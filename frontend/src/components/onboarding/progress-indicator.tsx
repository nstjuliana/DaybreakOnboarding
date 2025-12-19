/**
 * @file ProgressIndicator Component
 * @description Shows user's progress through the onboarding phases.
 *              Displays all main phases with their current status.
 *
 * @see {@link _docs/ui-rules.md} Progress Indicators
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/stores/onboarding-store';
import {
  MAIN_PHASES,
  PHASES,
  getPhaseStatus,
  getDisplayPhaseId,
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
 * Gets the phase ID from the current URL pathname
 * This ensures the progress indicator reflects the actual page being viewed
 *
 * @param pathname - Current URL pathname
 * @returns PhaseId derived from the URL
 */
function getPhaseFromPathname(pathname: string): PhaseId {
  // Find the phase whose route matches the current pathname
  const matchedPhase = PHASES.find((phase) => {
    // Handle exact matches
    if (pathname === phase.route) return true;
    // Handle sub-routes (e.g., /phase-3/insurance matches phase-3)
    if (pathname.startsWith(phase.route + '/')) return true;
    // Special case for phase-1-5 URL mapping to phase-1.5
    if (pathname === '/phase-1-5' && phase.id === 'phase-1.5') return true;
    return false;
  });

  return matchedPhase?.id || 'phase-0';
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
  const pathname = usePathname();
  const { state } = useOnboarding();

  // Use the URL pathname to determine current phase (more reliable than state)
  const currentPhaseFromUrl = getPhaseFromPathname(pathname);

  /**
   * Handles navigation to a completed phase
   */
  function handlePhaseClick(phaseId: PhaseId) {
    const status = getPhaseStatus(
      phaseId,
      currentPhaseFromUrl,
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
            currentPhaseFromUrl,
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
  const pathname = usePathname();

  // Use URL pathname to determine current phase (more reliable than state)
  const currentPhaseFromUrl = getPhaseFromPathname(pathname);
  
  // Map hidden phases to their display equivalent
  const displayPhaseId = getDisplayPhaseId(currentPhaseFromUrl);
  const currentPhase = MAIN_PHASES.find((p) => p.id === displayPhaseId);
  const currentIndex = MAIN_PHASES.findIndex((p) => p.id === displayPhaseId);
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

