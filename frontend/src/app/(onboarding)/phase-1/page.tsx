/**
 * @file Phase 1 Page
 * @description Regulate and Relate - Calming welcome screen with
 *              supportive messaging before data collection begins.
 *
 * @see {@link _docs/user-flow.md} Phase 1: Regulate and Relate
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import {
  WelcomeMessage,
  CalmingVisual,
} from '@/components/onboarding/welcome-message';
import { ProcessOverview } from '@/components/onboarding/process-overview';

/**
 * Phase 1: Regulate and Relate page
 * Calming screen that reduces anxiety before data collection
 */
export default function Phase1Page() {
  const router = useRouter();
  const { state, setPhase, completePhase } = useOnboarding();

  // Set current phase and redirect if no user type selected
  useEffect(() => {
    setPhase('phase-1');

    // If no user type, redirect back to Phase 0
    if (!state.userType) {
      router.push('/phase-0');
    }
  }, [setPhase, state.userType, router]);

  // Don't render until we have user type
  if (!state.userType) {
    return null;
  }

  /**
   * Handles continue button click
   */
  function handleContinue() {
    completePhase('phase-1');
    setPhase('phase-2');
    router.push('/phase-2');
  }

  /**
   * Handles back button click
   */
  function handleBack() {
    router.push('/phase-0');
  }

  return (
    <div className="relative flex flex-col items-center min-h-[60vh] py-8">
      {/* Calming background visual */}
      <CalmingVisual />

      {/* Main content */}
      <div className="animate-fade-in space-y-12 w-full">
        {/* Welcome message */}
        <WelcomeMessage userType={state.userType} />

        {/* Process overview */}
        <ProcessOverview className="mt-12" />

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="gap-2 order-2 sm:order-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            size="lg"
            onClick={handleContinue}
            className="min-w-[200px] gap-2 order-1 sm:order-2"
          >
            Let's Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reassurance footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          You can save your progress at any time and return later.
          Your information is always kept private and secure.
        </p>
      </div>
    </div>
  );
}

