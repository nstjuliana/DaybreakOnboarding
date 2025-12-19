/**
 * @file Phase 3C Demographics Page
 * @description Demographics collection page for Phase 3.
 *              Collects patient/child information based on user type.
 *
 * @see {@link _docs/user-flow.md} Phase 3C: Demographics Collection
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { DemographicsForm } from '@/components/forms/demographics-form';
import { apiPost } from '@/lib/api/client';
import type { PatientFormData } from '@/types/patient';

/**
 * Phase 3C: Demographics Collection Page
 * Collects patient information appropriate to user type
 */
export default function Phase3DemographicsPage() {
  const router = useRouter();
  const { state, setPhase } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  /**
   * Handles demographics form submission
   */
  async function handleSubmit(data: PatientFormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiPost('/patients', {
        patient: {
          first_name: data.firstName,
          last_name: data.lastName,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
          pronouns: data.pronouns,
          preferred_name: data.preferredName,
          email: data.email,
          phone: data.phone,
          school: data.school,
          grade: data.grade,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
          emergency_contact_name: data.emergencyContactName,
          emergency_contact_relationship: data.emergencyContactRelationship,
          emergency_contact_phone: data.emergencyContactPhone,
        },
      });

      // Navigate to matching
      router.push('/phase-3/matching');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save information'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Handles back navigation
   */
  function handleBack() {
    router.push('/phase-3/insurance');
  }

  // Don't render until we have user type
  if (!state.userType) {
    return null;
  }

  // Determine the subject based on user type
  const isParent = state.userType === 'parent';
  const isFriend = state.userType === 'friend';

  // Friend flow has different handling
  if (isFriend) {
    return (
      <div className="flex flex-col items-center animate-fade-in">
        <div className="text-center mb-8 max-w-xl">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Your Contact Information
          </h1>
          <p className="text-muted-foreground">
            We&apos;ll use this to send you resources and follow up.
          </p>
        </div>

        {/* Simplified form for friends */}
        <div className="w-full max-w-xl bg-white rounded-xl border border-neutral-200 p-6">
          <p className="text-sm text-muted-foreground mb-6">
            As a concerned friend, we&apos;ll provide you with resources to help
            support your loved one. Your account information is sufficient for now.
          </p>
          <Button size="lg" onClick={() => router.push('/phase-3/matching')}>
            Continue to Resources
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="h-6 w-6 text-primary-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {isParent ? "Tell Us About Your Child" : 'Tell Us About Yourself'}
        </h1>
        <p className="text-muted-foreground">
          {isParent
            ? 'This information helps us match your child with the right clinician.'
            : 'This information helps us provide you with the best care.'}
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="w-full max-w-xl mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Demographics form */}
      <div className="w-full max-w-xl bg-white rounded-xl border border-neutral-200 p-6">
        <DemographicsForm
          userType={state.userType}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Back button */}
      <div className="mt-8">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Insurance
        </Button>
      </div>

      {/* Privacy note */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-xs text-muted-foreground">
          Your information is protected by HIPAA and our strict privacy policy.
          We only share information with your care team.
        </p>
      </div>
    </div>
  );
}


