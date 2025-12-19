/**
 * @file Home Page
 * @description Entry point for the Parent Onboarding AI application.
 *              Redirects to the onboarding flow or displays a landing page.
 *
 * @see {@link _docs/user-flow.md} Phase 0: Identification Lobby
 */

import { redirect } from 'next/navigation';

/**
 * Home page component
 * Redirects to the onboarding flow entry point (Phase 0)
 */
export default function HomePage() {
  redirect('/phase-0');
}
