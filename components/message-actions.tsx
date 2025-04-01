import type { Message } from 'ai';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';

import type { Vote } from '@/lib/db/schema';

import { CopyIcon, ThumbDownIcon, ThumbUpIcon, ChevronDownIcon, ChevronUpIcon } from './icons';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { memo, useState } from 'react';
import equal from 'fast-deep-equal';
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

export function PureMessageActions({
  chatId,
  message,
  vote,
  isLoading,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) return null;
  if (message.role === 'user') return null;

  // Find metadata part that contains assistantMessages
  const metadataPart = message.parts?.find(part => 
    part.type === 'metadata' && part.metadata?.assistantMessages
  );
  
  const assistantMessages = metadataPart?.metadata?.assistantMessages || [];
  const hasAssistantMessages = assistantMessages.length > 0;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-row gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="py-1 px-2 h-fit text-muted-foreground"
                variant="outline"
                onClick={async () => {
                  const textFromParts = message.parts
                    ?.filter((part) => part.type === 'text')
                    .map((part) => part.text)
                    .join('\n')
                    .trim();

                  if (!textFromParts) {
                    toast.error("There's no text to copy!");
                    return;
                  }

                  await copyToClipboard(textFromParts);
                  toast.success('Copied to clipboard!');
                }}
              >
                <CopyIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="message-upvote"
                className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
                disabled={vote?.isUpvoted}
                variant="outline"
                onClick={async () => {
                  const upvote = fetch('/api/vote', {
                    method: 'PATCH',
                    body: JSON.stringify({
                      chatId,
                      messageId: message.id,
                      type: 'up',
                    }),
                  });

                  toast.promise(upvote, {
                    loading: 'Upvoting Response...',
                    success: () => {
                      mutate<Array<Vote>>(
                        `/api/vote?chatId=${chatId}`,
                        (currentVotes) => {
                          if (!currentVotes) return [];

                          const votesWithoutCurrent = currentVotes.filter(
                            (vote) => vote.messageId !== message.id,
                          );

                          return [
                            ...votesWithoutCurrent,
                            {
                              chatId,
                              messageId: message.id,
                              isUpvoted: true,
                            },
                          ];
                        },
                        { revalidate: false },
                      );

                      return 'Upvoted Response!';
                    },
                    error: 'Failed to upvote response.',
                  });
                }}
              >
                <ThumbUpIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Upvote Response</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                data-testid="message-downvote"
                className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
                variant="outline"
                disabled={vote && !vote.isUpvoted}
                onClick={async () => {
                  const downvote = fetch('/api/vote', {
                    method: 'PATCH',
                    body: JSON.stringify({
                      chatId,
                      messageId: message.id,
                      type: 'down',
                    }),
                  });

                  toast.promise(downvote, {
                    loading: 'Downvoting Response...',
                    success: () => {
                      mutate<Array<Vote>>(
                        `/api/vote?chatId=${chatId}`,
                        (currentVotes) => {
                          if (!currentVotes) return [];

                          const votesWithoutCurrent = currentVotes.filter(
                            (vote) => vote.messageId !== message.id,
                          );

                          return [
                            ...votesWithoutCurrent,
                            {
                              chatId,
                              messageId: message.id,
                              isUpvoted: false,
                            },
                          ];
                        },
                        { revalidate: false },
                      );

                      return 'Downvoted Response!';
                    },
                    error: 'Failed to downvote response.',
                  });
                }}
              >
                <ThumbDownIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Downvote Response</TooltipContent>
          </Tooltip>

          {hasAssistantMessages && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full hidden">
                  <CollapsibleTrigger asChild>
                    <Button
                      data-testid="message-alternatives"
                      className="py-1 px-2 h-fit text-muted-foreground !pointer-events-auto"
                      variant="outline"
                    >
                      {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      <span className="ml-1">Alternatives ({assistantMessages.length})</span>
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </TooltipTrigger>
              <TooltipContent>Show Alternative Responses</TooltipContent>
            </Tooltip>
          )}
        </div>

        {hasAssistantMessages && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <CollapsibleContent className="mt-2 space-y-2">
              {assistantMessages.map((msg, index) => (
                <div key={index} className="p-3 border rounded-md bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Alternative {index + 1}</div>
                  <div className="text-sm">{msg.text}</div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    return true;
  },
);
