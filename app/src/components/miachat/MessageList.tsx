import { memo } from 'react';
import type { Message } from './chat';
import { Avatar, AvatarFallback } from '@lumia/ui';

interface MessageListProps {
  messages: Message[];
  activeChatId: string;
}

export const MessageList = memo(({ messages }: MessageListProps) => {
  return (
    <div className="flex flex-col space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`flex items-start space-x-3 max-w-[85%] ${
              message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <Avatar className="w-8 h-8 flex-shrink-0 mt-1">
              <AvatarFallback>{message.role === "user" ? "U" : "M"}</AvatarFallback>
            </Avatar>
            <div
              className={`p-3 rounded-lg shadow-sm ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-bl-none"
              }`}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              <span className="text-xs opacity-70 block text-right mt-1">
                {message.timestamp}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

MessageList.displayName = 'MessageList';