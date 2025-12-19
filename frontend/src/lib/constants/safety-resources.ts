/**
 * @file Safety Resources Constants
 * @description Crisis hotlines and safety resources for emergency situations.
 *              Displayed when crisis is detected during chat.
 *
 * @see {@link frontend/src/components/onboarding/safety-pivot.tsx}
 */

/**
 * Crisis resource definition
 */
export interface CrisisResource {
  id: string;
  name: string;
  description: string;
  phone?: string;
  text?: string;
  website?: string;
  available: string;
  type: 'hotline' | 'text' | 'chat' | 'emergency';
  priority: number;
}

/**
 * Primary crisis resources - always shown
 */
export const PRIMARY_CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: '988-lifeline',
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support for people in distress',
    phone: '988',
    text: '988',
    website: 'https://988lifeline.org',
    available: '24/7',
    type: 'hotline',
    priority: 1,
  },
  {
    id: 'crisis-text',
    name: 'Crisis Text Line',
    description: 'Text with a trained crisis counselor',
    text: 'Text HOME to 741741',
    website: 'https://www.crisistextline.org',
    available: '24/7',
    type: 'text',
    priority: 2,
  },
  {
    id: '911',
    name: 'Emergency Services',
    description: 'For immediate danger or medical emergency',
    phone: '911',
    available: '24/7',
    type: 'emergency',
    priority: 3,
  },
];

/**
 * Secondary resources - shown for additional support
 */
export const SECONDARY_CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: 'trevor-project',
    name: 'The Trevor Project',
    description: 'For LGBTQ+ young people',
    phone: '1-866-488-7386',
    text: 'Text START to 678-678',
    website: 'https://www.thetrevorproject.org',
    available: '24/7',
    type: 'hotline',
    priority: 4,
  },
  {
    id: 'childhelp',
    name: 'Childhelp National Child Abuse Hotline',
    description: 'Help for child abuse situations',
    phone: '1-800-422-4453',
    website: 'https://www.childhelp.org',
    available: '24/7',
    type: 'hotline',
    priority: 5,
  },
  {
    id: 'samhsa',
    name: 'SAMHSA National Helpline',
    description: 'Substance abuse and mental health support',
    phone: '1-800-662-4357',
    website: 'https://www.samhsa.gov/find-help/national-helpline',
    available: '24/7, 365 days',
    type: 'hotline',
    priority: 6,
  },
];

/**
 * All crisis resources combined
 */
export const ALL_CRISIS_RESOURCES: CrisisResource[] = [
  ...PRIMARY_CRISIS_RESOURCES,
  ...SECONDARY_CRISIS_RESOURCES,
].sort((a, b) => a.priority - b.priority);

/**
 * Safety affirmations for the safety pivot screen
 */
export const SAFETY_AFFIRMATIONS = [
  "You're not alone in this.",
  'What you\'re feeling is valid.',
  'Help is available right now.',
  'You matter, and so do your feelings.',
  'Taking this step to reach out shows strength.',
  'Things can get better with support.',
];

/**
 * Gets a random safety affirmation
 */
export function getRandomAffirmation(): string {
  const index = Math.floor(Math.random() * SAFETY_AFFIRMATIONS.length);
  return SAFETY_AFFIRMATIONS[index];
}

/**
 * Safety check questions for "I'm safe" confirmation
 */
export const SAFETY_CHECK_QUESTIONS = [
  'Are you currently in a safe place?',
  'Do you have someone you can talk to right now?',
  'Are you having thoughts of hurting yourself?',
];

