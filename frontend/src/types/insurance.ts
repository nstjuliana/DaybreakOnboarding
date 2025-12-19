/**
 * @file Insurance Type Definitions
 * @description TypeScript types for insurance-related data structures.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

/**
 * Payment method options for insurance selection
 */
export type PaymentMethod = 'insurance' | 'self_pay' | 'no_insurance';

/**
 * Insurance card processing status
 */
export type InsuranceStatus =
  | 'pending'
  | 'extracting'
  | 'extracted'
  | 'verified'
  | 'failed';

/**
 * Relationship to patient options
 */
export type RelationshipToPatient =
  | 'self'
  | 'spouse'
  | 'child'
  | 'parent'
  | 'other';

/**
 * Payment method configuration with labels and descriptions
 */
export const PAYMENT_METHOD_CONFIG: Record<
  PaymentMethod,
  { label: string; description: string; icon: string }
> = {
  insurance: {
    label: 'I have insurance',
    description: 'Submit your insurance information for coverage',
    icon: 'shield-check',
  },
  self_pay: {
    label: 'I will self-pay',
    description: 'Pay out-of-pocket for services',
    icon: 'credit-card',
  },
  no_insurance: {
    label: "I don't have insurance",
    description: 'Learn about payment options and financial assistance',
    icon: 'help-circle',
  },
};

/**
 * Relationship options for policyholder
 */
export const RELATIONSHIP_OPTIONS: Record<RelationshipToPatient, string> = {
  self: 'Self',
  spouse: 'Spouse',
  child: 'Child',
  parent: 'Parent',
  other: 'Other',
};

/**
 * Insurance card data from the API
 */
export interface InsuranceCard {
  id: string;
  provider: string | null;
  memberId: string | null;
  groupNumber: string | null;
  planName: string | null;
  policyholderName: string | null;
  policyholderDob: string | null;
  relationshipToPatient: RelationshipToPatient | null;
  paymentMethod: PaymentMethod;
  status: InsuranceStatus;
  statusLabel: string;
  paymentMethodLabel: string;
  extractionConfidence: number | null;
  hasFrontImage: boolean;
  hasBackImage: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Insurance form data for manual entry
 */
export interface InsuranceFormData {
  provider: string;
  memberId: string;
  groupNumber: string;
  planName?: string;
  policyholderName: string;
  policyholderDob: string;
  relationshipToPatient: RelationshipToPatient;
}

/**
 * OCR extraction result from GPT-4V
 */
export interface InsuranceExtraction {
  provider: string | null;
  memberId: string | null;
  groupNumber: string | null;
  planName: string | null;
  policyholderName: string | null;
  confidence: number;
  extractedAt: string;
}

/**
 * Maps API insurance card response (snake_case) to frontend type (camelCase)
 *
 * @param apiCard - Insurance card data from API
 * @returns Formatted insurance card object
 */
export function mapApiInsuranceCard(
  apiCard: Record<string, unknown>
): InsuranceCard {
  return {
    id: apiCard.id as string,
    provider: apiCard.provider as string | null,
    memberId: apiCard.member_id as string | null,
    groupNumber: apiCard.group_number as string | null,
    planName: apiCard.plan_name as string | null,
    policyholderName: apiCard.policyholder_name as string | null,
    policyholderDob: apiCard.policyholder_dob as string | null,
    relationshipToPatient: apiCard.relationship_to_patient as RelationshipToPatient | null,
    paymentMethod: apiCard.payment_method as PaymentMethod,
    status: apiCard.status as InsuranceStatus,
    statusLabel: apiCard.status_label as string,
    paymentMethodLabel: apiCard.payment_method_label as string,
    extractionConfidence: apiCard.extraction_confidence as number | null,
    hasFrontImage: apiCard.has_front_image as boolean,
    hasBackImage: apiCard.has_back_image as boolean,
    verified: apiCard.verified as boolean,
    createdAt: apiCard.created_at as string,
    updatedAt: apiCard.updated_at as string,
  };
}


