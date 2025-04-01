import {
  UIMessage,
  appendResponseMessages,
  createDataStreamResponse,
  generateText,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import { systemPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  getTrailingMessageId,
} from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { queryDatabase } from '@/lib/ai/tools/query-database';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';

export const maxDuration = 60;

export async function POST(request: Request) {
  // TODO: Make it properly asynchronous, all in parallel
  async function generateAssistantMessage(userMessage: UIMessage, selectedChatModel="chat-model-4o-mini") {
    const response = await generateText({
      model: myProvider.languageModel(selectedChatModel),
      prompt: JSON.stringify(userMessage),
    });
    return response;
  }

  try {
    const {
      id,
      messages,
      selectedChatModel,
      data,
    }: {
      id: string;
      messages: Array<UIMessage>;
      selectedChatModel: string;
      data?: { 
        count: number;
        evaluators: string[];
      };
    } = await request.json();

    // Define explicit types for the arrays
    interface AssistantMessageResponse {
      text: string;
      [key: string]: any; // For other potential properties
    }
    
    const assistantMessages: AssistantMessageResponse[] = [];
    if (data && data.count) {
      console.log("Count from request:", data.count);
      const count = data.count;
      
      for (let i = 0; i < count; i++) {
        const assistantMessage = await generateAssistantMessage(messages[messages.length - 1]);
        console.log("Assistant Message:", assistantMessage.text);
        // Store just the text for simplicity
        assistantMessages.push({ text: assistantMessage.text });
      }
      
      console.log("Generated assistantMessages array:", JSON.stringify(assistantMessages));
    }

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const userMessage = getMostRecentUserMessage(messages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });

      await saveChat({ id, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    // Get the selected evaluators from the request data
    const evaluations: string[] = data?.evaluators || [];
    console.log("Selected evaluators:", evaluations);
    
    // Save the user message first
    const partsWithMetadata = [
      ...userMessage.parts,
      {
        type: 'metadata',
        metadata: {
          assistantMessages: assistantMessages,
          evaluationSet: evaluations
        }
      }
    ];

    console.log("User message with metadata:", {
      messageId: userMessage.id,
      assistantMessagesCount: assistantMessages.length,
      assistantMessages: JSON.stringify(assistantMessages, null, 2),
      evaluations: evaluations,
      metadataStructure: JSON.stringify({
        type: 'metadata',
        metadata: {
          assistantMessages: assistantMessages,
          evaluationSet: evaluations
        }
      }, null, 2)
    });

    await saveMessages({
      messages: [
        {
          chatId: id,
          id: userMessage.id,
          role: 'user',
          parts: partsWithMetadata,
          attachments: userMessage.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    console.log("Message with metadata:", partsWithMetadata);
    console.log("Assistant Messages array:", assistantMessages);
    
    return createDataStreamResponse({
      execute: (dataStream) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: systemPrompt({ selectedChatModel }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning' ||
            selectedChatModel === 'reasoning-model-o3-mini' ||
            selectedChatModel === 'reasoning-model-o1-mini'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                  'queryDatabase',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            queryDatabase,
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [userMessage],
                  responseMessages: response.messages,
                });

                // Create parts with metadata for assistant message
                const assistantPartsWithMetadata = [
                  ...(assistantMessage.parts || []),
                  {
                    type: 'metadata',
                    metadata: {
                      assistantMessages: assistantMessages,
                      evaluationSet: evaluations
                    }
                  }
                ];

                console.log("Saving assistant message with metadata:", {
                  assistantMessages: JSON.stringify(assistantMessages, null, 2),
                  evaluations,
                  metadataStructure: JSON.stringify({
                    type: 'metadata',
                    metadata: {
                      assistantMessages: assistantMessages,
                      evaluationSet: evaluations
                    }
                  }, null, 2)
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantPartsWithMetadata,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return 'Oops, an error occured!';
      },
    });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 404,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request!', {
      status: 500,
    });
  }
}
