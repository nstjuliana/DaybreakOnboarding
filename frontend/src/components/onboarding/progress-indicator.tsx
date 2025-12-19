/**
 * @file ProgressIndicator Component
 * @description Shows user's progress through the onboarding phases.
 *              Displays all main phases with their current status.
 *
 * @see {@link _docs/ui-rules.md} Progress Indicators
 */

'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/stores/onboarding-store';
import {
  MAIN_PHASES,
  getPhaseStatus,
  type PhaseId,
} from '@/lib/constants/phases';
import { ProgressStep } from './progress-step';

/**
 * ProgressIndicator component props
 */
interface ProgressIndicatorProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Progress indicator showing all onboarding phases
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <ProgressIndicator className="mb-8" />
 * ```
 */
export function ProgressIndicator({ className }: ProgressIndicatorProps) {
  const router = useRouter();
  const { state } = useOnboarding();

  /**
   * Handles navigation to a completed phase
   */
  function handlePhaseClick(phaseId: PhaseId) {
    const status = getPhaseStatus(
      phaseId,
      state.currentPhase,
      state.completedPhases
    );

    // Only allow navigation to completed phases
    if (status === 'completed') {
      const phase = MAIN_PHASES.find((p) => p.id === phaseId);
      if (phase) {
        router.push(phase.route);
      }
    }
  }

  return (
    <nav
      className={cn('flex items-center justify-center', className)}
      aria-label="Onboarding progress"
    >
      <ol className="flex items-center">
        {MAIN_PHASES.map((phase, index) => {
          const status = getPhaseStatus(
            phase.id,
            state.currentPhase,
            state.completedPhases
          );

          const isClickable = status === 'completed';
          const isLastStep = index === MAIN_PHASES.length - 1;

          return (
            <li key={phase.id} className="flex items-center">
              <ProgressStep
                phase={phase}
                status={status}
                stepNumber={index + 1}
                showConnector={!isLastStep}
                isClickable={isClickable}
                onClick={() => handlePhaseClick(phase.id)}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Simplified progress indicator for mobile
 * Shows only current phase with fraction
 */
export function ProgressIndicatorMobile({ className }: ProgressIndicatorProps) {
  const { state } = useOnboarding();

  const currentPhase = MAIN_PHASES.find((p) => p.id === state.currentPhase);
  const currentIndex = MAIN_PHASES.findIndex((p) => p.id === state.currentPhase);
  const totalPhases = MAIN_PHASES.length;

  if (!currentPhase) return null;

  return (
    <div
      className={cn('flex items-center justify-between', className)}
      role="status"
      aria-label={`Step ${currentIndex + 1} of ${totalPhases}: ${currentPhase.label}`}
    >
      <span className="text-sm font-medium text-muted-foreground">
        Step {currentIndex + 1} of {totalPhases}
      </span>
      <span className="text-sm font-semibold text-primary">
        {currentPhase.label}
      </span>
    </div>
  );
}

