/**
 * @file Storage Utilities
 * @description LocalStorage helpers with expiration support for
 *              saving and resuming onboarding progress.
 *
 * @see {@link _docs/user-flow.md} Save and Resume functionality
 */

/**
 * Storage item with expiration
 */
interface StorageItem<T> {
  data: T;
  expiresAt: number;
}

/**
 * Default expiration time (30 days in milliseconds)
 */
const DEFAULT_EXPIRATION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Storage key prefix for namespacing
 */
const STORAGE_PREFIX = 'daybreak_onboarding_';

/**
 * Saves data to localStorage with expiration
 *
 * @param key - Storage key (will be prefixed)
 * @param data - Data to store
 * @param expirationMs - Expiration time in milliseconds (default: 30 days)
 *
 * @example
 * ```ts
 * saveToStorage('progress', { phase: 'phase-2', responses: {} });
 * ```
 */
export function saveToStorage<T>(
  key: string,
  data: T,
  expirationMs: number = DEFAULT_EXPIRATION_MS
): void {
  if (typeof window === 'undefined') return;

  const item: StorageItem<T> = {
    data,
    expiresAt: Date.now() + expirationMs,
  };

  try {
    localStorage.setItem(
      `${STORAGE_PREFIX}${key}`,
      JSON.stringify(item)
    );
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

/**
 * Loads data from localStorage, checking expiration
 *
 * @param key - Storage key (will be prefixed)
 * @returns Stored data or null if expired/not found
 *
 * @example
 * ```ts
 * const progress = loadFromStorage<OnboardingState>('progress');
 * if (progress) {
 *   // Resume from saved state
 * }
 * ```
 */
export function loadFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;

    const item: StorageItem<T> = JSON.parse(raw);

    // Check expiration
    if (Date.now() > item.expiresAt) {
      removeFromStorage(key);
      return null;
    }

    return item.data;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return null;
  }
}

/**
 * Removes data from localStorage
 *
 * @param key - Storage key (will be prefixed)
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

/**
 * Checks if saved data exists and is not expired
 *
 * @param key - Storage key (will be prefixed)
 * @returns True if valid data exists
 */
export function hasStoredData(key: string): boolean {
  return loadFromStorage(key) !== null;
}

/**
 * Clears all onboarding-related data from storage
 */
export function clearOnboardingStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear onboarding storage:', error);
  }
}

/**
 * Gets the expiration date of stored data
 *
 * @param key - Storage key (will be prefixed)
 * @returns Expiration date or null
 */
export function getStorageExpiration(key: string): Date | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return null;

    const item: StorageItem<unknown> = JSON.parse(raw);
    return new Date(item.expiresAt);
  } catch {
    return null;
  }
}

