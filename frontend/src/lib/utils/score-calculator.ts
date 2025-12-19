/**
 * @file Score Calculator
 * @description Client-side scoring utilities for mental health screeners.
 *              Calculates total and subscale scores with severity classification.
 *
 * @see {@link _docs/user-flow.md} Phase 2: Holistic Intake
 */

import { PSC17_CONFIG, type ScreenerConfig } from '@/lib/constants/screeners/psc-17';

/**
 * Responses map type
 */
export type Responses = Record<string, number>;

/**
 * Severity levels
 */
export type SeverityLevel = 'minimal' | 'mild' | 'moderate' | 'severe';

/**
 * Subscale score result
 */
export interface SubscaleScore {
  name: string;
  score: number;
  maxScore: number;
  cutoff: number;
  isElevated: boolean;
}

/**
 * Full scoring result
 */
export interface ScoringResult {
  totalScore: number;
  maxScore: number;
  percentile: number;
  severity: SeverityLevel;
  isElevated: boolean;
  subscales: SubscaleScore[];
  recommendation: string;
}

/**
 * Calculates the total score from responses
 *
 * @param responses - Map of question IDs to response values
 * @returns Total score
 */
export function calculateTotalScore(responses: Responses): number {
  return Object.values(responses).reduce((sum, value) => sum + (value || 0), 0);
}

/**
 * Calculates subscale scores
 *
 * @param responses - Map of question IDs to response values
 * @param config - Screener configuration
 * @returns Array of subscale scores
 */
export function calculateSubscaleScores(
  responses: Responses,
  config: ScreenerConfig
): SubscaleScore[] {
  return config.scoring.subscales.map((subscale) => {
    const score = subscale.questionIds.reduce(
      (sum, id) => sum + (responses[id] || 0),
      0
    );
    const maxScore = subscale.questionIds.length * 2; // Max is 2 per question

    return {
      name: subscale.name,
      score,
      maxScore,
      cutoff: subscale.cutoff,
      isElevated: score >= subscale.cutoff,
    };
  });
}

/**
 * Determines severity level based on total score
 *
 * @param score - Total score
 * @param maxScore - Maximum possible score
 * @param cutoff - Clinical cutoff threshold
 * @returns Severity level
 */
export function determineSeverity(
  score: number,
  maxScore: number,
  cutoff: number
): SeverityLevel {
  const percentage = (score / maxScore) * 100;

  if (score < cutoff * 0.5) return 'minimal';
  if (score < cutoff) return 'mild';
  if (score < cutoff * 1.5) return 'moderate';
  return 'severe';
}

/**
 * Generates a recommendation based on the score
 *
 * @param severity - Severity level
 * @param elevatedSubscales - Names of elevated subscales
 * @returns Recommendation text
 */
function generateRecommendation(
  severity: SeverityLevel,
  elevatedSubscales: string[]
): string {
  const subscaleText =
    elevatedSubscales.length > 0
      ? ` Areas of focus: ${elevatedSubscales.join(', ')}.`
      : '';

  switch (severity) {
    case 'minimal':
      return `Based on your responses, symptoms appear minimal. Daybreak can provide preventive support and resources.${subscaleText}`;
    case 'mild':
      return `Based on your responses, some mild symptoms were identified. Early intervention can be very helpful.${subscaleText}`;
    case 'moderate':
      return `Based on your responses, moderate symptoms were identified. We recommend connecting with a clinician.${subscaleText}`;
    case 'severe':
      return `Based on your responses, significant symptoms were identified. We strongly recommend speaking with a clinician soon.${subscaleText}`;
  }
}

/**
 * Calculates full scoring result for PSC-17
 *
 * @param responses - Map of question IDs to response values
 * @returns Complete scoring result
 *
 * @example
 * ```ts
 * const result = calculatePSC17Score({
 *   psc17_1: 1,
 *   psc17_2: 2,
 *   // ... more responses
 * });
 * console.log(result.severity); // 'moderate'
 * ```
 */
export function calculatePSC17Score(responses: Responses): ScoringResult {
  const config = PSC17_CONFIG;
  const totalScore = calculateTotalScore(responses);
  const subscales = calculateSubscaleScores(responses, config);

  const severity = determineSeverity(
    totalScore,
    config.scoring.maxScore,
    config.scoring.totalCutoff
  );

  const isElevated = totalScore >= config.scoring.totalCutoff;
  const elevatedSubscales = subscales
    .filter((s) => s.isElevated)
    .map((s) => s.name);

  const percentile = Math.round((totalScore / config.scoring.maxScore) * 100);

  return {
    totalScore,
    maxScore: config.scoring.maxScore,
    percentile,
    severity,
    isElevated,
    subscales,
    recommendation: generateRecommendation(severity, elevatedSubscales),
  };
}

/**
 * Checks if all questions have been answered
 *
 * @param responses - Map of question IDs to response values
 * @param questionCount - Expected number of questions
 * @returns True if all questions answered
 */
export function isScreenerComplete(
  responses: Responses,
  questionCount: number = 17
): boolean {
  const answeredCount = Object.keys(responses).filter(
    (key) => responses[key] !== undefined && responses[key] !== null
  ).length;
  return answeredCount >= questionCount;
}

