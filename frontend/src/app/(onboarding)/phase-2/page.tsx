/**
 * @file Phase 2 Page
 * @description Static Screener - PSC-17 assessment form.
 *              Collects mental health screening data.
 *
 * @see {@link _docs/user-flow.md} Phase 2: Holistic Intake
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { ScreenerForm } from '@/components/forms/screener-form';
import type { Responses } from '@/lib/utils/score-calculator';

/**
 * Phase 2: Static Screener page
 * PSC-17 assessment questionnaire
 */
export default function Phase2Page() {
  const router = useRouter();
  const {
    state,
    setPhase,
    completePhase,
    setAssessmentResponses,
    saveProgress,
  } = useOnboarding();

  // Set current phase and redirect if prerequisites not met
  useEffect(() => {
    setPhase('phase-2');

    // Redirect if no user type selected
    if (!state.userType) {
      router.push('/phase-0');
    }
  }, [setPhase, state.userType, router]);

  // Don't render until we have user type
  if (!state.userType) {
    return null;
  }

  /**
   * Handles saving progress as user answers questions
   */
  function handleSaveProgress(responses: Responses) {
    setAssessmentResponses(responses);
    saveProgress();
  }

  /**
   * Handles form submission
   */
  async function handleSubmit(
    responses: Responses,
    score: number,
    severity: string
  ) {
    // Save final responses
    setAssessmentResponses(responses);

    // In a real implementation, we'd submit to the API here
    // For MVP, we just store locally and proceed
    console.log('Assessment submitted:', { responses, score, severity });

    // Mark phase complete and navigate
    completePhase('phase-2');
    setPhase('phase-3');
    router.push('/phase-3/account');
  }

  /**
   * Handles back navigation
   */
  function handleBack() {
    router.push('/phase-1');
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Quick Assessment
        </h1>
        <p className="text-muted-foreground">
          These questions help us understand how we can best support{' '}
          {state.userType === 'minor' ? 'you' : 'your child'}.
        </p>
      </div>

      {/* Screener form */}
      <ScreenerForm
        initialResponses={state.assessmentResponses}
        onSubmit={handleSubmit}
        onSaveProgress={handleSaveProgress}
      />

      {/* Back button */}
      <div className="mt-8">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Previous Step
        </Button>
      </div>

      {/* Privacy reassurance */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-xs text-muted-foreground">
          Your responses are confidential and protected under HIPAA.
          This screening is not a diagnosis—it helps us connect you
          with the right level of care.
        </p>
      </div>
    </div>
  );
}

