/**
 * @file Messaging Constants
 * @description Role-specific messaging and copy for the onboarding flow.
 *              Maintains supportive, non-judgmental tone throughout.
 *
 * @see {@link _docs/ui-rules.md} Emotional Validation
 * @see {@link _docs/user-flow.md} for role-specific messaging
 */

import type { UserType } from '@/types/user';

/**
 * Welcome messages for Phase 1 (Regulate and Relate)
 */
export const WELCOME_MESSAGES: Record<UserType, {
  headline: string;
  subheadline: string;
  supportText: string;
}> = {
  parent: {
    headline: "You're taking an important step for your family",
    subheadline: "We're here to guide you through finding the right care for your child.",
    supportText: "Many parents feel uncertain about where to start. That's completely normal, and we'll help you every step of the way.",
  },
  minor: {
    headline: "This is a safe space for you",
    subheadline: "You're not broken—we're here to help you find your path.",
    supportText: "It takes courage to reach out. Whatever you're going through, you deserve support.",
  },
  friend: {
    headline: "It takes courage to reach out for someone you care about",
    subheadline: "Let's explore how we can help.",
    supportText: "Supporting someone through a difficult time can be challenging. We'll help you understand what options are available.",
  },
};

/**
 * Process overview steps shown in Phase 1
 */
export const PROCESS_STEPS = [
  {
    title: 'Quick Assessment',
    description: 'Answer a few questions to help us understand the situation.',
    duration: '5-10 minutes',
  },
  {
    title: 'Create Account',
    description: 'Set up your secure account to save your progress.',
    duration: '2 minutes',
  },
  {
    title: 'Meet Your Match',
    description: 'We\'ll connect you with a clinician who\'s right for your needs.',
    duration: '1 minute',
  },
  {
    title: 'Book Appointment',
    description: 'Schedule your first session at a time that works for you.',
    duration: '2 minutes',
  },
];

/**
 * User type card content for Phase 0
 */
export const USER_TYPE_CARDS: Record<UserType, {
  title: string;
  description: string;
  icon: 'family' | 'person' | 'heart';
}> = {
  parent: {
    title: "I'm a Parent or Guardian",
    description: 'Seeking mental health support for my child or teenager',
    icon: 'family',
  },
  minor: {
    title: "I'm looking for help for myself",
    description: "I'm a teen or young adult (13+) seeking support",
    icon: 'person',
  },
  friend: {
    title: "I'm worried about someone",
    description: 'I want to help a friend or family member get support',
    icon: 'heart',
  },
};

/**
 * Encouraging messages for various states
 */
export const ENCOURAGEMENT = {
  saving: "Your progress is being saved...",
  saved: "Progress saved! You can return anytime to continue.",
  resuming: "Welcome back! Picking up where you left off.",
  completing: "You're almost there!",
  finished: "Congratulations! You've completed the onboarding process.",
};

/**
 * Error messages with supportive framing
 */
export const ERROR_MESSAGES = {
  generic: "Something went wrong. Don't worry, your progress is saved.",
  network: "We're having trouble connecting. Please check your internet connection.",
  validation: "Please review the highlighted fields and try again.",
  timeout: "This is taking longer than expected. Please try again.",
};

/**
 * Placeholder content for loading states
 */
export const LOADING_MESSAGES = [
  "Taking a moment to prepare...",
  "Getting things ready for you...",
  "Almost there...",
];

