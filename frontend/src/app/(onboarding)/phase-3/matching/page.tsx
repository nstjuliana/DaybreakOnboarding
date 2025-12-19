/**
 * @file Phase 3D Matching Page
 * @description Clinician matching page where users see their matched clinician.
 *              Uses weighted matching algorithm based on assessment results.
 *              Displays insurance match status and estimated costs.
 *
 * @see {@link _docs/user-flow.md} Phase 3D: Clinician Matching
 */

'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw, Loader2, Star, DollarSign, Shield, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { ClinicianCard } from '@/components/onboarding/clinician-card';
import { useClinicianMatch } from '@/hooks/use-clinician-match';
import type { Clinician } from '@/types/clinician';
import { cn } from '@/lib/utils';

/**
 * Estimated pricing tiers for sessions
 * Note: These are example rates for demonstration purposes
 */
const PRICING = {
  /** Standard session rate for self-pay */
  selfPayRate: 175,
  /** Typical copay range when in-network */
  inNetworkCopay: { min: 20, max: 50 },
  /** Out-of-network rate (patient pays more) */
  outOfNetworkRate: { min: 100, max: 175 },
  /** Sliding scale minimum */
  slidingScaleMin: 50,
};

/**
 * Checks if a clinician accepts the user's insurance
 */
function checkInsuranceMatch(clinician: Clinician, userProvider: string | null): boolean {
  if (!userProvider || !clinician.acceptedInsurances?.length) return false;
  
  const normalizedUserProvider = userProvider.toLowerCase();
  return clinician.acceptedInsurances.some((insurance) => {
    const normalizedInsurance = insurance.toLowerCase();
    return normalizedInsurance.includes(normalizedUserProvider) ||
           normalizedUserProvider.includes(normalizedInsurance);
  });
}

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
    userInsuranceStatus,
    userInsuranceProvider,
  } = useClinicianMatch();

  /**
   * Determines if the selected clinician accepts the user's insurance
   */
  const hasInsuranceMatch = useMemo(() => {
    if (!selectedMatch?.clinician || userInsuranceStatus !== 'insured') return false;
    return checkInsuranceMatch(selectedMatch.clinician, userInsuranceProvider);
  }, [selectedMatch, userInsuranceStatus, userInsuranceProvider]);

  /**
   * Calculates estimated cost information based on insurance status
   */
  const costEstimate = useMemo(() => {
    if (!selectedMatch?.clinician) return null;

    const clinician = selectedMatch.clinician;

    if (userInsuranceStatus === 'insured') {
      if (hasInsuranceMatch) {
        return {
          type: 'in_network' as const,
          label: 'In-Network Copay',
          range: `$${PRICING.inNetworkCopay.min} - $${PRICING.inNetworkCopay.max}`,
          description: 'Your estimated copay per session (varies by plan)',
          highlight: true,
        };
      } else {
        return {
          type: 'out_of_network' as const,
          label: 'Out-of-Network Estimate',
          range: `$${PRICING.outOfNetworkRate.min} - $${PRICING.outOfNetworkRate.max}`,
          description: 'You may submit for out-of-network reimbursement',
          highlight: false,
        };
      }
    }

    if (userInsuranceStatus === 'self_pay') {
      return {
        type: 'self_pay' as const,
        label: 'Self-Pay Rate',
        range: `$${PRICING.selfPayRate}`,
        description: 'Per 50-minute session',
        highlight: clinician.acceptsSelfPay ?? false,
      };
    }

    if (userInsuranceStatus === 'uninsured') {
      if (clinician.offersSlidingScale) {
        return {
          type: 'sliding_scale' as const,
          label: 'Sliding Scale Available',
          range: `Starting at $${PRICING.slidingScaleMin}`,
          description: 'Based on your financial situation',
          highlight: true,
        };
      }
      return {
        type: 'self_pay' as const,
        label: 'Session Rate',
        range: `$${PRICING.selfPayRate}`,
        description: 'Financial assistance may be available',
        highlight: false,
      };
    }

    return null;
  }, [selectedMatch, userInsuranceStatus, hasInsuranceMatch]);

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
            <ClinicianCard 
              clinician={selectedMatch.clinician} 
              isSelected
              userInsuranceProvider={userInsuranceProvider}
              userInsuranceStatus={userInsuranceStatus}
            />

            {/* Estimated Cost Section */}
            {costEstimate && (
              <div 
                className={cn(
                  'mt-4 p-4 rounded-lg border-2',
                  costEstimate.highlight 
                    ? 'bg-emerald-50 border-emerald-200' 
                    : 'bg-amber-50 border-amber-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className={cn(
                      'p-2 rounded-full',
                      costEstimate.highlight ? 'bg-emerald-100' : 'bg-amber-100'
                    )}
                  >
                    {costEstimate.highlight ? (
                      <Shield className={cn('h-5 w-5', costEstimate.highlight ? 'text-emerald-600' : 'text-amber-600')} />
                    ) : (
                      <DollarSign className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 
                        className={cn(
                          'text-sm font-semibold',
                          costEstimate.highlight ? 'text-emerald-800' : 'text-amber-800'
                        )}
                      >
                        {costEstimate.label}
                      </h3>
                      <span 
                        className={cn(
                          'text-lg font-bold',
                          costEstimate.highlight ? 'text-emerald-700' : 'text-amber-700'
                        )}
                      >
                        {costEstimate.range}
                      </span>
                    </div>
                    <p 
                      className={cn(
                        'text-sm mt-1',
                        costEstimate.highlight ? 'text-emerald-600' : 'text-amber-600'
                      )}
                    >
                      {costEstimate.description}
                    </p>
                    {costEstimate.type === 'out_of_network' && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-700">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>This provider is not in your insurance network</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Match reasons */}
            {selectedMatch.reasons.length > 0 && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Why we matched you
                </h3>
                <ul className="space-y-1">
                  {selectedMatch.reasons.map((reason, index) => (
                    <li
                      key={index}
                      className="text-sm text-foreground/70 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary/40" />
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

