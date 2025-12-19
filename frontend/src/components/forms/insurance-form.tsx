/**
 * @file InsuranceForm Component
 * @description Manual entry form for insurance information.
 *              Used for fallback when OCR fails or user prefers manual entry.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  insuranceFormSchema,
  type InsuranceFormValues,
  COMMON_PROVIDERS,
} from '@/lib/validation/insurance-schema';
import { RELATIONSHIP_OPTIONS } from '@/types/insurance';
import { cn } from '@/lib/utils';

/**
 * Props for InsuranceForm component
 */
interface InsuranceFormProps {
  /** Initial values from OCR extraction */
  defaultValues?: Partial<InsuranceFormValues>;
  /** Callback when form is submitted */
  onSubmit: (data: InsuranceFormValues) => void;
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
  /** Mode of the form */
  mode?: 'create' | 'verify';
}

/**
 * InsuranceForm Component
 *
 * @description Form for entering or verifying insurance information.
 *              Pre-fills with OCR data when available.
 *
 * @example
 * ```tsx
 * <InsuranceForm
 *   defaultValues={extractedData}
 *   onSubmit={handleSubmit}
 *   mode="verify"
 * />
 * ```
 */
export function InsuranceForm({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create',
}: InsuranceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InsuranceFormValues>({
    resolver: zodResolver(insuranceFormSchema),
    defaultValues: {
      provider: defaultValues?.provider || '',
      memberId: defaultValues?.memberId || '',
      groupNumber: defaultValues?.groupNumber || '',
      planName: defaultValues?.planName || '',
      policyholderName: defaultValues?.policyholderName || '',
      policyholderDob: defaultValues?.policyholderDob || '',
      relationshipToPatient: defaultValues?.relationshipToPatient || 'self',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Provider */}
      <FormField
        label="Insurance Provider"
        required
        error={errors.provider?.message}
      >
        <Input
          {...register('provider')}
          type="text"
          list="providers-list"
          placeholder="e.g., Blue Cross Blue Shield"
          disabled={isSubmitting}
        />
        <datalist id="providers-list">
          {COMMON_PROVIDERS.map((provider) => (
            <option key={provider} value={provider} />
          ))}
        </datalist>
      </FormField>

      {/* Member ID and Group Number */}
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Member ID"
          required
          error={errors.memberId?.message}
          hint="Usually found on the front of your card"
        >
          <Input
            {...register('memberId')}
            type="text"
            placeholder="e.g., ABC123456789"
            disabled={isSubmitting}
          />
        </FormField>

        <FormField
          label="Group Number"
          error={errors.groupNumber?.message}
          hint="May be labeled 'Group' or 'Grp'"
        >
          <Input
            {...register('groupNumber')}
            type="text"
            placeholder="e.g., GRP001"
            disabled={isSubmitting}
          />
        </FormField>
      </div>

      {/* Plan Name */}
      <FormField
        label="Plan Name"
        error={errors.planName?.message}
        hint="Optional - e.g., PPO, HMO, Gold Plan"
      >
        <Input
          {...register('planName')}
          type="text"
          placeholder="e.g., PPO Gold"
          disabled={isSubmitting}
        />
      </FormField>

      {/* Policyholder Section */}
      <div className="border-t border-neutral-200 pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Policyholder Information
        </h3>

        <div className="space-y-4">
          <FormField
            label="Policyholder Name"
            required
            error={errors.policyholderName?.message}
            hint="Name as it appears on the insurance card"
          >
            <Input
              {...register('policyholderName')}
              type="text"
              placeholder="e.g., Jane Doe"
              disabled={isSubmitting}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Policyholder Date of Birth"
              required
              error={errors.policyholderDob?.message}
            >
              <Input
                {...register('policyholderDob')}
                type="date"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Relationship to Patient"
              required
              error={errors.relationshipToPatient?.message}
            >
              <select
                {...register('relationshipToPatient')}
                disabled={isSubmitting}
                className={cn(
                  'flex h-12 w-full rounded-md border border-neutral-200 bg-white px-4 py-2',
                  'text-base ring-offset-white',
                  'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {Object.entries(RELATIONSHIP_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : mode === 'verify' ? (
            'Confirm & Continue'
          ) : (
            'Save Insurance Information'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * Form field wrapper with label and error display
 */
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

