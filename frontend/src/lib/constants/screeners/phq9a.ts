/**
 * @file PHQ-9A Screener Data
 * @description Patient Health Questionnaire for Adolescents (9-item version)
 *              for screening depression symptoms in young people.
 *
 * @see {@link _docs/user-flow.md} Phase 2: Holistic Intake
 */

import type { ResponseOption, ScreenerQuestion, ScreenerConfig } from './psc-17';

/**
 * PHQ-9A response options (4-point Likert scale)
 */
export const PHQ9A_RESPONSE_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Not at all', description: 'Never or rarely' },
  { value: 1, label: 'Several days', description: 'Less than half the days' },
  { value: 2, label: 'More than half the days', description: 'Most days' },
  { value: 3, label: 'Nearly every day', description: 'Almost always' },
];

/**
 * PHQ-9A Questions
 * Based on the Patient Health Questionnaire for Adolescents
 * Timeframe: Over the last 2 weeks
 */
export const PHQ9A_QUESTIONS: ScreenerQuestion[] = [
  {
    id: 'phq9a_1',
    text: 'Little interest or pleasure in doing things',
    subscale: 'internalizing',
    order: 1,
  },
  {
    id: 'phq9a_2',
    text: 'Feeling down, depressed, or hopeless',
    subscale: 'internalizing',
    order: 2,
  },
  {
    id: 'phq9a_3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    subscale: 'internalizing',
    order: 3,
  },
  {
    id: 'phq9a_4',
    text: 'Feeling tired or having little energy',
    subscale: 'internalizing',
    order: 4,
  },
  {
    id: 'phq9a_5',
    text: 'Poor appetite or overeating',
    subscale: 'internalizing',
    order: 5,
  },
  {
    id: 'phq9a_6',
    text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
    subscale: 'internalizing',
    order: 6,
  },
  {
    id: 'phq9a_7',
    text: 'Trouble concentrating on things, such as reading or watching TV',
    subscale: 'attention',
    order: 7,
  },
  {
    id: 'phq9a_8',
    text: 'Moving or speaking so slowly that other people could have noticed. Or being so fidgety or restless that you have been moving around a lot more than usual',
    subscale: 'internalizing',
    order: 8,
  },
  {
    id: 'phq9a_9',
    text: 'Thoughts that you would be better off dead, or of hurting yourself in some way',
    subscale: 'internalizing',
    order: 9,
  },
];

/**
 * Full PHQ-9A configuration
 */
export const PHQ9A_CONFIG: ScreenerConfig = {
  id: 'phq9a',
  name: 'Patient Health Questionnaire for Adolescents',
  shortName: 'PHQ-9A',
  description:
    'A brief screening questionnaire to help identify depression symptoms in adolescents.',
  instructions:
    'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  questions: PHQ9A_QUESTIONS,
  responseOptions: PHQ9A_RESPONSE_OPTIONS,
  scoring: {
    subscales: [
      {
        name: 'Depression',
        questionIds: PHQ9A_QUESTIONS.map((q) => q.id),
        cutoff: 10,
      },
    ],
    totalCutoff: 10,
    maxScore: 27,
  },
};

/**
 * PHQ-9A severity levels based on total score
 */
export const PHQ9A_SEVERITY_LEVELS = {
  minimal: { min: 0, max: 4, label: 'Minimal depression' },
  mild: { min: 5, max: 9, label: 'Mild depression' },
  moderate: { min: 10, max: 14, label: 'Moderate depression' },
  moderatelySevere: { min: 15, max: 19, label: 'Moderately severe depression' },
  severe: { min: 20, max: 27, label: 'Severe depression' },
};

/**
 * Gets severity level from PHQ-9A score
 *
 * @param score - Total PHQ-9A score
 * @returns Severity level information
 */
export function getPHQ9ASeverity(score: number): {
  level: keyof typeof PHQ9A_SEVERITY_LEVELS;
  label: string;
} {
  if (score <= 4) return { level: 'minimal', label: PHQ9A_SEVERITY_LEVELS.minimal.label };
  if (score <= 9) return { level: 'mild', label: PHQ9A_SEVERITY_LEVELS.mild.label };
  if (score <= 14) return { level: 'moderate', label: PHQ9A_SEVERITY_LEVELS.moderate.label };
  if (score <= 19) return { level: 'moderatelySevere', label: PHQ9A_SEVERITY_LEVELS.moderatelySevere.label };
  return { level: 'severe', label: PHQ9A_SEVERITY_LEVELS.severe.label };
}

/**
 * Checks if the safety question (Q9) indicates risk
 *
 * @param q9Value - Value for question 9
 * @returns True if any positive response to Q9
 */
export function hasSafetyRisk(q9Value: number): boolean {
  return q9Value > 0;
}

/**
 * Calculates PHQ-9A total score
 *
 * @param responses - Response values keyed by question ID
 * @returns Total score
 */
export function calculatePHQ9AScore(responses: Record<string, number>): number {
  return PHQ9A_QUESTIONS.reduce((total, question) => {
    const value = responses[question.id];
    return total + (typeof value === 'number' ? value : 0);
  }, 0);
}

