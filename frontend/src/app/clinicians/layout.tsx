/**
 * @file Clinicians Layout
 * @description Layout wrapper for the browse clinicians page.
 *              Provides consistent structure without the onboarding header.
 *
 * @see {@link _docs/user-flow.md} Browse Clinicians
 */

import { OnboardingProvider } from '@/stores/onboarding-store';

/**
 * Metadata for clinicians pages
 */
export const metadata = {
  title: 'Browse Clinicians | Daybreak Health',
  description: 'Browse our team of licensed mental health professionals.',
};

/**
 * Clinicians layout component props
 */
interface CliniciansLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for clinicians browsing
 * Provides minimal chrome for standalone browsing
 *
 * @param props - Component props
 */
export default function CliniciansLayout({ children }: CliniciansLayoutProps) {
  return (
    <OnboardingProvider>
      {children}
    </OnboardingProvider>
  );
}

