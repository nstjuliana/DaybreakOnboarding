/**
 * @file useClinicianMatch Hook
 * @description Custom hook for clinician matching via API.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

import { useState, useCallback } from 'react';
import { apiPost, apiGet } from '@/lib/api/client';
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
   */
  const fetchMatches = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await apiPost<
        Array<{
          clinician: Record<string, unknown>;
          score: number;
          reasons: string[];
        }>
      >('/clinicians/match', {});

      if (response.data && response.data.length > 0) {
        const matches: ClinicianMatch[] = response.data.map((match) => ({
          clinician: mapApiClinician(match.clinician),
          score: match.score,
          reasons: match.reasons,
        }));

        setState({
          matches,
          selectedMatch: matches[0],
          isLoading: false,
          error: null,
        });
      } else {
        // Fallback to random clinician if no matches
        const randomResponse = await apiGet<Record<string, unknown>>(
          '/clinicians/random'
        );

        if (randomResponse.data) {
          const fallbackMatch: ClinicianMatch = {
            clinician: mapApiClinician(randomResponse.data),
            score: 0.5,
            reasons: ['Available clinician'],
          };

          setState({
            matches: [fallbackMatch],
            selectedMatch: fallbackMatch,
            isLoading: false,
            error: null,
          });
        } else {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'No clinicians available at this time.',
          }));
        }
      }
    } catch (err) {
      // If API fails, try random clinician as fallback
      try {
        const randomResponse = await apiGet<Record<string, unknown>>(
          '/clinicians/random'
        );

        if (randomResponse.data) {
          const fallbackMatch: ClinicianMatch = {
            clinician: mapApiClinician(randomResponse.data),
            score: 0.5,
            reasons: ['Available clinician'],
          };

          setState({
            matches: [fallbackMatch],
            selectedMatch: fallbackMatch,
            isLoading: false,
            error: null,
          });
          return;
        }
      } catch {
        // Ignore fallback error
      }

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to find a match',
      }));
    }
  }, []);

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

