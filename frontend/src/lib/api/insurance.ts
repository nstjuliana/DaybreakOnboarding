/**
 * @file Insurance API Client
 * @description API functions for insurance card operations.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

import { apiGet, apiPost, apiPatch } from './client';
import type {
  InsuranceCard,
  PaymentMethod,
  InsuranceFormData,
} from '@/types/insurance';

/**
 * Raw API response type for insurance card
 */
type InsuranceCardResponse = Record<string, unknown>;

/**
 * Fetches the current user's insurance card
 *
 * @returns Insurance card data or null if none exists
 */
export async function getInsuranceCard(): Promise<InsuranceCard | null> {
  const response = await apiGet<InsuranceCardResponse>('/insurance');
  if (response.data) {
    return mapInsuranceResponse(response.data);
  }
  return null;
}

/**
 * Creates a new insurance card with payment method selection
 *
 * @param paymentMethod - Selected payment method
 * @returns Created insurance card
 */
export async function createInsuranceCard(
  paymentMethod: PaymentMethod
): Promise<InsuranceCard> {
  const response = await apiPost<InsuranceCardResponse>('/insurance', {
    insurance: { payment_method: paymentMethod },
  });
  return mapInsuranceResponse(response.data!);
}

/**
 * Updates insurance card with form data
 *
 * @param id - Insurance card ID
 * @param data - Insurance form data
 * @returns Updated insurance card
 */
export async function updateInsuranceCard(
  id: string,
  data: Partial<InsuranceFormData>
): Promise<InsuranceCard> {
  const response = await apiPatch<InsuranceCardResponse>(`/insurance/${id}`, {
    insurance: {
      provider: data.provider,
      member_id: data.memberId,
      group_number: data.groupNumber,
      plan_name: data.planName,
      policyholder_name: data.policyholderName,
      policyholder_dob: data.policyholderDob,
      relationship_to_patient: data.relationshipToPatient,
    },
  });
  return mapInsuranceResponse(response.data!);
}

/**
 * Storage key for JWT token (must match client.ts)
 */
const TOKEN_STORAGE_KEY = 'daybreak_auth_token';

/**
 * Gets the stored authentication token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Uploads insurance card images and triggers OCR extraction
 *
 * @param frontImage - Front of card image file
 * @param backImage - Optional back of card image file
 * @returns Created insurance card with extraction in progress
 */
export async function uploadInsuranceCard(
  frontImage: File,
  backImage?: File
): Promise<InsuranceCard> {
  const formData = new FormData();
  formData.append('insurance[payment_method]', 'insurance');
  formData.append('insurance[front_image]', frontImage);
  if (backImage) {
    formData.append('insurance[back_image]', backImage);
  }

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  // Build headers with auth token
  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/insurance`, {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload insurance card');
  }

  const data = await response.json();
  return mapInsuranceResponse(data.data);
}

/**
 * Triggers OCR extraction on an existing insurance card
 *
 * @param id - Insurance card ID
 * @returns Extraction result with updated card
 */
export async function extractInsuranceData(id: string): Promise<{
  insuranceCard: InsuranceCard;
  extraction: Record<string, unknown>;
}> {
  const response = await apiPost<{
    insurance_card: InsuranceCardResponse;
    extraction: Record<string, unknown>;
  }>(`/insurance/${id}/extract`, {});

  return {
    insuranceCard: mapInsuranceResponse(response.data!.insurance_card),
    extraction: response.data!.extraction,
  };
}

/**
 * Marks insurance card as verified
 *
 * @param id - Insurance card ID
 * @returns Verified insurance card
 */
export async function verifyInsuranceCard(id: string): Promise<InsuranceCard> {
  const response = await apiPost<InsuranceCardResponse>(
    `/insurance/${id}/verify`,
    {}
  );
  return mapInsuranceResponse(response.data!);
}

/**
 * Maps API response to InsuranceCard type
 */
function mapInsuranceResponse(data: InsuranceCardResponse): InsuranceCard {
  return {
    id: data.id as string,
    provider: data.provider as string | null,
    memberId: data.member_id as string | null,
    groupNumber: data.group_number as string | null,
    planName: data.plan_name as string | null,
    policyholderName: data.policyholder_name as string | null,
    policyholderDob: data.policyholder_dob as string | null,
    relationshipToPatient: data.relationship_to_patient as InsuranceCard['relationshipToPatient'],
    paymentMethod: data.payment_method as InsuranceCard['paymentMethod'],
    status: data.status as InsuranceCard['status'],
    statusLabel: data.status_label as string,
    paymentMethodLabel: data.payment_method_label as string,
    extractionConfidence: data.extraction_confidence as number | null,
    hasFrontImage: data.has_front_image as boolean,
    hasBackImage: data.has_back_image as boolean,
    verified: data.verified as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  };
}


