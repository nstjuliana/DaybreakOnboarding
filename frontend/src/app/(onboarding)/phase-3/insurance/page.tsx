/**
 * @file Phase 3B Insurance Page
 * @description Insurance selection and capture page for Phase 3.
 *              Supports insurance upload with OCR, manual entry, and self-pay options.
 *
 * @see {@link _docs/user-flow.md} Phase 3B: Payment/Insurance
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { InsuranceSelector } from '@/components/forms/insurance-selector';
import { InsuranceUpload } from '@/components/forms/insurance-upload';
import { InsuranceForm } from '@/components/forms/insurance-form';
import { InsuranceVerification } from '@/components/forms/insurance-verification';
import { useInsuranceUpload } from '@/hooks/use-insurance-upload';
import type { PaymentMethod } from '@/types/insurance';

/**
 * Phase 3B: Insurance Selection Page
 * Handles payment method selection and insurance capture
 */
export default function Phase3InsurancePage() {
  const router = useRouter();
  const { state, setPhase } = useOnboarding();
  const {
    step,
    insuranceCard,
    isLoading,
    error,
    selectPaymentMethod,
    uploadImages,
    switchToManual,
    submitManualEntry,
    confirmVerification,
    updateData,
  } = useInsuranceUpload();

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

  // Navigate to next step when complete
  useEffect(() => {
    if (step === 'complete') {
      router.push('/phase-3/demographics');
    }
  }, [step, router]);

  // Handle back navigation
  function handleBack() {
    if (step === 'upload' || step === 'manual') {
      // Go back to selection
      window.location.reload();
    } else {
      router.push('/phase-3/account');
    }
  }

  // Don't render until we have user type
  if (!state.userType) {
    return null;
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {getHeaderTitle(step)}
        </h1>
        <p className="text-muted-foreground">{getHeaderSubtitle(step)}</p>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 text-primary" />
        <span>Your information is encrypted and HIPAA compliant</span>
      </div>

      {/* Error display */}
      {error && (
        <div className="w-full max-w-xl mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Content based on step */}
      <div className="w-full max-w-xl">
        {step === 'select' && (
          <InsuranceSelectionStep
            onSelect={selectPaymentMethod}
            isLoading={isLoading}
          />
        )}

        {step === 'upload' && (
          <InsuranceUploadStep
            onUpload={uploadImages}
            onManualEntry={switchToManual}
            isLoading={isLoading}
          />
        )}

        {step === 'manual' && (
          <InsuranceManualStep
            onSubmit={submitManualEntry}
            isLoading={isLoading}
          />
        )}

        {step === 'verify' && insuranceCard && (
          <InsuranceVerification
            insuranceCard={insuranceCard}
            onConfirm={confirmVerification}
            onEdit={updateData}
            isConfirming={isLoading}
            isEditing={isLoading}
          />
        )}
      </div>

      {/* Back button */}
      <div className="mt-8">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
    </div>
  );
}

/**
 * Gets the header title based on current step
 */
function getHeaderTitle(step: string): string {
  switch (step) {
    case 'select':
      return 'How will you pay for services?';
    case 'upload':
      return 'Upload Your Insurance Card';
    case 'manual':
      return 'Enter Insurance Information';
    case 'verify':
      return 'Verify Your Information';
    default:
      return 'Insurance Information';
  }
}

/**
 * Gets the header subtitle based on current step
 */
function getHeaderSubtitle(step: string): string {
  switch (step) {
    case 'select':
      return 'Select the option that best describes your situation.';
    case 'upload':
      return "Take a photo of your card and we'll extract the information automatically.";
    case 'manual':
      return 'Enter your insurance details below.';
    case 'verify':
      return 'Please review the information we extracted and make any corrections.';
    default:
      return '';
  }
}

/**
 * Payment method selection step
 */
interface InsuranceSelectionStepProps {
  onSelect: (method: PaymentMethod) => void;
  isLoading: boolean;
}

function InsuranceSelectionStep({
  onSelect,
  isLoading,
}: InsuranceSelectionStepProps) {
  return (
    <div className="space-y-6">
      <InsuranceSelector
        value={null}
        onChange={onSelect}
        disabled={isLoading}
      />

      {/* Self-pay info */}
      <div className="p-4 bg-neutral-50 rounded-lg">
        <h3 className="font-medium text-foreground mb-2">
          About Self-Pay Options
        </h3>
        <p className="text-sm text-muted-foreground">
          If you don&apos;t have insurance or prefer to pay out-of-pocket, we offer
          competitive rates and can discuss payment plans. Financial assistance
          may be available.
        </p>
      </div>
    </div>
  );
}

/**
 * Insurance card upload step
 */
interface InsuranceUploadStepProps {
  onUpload: (front: File, back?: File) => void;
  onManualEntry: () => void;
  isLoading: boolean;
}

function InsuranceUploadStep({
  onUpload,
  onManualEntry,
  isLoading,
}: InsuranceUploadStepProps) {
  return (
    <div className="space-y-6">
      <InsuranceUpload onUpload={onUpload} isUploading={isLoading} />

      <div className="text-center border-t border-neutral-200 pt-6">
        <p className="text-sm text-muted-foreground mb-3">
          Prefer to type it in?
        </p>
        <Button variant="outline" onClick={onManualEntry} disabled={isLoading}>
          Enter Manually Instead
        </Button>
      </div>
    </div>
  );
}

/**
 * Manual insurance entry step
 */
interface InsuranceManualStepProps {
  onSubmit: (data: Parameters<typeof submitManualEntry>[0]) => void;
  isLoading: boolean;
}

function InsuranceManualStep({ onSubmit, isLoading }: InsuranceManualStepProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <InsuranceForm onSubmit={onSubmit} isSubmitting={isLoading} mode="create" />
    </div>
  );
}

// Type helper for the submitManualEntry function
type submitManualEntry = ReturnType<typeof useInsuranceUpload>['submitManualEntry'];


