/**
 * @file Phase 0 Page
 * @description Identification Lobby - User type selection screen.
 *              Entry point to the onboarding flow.
 *
 * @see {@link _docs/user-flow.md} Phase 0: Identification Lobby
 */

'use client';

import { useEffect } from 'react';
import { UserTypeSelector } from '@/components/onboarding/user-type-selector';
import { useOnboarding } from '@/stores/onboarding-store';
import { ResumePrompt } from '@/components/onboarding/resume-prompt';

/**
 * Phase 0: Identification Lobby page
 * First step in the onboarding flow where users identify themselves
 */
export default function Phase0Page() {
  const { state, setPhase } = useOnboarding();

  // Set current phase on mount
  useEffect(() => {
    setPhase('phase-0');
  }, [setPhase]);

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Resume prompt if there's saved progress */}
      {state.hasSavedProgress && state.currentPhase !== 'phase-0' && (
        <ResumePrompt />
      )}

      {/* Hero section */}
      <div className="text-center mb-10 max-w-xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Who is looking for help today?
        </h1>
        <p className="text-lg text-muted-foreground">
          Let us know so we can guide you to the right resources.
        </p>
      </div>

      {/* User type selection */}
      <UserTypeSelector />

      {/* Trust indicators */}
      <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldIcon className="h-4 w-4" />
          <span>HIPAA Compliant</span>
        </div>
        <div className="flex items-center gap-2">
          <LockIcon className="h-4 w-4" />
          <span>Secure & Private</span>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="h-4 w-4" />
          <span>~15 minutes</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple shield icon
 */
function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/**
 * Simple lock icon
 */
function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/**
 * Simple clock icon
 */
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

