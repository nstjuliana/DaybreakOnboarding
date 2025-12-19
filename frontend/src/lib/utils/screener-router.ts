/**
 * @file Screener Router Utility
 * @description Routes users to appropriate screeners based on their selected concerns.
 *              Implements the triage pulse logic for Phase 1.5.
 *
 * @see {@link _docs/user-flow.md} Phase 1.5: Triage Pulse
 */

/**
 * Available screener types
 */
export type ScreenerType = 'psc17' | 'phq9a' | 'scared';

/**
 * Concern area identifiers
 */
export type ConcernArea =
  | 'mood'
  | 'anxiety'
  | 'behavior'
  | 'attention'
  | 'social'
  | 'not_sure';

/**
 * Concern area configuration
 */
export interface ConcernConfig {
  id: ConcernArea;
  label: string;
  description: string;
  icon: string;
  screener: ScreenerType;
  examples: string[];
}

/**
 * Screener configuration
 */
export interface ScreenerConfig {
  type: ScreenerType;
  name: string;
  shortName: string;
  description: string;
  questionCount: number;
  estimatedMinutes: number;
}

/**
 * Concern areas with their associated screeners
 */
export const CONCERN_AREAS: ConcernConfig[] = [
  {
    id: 'mood',
    label: 'Mood & Feelings',
    description: 'Sadness, low energy, or loss of interest',
    icon: '💭',
    screener: 'phq9a',
    examples: [
      'Feeling sad or down most days',
      'Loss of interest in activities',
      'Changes in sleep or appetite',
      'Feeling hopeless about the future',
    ],
  },
  {
    id: 'anxiety',
    label: 'Worry & Anxiety',
    description: 'Excessive worry, fear, or nervousness',
    icon: '😰',
    screener: 'scared',
    examples: [
      'Constant worry about many things',
      'Fear of social situations',
      'Panic attacks or physical symptoms',
      'Difficulty relaxing or calming down',
    ],
  },
  {
    id: 'behavior',
    label: 'Behavior & Conduct',
    description: 'Acting out, defiance, or aggression',
    icon: '⚡',
    screener: 'psc17',
    examples: [
      'Frequent arguments with adults',
      'Difficulty following rules',
      'Aggressive behavior toward others',
      'Problems at school or home',
    ],
  },
  {
    id: 'attention',
    label: 'Focus & Attention',
    description: 'Difficulty concentrating or staying focused',
    icon: '🎯',
    screener: 'psc17',
    examples: [
      'Trouble paying attention',
      'Easily distracted',
      'Difficulty completing tasks',
      'Restlessness or fidgeting',
    ],
  },
  {
    id: 'social',
    label: 'Social & Relationships',
    description: 'Difficulty with peers or social situations',
    icon: '👥',
    screener: 'psc17',
    examples: [
      'Trouble making friends',
      'Feeling left out',
      'Conflict with peers',
      'Isolation or withdrawal',
    ],
  },
  {
    id: 'not_sure',
    label: "I'm Not Sure",
    description: "General concerns or don't know where to start",
    icon: '🤔',
    screener: 'psc17',
    examples: [
      "Something seems off but I can't pinpoint it",
      'General wellness check',
      'Multiple areas of concern',
      'First time seeking support',
    ],
  },
];

/**
 * Screener configurations
 */
export const SCREENER_CONFIGS: Record<ScreenerType, ScreenerConfig> = {
  psc17: {
    type: 'psc17',
    name: 'Pediatric Symptom Checklist',
    shortName: 'PSC-17',
    description: 'A broad screening tool that covers emotional, attention, and behavioral concerns.',
    questionCount: 17,
    estimatedMinutes: 5,
  },
  phq9a: {
    type: 'phq9a',
    name: 'Patient Health Questionnaire for Adolescents',
    shortName: 'PHQ-9A',
    description: 'Focused on mood and depression symptoms in young people.',
    questionCount: 9,
    estimatedMinutes: 3,
  },
  scared: {
    type: 'scared',
    name: 'Screen for Child Anxiety Related Disorders',
    shortName: 'SCARED-5',
    description: 'A brief screening focused on anxiety and worry symptoms.',
    questionCount: 5,
    estimatedMinutes: 2,
  },
};

/**
 * Determines the appropriate screener based on selected concerns
 *
 * @param concerns - Array of selected concern area IDs
 * @returns The recommended screener type
 *
 * @example
 * ```ts
 * const screener = determineScreener(['mood', 'anxiety']);
 * // Returns 'phq9a' if mood is primary concern
 * ```
 */
export function determineScreener(concerns: ConcernArea[]): ScreenerType {
  if (concerns.length === 0) {
    return 'psc17'; // Default to broadband screener
  }

  // Priority order for screener selection
  // If mood is selected, prioritize depression screening
  if (concerns.includes('mood')) {
    return 'phq9a';
  }

  // If anxiety is selected (without mood), use anxiety screener
  if (concerns.includes('anxiety')) {
    return 'scared';
  }

  // For behavior, attention, social, or not_sure, use broadband PSC-17
  return 'psc17';
}

/**
 * Gets the screener config for a concern area
 *
 * @param concernId - Concern area ID
 * @returns Screener configuration
 */
export function getScreenerForConcern(concernId: ConcernArea): ScreenerConfig {
  const concern = CONCERN_AREAS.find((c) => c.id === concernId);
  const screenerType = concern?.screener || 'psc17';
  return SCREENER_CONFIGS[screenerType];
}

/**
 * Gets all screener types that would be selected for given concerns
 *
 * @param concerns - Array of selected concern area IDs
 * @returns Array of unique screener types
 */
export function getScreenersForConcerns(concerns: ConcernArea[]): ScreenerType[] {
  const screeners = new Set<ScreenerType>();
  
  for (const concernId of concerns) {
    const concern = CONCERN_AREAS.find((c) => c.id === concernId);
    if (concern) {
      screeners.add(concern.screener);
    }
  }
  
  return Array.from(screeners);
}

/**
 * Gets the primary screener configuration based on concerns
 *
 * @param concerns - Array of selected concern area IDs
 * @returns Primary screener configuration
 */
export function getPrimaryScreener(concerns: ConcernArea[]): ScreenerConfig {
  const screenerType = determineScreener(concerns);
  return SCREENER_CONFIGS[screenerType];
}

/**
 * Validates that at least one concern is selected
 *
 * @param concerns - Array of selected concern area IDs
 * @returns True if valid selection
 */
export function isValidConcernSelection(concerns: ConcernArea[]): boolean {
  return concerns.length > 0 && concerns.length <= 3;
}

