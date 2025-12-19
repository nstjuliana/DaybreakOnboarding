/**
 * @file ProgressStep Component
 * @description Individual step in the progress indicator.
 *              Shows completed, current, or upcoming state.
 *
 * @see {@link _docs/ui-rules.md} Progress Indicators
 */

'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Phase, PhaseStatus } from '@/lib/constants/phases';

/**
 * ProgressStep component props
 */
interface ProgressStepProps {
  /** Phase configuration */
  phase: Phase;
  /** Current status of this step */
  status: PhaseStatus;
  /** Step number (1-indexed) */
  stepNumber: number;
  /** Whether to show the connector line */
  showConnector?: boolean;
  /** Whether the step is clickable */
  isClickable?: boolean;
  /** Click handler for navigation */
  onClick?: () => void;
}

/**
 * Individual step in the progress indicator
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <ProgressStep
 *   phase={phases[0]}
 *   status="completed"
 *   stepNumber={1}
 *   showConnector
 *   onClick={() => navigateToPhase('phase-0')}
 * />
 * ```
 */
export function ProgressStep({
  phase,
  status,
  stepNumber,
  showConnector = true,
  isClickable = false,
  onClick,
}: ProgressStepProps) {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isUpcoming = status === 'upcoming' || status === 'locked';

  return (
    <div className="flex items-center">
      {/* Step circle and label */}
      <button
        type="button"
        onClick={isClickable && onClick ? onClick : undefined}
        disabled={!isClickable || !onClick}
        className={cn(
          'flex flex-col items-center gap-2 transition-all duration-200',
          isClickable && onClick && 'cursor-pointer hover:opacity-80',
          !isClickable && 'cursor-default'
        )}
        aria-current={isCurrent ? 'step' : undefined}
        aria-label={`${phase.label} - ${status}`}
      >
        {/* Circle indicator */}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200',
            // Completed state
            isCompleted && 'border-primary bg-primary text-primary-foreground',
            // Current state
            isCurrent &&
              'border-primary bg-secondary text-primary ring-4 ring-primary/20',
            // Upcoming state
            isUpcoming && 'border-muted-foreground/30 bg-muted text-muted-foreground'
          )}
        >
          {isCompleted ? (
            <Check className="h-5 w-5" aria-hidden="true" />
          ) : (
            <span className="text-sm font-medium">{stepNumber}</span>
          )}
        </div>

        {/* Label */}
        <span
          className={cn(
            'text-xs font-medium transition-colors duration-200 hidden sm:block',
            isCompleted && 'text-primary',
            isCurrent && 'text-primary font-semibold',
            isUpcoming && 'text-muted-foreground'
          )}
        >
          {phase.shortLabel}
        </span>
      </button>

      {/* Connector line */}
      {showConnector && (
        <div
          className={cn(
            'mx-2 h-0.5 w-8 sm:w-12 lg:w-16 transition-colors duration-200',
            isCompleted ? 'bg-primary' : 'bg-muted-foreground/30'
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

