import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { groq } from '@ai-sdk/groq';
import { xai } from '@ai-sdk/xai';
import { openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
  reasoningModelO3Mini,
  chat4oMiniModel,
  chat4oModel,
} from './models.test';

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'chat-model-4o': chat4oModel,
        'chat-model-4o-mini': chat4oMiniModel,
        'reasoning-model-o3-mini': reasoningModelO3Mini,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        // 'chat-model': xai('grok-2-1212'),
        'chat-model': openai('gpt-4o'),
        'chat-model-reasoning': wrapLanguageModel({
          model: groq('deepseek-r1-distill-llama-70b'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'chat-model-4o': openai('gpt-4o'),
        'chat-model-4o-mini': openai('gpt-4o-mini'),
        'reasoning-model-o3-mini': wrapLanguageModel({
          model: openai('o3-mini'),
          middleware: extractReasoningMiddleware({ tagName: 'reasoning' }),
        }),
        // 'title-model': xai('grok-2-1212'),
        // 'artifact-model': xai('grok-2-1212'),
        'title-model': openai('gpt-4o'),
        'artifact-model': openai('gpt-4o'),
      },
      imageModels: {
        'small-model': xai.image('grok-2-image'),
      },
    });
