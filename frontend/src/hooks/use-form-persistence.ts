/**
 * @file useFormPersistence Hook
 * @description React hook for persisting form data to localStorage.
 *              Enables save and resume functionality for onboarding forms.
 *
 * @see {@link _docs/user-flow.md} Save and Resume
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  saveToStorage,
  loadFromStorage,
  removeFromStorage,
} from '@/lib/utils/storage';

/**
 * Form persistence options
 */
interface UseFormPersistenceOptions<T> {
  /** Storage key for this form */
  key: string;
  /** Default values when no saved data exists */
  defaultValues: T;
  /** Debounce delay in ms for auto-save (default: 500) */
  debounceMs?: number;
  /** Whether to auto-save on every change (default: true) */
  autoSave?: boolean;
  /** Expiration time in ms (default: 30 days) */
  expirationMs?: number;
}

/**
 * Form persistence return type
 */
interface UseFormPersistenceReturn<T> {
  /** Current form values */
  values: T;
  /** Whether saved data was loaded */
  wasRestored: boolean;
  /** Updates a single field value */
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Updates multiple field values */
  setValues: (values: Partial<T>) => void;
  /** Manually triggers a save */
  save: () => void;
  /** Clears all saved data */
  clear: () => void;
  /** Resets to default values without clearing storage */
  reset: () => void;
  /** Last saved timestamp */
  lastSavedAt: Date | null;
}

/**
 * Hook for persisting form data to localStorage
 *
 * @param options - Persistence options
 * @returns Form state and control functions
 *
 * @example
 * ```tsx
 * function RegistrationForm() {
 *   const {
 *     values,
 *     setValue,
 *     wasRestored,
 *     clear,
 *   } = useFormPersistence({
 *     key: 'registration',
 *     defaultValues: { email: '', name: '' },
 *   });
 *
 *   return (
 *     <>
 *       {wasRestored && <p>Welcome back! Your progress was saved.</p>}
 *       <input
 *         value={values.email}
 *         onChange={(e) => setValue('email', e.target.value)}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
export function useFormPersistence<T extends Record<string, unknown>>({
  key,
  defaultValues,
  debounceMs = 500,
  autoSave = true,
  expirationMs,
}: UseFormPersistenceOptions<T>): UseFormPersistenceReturn<T> {
  const [values, setValuesState] = useState<T>(defaultValues);
  const [wasRestored, setWasRestored] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Ref to track if we've initialized
  const isInitialized = useRef(false);
  // Ref for debounce timeout
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved data on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const savedData = loadFromStorage<T>(key);
    if (savedData) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setValuesState(savedData);
      setWasRestored(true);
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [key]);

  /**
   * Saves current values to storage
   */
  const save = useCallback(() => {
    saveToStorage(key, values, expirationMs);
    setLastSavedAt(new Date());
  }, [key, values, expirationMs]);

  /**
   * Debounced save function
   */
  const debouncedSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);
  }, [save, debounceMs]);

  /**
   * Updates a single field value
   */
  const setValue = useCallback(
    <K extends keyof T>(fieldKey: K, value: T[K]) => {
      setValuesState((prev) => {
        const updated = { ...prev, [fieldKey]: value };
        return updated;
      });
    },
    []
  );

  /**
   * Updates multiple field values
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Auto-save when values change
  useEffect(() => {
    if (!isInitialized.current || !autoSave) return;
    debouncedSave();
  }, [values, autoSave, debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Clears saved data from storage
   */
  const clear = useCallback(() => {
    removeFromStorage(key);
    setValuesState(defaultValues);
    setWasRestored(false);
    setLastSavedAt(null);
  }, [key, defaultValues]);

  /**
   * Resets to default values without clearing storage
   */
  const reset = useCallback(() => {
    setValuesState(defaultValues);
  }, [defaultValues]);

  return {
    values,
    wasRestored,
    setValue,
    setValues,
    save,
    clear,
    reset,
    lastSavedAt,
  };
}

/**
 * Simplified hook for React Hook Form integration
 * Syncs form state with localStorage persistence
 *
 * @param key - Storage key
 * @param getValues - React Hook Form getValues function
 * @param reset - React Hook Form reset function
 */
export function useFormPersistenceSync<T extends Record<string, unknown>>(
  key: string,
  getValues: () => T,
  reset: (values: T) => void
) {
  const isInitialized = useRef(false);

  // Load saved data on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const savedData = loadFromStorage<T>(key);
    if (savedData) {
      reset(savedData);
    }
  }, [key, reset]);

  /**
   * Saves current form values
   */
  const save = useCallback(() => {
    const values = getValues();
    saveToStorage(key, values);
  }, [key, getValues]);

  /**
   * Clears saved data
   */
  const clear = useCallback(() => {
    removeFromStorage(key);
  }, [key]);

  return { save, clear };
}

