/**
 * @file PSC-17 Screener Data
 * @description Pediatric Symptom Checklist (17-item version) questions
 *              and scoring information for the mental health screening.
 *
 * @see {@link _docs/user-flow.md} Phase 2: Holistic Intake
 */

/**
 * Response option for Likert scale
 */
export interface ResponseOption {
  value: number;
  label: string;
  description?: string;
}

/**
 * Screener question
 */
export interface ScreenerQuestion {
  id: string;
  text: string;
  subscale: 'internalizing' | 'attention' | 'externalizing';
  order: number;
}

/**
 * Screener configuration
 */
export interface ScreenerConfig {
  id: string;
  name: string;
  shortName: string;
  description: string;
  instructions: string;
  questions: ScreenerQuestion[];
  responseOptions: ResponseOption[];
  scoring: {
    subscales: {
      name: string;
      questionIds: string[];
      cutoff: number;
    }[];
    totalCutoff: number;
    maxScore: number;
  };
}

/**
 * PSC-17 response options (Likert scale)
 */
export const PSC17_RESPONSE_OPTIONS: ResponseOption[] = [
  { value: 0, label: 'Never', description: 'Never occurs' },
  { value: 1, label: 'Sometimes', description: 'Occurs sometimes' },
  { value: 2, label: 'Often', description: 'Occurs often' },
];

/**
 * PSC-17 Questions
 * Based on the Pediatric Symptom Checklist
 */
export const PSC17_QUESTIONS: ScreenerQuestion[] = [
  // Internalizing subscale (questions about mood/anxiety)
  {
    id: 'psc17_1',
    text: 'Feels sad, unhappy',
    subscale: 'internalizing',
    order: 1,
  },
  {
    id: 'psc17_2',
    text: 'Feels hopeless',
    subscale: 'internalizing',
    order: 2,
  },
  {
    id: 'psc17_3',
    text: 'Is down on self',
    subscale: 'internalizing',
    order: 3,
  },
  {
    id: 'psc17_4',
    text: 'Worries a lot',
    subscale: 'internalizing',
    order: 4,
  },
  {
    id: 'psc17_5',
    text: 'Seems to be having less fun',
    subscale: 'internalizing',
    order: 5,
  },

  // Attention subscale
  {
    id: 'psc17_6',
    text: 'Fidgety, unable to sit still',
    subscale: 'attention',
    order: 6,
  },
  {
    id: 'psc17_7',
    text: 'Daydreams too much',
    subscale: 'attention',
    order: 7,
  },
  {
    id: 'psc17_8',
    text: 'Distracted easily',
    subscale: 'attention',
    order: 8,
  },
  {
    id: 'psc17_9',
    text: 'Has trouble concentrating',
    subscale: 'attention',
    order: 9,
  },
  {
    id: 'psc17_10',
    text: 'Acts as if driven by a motor',
    subscale: 'attention',
    order: 10,
  },

  // Externalizing subscale (conduct/behavior)
  {
    id: 'psc17_11',
    text: 'Fights with others',
    subscale: 'externalizing',
    order: 11,
  },
  {
    id: 'psc17_12',
    text: 'Does not listen to rules',
    subscale: 'externalizing',
    order: 12,
  },
  {
    id: 'psc17_13',
    text: 'Does not understand other people\'s feelings',
    subscale: 'externalizing',
    order: 13,
  },
  {
    id: 'psc17_14',
    text: 'Teases others',
    subscale: 'externalizing',
    order: 14,
  },
  {
    id: 'psc17_15',
    text: 'Blames others for own troubles',
    subscale: 'externalizing',
    order: 15,
  },
  {
    id: 'psc17_16',
    text: 'Takes things that do not belong to them',
    subscale: 'externalizing',
    order: 16,
  },
  {
    id: 'psc17_17',
    text: 'Refuses to share',
    subscale: 'externalizing',
    order: 17,
  },
];

/**
 * Full PSC-17 configuration
 */
export const PSC17_CONFIG: ScreenerConfig = {
  id: 'psc17',
  name: 'Pediatric Symptom Checklist',
  shortName: 'PSC-17',
  description:
    'A brief screening questionnaire to help identify children who may benefit from mental health support.',
  instructions:
    'Please indicate how often each statement applies. Answer based on the past month.',
  questions: PSC17_QUESTIONS,
  responseOptions: PSC17_RESPONSE_OPTIONS,
  scoring: {
    subscales: [
      {
        name: 'Internalizing',
        questionIds: ['psc17_1', 'psc17_2', 'psc17_3', 'psc17_4', 'psc17_5'],
        cutoff: 5,
      },
      {
        name: 'Attention',
        questionIds: ['psc17_6', 'psc17_7', 'psc17_8', 'psc17_9', 'psc17_10'],
        cutoff: 7,
      },
      {
        name: 'Externalizing',
        questionIds: [
          'psc17_11',
          'psc17_12',
          'psc17_13',
          'psc17_14',
          'psc17_15',
          'psc17_16',
          'psc17_17',
        ],
        cutoff: 7,
      },
    ],
    totalCutoff: 15,
    maxScore: 34,
  },
};

/**
 * Gets questions grouped by subscale
 */
export function getQuestionsBySubscale(): Record<string, ScreenerQuestion[]> {
  return PSC17_QUESTIONS.reduce(
    (acc, question) => {
      if (!acc[question.subscale]) {
        acc[question.subscale] = [];
      }
      acc[question.subscale].push(question);
      return acc;
    },
    {} as Record<string, ScreenerQuestion[]>
  );
}

