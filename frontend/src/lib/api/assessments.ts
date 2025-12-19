/**
 * @file assessments.ts
 * @description API functions for assessment-related operations.
 *              Handles creating and retrieving assessments from the backend.
 */

import { apiPost, apiGet, ApiError } from './client';
import type { Assessment, AssessmentResponses } from '@/types/assessment';

/**
 * Payload for creating a new assessment
 */
interface CreateAssessmentPayload {
  user_id: string;
  screener_type: string;
  score: number;
  responses: AssessmentResponses;
}

/**
 * Creates a new assessment for a user
 *
 * @param data - The assessment data to create
 * @returns Promise resolving to the created Assessment
 * @throws ApiError if the request fails
 */
export async function createAssessment(data: CreateAssessmentPayload): Promise<Assessment> {
  const response = await apiPost<Assessment>('/assessments', { assessment: data });
  if (!response.data) {
    throw new ApiError('Failed to create assessment', 500);
  }
  return response.data;
}

/**
 * Retrieves an assessment by ID
 *
 * @param id - The assessment ID to retrieve
 * @returns Promise resolving to the Assessment
 * @throws ApiError if the request fails
 */
export async function getAssessment(id: string): Promise<Assessment> {
  const response = await apiGet<Assessment>(`/assessments/${id}`);
  if (!response.data) {
    throw new ApiError('Assessment not found', 404);
  }
  return response.data;
}

