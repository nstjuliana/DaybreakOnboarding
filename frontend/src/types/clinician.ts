/**
 * @file Clinician Type Definitions
 * @description TypeScript types for clinician-related data structures.
 *
 * @see {@link _docs/user-flow.md} Phase 3D: Clinician Matching
 */

/**
 * Clinician status values
 */
export type ClinicianStatus = 'active' | 'inactive' | 'on_leave';

/**
 * Clinician data from API
 */
export interface Clinician {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  credentials?: string;
  bio?: string;
  photoUrl?: string;
  videoUrl?: string;
  specialties: string[];
  status: ClinicianStatus;
}

/**
 * Specialty display names
 */
export const SPECIALTY_LABELS: Record<string, string> = {
  anxiety: 'Anxiety',
  depression: 'Depression',
  adolescents: 'Adolescents',
  teens: 'Teens',
  children: 'Children',
  family_therapy: 'Family Therapy',
  behavioral_issues: 'Behavioral Issues',
  mood_disorders: 'Mood Disorders',
  life_transitions: 'Life Transitions',
  adhd: 'ADHD',
  social_skills: 'Social Skills',
  play_therapy: 'Play Therapy',
  trauma: 'Trauma',
  cultural_sensitivity: 'Cultural Sensitivity',
  cbt: 'CBT',
  dbt: 'DBT',
};

/**
 * Gets the display label for a specialty
 *
 * @param specialty - The specialty key
 * @returns Display label or formatted key
 */
export function getSpecialtyLabel(specialty: string): string {
  return SPECIALTY_LABELS[specialty] || formatSpecialty(specialty);
}

/**
 * Formats a specialty key into a readable string
 *
 * @param specialty - The specialty key (e.g., 'family_therapy')
 * @returns Formatted string (e.g., 'Family Therapy')
 */
function formatSpecialty(specialty: string): string {
  return specialty
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Maps API clinician response to frontend Clinician type
 *
 * @param apiClinician - Clinician data from API
 * @returns Formatted clinician object
 */
export function mapApiClinician(
  apiClinician: Record<string, unknown>
): Clinician {
  return {
    id: apiClinician.id as string,
    firstName: apiClinician.first_name as string,
    lastName: apiClinician.last_name as string,
    fullName: apiClinician.full_name as string,
    displayName: apiClinician.display_name as string,
    credentials: apiClinician.credentials as string | undefined,
    bio: apiClinician.bio as string | undefined,
    photoUrl: apiClinician.photo_url as string | undefined,
    videoUrl: apiClinician.video_url as string | undefined,
    specialties: (apiClinician.specialties as string[]) || [],
    status: apiClinician.status as ClinicianStatus,
  };
}

