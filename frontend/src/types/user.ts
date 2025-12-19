/**
 * @file User Type Definitions
 * @description TypeScript types for user-related data structures.
 *
 * @see {@link _docs/user-flow.md} for user type definitions
 */

/**
 * User types supported by the onboarding flow
 */
export type UserType = 'parent' | 'minor' | 'friend';

/**
 * User type configuration with labels and descriptions
 */
export const USER_TYPE_CONFIG: Record<
  UserType,
  { label: string; description: string }
> = {
  parent: {
    label: "I'm a Parent/Guardian",
    description: 'Seeking mental health services for my child',
  },
  minor: {
    label: "I'm looking for help for myself",
    description: 'A teen or young adult seeking support (13+)',
  },
  friend: {
    label: "I'm worried about someone",
    description: 'A friend or family member wanting to help',
  },
};

/**
 * User profile data from the API
 */
export interface User {
  id: string;
  email: string;
  userType: UserType;
  userTypeLabel?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  dateOfBirth?: string;
  profile?: Record<string, unknown>;
  confirmed?: boolean;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  passwordConfirmation: string;
  userType: UserType;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Maps API user response (snake_case) to frontend User type (camelCase)
 *
 * @param apiUser - User data from API
 * @returns Formatted user object
 */
export function mapApiUserToUser(apiUser: Record<string, unknown>): User {
  return {
    id: apiUser.id as string,
    email: apiUser.email as string,
    userType: apiUser.user_type as UserType,
    userTypeLabel: apiUser.user_type_label as string | undefined,
    firstName: apiUser.first_name as string | undefined,
    lastName: apiUser.last_name as string | undefined,
    displayName: apiUser.display_name as string | undefined,
    phone: apiUser.phone as string | undefined,
    dateOfBirth: apiUser.date_of_birth as string | undefined,
    profile: apiUser.profile as Record<string, unknown> | undefined,
    confirmed: apiUser.confirmed as boolean | undefined,
    createdAt: apiUser.created_at as string,
    updatedAt: apiUser.updated_at as string | undefined,
  };
}

