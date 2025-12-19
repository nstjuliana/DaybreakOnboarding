/**
 * @file ProcessOverview Component
 * @description Shows the onboarding process steps in Phase 1.
 *              Helps set expectations for what's ahead.
 *
 * @see {@link _docs/user-flow.md} Phase 1: Regulate and Relate
 */

'use client';

import { cn } from '@/lib/utils';
import { PROCESS_STEPS } from '@/lib/constants/messaging';
import { Clock, CheckCircle2 } from 'lucide-react';

/**
 * ProcessOverview component props
 */
interface ProcessOverviewProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Shows overview of the onboarding process steps
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <ProcessOverview className="mt-8" />
 * ```
 */
export function ProcessOverview({ className }: ProcessOverviewProps) {
  return (
    <div className={cn('max-w-xl mx-auto', className)}>
      <h2 className="text-xl font-semibold text-foreground text-center mb-6">
        What to Expect
      </h2>

      <div className="space-y-4">
        {PROCESS_STEPS.map((step, index) => (
          <ProcessStep
            key={step.title}
            number={index + 1}
            title={step.title}
            description={step.description}
            duration={step.duration}
          />
        ))}
      </div>

      {/* Total time estimate */}
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Total time: about 15 minutes</span>
      </div>
    </div>
  );
}

/**
 * Individual process step component
 */
interface ProcessStepProps {
  number: number;
  title: string;
  description: string;
  duration: string;
}

function ProcessStep({ number, title, description, duration }: ProcessStepProps) {
  return (
    <div className="flex gap-4 items-start">
      {/* Step number */}
      <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
        {number}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ~{duration}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}

/**
 * Simplified expectation list for smaller screens
 */
export function ProcessOverviewCompact({ className }: ProcessOverviewProps) {
  return (
    <div className={cn('max-w-md mx-auto', className)}>
      <h2 className="text-lg font-semibold text-foreground text-center mb-4">
        Quick Overview
      </h2>

      <ul className="space-y-2">
        {PROCESS_STEPS.map((step) => (
          <li key={step.title} className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-muted-foreground">{step.title}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Takes about 15 minutes total
      </p>
    </div>
  );
}

