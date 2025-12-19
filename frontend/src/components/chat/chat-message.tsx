/**
 * @file Chat Message Component
 * @description Displays individual messages in the chat interface.
 *              Supports AI and user messages with appropriate styling.
 *
 * @see {@link _docs/theme-rules.md} Chat Interface tokens
 */

'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

/**
 * Message sender type
 */
export type MessageSender = 'ai' | 'user';

/**
 * Chat message data structure
 */
export interface ChatMessageData {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

/**
 * Props for ChatMessage component
 */
interface ChatMessageProps {
  /** Message data */
  message: ChatMessageData;
  /** Whether this is the latest message */
  isLatest?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Chat message component
 * Renders a single message with sender-appropriate styling
 *
 * @param props - Component props
 */
export function ChatMessage({ message, isLatest, className }: ChatMessageProps) {
  const isAi = message.sender === 'ai';

  return (
    <div
      className={cn(
        'flex gap-3 animate-fade-in',
        isAi ? 'justify-start' : 'justify-end',
        className
      )}
      role="listitem"
      aria-label={`${isAi ? 'AI' : 'You'}: ${message.content}`}
    >
      {/* AI Avatar */}
      {isAi && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
          <Bot className="w-4 h-4 text-primary-600" aria-hidden="true" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isAi
            ? 'bg-primary-50 border border-primary-100 text-neutral-800'
            : 'bg-neutral-100 text-neutral-800',
          isLatest && message.isStreaming && 'animate-pulse-soft'
        )}
      >
        {/* Message content */}
        <p className="text-sm md:text-base whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-primary-500 animate-pulse" />
          )}
        </p>

        {/* Timestamp - subtle on hover */}
        <time
          dateTime={message.timestamp.toISOString()}
          className="block text-xs text-neutral-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {formatMessageTime(message.timestamp)}
        </time>
      </div>

      {/* User Avatar */}
      {!isAi && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
          <User className="w-4 h-4 text-neutral-600" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

/**
 * Formats message timestamp for display
 *
 * @param date - Message timestamp
 * @returns Formatted time string
 */
function formatMessageTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * System message component for announcements
 */
export function SystemMessage({
  content,
  variant = 'info',
  className,
}: {
  content: string;
  variant?: 'info' | 'warning' | 'error';
  className?: string;
}) {
  const variantStyles = {
    info: 'bg-primary-50 border-primary-200 text-primary-700',
    warning: 'bg-warning-50 border-warning-200 text-warning-700',
    error: 'bg-error-50 border-error-200 text-error-700',
  };

  return (
    <div
      className={cn(
        'text-center py-2 px-4 rounded-lg border text-sm',
        variantStyles[variant],
        className
      )}
      role="status"
    >
      {content}
    </div>
  );
}

