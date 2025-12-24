/**
 * @file Onboarding Complete Page
 * @description Success page shown after completing the entire onboarding flow.
 *              Provides next steps and links to patient portal.
 *
 * @see {@link _docs/user-flow.md} Post-onboarding
 */

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Calendar, MessageCircle, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Onboarding completion page
 * Shows success message and next steps after booking
 */
export default function CompletePage() {
  // Clear any remaining onboarding state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('daybreak_state');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-primary font-semibold text-lg">
            <DaybreakLogo className="h-8 w-8" />
            <span>Daybreak Health</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center space-y-8 animate-fade-in">
          {/* Success icon */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-success-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-success-600" />
            </div>
          </div>

          {/* Success message */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              You&apos;re All Set!
            </h1>
            <p className="text-lg text-muted-foreground">
              Your onboarding is complete. We&apos;re excited to support you on your mental health journey.
            </p>
          </div>

          {/* Quick links card */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
            <h2 className="font-semibold text-foreground">Quick Links</h2>
            
            <div className="grid gap-3">
              <QuickLink
                icon={Calendar}
                title="View Your Appointments"
                description="See upcoming sessions and manage your schedule"
                href="/appointments"
              />
              <QuickLink
                icon={MessageCircle}
                title="Message Your Clinician"
                description="Reach out with any questions before your session"
                href="/messages"
              />
              <QuickLink
                icon={User}
                title="Your Profile"
                description="Update your information and preferences"
                href="/profile"
              />
            </div>
          </div>

          {/* CTA */}
          <div>
            <Button size="lg" asChild>
              <Link href="/dashboard" className="gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Support text */}
          <p className="text-sm text-muted-foreground">
            Need help? Contact us at{' '}
            <a href="mailto:support@daybreakhealth.com" className="text-primary hover:underline">
              support@daybreakhealth.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

/**
 * Quick link component
 */
interface QuickLinkProps {
  icon: React.ElementType;
  title: string;
  description: string;
  href: string;
}

function QuickLink({ icon: Icon, title, description, href }: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors text-left group"
    >
      <div className="p-2 rounded-full bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground group-hover:text-primary-700 transition-colors">
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary-500 transition-colors" />
    </Link>
  );
}

/**
 * Simple Daybreak logo component
 */
function DaybreakLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="16" cy="20" r="8" fill="currentColor" opacity="0.2" />
      <path
        d="M16 12V4M8 14L4 10M24 14L28 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 20H28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 20C8 15.5817 11.5817 12 16 12C20.4183 12 24 15.5817 24 20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

