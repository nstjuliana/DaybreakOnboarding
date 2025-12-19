/**
 * @file clinicians.ts
 * @description API functions for clinician-related operations.
 *              Handles fetching clinicians for the matching flow.
 */

import { apiGet, ApiError } from './client';
import type { Clinician } from '@/types/clinician';

/**
 * Fetches all available clinicians for matching
 *
 * @returns Promise resolving to an array of Clinicians
 * @throws ApiError if the request fails
 */
export async function fetchClinicians(): Promise<Clinician[]> {
  const response = await apiGet<Clinician[]>('/clinicians');
  if (!response.data) {
    throw new ApiError('Failed to fetch clinicians', 500);
  }
  return response.data;
}

/**
 * Fetches a single clinician by ID
 *
 * @param id - The clinician ID to retrieve
 * @returns Promise resolving to the Clinician
 * @throws ApiError if the request fails
 */
export async function getClinician(id: string): Promise<Clinician> {
  const response = await apiGet<Clinician>(`/clinicians/${id}`);
  if (!response.data) {
    throw new ApiError('Clinician not found', 404);
  }
  return response.data;
}

