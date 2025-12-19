/**
 * @file useOnboardingState Hook
 * @description Convenience hook that wraps the onboarding store
 *              with additional navigation and validation helpers.
 *
 * @see {@link stores/onboarding-store.ts} for the underlying store
 */

'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/stores/onboarding-store';
import {
  getPhase,
  getNextPhase,
  getPreviousPhase,
  type PhaseId,
} from '@/lib/constants/phases';

/**
 * Hook return type
 */
interface UseOnboardingStateReturn {
  /** Current onboarding state */
  state: ReturnType<typeof useOnboarding>['state'];
  /** Navigate to next phase */
  goToNextPhase: () => void;
  /** Navigate to previous phase */
  goToPreviousPhase: () => void;
  /** Navigate to specific phase */
  goToPhase: (phaseId: PhaseId) => void;
  /** Complete current phase and advance */
  completeAndAdvance: () => void;
  /** Check if can proceed to next phase */
  canProceed: boolean;
  /** Get validation errors for current phase */
  getValidationErrors: () => string[];
  /** Save and exit the flow */
  saveAndExit: () => void;
  /** All onboarding actions */
  actions: Omit<ReturnType<typeof useOnboarding>, 'state'>;
}

/**
 * Enhanced onboarding state hook with navigation helpers
 *
 * @returns Onboarding state and navigation functions
 *
 * @example
 * ```tsx
 * function PhaseComponent() {
 *   const {
 *     state,
 *     canProceed,
 *     completeAndAdvance,
 *     goToPreviousPhase,
 *   } = useOnboardingState();
 *
 *   return (
 *     <>
 *       <button onClick={goToPreviousPhase}>Back</button>
 *       <button
 *         onClick={completeAndAdvance}
 *         disabled={!canProceed}
 *       >
 *         Continue
 *       </button>
 *     </>
 *   );
 * }
 * ```
 */
export function useOnboardingState(): UseOnboardingStateReturn {
  const router = useRouter();
  const { state, ...actions } = useOnboarding();

  /**
   * Navigates to the next phase in the flow
   */
  const goToNextPhase = useCallback(() => {
    const nextPhase = getNextPhase(state.currentPhase);
    if (nextPhase) {
      actions.setPhase(nextPhase.id);
      router.push(nextPhase.route);
    }
  }, [state.currentPhase, actions, router]);

  /**
   * Navigates to the previous phase in the flow
   */
  const goToPreviousPhase = useCallback(() => {
    const prevPhase = getPreviousPhase(state.currentPhase);
    if (prevPhase) {
      actions.setPhase(prevPhase.id);
      router.push(prevPhase.route);
    }
  }, [state.currentPhase, actions, router]);

  /**
   * Navigates to a specific phase
   */
  const goToPhase = useCallback(
    (phaseId: PhaseId) => {
      const phase = getPhase(phaseId);
      if (phase) {
        actions.setPhase(phaseId);
        router.push(phase.route);
      }
    },
    [actions, router]
  );

  /**
   * Completes current phase and advances to next
   */
  const completeAndAdvance = useCallback(() => {
    actions.completePhase(state.currentPhase);
    goToNextPhase();
  }, [actions, state.currentPhase, goToNextPhase]);

  /**
   * Gets validation errors for current phase
   */
  const getValidationErrors = useCallback((): string[] => {
    const errors: string[] = [];

    switch (state.currentPhase) {
      case 'phase-0':
        if (!state.userType) {
          errors.push('Please select who you are');
        }
        break;

      case 'phase-2':
        const responseCount = Object.keys(state.assessmentResponses).length;
        if (responseCount < 17) {
          errors.push(`Please answer all questions (${responseCount}/17)`);
        }
        break;

      default:
        break;
    }

    return errors;
  }, [state]);

  /**
   * Checks if user can proceed from current phase
   */
  const canProceed = getValidationErrors().length === 0;

  /**
   * Saves progress and exits the flow
   */
  const saveAndExit = useCallback(() => {
    actions.saveProgress();
    router.push('/');
  }, [actions, router]);

  return {
    state,
    goToNextPhase,
    goToPreviousPhase,
    goToPhase,
    completeAndAdvance,
    canProceed,
    getValidationErrors,
    saveAndExit,
    actions,
  };
}

