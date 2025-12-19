/**
 * @file Phase 3A Account Page
 * @description Account creation page where users register
 *              to save their progress and continue onboarding.
 *
 * @see {@link _docs/user-flow.md} Phase 3A: Account Creation
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { useAuth } from '@/hooks/use-auth';
import { RegistrationForm } from '@/components/forms/registration-form';

/**
 * Phase 3A: Account Creation page
 * User registration before clinician matching
 */
export default function Phase3AccountPage() {
  const router = useRouter();
  const { state, setPhase, completePhase } = useOnboarding();
  const { register, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Set current phase and redirect if prerequisites not met
  useEffect(() => {
    setPhase('phase-3');

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
   * Handles registration form submission
   */
  async function handleSubmit(data: {
    email: string;
    password: string;
    passwordConfirmation: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }) {
    setError(null);

    try {
      await register({
        email: data.email,
        password: data.password,
        passwordConfirmation: data.passwordConfirmation,
        userType: state.userType!,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      // Mark phase complete and navigate to matching
      completePhase('phase-3');
      router.push('/phase-3/matching');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  /**
   * Handles back navigation
   */
  function handleBack() {
    router.push('/phase-2');
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Create Your Account
        </h1>
        <p className="text-muted-foreground">
          Save your progress and get matched with a clinician.
        </p>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>Your information is encrypted and HIPAA compliant</span>
      </div>

      {/* Registration form */}
      <div className="w-full max-w-md">
        {(error || authError) && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error || authError}</p>
          </div>
        )}

        <RegistrationForm
          userType={state.userType}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Back button */}
      <div className="mt-8">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Assessment
        </Button>
      </div>

      {/* Benefits list */}
      <div className="mt-8 max-w-md">
        <h3 className="text-sm font-medium text-foreground mb-3 text-center">
          With your account, you can:
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <CheckIcon />
            Save your progress and return anytime
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon />
            Get matched with the right clinician
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon />
            Schedule and manage appointments
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon />
            Access your care portal securely
          </li>
        </ul>
      </div>
    </div>
  );
}

/**
 * Simple check icon for benefit list
 */
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4 text-success flex-shrink-0"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

