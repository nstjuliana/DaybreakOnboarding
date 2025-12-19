/**
 * @file Auth API Functions
 * @description API functions for authentication (register, login, logout).
 *              Handles JWT token management and storage.
 *
 * @see {@link _docs/tech-stack.md} for authentication requirements
 */

import { apiDelete, ApiResponse } from './client';
import type { User, LoginCredentials, RegisterData } from '@/types/user';

/**
 * Storage key for JWT token
 */
const TOKEN_STORAGE_KEY = 'daybreak_auth_token';

/**
 * Gets the stored authentication token
 *
 * @returns The JWT token or null if not stored
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Stores the authentication token
 *
 * @param token - The JWT token to store
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/**
 * Removes the stored authentication token
 */
export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Extracts JWT token from response headers
 *
 * @param response - The fetch response
 * @returns The JWT token or null
 */
function extractTokenFromResponse(response: Response): string | null {
  const authHeader = response.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  return null;
}

/**
 * Auth response with user data
 */
interface AuthResponse {
  user: User;
  token: string | null;
}

/**
 * Registers a new user account
 *
 * @param data - Registration data
 * @returns User data and JWT token
 *
 * @example
 * ```ts
 * const { user, token } = await register({
 *   email: 'parent@example.com',
 *   password: 'SecurePass123!',
 *   passwordConfirmation: 'SecurePass123!',
 *   userType: 'parent'
 * });
 * ```
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      user: {
        email: data.email,
        password: data.password,
        password_confirmation: data.passwordConfirmation,
        user_type: data.userType,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
      },
    }),
  });

  const result: ApiResponse<User> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Registration failed');
  }

  const token = extractTokenFromResponse(response);
  if (token) {
    setAuthToken(token);
  }

  return {
    user: result.data!,
    token,
  };
}

/**
 * Logs in a user with email and password
 *
 * @param credentials - Login credentials
 * @returns User data and JWT token
 *
 * @example
 * ```ts
 * const { user, token } = await login({
 *   email: 'parent@example.com',
 *   password: 'SecurePass123!'
 * });
 * ```
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      user: {
        email: credentials.email,
        password: credentials.password,
      },
    }),
  });

  const result: ApiResponse<User> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Invalid email or password');
  }

  const token = extractTokenFromResponse(response);
  if (token) {
    setAuthToken(token);
  }

  return {
    user: result.data!,
    token,
  };
}

/**
 * Logs out the current user
 *
 * @example
 * ```ts
 * await logout();
 * ```
 */
export async function logout(): Promise<void> {
  const token = getAuthToken();

  if (token) {
    try {
      await apiDelete('/auth/logout');
    } catch {
      // Ignore errors during logout - we'll clear the token anyway
    }
  }

  clearAuthToken();
}

/**
 * Gets the current authenticated user
 *
 * @returns User data or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result: ApiResponse<User> = await response.json();

    if (!response.ok || !result.success) {
      clearAuthToken();
      return null;
    }

    return result.data!;
  } catch {
    clearAuthToken();
    return null;
  }
}

/**
 * Checks if user is currently authenticated
 *
 * @returns True if a token exists
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

