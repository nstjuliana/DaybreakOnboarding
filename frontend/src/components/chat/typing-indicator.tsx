/**
 * @file Typing Indicator Component
 * @description Animated indicator showing AI is generating a response.
 *
 * @see {@link _docs/theme-rules.md} Animation tokens
 */

'use client';

import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

/**
 * Props for TypingIndicator component
 */
interface TypingIndicatorProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Typing indicator component
 * Shows animated dots to indicate AI is typing
 *
 * @param props - Component props
 */
export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div
      className={cn('flex gap-3 justify-start animate-fade-in', className)}
      role="status"
      aria-label="AI is typing"
    >
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
        <Bot className="w-4 h-4 text-primary-600" aria-hidden="true" />
      </div>

      {/* Typing bubble */}
      <div className="bg-primary-50 border border-primary-100 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-1.5">
          <TypingDot delay={0} />
          <TypingDot delay={150} />
          <TypingDot delay={300} />
        </div>
      </div>
    </div>
  );
}

/**
 * Individual animated dot
 */
function TypingDot({ delay }: { delay: number }) {
  return (
    <span
      className="w-2 h-2 rounded-full bg-primary-400 animate-bounce"
      style={{
        animationDelay: `${delay}ms`,
        animationDuration: '600ms',
      }}
    />
  );
}

/**
 * Compact typing indicator for inline use
 */
export function TypingIndicatorInline({ className }: TypingIndicatorProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      role="status"
      aria-label="typing"
    >
      <span className="text-sm text-neutral-500">AI is thinking</span>
      <span className="flex gap-0.5">
        <span
          className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <span
          className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce"
          style={{ animationDelay: '100ms' }}
        />
        <span
          className="w-1 h-1 rounded-full bg-neutral-400 animate-bounce"
          style={{ animationDelay: '200ms' }}
        />
      </span>
    </span>
  );
}

