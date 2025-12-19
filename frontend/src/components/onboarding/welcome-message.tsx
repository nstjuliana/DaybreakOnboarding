/**
 * @file WelcomeMessage Component
 * @description Displays role-specific welcome messaging in Phase 1.
 *              Provides calming, supportive content based on user type.
 *
 * @see {@link _docs/user-flow.md} Phase 1: Regulate and Relate
 */

'use client';

import { cn } from '@/lib/utils';
import { WELCOME_MESSAGES } from '@/lib/constants/messaging';
import type { UserType } from '@/types/user';

/**
 * WelcomeMessage component props
 */
interface WelcomeMessageProps {
  /** User type for personalized messaging */
  userType: UserType;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Role-specific welcome message component
 * Displays supportive, calming content
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <WelcomeMessage userType="parent" />
 * ```
 */
export function WelcomeMessage({ userType, className }: WelcomeMessageProps) {
  const message = WELCOME_MESSAGES[userType];

  return (
    <div className={cn('text-center max-w-2xl mx-auto', className)}>
      {/* Main headline with gentle animation */}
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 animate-fade-in">
        {message.headline}
      </h1>

      {/* Subheadline */}
      <p className="text-xl text-muted-foreground mb-6 animate-fade-in animation-delay-100">
        {message.subheadline}
      </p>

      {/* Support text with softer styling */}
      <div className="bg-secondary/50 rounded-xl p-6 mt-8 animate-slide-up animation-delay-200">
        <p className="text-muted-foreground italic">
          "{message.supportText}"
        </p>
      </div>
    </div>
  );
}

/**
 * Decorative calming visual element
 */
export function CalmingVisual({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none -z-10',
        className
      )}
      aria-hidden="true"
    >
      {/* Soft gradient circles */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/30 blur-3xl" />
    </div>
  );
}

