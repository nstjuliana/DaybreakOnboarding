/**
 * @file Onboarding Layout
 * @description Shared layout for all onboarding pages.
 *              Includes progress indicator, save button, and consistent styling.
 *
 * @see {@link _docs/ui-rules.md} for design guidelines
 */

import { OnboardingProvider } from '@/stores/onboarding-store';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';

/**
 * Metadata for onboarding pages
 */
export const metadata = {
  title: 'Get Started',
  description: 'Begin your mental health care journey with Daybreak Health.',
};

/**
 * Onboarding layout component props
 */
interface OnboardingLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout wrapper for onboarding flow
 * Provides shared header, progress tracking, and styling
 *
 * @param props - Component props
 */
export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-background">
        {/* Header with progress indicator */}
        <OnboardingHeader />

        {/* Main content area */}
        <div className="container-content py-8 md:py-12">
          {children}
        </div>

        {/* Footer with support info */}
        <footer className="border-t border-border py-6">
          <div className="container-content text-center text-sm text-muted-foreground">
            <p>
              Need help?{' '}
              <a
                href="mailto:support@daybreakhealth.com"
                className="text-primary hover:underline"
              >
                Contact support
              </a>
            </p>
            <p className="mt-2">
              Your information is secure and protected under HIPAA.
            </p>
          </div>
        </footer>
      </div>
    </OnboardingProvider>
  );
}

