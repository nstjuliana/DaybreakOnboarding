/**
 * @file API Types
 * @description TypeScript types for API responses and requests.
 *
 * @see {@link _docs/tech-stack.md} for API conventions
 */

/**
 * Health check response from the backend
 */
export interface HealthStatus {
  status: "ok" | "error";
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: "ok" | "error";
    cache: "ok" | "error";
  };
}

/**
 * User types supported by the application
 */
export type UserType = "parent" | "minor" | "friend";

/**
 * Onboarding phase identifiers
 */
export type OnboardingPhase =
  | "phase-0"
  | "phase-1"
  | "phase-1-5"
  | "phase-2"
  | "phase-3"
  | "phase-4";

/**
 * Generic pagination parameters
 */
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

/**
 * Generic pagination metadata
 */
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}


