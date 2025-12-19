/**
 * @file Phase 3 Coverage Page
 * @description Insurance/payment status selection page.
 *              Asks users if they are insured or self-paying
 *              to inform clinician matching.
 *
 * @see {@link _docs/user-flow.md} Phase 3: Logistics & Matching
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Shield, CreditCard, HelpCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding, type InsuranceStatus } from '@/stores/onboarding-store';
import { cn } from '@/lib/utils';

/**
 * Coverage option configuration
 */
const COVERAGE_OPTIONS: Array<{
  status: InsuranceStatus;
  icon: React.ElementType;
  title: string;
  description: string;
  highlight?: string;
}> = [
  {
    status: 'insured',
    icon: Shield,
    title: 'I have insurance',
    description: 'We accept most major insurance plans and will match you with in-network clinicians when possible.',
    highlight: 'Most common',
  },
  {
    status: 'self_pay',
    icon: CreditCard,
    title: 'I prefer to self-pay',
    description: 'Pay out-of-pocket for services. We offer competitive rates and payment plans.',
  },
  {
    status: 'uninsured',
    icon: HelpCircle,
    title: "I don't have insurance",
    description: 'No problem! We have options for uninsured families including sliding scale fees and financial assistance.',
  },
];

/**
 * Phase 3 Coverage: Insurance Status Selection page
 * Determines payment method for clinician matching
 */
export default function Phase3CoveragePage() {
  const router = useRouter();
  const { state, setPhase, setInsuranceStatus, saveProgress } = useOnboarding();
  const [selectedStatus, setSelectedStatus] = useState<InsuranceStatus>(
    state.insuranceStatus
  );

  // Set current phase
  useEffect(() => {
    setPhase('phase-3');
  }, [setPhase]);

  // Redirect if prerequisites not met
  useEffect(() => {
    if (!state.userType) {
      router.push('/phase-0');
    }
  }, [state.userType, router]);

  // Don't render until we have user type
  if (!state.userType) {
    return null;
  }

  /**
   * Handles coverage option selection
   */
  function handleSelect(status: InsuranceStatus) {
    setSelectedStatus(status);
  }

  /**
   * Handles continue to matching or insurance details
   */
  function handleContinue() {
    if (!selectedStatus) return;

    setInsuranceStatus(selectedStatus);
    saveProgress();

    // If they have insurance, go to insurance details page
    // Otherwise, skip to matching
    if (selectedStatus === 'insured') {
      router.push('/phase-3/insurance');
    } else {
      router.push('/phase-3/matching');
    }
  }

  /**
   * Handles browsing all clinicians
   */
  function handleBrowseAll() {
    router.push('/clinicians');
  }

  /**
   * Handles back navigation
   */
  function handleBack() {
    router.push('/phase-3/account');
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          How will you be paying for care?
        </h1>
        <p className="text-muted-foreground">
          This helps us match you with clinicians who fit your needs.
        </p>
      </div>

      {/* Coverage options */}
      <div className="w-full max-w-2xl space-y-4">
        {COVERAGE_OPTIONS.map((option) => {
          const isSelected = selectedStatus === option.status;
          const Icon = option.icon;

          return (
            <button
              key={option.status}
              type="button"
              onClick={() => handleSelect(option.status)}
              className={cn(
                'relative w-full flex items-start gap-4 p-6 rounded-xl border-2 transition-all duration-200 text-left',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
              )}
            >
              {/* Selection indicator */}
              <div
                className={cn(
                  'absolute top-4 right-4 h-5 w-5 rounded-full border-2 transition-colors flex items-center justify-center',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30 bg-background'
                )}
              >
                {isSelected && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    className="h-3 w-3"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>

              {/* Highlight badge */}
              {option.highlight && (
                <span className="absolute -top-3 left-4 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                  {option.highlight}
                </span>
              )}

              {/* Icon */}
              <div
                className={cn(
                  'p-3 rounded-full transition-colors flex-shrink-0',
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <div className="flex-1 pr-8">
                <h3
                  className={cn(
                    'text-lg font-semibold mb-1',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}
                >
                  {option.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedStatus}
          className="min-w-[200px] gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Browse all clinicians option */}
      <div className="mt-6 pt-6 border-t border-border w-full max-w-md text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Want to see all available clinicians first?
        </p>
        <Button
          variant="outline"
          onClick={handleBrowseAll}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Browse All Clinicians
        </Button>
      </div>

      {/* Back button */}
      <div className="mt-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Helper text */}
      <p className="mt-6 text-center text-xs text-muted-foreground max-w-md">
        Don&apos;t worry — you can change this later. We want to make sure you get 
        connected with a clinician who works with your situation.
      </p>
    </div>
  );
}

