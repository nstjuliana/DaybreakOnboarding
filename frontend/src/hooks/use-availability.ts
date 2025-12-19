/**
 * @file useAvailability Hook
 * @description Custom hook for fetching clinician availability slots.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

import { useState, useCallback } from 'react';
import { apiGet } from '@/lib/api/client';

/**
 * Time slot from the API
 */
export interface TimeSlot {
  date: string;
  time: string;
  endTime: string;
  datetime: string;
  duration: number;
  available: boolean;
}

/**
 * State shape for availability
 */
interface AvailabilityState {
  slots: TimeSlot[];
  slotsByDate: Record<string, TimeSlot[]>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Return type for useAvailability hook
 */
interface UseAvailabilityReturn extends AvailabilityState {
  /** Fetch availability for a clinician */
  fetchAvailability: (
    clinicianId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<void>;
  /** Get available dates (for calendar) */
  getAvailableDates: () => string[];
  /** Get slots for a specific date */
  getSlotsForDate: (date: string) => TimeSlot[];
  /** Reset state */
  reset: () => void;
}

/**
 * useAvailability Hook
 *
 * @description Fetches and manages clinician availability data.
 *
 * @example
 * ```tsx
 * const { fetchAvailability, slotsByDate, isLoading } = useAvailability();
 *
 * useEffect(() => {
 *   fetchAvailability(clinicianId);
 * }, [clinicianId]);
 * ```
 */
export function useAvailability(): UseAvailabilityReturn {
  const [state, setState] = useState<AvailabilityState>({
    slots: [],
    slotsByDate: {},
    isLoading: false,
    error: null,
  });

  /**
   * Fetches availability from the API
   */
  const fetchAvailability = useCallback(
    async (clinicianId: string, startDate?: string, endDate?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // Build query params
        const params = new URLSearchParams();
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);

        const queryString = params.toString();
        const url = `/clinicians/${clinicianId}/availability${queryString ? `?${queryString}` : ''}`;

        const response = await apiGet<{
          slots: Array<{
            date: string;
            time: string;
            end_time: string;
            datetime: string;
            duration: number;
            available: boolean;
          }>;
        }>(url);

        if (response.data?.slots) {
          const slots: TimeSlot[] = response.data.slots.map((slot) => ({
            date: slot.date,
            time: slot.time,
            endTime: slot.end_time,
            datetime: slot.datetime,
            duration: slot.duration,
            available: slot.available,
          }));

          // Group by date
          const slotsByDate = slots.reduce(
            (acc, slot) => {
              if (!acc[slot.date]) {
                acc[slot.date] = [];
              }
              acc[slot.date].push(slot);
              return acc;
            },
            {} as Record<string, TimeSlot[]>
          );

          setState({
            slots,
            slotsByDate,
            isLoading: false,
            error: null,
          });
        } else {
          setState({
            slots: [],
            slotsByDate: {},
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            err instanceof Error ? err.message : 'Failed to load availability',
        }));
      }
    },
    []
  );

  /**
   * Gets list of dates that have available slots
   */
  const getAvailableDates = useCallback(() => {
    return Object.entries(state.slotsByDate)
      .filter(([_, slots]) => slots.some((s) => s.available))
      .map(([date]) => date);
  }, [state.slotsByDate]);

  /**
   * Gets slots for a specific date
   */
  const getSlotsForDate = useCallback(
    (date: string) => {
      return state.slotsByDate[date] || [];
    },
    [state.slotsByDate]
  );

  /**
   * Resets the state
   */
  const reset = useCallback(() => {
    setState({
      slots: [],
      slotsByDate: {},
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    fetchAvailability,
    getAvailableDates,
    getSlotsForDate,
    reset,
  };
}

