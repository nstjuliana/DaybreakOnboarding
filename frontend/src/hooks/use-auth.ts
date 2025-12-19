/**
 * @file useAuth Hook
 * @description React hook for managing authentication state.
 *              Provides login, logout, register functions and current user state.
 *
 * @see {@link _docs/tech-stack.md} for authentication requirements
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
  clearAuthToken,
} from '@/lib/api/auth';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthState,
} from '@/types/user';
import { mapApiUserToUser } from '@/types/user';

/**
 * Authentication hook return type
 */
interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for managing authentication state
 *
 * @returns Authentication state and functions
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { login, isLoading, error } = useAuth();
 *
 *   const handleSubmit = async (data) => {
 *     try {
 *       await login(data);
 *       router.push('/dashboard');
 *     } catch (err) {
 *       // Error is already set in state
 *     }
 *   };
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Loads the current user on mount
   */
  useEffect(() => {
    async function loadUser() {
      if (!checkIsAuthenticated()) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return;
      }

      try {
        const user = await getCurrentUser();
        setState({
          user: user ? mapApiUserToUser(user as unknown as Record<string, unknown>) : null,
          isAuthenticated: !!user,
          isLoading: false,
          error: null,
        });
      } catch {
        clearAuthToken();
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    }

    loadUser();
  }, []);

  /**
   * Logs in a user
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user } = await apiLogin(credentials);
      const mappedUser = mapApiUserToUser(user as unknown as Record<string, unknown>);

      setState({
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return mappedUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  /**
   * Logs out the current user
   */
  const logout = useCallback(async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await apiLogout();
    } finally {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  /**
   * Registers a new user
   */
  const register = useCallback(async (data: RegisterData): Promise<User> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { user } = await apiRegister(data);
      const mappedUser = mapApiUserToUser(user as unknown as Record<string, unknown>);

      setState({
        user: mappedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return mappedUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  /**
   * Refreshes the current user data
   */
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!checkIsAuthenticated()) return;

    try {
      const user = await getCurrentUser();
      setState((prev) => ({
        ...prev,
        user: user ? mapApiUserToUser(user as unknown as Record<string, unknown>) : null,
        isAuthenticated: !!user,
      }));
    } catch {
      // Silent fail - user state remains unchanged
    }
  }, []);

  /**
   * Clears the current error
   */
  const clearError = useCallback((): void => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    logout,
    register,
    refreshUser,
    clearError,
  };
}

