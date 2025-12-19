/**
 * @file DemographicsForm Component
 * @description Role-adaptive demographics collection form.
 *              Adjusts fields based on user type (parent vs minor).
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  GENDER_OPTIONS,
  PRONOUN_OPTIONS,
  US_STATES,
  type PatientFormData,
} from '@/types/patient';
import type { UserType } from '@/types/user';

/**
 * Validation schema for demographics form
 */
const demographicsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  preferredName: z.string().max(50).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  school: z.string().max(100).optional(),
  grade: z.string().optional(),
  addressLine1: z.string().max(100).optional(),
  addressLine2: z.string().max(100).optional(),
  city: z.string().max(50).optional(),
  state: z.string().max(2).optional(),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code').optional().or(z.literal('')),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactRelationship: z.string().max(50).optional(),
  emergencyContactPhone: z.string().optional(),
});

type DemographicsFormValues = z.infer<typeof demographicsSchema>;

/**
 * Props for DemographicsForm component
 */
interface DemographicsFormProps {
  /** User type determines which fields to show */
  userType: UserType;
  /** Initial values for editing */
  defaultValues?: Partial<PatientFormData>;
  /** Callback when form is submitted */
  onSubmit: (data: PatientFormData) => void;
  /** Whether form submission is in progress */
  isSubmitting?: boolean;
}

/**
 * DemographicsForm Component
 *
 * @description Collects patient demographics with role-appropriate fields.
 *              Parent flow collects child info; minor flow collects self info.
 *
 * @example
 * ```tsx
 * <DemographicsForm
 *   userType="parent"
 *   onSubmit={handleSubmit}
 * />
 * ```
 */
export function DemographicsForm({
  userType,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: DemographicsFormProps) {
  const isParent = userType === 'parent';
  const isMinor = userType === 'minor';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DemographicsFormValues>({
    resolver: zodResolver(demographicsSchema),
    defaultValues: {
      firstName: defaultValues?.firstName || '',
      lastName: defaultValues?.lastName || '',
      dateOfBirth: defaultValues?.dateOfBirth || '',
      gender: defaultValues?.gender || '',
      pronouns: defaultValues?.pronouns || '',
      preferredName: defaultValues?.preferredName || '',
      email: defaultValues?.email || '',
      phone: defaultValues?.phone || '',
      school: defaultValues?.school || '',
      grade: defaultValues?.grade || '',
      addressLine1: defaultValues?.addressLine1 || '',
      addressLine2: defaultValues?.addressLine2 || '',
      city: defaultValues?.city || '',
      state: defaultValues?.state || '',
      zipCode: defaultValues?.zipCode || '',
      emergencyContactName: defaultValues?.emergencyContactName || '',
      emergencyContactRelationship: defaultValues?.emergencyContactRelationship || '',
      emergencyContactPhone: defaultValues?.emergencyContactPhone || '',
    },
  });

  const handleFormSubmit = (data: DemographicsFormValues) => {
    onSubmit(data as PatientFormData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Patient/Self Information Section */}
      <section>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {isParent ? "Child's Information" : 'Your Information'}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {isParent
            ? 'Please provide information about your child who will be receiving care.'
            : 'Please provide your information.'}
        </p>

        <div className="space-y-4">
          {/* Name fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="First Name"
              required
              error={errors.firstName?.message}
            >
              <Input
                {...register('firstName')}
                placeholder="First name"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Last Name"
              required
              error={errors.lastName?.message}
            >
              <Input
                {...register('lastName')}
                placeholder="Last name"
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          {/* Preferred name */}
          <FormField
            label="Preferred Name"
            hint="What name would they like to be called?"
            error={errors.preferredName?.message}
          >
            <Input
              {...register('preferredName')}
              placeholder="Preferred name (optional)"
              disabled={isSubmitting}
            />
          </FormField>

          {/* DOB and Gender */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Date of Birth"
              required
              error={errors.dateOfBirth?.message}
            >
              <Input
                {...register('dateOfBirth')}
                type="date"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Gender" error={errors.gender?.message}>
              <select
                {...register('gender')}
                disabled={isSubmitting}
                className={selectClassName}
              >
                <option value="">Select gender</option>
                {Object.entries(GENDER_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Pronouns */}
          <FormField label="Pronouns" error={errors.pronouns?.message}>
            <select
              {...register('pronouns')}
              disabled={isSubmitting}
              className={selectClassName}
            >
              <option value="">Select pronouns</option>
              {Object.entries(PRONOUN_OPTIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormField>

          {/* School (optional) */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="School" hint="Optional" error={errors.school?.message}>
              <Input
                {...register('school')}
                placeholder="School name"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Grade" error={errors.grade?.message}>
              <Input
                {...register('grade')}
                placeholder="e.g., 8th grade"
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </div>
      </section>

      {/* Contact Information (for minors) */}
      {isMinor && (
        <section className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Contact Information
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Optional - how can we reach you if needed?
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Email" error={errors.email?.message}>
              <Input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Phone" error={errors.phone?.message}>
              <Input
                {...register('phone')}
                type="tel"
                placeholder="(555) 555-5555"
                disabled={isSubmitting}
              />
            </FormField>
          </div>
        </section>
      )}

      {/* Address (for parents) */}
      {isParent && (
        <section className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Address</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Your home address for records.
          </p>

          <div className="space-y-4">
            <FormField label="Street Address" error={errors.addressLine1?.message}>
              <Input
                {...register('addressLine1')}
                placeholder="123 Main St"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField label="Apt/Suite/Unit" error={errors.addressLine2?.message}>
              <Input
                {...register('addressLine2')}
                placeholder="Apt 4B (optional)"
                disabled={isSubmitting}
              />
            </FormField>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField label="City" error={errors.city?.message}>
                <Input
                  {...register('city')}
                  placeholder="City"
                  disabled={isSubmitting}
                />
              </FormField>

              <FormField label="State" error={errors.state?.message}>
                <select
                  {...register('state')}
                  disabled={isSubmitting}
                  className={selectClassName}
                >
                  <option value="">State</option>
                  {US_STATES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="ZIP Code" error={errors.zipCode?.message}>
                <Input
                  {...register('zipCode')}
                  placeholder="12345"
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </div>
        </section>
      )}

      {/* Emergency Contact */}
      <section className="border-t border-neutral-200 pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Emergency Contact
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {isMinor
            ? 'Someone we can contact in case of emergency (a parent or trusted adult).'
            : 'Someone we can contact in case of emergency.'}
        </p>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Contact Name"
              error={errors.emergencyContactName?.message}
            >
              <Input
                {...register('emergencyContactName')}
                placeholder="Full name"
                disabled={isSubmitting}
              />
            </FormField>

            <FormField
              label="Relationship"
              error={errors.emergencyContactRelationship?.message}
            >
              <Input
                {...register('emergencyContactRelationship')}
                placeholder="e.g., Mother, Father, Aunt"
                disabled={isSubmitting}
              />
            </FormField>
          </div>

          <FormField
            label="Phone Number"
            error={errors.emergencyContactPhone?.message}
          >
            <Input
              {...register('emergencyContactPhone')}
              type="tel"
              placeholder="(555) 555-5555"
              disabled={isSubmitting}
            />
          </FormField>
        </div>
      </section>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg" disabled={isSubmitting} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Continue to Matching'
          )}
        </Button>
      </div>
    </form>
  );
}

/**
 * Common select className
 */
const selectClassName = cn(
  'flex h-12 w-full rounded-md border border-neutral-200 bg-white px-4 py-2',
  'text-base ring-offset-white',
  'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50'
);

/**
 * Form field wrapper
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

