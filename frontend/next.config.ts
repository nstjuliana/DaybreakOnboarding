/**
 * @file Next.js Configuration
 * @description Configuration for the Next.js application.
 *              Enables standalone output for Docker deployment.
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  // This creates a minimal production bundle
  output: "standalone",

  // Strict mode for catching potential issues
  reactStrictMode: true,

  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || "0.1.0",
  },

  // Image optimization configuration
  images: {
    remotePatterns: [
      // Add any external image domains here
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'images.daybreakhealth.com',
      // },
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
