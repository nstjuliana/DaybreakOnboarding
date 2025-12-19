/**
 * @file Phase 4 Page
 * @description Commitment phase - Shows completion for MVP.
 *              In future phases, this will be the scheduling interface.
 *
 * @see {@link _docs/user-flow.md} Phase 4: Commitment (Care)
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';

/**
 * Phase 4: Commitment page
 * For MVP, shows completion message and next steps
 */
export default function Phase4Page() {
  const router = useRouter();
  const { state, setPhase, completePhase, clearProgress } = useOnboarding();

  // Set current phase
  useEffect(() => {
    setPhase('phase-4');
  }, [setPhase]);

  /**
   * Handles completing the onboarding flow
   */
  function handleComplete() {
    completePhase('phase-4');
    clearProgress(); // Clear saved progress since we're done
    // In production, redirect to patient portal
    // For now, just go back to start
    router.push('/');
  }

  return (
    <div className="flex flex-col items-center animate-fade-in text-center">
      {/* Success icon */}
      <div className="mb-6">
        <div className="h-20 w-20 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle2 className="h-12 w-12 text-success" />
        </div>
      </div>

      {/* Header */}
      <div className="mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          You're All Set!
        </h1>
        <p className="text-lg text-muted-foreground">
          Thank you for completing the onboarding process. We're excited to
          support you on your mental health journey.
        </p>
      </div>

      {/* Next steps card */}
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 mb-8">
        <h2 className="font-semibold text-foreground mb-4">What's Next</h2>
        <ul className="space-y-4 text-left">
          <li className="flex gap-3">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">1</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Check Your Email</p>
              <p className="text-sm text-muted-foreground">
                We've sent you a confirmation with next steps and login
                details.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">2</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Schedule Appointment</p>
              <p className="text-sm text-muted-foreground">
                Our team will reach out to help you schedule your first
                session.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">3</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Meet Your Clinician</p>
              <p className="text-sm text-muted-foreground">
                Connect with your matched clinician and begin your care
                journey.
              </p>
            </div>
          </li>
        </ul>
      </div>

      {/* MVP notice */}
      <div className="w-full max-w-md rounded-lg bg-secondary/50 p-4 mb-8">
        <p className="text-sm text-muted-foreground">
          <strong>MVP Note:</strong> In the full version, you would be able to
          schedule your appointment directly from this page using a calendar
          interface.
        </p>
      </div>

      {/* Action button */}
      <Button size="lg" onClick={handleComplete} className="gap-2">
        Return to Home
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* Support info */}
      <div className="mt-8">
        <p className="text-sm text-muted-foreground">
          Questions?{' '}
          <a
            href="mailto:support@daybreakhealth.com"
            className="text-primary hover:underline"
          >
            Contact our support team
          </a>
        </p>
      </div>
    </div>
  );
}

