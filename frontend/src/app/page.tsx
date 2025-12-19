/**
 * @file Home Page
 * @description Landing page for the Parent Onboarding AI application.
 *              Displays welcome message and backend health status.
 *
 * @see {@link _docs/user-flow.md} for user journey specification
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HealthStatusDisplay } from "@/components/health-status";

/**
 * Home page component
 * Entry point for the Parent Onboarding AI application
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--daybreak-primary-50)] via-background to-[var(--daybreak-accent-50)] opacity-50" />

        <div className="relative container-content py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Logo/Brand */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                />
              </svg>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight text-balance">
              Parent Onboarding AI
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Connecting families with compassionate mental health care for
              children and adolescents.
            </p>

            {/* Daybreak branding */}
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <span className="font-semibold text-primary">Daybreak Health</span>
            </p>
          </div>
        </div>
      </div>

      {/* Status Section */}
      <div className="container-content py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Welcome Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Welcome to Phase 0</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This is the foundation phase of the Parent Onboarding AI
                project. The application infrastructure is now set up with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Rails 8 API backend with PostgreSQL</li>
                <li>Next.js 14 frontend with Tailwind CSS</li>
                <li>Docker containerization for development</li>
                <li>HIPAA-compliant configuration</li>
              </ul>
            </CardContent>
          </Card>

          {/* Health Status Card */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <HealthStatusDisplay />
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card className="border-0 shadow-md bg-[var(--daybreak-primary-50)]">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Phase 1 will implement the core onboarding flow:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>User identification (Parent/Minor/Friend)</li>
                <li>Account creation with Devise authentication</li>
                <li>Phase 0 - Identification Lobby UI</li>
                <li>Phase 1 - Regulate and Relate screens</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-12">
        <div className="container-content text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Daybreak Health. All rights reserved.</p>
          <p className="mt-2">HIPAA Compliant &bull; Secure &bull; Confidential</p>
        </div>
      </footer>
    </div>
  );
}
