/**
 * @file API Client
 * @description Base API client for communicating with the Rails backend.
 *              Provides typed fetch wrapper with error handling.
 *
 * @see {@link _docs/tech-stack.md} for API conventions
 */

/**
 * API response wrapper type
 * All API responses follow this structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  meta?: {
    timestamp?: string;
    pagination?: {
      current_page: number;
      per_page: number;
      total_pages: number;
      total_count: number;
    };
  };
}

/**
 * API error class for handling API-specific errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: string[] = []
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Base URL for API requests
 * Uses environment variable with fallback to localhost
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

/**
 * Storage key for JWT token (must match auth.ts)
 */
const TOKEN_STORAGE_KEY = 'daybreak_auth_token';

/**
 * Gets the stored authentication token
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Default headers for API requests
 */
const DEFAULT_HEADERS: HeadersInit = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/**
 * Fetch wrapper with error handling and typing
 *
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Parsed API response
 * @throws ApiError if request fails
 *
 * @example
 * ```ts
 * const health = await apiFetch<HealthStatus>('/health');
 * ```
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Build headers with auth token if available
  const headers: HeadersInit = {
    ...DEFAULT_HEADERS,
    ...options.headers,
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Parse JSON response
    const data: ApiResponse<T> = await response.json();

    // Check for HTTP errors
    if (!response.ok) {
      throw new ApiError(
        data.error || `Request failed with status ${response.status}`,
        response.status,
        data.errors || []
      );
    }

    return data;
  } catch (error) {
    // Re-throw ApiErrors as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError("Unable to connect to the server", 0, [
        "Please check your internet connection",
      ]);
    }

    // Handle other errors
    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
}

/**
 * GET request helper
 */
export function apiGet<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export function apiPost<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH request helper
 */
export function apiPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, { ...options, method: "DELETE" });
}


