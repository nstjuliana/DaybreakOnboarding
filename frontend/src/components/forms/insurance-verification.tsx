/**
 * @file InsuranceVerification Component
 * @description Displays extracted insurance data for user verification.
 *              Shows confidence scores and allows corrections.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InsuranceForm } from './insurance-form';
import type { InsuranceCard, InsuranceFormData } from '@/types/insurance';
import { cn } from '@/lib/utils';

/**
 * Props for InsuranceVerification component
 */
interface InsuranceVerificationProps {
  /** The extracted insurance card data */
  insuranceCard: InsuranceCard;
  /** Callback when user confirms the data */
  onConfirm: () => void;
  /** Callback when user wants to edit */
  onEdit: (data: InsuranceFormData) => void;
  /** Whether confirmation is in progress */
  isConfirming?: boolean;
  /** Whether edit is in progress */
  isEditing?: boolean;
}

/**
 * InsuranceVerification Component
 *
 * @description Shows extracted insurance information for user review.
 *              Highlights confidence levels and allows corrections.
 *
 * @example
 * ```tsx
 * <InsuranceVerification
 *   insuranceCard={extractedCard}
 *   onConfirm={handleConfirm}
 *   onEdit={handleEdit}
 * />
 * ```
 */
export function InsuranceVerification({
  insuranceCard,
  onConfirm,
  onEdit,
  isConfirming = false,
  isEditing = false,
}: InsuranceVerificationProps) {
  const [isEditMode, setIsEditMode] = useState(false);

  const confidence = insuranceCard.extractionConfidence || 0;
  const isHighConfidence = confidence >= 0.8;
  const isMediumConfidence = confidence >= 0.5 && confidence < 0.8;

  // If in edit mode, show the form
  if (isEditMode) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Edit Insurance Information
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditMode(false)}
          >
            Cancel
          </Button>
        </div>
        <InsuranceForm
          defaultValues={{
            provider: insuranceCard.provider || '',
            memberId: insuranceCard.memberId || '',
            groupNumber: insuranceCard.groupNumber || '',
            planName: insuranceCard.planName || '',
            policyholderName: insuranceCard.policyholderName || '',
            policyholderDob: insuranceCard.policyholderDob || '',
            relationshipToPatient: insuranceCard.relationshipToPatient || 'self',
          }}
          onSubmit={(data) => {
            onEdit(data);
            setIsEditMode(false);
          }}
          isSubmitting={isEditing}
          mode="verify"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confidence indicator */}
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-lg',
          isHighConfidence && 'bg-success-50 text-success-600',
          isMediumConfidence && 'bg-warning-50 text-warning-600',
          !isHighConfidence && !isMediumConfidence && 'bg-neutral-100 text-neutral-600'
        )}
      >
        {isHighConfidence ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
        <div>
          <p className="font-medium">
            {isHighConfidence
              ? 'Information extracted successfully'
              : 'Please verify the extracted information'}
          </p>
          <p className="text-sm opacity-80">
            {isHighConfidence
              ? 'Please review and confirm the details below are correct.'
              : 'Some fields may need correction. Please review carefully.'}
          </p>
        </div>
      </div>

      {/* Extracted data display */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Insurance Details</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditMode(true)}
            className="gap-2"
          >
            <Edit2 className="h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="divide-y divide-neutral-100">
          <DataRow label="Insurance Provider" value={insuranceCard.provider} />
          <DataRow label="Member ID" value={insuranceCard.memberId} required />
          <DataRow label="Group Number" value={insuranceCard.groupNumber} />
          <DataRow label="Plan Name" value={insuranceCard.planName} />
          <DataRow
            label="Policyholder Name"
            value={insuranceCard.policyholderName}
          />
          <DataRow
            label="Policyholder DOB"
            value={
              insuranceCard.policyholderDob
                ? new Date(insuranceCard.policyholderDob).toLocaleDateString()
                : null
            }
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={() => setIsEditMode(true)}
          disabled={isConfirming}
        >
          Make Corrections
        </Button>
        <Button
          size="lg"
          onClick={onConfirm}
          disabled={isConfirming}
          className="gap-2"
        >
          {isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Confirm & Continue
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Individual data row for displaying extracted values
 */
interface DataRowProps {
  label: string;
  value: string | null | undefined;
  required?: boolean;
}

function DataRow({ label, value, required = false }: DataRowProps) {
  const isEmpty = !value || value.trim() === '';

  return (
    <div className="px-6 py-3 flex justify-between items-center">
      <span className="text-sm text-muted-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </span>
      <span
        className={cn(
          'text-sm font-medium',
          isEmpty ? 'text-muted-foreground italic' : 'text-foreground'
        )}
      >
        {isEmpty ? 'Not provided' : value}
      </span>
    </div>
  );
}

