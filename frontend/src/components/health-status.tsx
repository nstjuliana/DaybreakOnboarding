/**
 * @file HealthStatusDisplay Component
 * @description Displays the backend API health status with visual indicators.
 *              Fetches status on mount and shows service health.
 */

"use client";

import { useEffect, useState } from "react";
import { getHealthStatus } from "@/lib/api/health";
import type { HealthStatus } from "@/types/api";

/**
 * Status indicator component
 */
function StatusIndicator({
  status,
  label,
}: {
  status: "ok" | "error" | "loading";
  label: string;
}) {
  const colors = {
    ok: "bg-green-500",
    error: "bg-red-500",
    loading: "bg-yellow-500 animate-pulse",
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-2.5 h-2.5 rounded-full ${colors[status]}`}
        aria-hidden="true"
      />
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  );
}

/**
 * Health status display component
 * Fetches and displays the backend health status
 */
export function HealthStatusDisplay() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const response = await getHealthStatus();
        if (response.data) {
          setHealth(response.data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch health status"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();

    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
          <span className="text-muted-foreground">Checking backend status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-red-600 font-medium">Backend Unavailable</span>
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
        <p className="text-sm text-muted-foreground">
          Make sure the backend is running at{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
            localhost:3000
          </code>
        </p>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Overall Status */}
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full ${
            health.status === "ok" ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="font-medium">
          {health.status === "ok" ? "All Systems Operational" : "System Issues Detected"}
        </span>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-2 gap-4 pt-2">
        <StatusIndicator status={health.services.database} label="Database" />
        <StatusIndicator status={health.services.cache} label="Cache" />
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-border space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Version</span>
          <span className="font-mono">{health.version}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Environment</span>
          <span className="font-mono capitalize">{health.environment}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Last Check</span>
          <span className="font-mono">
            {new Date(health.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}

