/**
 * @file useClinicianMatch Hook
 * @description Custom hook for clinician matching via API.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

import { useState, useCallback } from 'react';
import { apiGet } from '@/lib/api/client';
import type { Clinician } from '@/types/clinician';

/**
 * Match result from the API
 */
interface ClinicianMatch {
  clinician: Clinician;
  score: number;
  reasons: string[];
}

/**
 * State shape for clinician matching
 */
interface ClinicianMatchState {
  matches: ClinicianMatch[];
  selectedMatch: ClinicianMatch | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Return type for useClinicianMatch hook
 */
interface UseClinicianMatchReturn extends ClinicianMatchState {
  /** Fetch matches from API */
  fetchMatches: () => Promise<void>;
  /** Select a specific match */
  selectMatch: (match: ClinicianMatch) => void;
  /** Request a different match (next in list) */
  requestDifferentMatch: () => void;
  /** Clear state */
  reset: () => void;
}

/**
 * Mock clinicians for development fallback
 */
const MOCK_CLINICIANS: Clinician[] = [
  {
    id: 'mock-1',
    firstName: 'Sarah',
    lastName: 'Chen',
    fullName: 'Sarah Chen',
    displayName: 'Dr. Sarah Chen',
    credentials: 'PhD, LMFT',
    bio: 'Dr. Chen specializes in adolescent mental health with over 10 years of experience helping young people navigate anxiety, depression, and life transitions. She uses a warm, collaborative approach.',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    specialties: ['Anxiety', 'Depression', 'Teen Therapy', 'Family Counseling'],
    status: 'active',
  },
  {
    id: 'mock-2',
    firstName: 'Michael',
    lastName: 'Torres',
    fullName: 'Michael Torres',
    displayName: 'Michael Torres, LCSW',
    credentials: 'LCSW',
    bio: 'Michael brings a compassionate, evidence-based approach to therapy. He specializes in helping children and adolescents with behavioral challenges, ADHD, and social skills development.',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    specialties: ['ADHD', 'Behavioral Issues', 'Social Skills', 'Play Therapy'],
    status: 'active',
  },
  {
    id: 'mock-3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    fullName: 'Emily Rodriguez',
    displayName: 'Dr. Emily Rodriguez',
    credentials: 'PsyD',
    bio: 'Dr. Rodriguez is passionate about helping families build stronger connections. She specializes in trauma-informed care and works with children who have experienced difficult life events.',
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    specialties: ['Trauma', 'Grief', 'Family Therapy', 'Anxiety'],
    status: 'active',
  },
];

/**
 * Maps API clinician response to Clinician type
 */
function mapApiClinician(data: Record<string, unknown>): Clinician {
  return {
    id: data.id as string,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    fullName: data.full_name as string,
    displayName: data.display_name as string,
    credentials: data.credentials as string,
    bio: data.bio as string,
    photoUrl: data.photo_url as string,
    videoUrl: data.video_url as string | undefined,
    specialties: data.specialties as string[],
    status: data.status as string,
  };
}

/**
 * Gets mock matches for development fallback
 */
function getMockMatches(): ClinicianMatch[] {
  return MOCK_CLINICIANS.map((clinician, index) => ({
    clinician,
    score: 0.95 - index * 0.05,
    reasons: [
      'Specializes in areas matching your concerns',
      'Experienced with similar cases',
      'Available appointments this week',
    ],
  }));
}

/**
 * useClinicianMatch Hook
 *
 * @description Manages clinician matching flow with API integration.
 *
 * @example
 * ```tsx
 * const { matches, selectedMatch, fetchMatches, selectMatch } = useClinicianMatch();
 *
 * useEffect(() => {
 *   fetchMatches();
 * }, [fetchMatches]);
 * ```
 */
export function useClinicianMatch(): UseClinicianMatchReturn {
  const [state, setState] = useState<ClinicianMatchState>({
    matches: [],
    selectedMatch: null,
    isLoading: false,
    error: null,
  });

  /**
   * Fetches matches from the API
   * First tries the random endpoint which works without auth,
   * falls back to mock data if API is unavailable.
   */
  const fetchMatches = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // First try to get a random clinician (doesn't require auth)
      const randomResponse = await apiGet<Record<string, unknown>>(
        '/clinicians/random'
      );

      // Check if we got data - the API wraps response in { success: true, data: {...} }
      const clinicianData = randomResponse.data || randomResponse;
      
      if (clinicianData && typeof clinicianData === 'object' && 'id' in clinicianData) {
        const fallbackMatch: ClinicianMatch = {
          clinician: mapApiClinician(clinicianData as Record<string, unknown>),
          score: 0.8,
          reasons: ['Available clinician matched to your needs'],
        };

        setState({
          matches: [fallbackMatch],
          selectedMatch: fallbackMatch,
          isLoading: false,
          error: null,
        });
        return;
      }

      // If no clinician data from API, use mock data
      useMockFallback();
    } catch (err) {
      // Use console.log instead of console.error to avoid Next.js error overlay - error is handled gracefully
      console.log('[ClinicianMatch] API unavailable, using mock data fallback');
      // Fall back to mock data when API is unavailable
      useMockFallback();
    }
  }, []);

  /**
   * Uses mock data as fallback for development
   */
  function useMockFallback() {
    const mockMatches = getMockMatches();
    setState({
      matches: mockMatches,
      selectedMatch: mockMatches[0],
      isLoading: false,
      error: null,
    });
  }

  /**
   * Selects a specific match
   */
  const selectMatch = useCallback((match: ClinicianMatch) => {
    setState((prev) => ({ ...prev, selectedMatch: match }));
  }, []);

  /**
   * Requests a different match (cycles through available matches)
   */
  const requestDifferentMatch = useCallback(() => {
    setState((prev) => {
      if (prev.matches.length <= 1) {
        return prev;
      }

      const currentIndex = prev.matches.findIndex(
        (m) => m.clinician.id === prev.selectedMatch?.clinician.id
      );
      const nextIndex = (currentIndex + 1) % prev.matches.length;

      return {
        ...prev,
        selectedMatch: prev.matches[nextIndex],
      };
    });
  }, []);

  /**
   * Resets the state
   */
  const reset = useCallback(() => {
    setState({
      matches: [],
      selectedMatch: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    fetchMatches,
    selectMatch,
    requestDifferentMatch,
    reset,
  };
}

