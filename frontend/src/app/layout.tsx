/**
 * @file RootLayout
 * @description Root layout for the Parent Onboarding AI application.
 *              Sets up Inter font, metadata, and global providers.
 *
 * @see {@link _docs/theme-rules.md} for typography specifications
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Inter font configuration
 * Primary font for the application - clean, modern, highly readable
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Application metadata for SEO and social sharing
 */
export const metadata: Metadata = {
  title: {
    default: "Parent Onboarding | Daybreak Health",
    template: "%s | Daybreak Health",
  },
  description:
    "Connect your family with pediatric mental health services. Our AI-guided onboarding helps you find the right care for your child.",
  keywords: [
    "mental health",
    "pediatric",
    "therapy",
    "counseling",
    "child psychology",
    "family support",
  ],
  authors: [{ name: "Daybreak Health" }],
  robots: {
    index: false, // Don't index during development
    follow: false,
  },
};

/**
 * Viewport configuration for mobile responsiveness
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2D5A7B",
};

/**
 * Root layout component
 * Wraps all pages with consistent structure and providers
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>

        {/* Main application content */}
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
