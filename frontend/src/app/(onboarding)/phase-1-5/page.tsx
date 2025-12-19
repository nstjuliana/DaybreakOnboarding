/**
 * @file Phase 1.5 Page - Triage Pulse
 * @description Quick triage to route users to the appropriate screener
 *              based on their primary concerns.
 *
 * @see {@link _docs/user-flow.md} Phase 1.5: Triage Pulse
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { ConcernSelector } from '@/components/onboarding/concern-selector';
import {
  type ConcernArea,
  getPrimaryScreener,
  type ScreenerConfig,
} from '@/lib/utils/screener-router';

/**
 * Phase 1.5: Triage Pulse page
 * Routes users to appropriate screener based on concerns
 */
export default function Phase15Page() {
  const router = useRouter();
  const {
    state,
    setPhase,
    completePhase,
    setConcernAreas,
  } = useOnboarding();

  const [selectedScreener, setSelectedScreener] = useState<ScreenerConfig | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  /**
   * Handles concern selection changes
   * (Must be defined before early return to respect hooks rules)
   */
  const handleSelectionChange = useCallback((concerns: ConcernArea[]) => {
    if (concerns.length > 0) {
      const screener = getPrimaryScreener(concerns);
      setSelectedScreener(screener);
    } else {
      setSelectedScreener(null);
    }
  }, []);

  // Set current phase and redirect if prerequisites not met
  useEffect(() => {
    setPhase('phase-1.5');

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
   * Handles concern confirmation
   */
  function handleConcernConfirm(concerns: ConcernArea[]) {
    setConcernAreas(concerns);
    const screener = getPrimaryScreener(concerns);
    setSelectedScreener(screener);
    setShowConfirmation(true);
  }

  /**
   * Proceeds to Phase 2 with selected screener
   */
  function handleProceed() {
    completePhase('phase-1.5');
    setPhase('phase-2');
    router.push('/phase-2');
  }

  /**
   * Goes back to concern selection
   */
  function handleBackToSelection() {
    setShowConfirmation(false);
  }

  /**
   * Handles back navigation
   */
  function handleBack() {
    router.push('/phase-1');
  }

  // Show confirmation screen
  if (showConfirmation && selectedScreener) {
    return (
      <div className="flex flex-col items-center animate-fade-in max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Your Personalized Assessment
          </h1>
          <p className="text-muted-foreground">
            Based on your concerns, we've selected the best assessment for you.
          </p>
        </div>

        {/* Screener info card */}
        <div className="w-full bg-white rounded-xl border border-neutral-200 shadow-sm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-neutral-800">
                {selectedScreener.name}
              </h2>
              <p className="text-sm text-neutral-500 mb-3">
                {selectedScreener.shortName}
              </p>
              <p className="text-neutral-600 text-sm">
                {selectedScreener.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <FileText className="w-4 h-4 text-neutral-400" />
              <span>{selectedScreener.questionCount} questions</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span>~{selectedScreener.estimatedMinutes} minutes</span>
            </div>
          </div>
        </div>

        {/* What to expect */}
        <div className="w-full bg-primary-50 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-neutral-800 mb-3">What to Expect</h3>
          <ul className="space-y-2 text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">•</span>
              <span>
                You can choose to chat with our AI assistant or use a traditional form
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">•</span>
              <span>Your responses are confidential and HIPAA-protected</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">•</span>
              <span>You can pause and resume at any time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500 font-bold">•</span>
              <span>This is a screening, not a diagnosis</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            variant="outline"
            onClick={handleBackToSelection}
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Change Selection
          </Button>
          <Button onClick={handleProceed} className="flex-1">
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  // Show concern selection screen
  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          What brings you here today?
        </h1>
        <p className="text-muted-foreground">
          Help us understand {state.userType === 'minor' ? 'your' : "your child's"}{' '}
          main concerns so we can ask the right questions.
        </p>
      </div>

      {/* Concern selector */}
      <ConcernSelector
        initialSelected={state.concernAreas as ConcernArea[]}
        onSelectionChange={handleSelectionChange}
        onConfirm={handleConcernConfirm}
        maxSelections={3}
        className="max-w-4xl"
      />

      {/* Selected screener preview */}
      {selectedScreener && (
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Based on your selection, we'll use the{' '}
            <span className="font-medium text-primary-600">
              {selectedScreener.shortName}
            </span>{' '}
            assessment ({selectedScreener.questionCount} questions,{' '}
            ~{selectedScreener.estimatedMinutes} min)
          </p>
        </div>
      )}

      {/* Back button */}
      <div className="mt-8">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Previous Step
        </Button>
      </div>
    </div>
  );
}

