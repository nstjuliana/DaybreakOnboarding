/**
 * @file Insurance Validation Schemas
 * @description Zod validation schemas for insurance form data.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

import { z } from 'zod';

/**
 * Payment method selection schema
 */
export const paymentMethodSchema = z.enum([
  'insurance',
  'self_pay',
  'no_insurance',
]);

/**
 * Relationship to patient schema
 */
export const relationshipSchema = z.enum([
  'self',
  'spouse',
  'child',
  'parent',
  'other',
]);

/**
 * Insurance form validation schema
 * Used for manual entry and verification
 */
export const insuranceFormSchema = z.object({
  provider: z
    .string()
    .min(2, 'Insurance provider is required')
    .max(100, 'Provider name is too long'),
  memberId: z
    .string()
    .min(4, 'Member ID must be at least 4 characters')
    .max(30, 'Member ID is too long')
    .regex(/^[A-Za-z0-9\-]+$/, 'Member ID can only contain letters, numbers, and hyphens'),
  groupNumber: z
    .string()
    .min(3, 'Group number must be at least 3 characters')
    .max(20, 'Group number is too long')
    .optional()
    .or(z.literal('')),
  planName: z
    .string()
    .max(100, 'Plan name is too long')
    .optional()
    .or(z.literal('')),
  policyholderName: z
    .string()
    .min(2, 'Policyholder name is required')
    .max(100, 'Name is too long'),
  policyholderDob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime()) && date < new Date();
      },
      { message: 'Please enter a valid date of birth' }
    ),
  relationshipToPatient: relationshipSchema,
});

/**
 * Type inferred from the insurance form schema
 */
export type InsuranceFormValues = z.infer<typeof insuranceFormSchema>;

/**
 * Common insurance providers for autocomplete
 */
export const COMMON_PROVIDERS = [
  'Aetna',
  'Anthem Blue Cross',
  'Blue Cross Blue Shield',
  'Cigna',
  'Humana',
  'Kaiser Permanente',
  'Medicaid',
  'Medicare',
  'Molina Healthcare',
  'Oscar Health',
  'UnitedHealthcare',
  'Other',
];

