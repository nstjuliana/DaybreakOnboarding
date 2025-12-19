/**
 * @file Assessment Type Definitions
 * @description TypeScript types for assessment-related data structures.
 *
 * @see {@link _docs/user-flow.md} Phase 2: Holistic Intake
 */

/**
 * Assessment status values
 */
export type AssessmentStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'analyzed'
  | 'expired';

/**
 * Screener type identifiers
 */
export type ScreenerType = 'psc17' | 'psc35' | 'phq9a' | 'gad7' | 'scared';

/**
 * Severity level classification
 */
export type SeverityLevel = 'minimal' | 'mild' | 'moderate' | 'severe';

/**
 * Assessment responses (question ID to value mapping)
 */
export type AssessmentResponses = Record<string, number>;

/**
 * Assessment results from analysis
 */
export interface AssessmentResults {
  fitForDaybreak?: boolean;
  recommendedCareLevel?: string;
  priorityConcerns?: string[];
  summary?: string;
  requiresSafetyPlanning?: boolean;
}

/**
 * Assessment data from API
 */
export interface Assessment {
  id: string;
  userId?: string;
  screenerType: ScreenerType;
  status: AssessmentStatus;
  responses: AssessmentResponses;
  results: AssessmentResults;
  score?: number;
  severity?: SeverityLevel;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create assessment request data
 */
export interface CreateAssessmentData {
  screenerType: ScreenerType;
  responses?: AssessmentResponses;
}

/**
 * Update assessment request data
 */
export interface UpdateAssessmentData {
  responses?: AssessmentResponses;
  status?: AssessmentStatus;
}

/**
 * Maps API assessment response to frontend Assessment type
 *
 * @param apiAssessment - Assessment data from API
 * @returns Formatted assessment object
 */
export function mapApiAssessment(
  apiAssessment: Record<string, unknown>
): Assessment {
  return {
    id: apiAssessment.id as string,
    userId: apiAssessment.user_id as string | undefined,
    screenerType: apiAssessment.screener_type as ScreenerType,
    status: apiAssessment.status as AssessmentStatus,
    responses: (apiAssessment.responses as AssessmentResponses) || {},
    results: mapResults(apiAssessment.results as Record<string, unknown>),
    score: apiAssessment.score as number | undefined,
    severity: apiAssessment.severity as SeverityLevel | undefined,
    startedAt: apiAssessment.started_at as string | undefined,
    completedAt: apiAssessment.completed_at as string | undefined,
    createdAt: apiAssessment.created_at as string,
    updatedAt: apiAssessment.updated_at as string,
  };
}

/**
 * Maps API results to frontend format
 */
function mapResults(results: Record<string, unknown> | null): AssessmentResults {
  if (!results) return {};

  return {
    fitForDaybreak: results.fit_for_daybreak as boolean | undefined,
    recommendedCareLevel: results.recommended_care_level as string | undefined,
    priorityConcerns: results.priority_concerns as string[] | undefined,
    summary: results.summary as string | undefined,
    requiresSafetyPlanning: results.requires_safety_planning as boolean | undefined,
  };
}

