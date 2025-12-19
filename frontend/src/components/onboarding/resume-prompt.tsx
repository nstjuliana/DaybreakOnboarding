/**
 * @file ResumePrompt Component
 * @description Prompts user to resume saved progress or start fresh.
 *              Appears when returning with saved onboarding state.
 *
 * @see {@link _docs/user-flow.md} Save and Resume
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOnboarding } from '@/stores/onboarding-store';
import { PHASE_MAP } from '@/lib/constants/phases';

/**
 * ResumePrompt component
 * Shows when user returns with saved progress
 */
export function ResumePrompt() {
  const router = useRouter();
  const { state, clearProgress, setPhase } = useOnboarding();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !state.hasSavedProgress) return null;

  const savedPhase = PHASE_MAP[state.currentPhase];
  const savedDate = state.lastSavedAt
    ? new Date(state.lastSavedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  /**
   * Resumes from saved progress
   */
  function handleResume() {
    if (savedPhase) {
      router.push(savedPhase.route);
    }
    setIsVisible(false);
  }

  /**
   * Starts fresh, clearing saved progress
   */
  function handleStartFresh() {
    clearProgress();
    setPhase('phase-0');
    setIsVisible(false);
  }

  return (
    <Card className="w-full max-w-lg mb-8 p-6 border-primary/20 bg-secondary/50">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Welcome back!
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          You have saved progress from{' '}
          {savedDate && <span className="font-medium">{savedDate}</span>}.
          {savedPhase && (
            <>
              {' '}
              You were on <span className="font-medium">{savedPhase.label}</span>.
            </>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleResume} className="gap-2">
            Resume Progress
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleStartFresh}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Start Fresh
          </Button>
        </div>
      </div>
    </Card>
  );
}

