/**
 * @file Phase 3D Matching Page
 * @description Clinician matching page where users see their matched clinician.
 *              Uses weighted matching algorithm based on assessment results.
 *
 * @see {@link _docs/user-flow.md} Phase 3D: Clinician Matching
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { ClinicianCard } from '@/components/onboarding/clinician-card';
import { useClinicianMatch } from '@/hooks/use-clinician-match';

/**
 * Phase 3D: Clinician Matching page
 * Shows matched clinician with option to request different match
 */
export default function Phase3MatchingPage() {
  const router = useRouter();
  const { setPhase, completePhase, setClinicianId } = useOnboarding();
  const {
    selectedMatch,
    matches,
    isLoading,
    error,
    fetchMatches,
    requestDifferentMatch,
  } = useClinicianMatch();

  // Set current phase
  useEffect(() => {
    setPhase('phase-3');
  }, [setPhase]);

  // Fetch matches on mount
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Update clinician ID when match changes
  useEffect(() => {
    if (selectedMatch) {
      setClinicianId(selectedMatch.clinician.id);
    }
  }, [selectedMatch, setClinicianId]);

  /**
   * Handles continuing to scheduling
   */
  function handleContinue() {
    completePhase('phase-3');
    setPhase('phase-4');
    router.push('/phase-4');
  }

  /**
   * Handles requesting a different match
   */
  function handleRequestDifferent() {
    requestDifferentMatch();
  }

  const hasMultipleMatches = matches.length > 1;

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {isLoading ? 'Finding Your Match' : "We've Found Your Match"}
        </h1>
        <p className="text-muted-foreground">
          {isLoading
            ? 'Looking for the perfect clinician for your needs...'
            : 'Based on your responses, we think this clinician would be a great fit.'}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Matching you with a clinician...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchMatches()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Clinician card */}
      {selectedMatch && !isLoading && (
        <>
          <div className="w-full max-w-md">
            <ClinicianCard clinician={selectedMatch.clinician} isSelected />

            {/* Match reasons */}
            {selectedMatch.reasons.length > 0 && (
              <div className="mt-4 p-4 bg-primary-50 rounded-lg">
                <h3 className="text-sm font-medium text-primary-700 mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Why we matched you
                </h3>
                <ul className="space-y-1">
                  {selectedMatch.reasons.map((reason, index) => (
                    <li
                      key={index}
                      className="text-sm text-primary-600 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary-400" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            {hasMultipleMatches && (
              <Button
                variant="outline"
                onClick={handleRequestDifferent}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                View Other Matches ({matches.length - 1} more)
              </Button>
            )}

            <Button size="lg" onClick={handleContinue} className="gap-2">
              Continue to Scheduling
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* Info text */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-xs text-muted-foreground">
          You&apos;ll have the opportunity to connect with your clinician before
          committing to ongoing care. If it&apos;s not the right fit, we&apos;ll help
          you find someone else.
        </p>
      </div>
    </div>
  );
}

