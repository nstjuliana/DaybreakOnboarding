/**
 * @file Onboarding Phase Definitions
 * @description Defines the phases of the onboarding flow with their
 *              routes, labels, and configuration.
 *
 * @see {@link _docs/user-flow.md} for phase documentation
 */

/**
 * Phase identifiers
 */
export type PhaseId =
  | 'phase-0'
  | 'phase-1'
  | 'phase-1.5'
  | 'phase-2'
  | 'phase-3'
  | 'phase-4';

/**
 * Phase status for progress tracking
 */
export type PhaseStatus = 'completed' | 'current' | 'upcoming' | 'locked';

/**
 * Phase configuration
 */
export interface Phase {
  id: PhaseId;
  label: string;
  shortLabel: string;
  description: string;
  route: string;
  order: number;
  requiresAuth: boolean;
}

/**
 * All onboarding phases
 */
export const PHASES: Phase[] = [
  {
    id: 'phase-0',
    label: 'Identification',
    shortLabel: 'Identify',
    description: 'Tell us who you are',
    route: '/phase-0',
    order: 0,
    requiresAuth: false,
  },
  {
    id: 'phase-1',
    label: 'Welcome',
    shortLabel: 'Welcome',
    description: 'Learn about what to expect',
    route: '/phase-1',
    order: 1,
    requiresAuth: false,
  },
  {
    id: 'phase-1.5',
    label: 'Triage',
    shortLabel: 'Triage',
    description: 'Quick assessment to guide your journey',
    route: '/phase-1-5',
    order: 1.5,
    requiresAuth: false,
  },
  {
    id: 'phase-2',
    label: 'Assessment',
    shortLabel: 'Assess',
    description: 'Complete a brief mental health screening',
    route: '/phase-2',
    order: 2,
    requiresAuth: false,
  },
  {
    id: 'phase-3',
    label: 'Account & Matching',
    shortLabel: 'Details',
    description: 'Create your account and find your clinician',
    route: '/phase-3',
    order: 3,
    requiresAuth: false,
  },
  {
    id: 'phase-4',
    label: 'Schedule',
    shortLabel: 'Book',
    description: 'Book your first appointment',
    route: '/phase-4',
    order: 4,
    requiresAuth: true,
  },
];

/**
 * Phase map for quick lookup
 */
export const PHASE_MAP = PHASES.reduce(
  (acc, phase) => {
    acc[phase.id] = phase;
    return acc;
  },
  {} as Record<PhaseId, Phase>
);

/**
 * Gets the phase by ID
 *
 * @param id - Phase ID
 * @returns Phase configuration or undefined
 */
export function getPhase(id: PhaseId): Phase | undefined {
  return PHASE_MAP[id];
}

/**
 * Gets the next phase after the given phase
 *
 * @param currentId - Current phase ID
 * @returns Next phase or undefined if at end
 */
export function getNextPhase(currentId: PhaseId): Phase | undefined {
  const currentPhase = PHASE_MAP[currentId];
  if (!currentPhase) return undefined;

  return PHASES.find((p) => p.order > currentPhase.order);
}

/**
 * Gets the previous phase before the given phase
 *
 * @param currentId - Current phase ID
 * @returns Previous phase or undefined if at start
 */
export function getPreviousPhase(currentId: PhaseId): Phase | undefined {
  const currentPhase = PHASE_MAP[currentId];
  if (!currentPhase) return undefined;

  return [...PHASES].reverse().find((p) => p.order < currentPhase.order);
}

/**
 * Gets the display phase ID for progress indicator
 * Maps hidden phases (like phase-1.5) to their display equivalent
 *
 * @param phaseId - Phase ID to map
 * @returns Display phase ID for progress indicator
 */
export function getDisplayPhaseId(phaseId: PhaseId): PhaseId {
  // Map phase-1.5 to phase-2 (Assess) since it's the triage leading into assessment
  if (phaseId === 'phase-1.5') {
    return 'phase-2';
  }
  return phaseId;
}

/**
 * Determines the status of a phase relative to the current phase
 *
 * @param phaseId - Phase to check
 * @param currentPhaseId - Current phase
 * @param completedPhases - Array of completed phase IDs
 * @returns Phase status
 */
export function getPhaseStatus(
  phaseId: PhaseId,
  currentPhaseId: PhaseId,
  completedPhases: PhaseId[]
): PhaseStatus {
  // Map hidden phases to their display equivalent for comparison
  const displayCurrentPhaseId = getDisplayPhaseId(currentPhaseId);

  // IMPORTANT: Check current phase FIRST - even if a phase was previously
  // completed, if user navigates back to it, it should show as current
  if (phaseId === currentPhaseId || phaseId === displayCurrentPhaseId) {
    return 'current';
  }

  const phase = PHASE_MAP[phaseId];
  const currentPhase = PHASE_MAP[currentPhaseId];

  if (!phase || !currentPhase) {
    return 'locked';
  }

  // Only show as completed if it's before the current phase
  // AND either explicitly completed or has a lower order
  if (phase.order < currentPhase.order) {
    return 'completed';
  }

  // Check explicit completion for phases at or after current
  if (completedPhases.includes(phaseId)) {
    return 'completed';
  }

  return 'upcoming';
}

/**
 * Main phases to display in progress indicator (excludes Phase 1.5)
 */
export const MAIN_PHASES = PHASES.filter(
  (p) => !p.id.includes('1.5')
);

