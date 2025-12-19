/**
 * @file OnboardingHeader Component
 * @description Header for the onboarding flow with logo, progress indicator,
 *              and save/exit options.
 *
 * @see {@link _docs/ui-rules.md} Navigation
 */

'use client';

import Link from 'next/link';
import { useOnboarding } from '@/stores/onboarding-store';
import { ProgressIndicator, ProgressIndicatorMobile } from './progress-indicator';
import { SaveProgressButton } from './save-progress-button';

/**
 * Header component for onboarding pages
 * Shows logo, progress, and save option
 */
export function OnboardingHeader() {
  const { state } = useOnboarding();

  // Don't show progress on Phase 0 (identification)
  const showProgress = state.currentPhase !== 'phase-0';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-content">
        {/* Top row: Logo and Save button */}
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-primary font-semibold text-lg hover:opacity-80 transition-opacity"
          >
            <DaybreakLogo className="h-8 w-8" />
            <span className="hidden sm:inline">Daybreak Health</span>
          </Link>

          {/* Save button (only show after Phase 0) */}
          {showProgress && <SaveProgressButton />}
        </div>

        {/* Progress indicator row */}
        {showProgress && (
          <>
            {/* Desktop progress */}
            <div className="hidden md:block pb-4">
              <ProgressIndicator />
            </div>

            {/* Mobile progress */}
            <div className="md:hidden pb-3">
              <ProgressIndicatorMobile />
            </div>
          </>
        )}
      </div>
    </header>
  );
}

/**
 * Simple Daybreak logo component
 */
function DaybreakLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Sun/sunrise icon representing daybreak */}
      <circle
        cx="16"
        cy="20"
        r="8"
        fill="currentColor"
        opacity="0.2"
      />
      <path
        d="M16 12V4M8 14L4 10M24 14L28 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 20H28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 20C8 15.5817 11.5817 12 16 12C20.4183 12 24 15.5817 24 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

