/**
 * @file SCARED-5 Screener Data
 * @description Screen for Child Anxiety Related Disorders (5-item short form)
 *              for screening anxiety symptoms in children and adolescents.
 *
 * @see {@link _docs/user-flow.md} Phase 2: Holistic Intake
 */

import type { ResponseOption, ScreenerQuestion, ScreenerConfig } from './psc-17';

/**
 * SCARED response options (3-point Likert scale)
 */
export const SCARED_RESPONSE_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Not true or hardly ever true', description: 'Rarely or never' },
  { value: 1, label: 'Somewhat true or sometimes true', description: 'Sometimes' },
  { value: 2, label: 'Very true or often true', description: 'Often or always' },
];

/**
 * SCARED-5 Questions (Brief version)
 * Based on the Screen for Child Anxiety Related Disorders
 * This is the validated 5-item short form
 */
export const SCARED_QUESTIONS: ScreenerQuestion[] = [
  {
    id: 'scared_1',
    text: 'I get really frightened for no reason at all',
    subscale: 'internalizing',
    order: 1,
  },
  {
    id: 'scared_2',
    text: 'I am afraid to be alone in the house',
    subscale: 'internalizing',
    order: 2,
  },
  {
    id: 'scared_3',
    text: 'People tell me that I worry too much',
    subscale: 'internalizing',
    order: 3,
  },
  {
    id: 'scared_4',
    text: 'I am scared to go to school',
    subscale: 'internalizing',
    order: 4,
  },
  {
    id: 'scared_5',
    text: 'I am shy',
    subscale: 'internalizing',
    order: 5,
  },
];

/**
 * Full SCARED-5 configuration
 */
export const SCARED_CONFIG: ScreenerConfig = {
  id: 'scared',
  name: 'Screen for Child Anxiety Related Disorders',
  shortName: 'SCARED-5',
  description:
    'A brief screening questionnaire to help identify anxiety symptoms in children and teens.',
  instructions:
    'Below is a list of sentences that describe how people feel. Read each phrase and decide if it describes you. Answer based on how you have felt recently.',
  questions: SCARED_QUESTIONS,
  responseOptions: SCARED_RESPONSE_OPTIONS,
  scoring: {
    subscales: [
      {
        name: 'Anxiety',
        questionIds: SCARED_QUESTIONS.map((q) => q.id),
        cutoff: 3,
      },
    ],
    totalCutoff: 3,
    maxScore: 10,
  },
};

/**
 * SCARED-5 severity levels based on total score
 */
export const SCARED_SEVERITY_LEVELS = {
  minimal: { min: 0, max: 2, label: 'Minimal anxiety' },
  mild: { min: 3, max: 4, label: 'Mild anxiety' },
  moderate: { min: 5, max: 6, label: 'Moderate anxiety' },
  severe: { min: 7, max: 10, label: 'Significant anxiety' },
};

/**
 * Gets severity level from SCARED-5 score
 *
 * @param score - Total SCARED-5 score
 * @returns Severity level information
 */
export function getSCAREDSeverity(score: number): {
  level: keyof typeof SCARED_SEVERITY_LEVELS;
  label: string;
} {
  if (score <= 2) return { level: 'minimal', label: SCARED_SEVERITY_LEVELS.minimal.label };
  if (score <= 4) return { level: 'mild', label: SCARED_SEVERITY_LEVELS.mild.label };
  if (score <= 6) return { level: 'moderate', label: SCARED_SEVERITY_LEVELS.moderate.label };
  return { level: 'severe', label: SCARED_SEVERITY_LEVELS.severe.label };
}

/**
 * Checks if score indicates clinical concern
 *
 * @param score - Total SCARED-5 score
 * @returns True if score is at or above cutoff (3)
 */
export function indicatesClinicalConcern(score: number): boolean {
  return score >= SCARED_CONFIG.scoring.totalCutoff;
}

/**
 * Calculates SCARED-5 total score
 *
 * @param responses - Response values keyed by question ID
 * @returns Total score
 */
export function calculateSCAREDScore(responses: Record<string, number>): number {
  return SCARED_QUESTIONS.reduce((total, question) => {
    const value = responses[question.id];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

/**
 * Determines if follow-up assessment is recommended
 *
 * @param score - Total SCARED-5 score
 * @returns True if full SCARED assessment recommended
 */
export function recommendsFullAssessment(score: number): boolean {
  return score >= 3;
}

