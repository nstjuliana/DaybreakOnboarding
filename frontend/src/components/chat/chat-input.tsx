/**
 * @file Chat Input Component
 * @description Text input area for sending messages in the chat interface.
 *
 * @see {@link _docs/theme-rules.md} Input tokens
 */

'use client';

import { useState, useRef, useEffect, type KeyboardEvent, type ChangeEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * Props for ChatInput component
 */
interface ChatInputProps {
  /** Callback when message is submitted */
  onSend: (message: string) => void;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether a message is being sent */
  isSending?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Chat input component
 * Auto-expanding textarea with send button
 *
 * @param props - Component props
 */
export function ChatInput({
  onSend,
  disabled = false,
  isSending = false,
  placeholder = 'Type your response...',
  maxLength = 1000,
  className,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !disabled && !isSending;

  /**
   * Auto-resize textarea based on content
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [value]);

  /**
   * Handles text input changes
   */
  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setValue(newValue);
    }
  }

  /**
   * Handles send action
   */
  function handleSend() {
    if (canSend) {
      onSend(value.trim());
      setValue('');
      textareaRef.current?.focus();
    }
  }

  /**
   * Handles keyboard events
   */
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      className={cn(
        'flex items-end gap-2 p-3 bg-white border-t border-neutral-200',
        className
      )}
    >
      {/* Textarea */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          placeholder={placeholder}
          rows={1}
          className={cn(
            'w-full px-4 py-3 rounded-xl border border-neutral-200 resize-none',
            'text-neutral-800 placeholder:text-neutral-400',
            'focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100',
            'disabled:bg-neutral-50 disabled:cursor-not-allowed',
            'transition-colors duration-150'
          )}
          aria-label="Message input"
        />

        {/* Character counter (shown when approaching limit) */}
        {value.length > maxLength * 0.8 && (
          <span
            className={cn(
              'absolute right-3 bottom-1 text-xs',
              value.length >= maxLength ? 'text-error-500' : 'text-neutral-400'
            )}
          >
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      {/* Send button */}
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!canSend}
        className="h-12 w-12 rounded-xl flex-shrink-0"
        aria-label="Send message"
      >
        {isSending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
}

/**
 * Simplified input for quick responses
 */
export function ChatInputSimple({
  onSend,
  disabled = false,
  placeholder = 'Type here...',
  className,
}: {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      onSend(value.trim());
      setValue('');
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'flex-1 px-4 py-2 rounded-lg border border-neutral-200',
          'focus:outline-none focus:border-primary-400',
          'disabled:bg-neutral-50'
        )}
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Send
      </Button>
    </form>
  );
}

