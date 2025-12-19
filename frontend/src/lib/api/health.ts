/**
 * @file Health API
 * @description API functions for health check endpoint.
 */

import { apiGet } from "./client";
import type { HealthStatus } from "@/types/api";

/**
 * Fetches the health status from the backend API
 *
 * @returns Health status including database and cache status
 * @throws ApiError if the request fails
 *
 * @example
 * ```ts
 * const { data } = await getHealthStatus();
 * console.log(data.status); // 'ok'
 * ```
 */
export async function getHealthStatus() {
  return apiGet<HealthStatus>("/health");
}

