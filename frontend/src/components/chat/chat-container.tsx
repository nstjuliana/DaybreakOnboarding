/**
 * @file Chat Container Component
 * @description Main wrapper component for the chat interface.
 *              Handles message display, scrolling, and layout.
 *
 * @see {@link _docs/theme-rules.md} Chat Interface tokens
 */

'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChatMessage, type ChatMessageData, SystemMessage } from './chat-message';
import { TypingIndicator } from './typing-indicator';
import { ChatInput } from './chat-input';
import { QuickReplies, type QuickReplyOption } from './quick-replies';

/**
 * Props for ChatContainer component
 */
interface ChatContainerProps {
  /** Array of messages to display */
  messages: ChatMessageData[];
  /** Whether AI is currently typing */
  isTyping?: boolean;
  /** Whether a message is being sent */
  isSending?: boolean;
  /** Callback when user sends a message */
  onSendMessage: (content: string) => void;
  /** Quick reply options to show (if any) */
  quickReplies?: QuickReplyOption[];
  /** Callback when quick reply is selected */
  onQuickReply?: (option: QuickReplyOption) => void;
  /** System message to display (e.g., crisis alert) */
  systemMessage?: { content: string; variant: 'info' | 'warning' | 'error' };
  /** Whether input is disabled */
  inputDisabled?: boolean;
  /** Input placeholder text */
  inputPlaceholder?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Chat container component
 * Full chat interface with messages, input, and quick replies
 *
 * @param props - Component props
 */
export function ChatContainer({
  messages,
  isTyping = false,
  isSending = false,
  onSendMessage,
  quickReplies,
  onQuickReply,
  systemMessage,
  inputDisabled = false,
  inputPlaceholder,
  className,
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /**
   * Handles quick reply selection
   */
  function handleQuickReply(option: QuickReplyOption) {
    onQuickReply?.(option);
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-neutral-50 rounded-xl border border-neutral-200 overflow-hidden',
        className
      )}
      role="region"
      aria-label="Chat conversation"
    >
      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {/* System message (if present) */}
        {systemMessage && (
          <SystemMessage
            content={systemMessage.content}
            variant={systemMessage.variant}
            className="mb-4"
          />
        )}

        {/* Messages list */}
        <div className="space-y-4" role="list">
          {messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))}
        </div>

        {/* Typing indicator - only show when typing AND no streaming message exists */}
        {isTyping && !messages.some((m) => m.isStreaming) && <TypingIndicator />}

        {/* Quick replies - only show when not typing AND no streaming message */}
        {quickReplies && quickReplies.length > 0 && !isTyping && !messages.some((m) => m.isStreaming) && (
          <div className="flex justify-center pt-2">
            <QuickReplies
              options={quickReplies}
              onSelect={handleQuickReply}
              disabled={isSending}
              layout="horizontal"
            />
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <ChatInput
        onSend={onSendMessage}
        disabled={inputDisabled || isTyping}
        isSending={isSending}
        placeholder={inputPlaceholder}
      />
    </div>
  );
}

/**
 * Minimal chat container for embedded use
 */
export function ChatContainerCompact({
  messages,
  isTyping,
  onSendMessage,
  className,
}: {
  messages: ChatMessageData[];
  isTyping?: boolean;
  onSendMessage: (content: string) => void;
  className?: string;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className={cn('flex flex-col h-96', className)}>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white rounded-t-lg border border-b-0">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput
        onSend={onSendMessage}
        disabled={isTyping}
        className="rounded-b-lg"
      />
    </div>
  );
}

