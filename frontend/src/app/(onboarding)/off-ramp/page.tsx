/**
 * @file Off-Ramp Page
 * @description Displayed when user is determined to not be a fit for the platform.
 *              Provides alternative resources and supportive messaging.
 *
 * @see {@link backend/app/services/assessments/fit_determinator.rb}
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ExternalLink, Phone, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';

/**
 * Resource for off-ramp recommendations
 */
interface OffRampResource {
  name: string;
  description?: string;
  phone?: string;
  website?: string;
  available?: string;
}

/**
 * Default resources to display
 */
const DEFAULT_RESOURCES: OffRampResource[] = [
  {
    name: '988 Suicide & Crisis Lifeline',
    description: 'Free, confidential support 24/7',
    phone: '988',
    available: '24/7',
  },
  {
    name: 'SAMHSA Treatment Locator',
    description: 'Find local mental health services',
    website: 'https://findtreatment.gov',
  },
  {
    name: 'Psychology Today Therapist Finder',
    description: 'Search for therapists in your area',
    website: 'https://www.psychologytoday.com/us/therapists',
  },
  {
    name: 'Mental Health America',
    description: 'Resources, screening tools, and support',
    website: 'https://www.mhanational.org',
  },
];

/**
 * Off-ramp page component
 */
export default function OffRampPage() {
  const router = useRouter();
  const { state, setPhase } = useOnboarding();

  useEffect(() => {
    setPhase('phase-2'); // Keep on phase-2 for navigation purposes
  }, [setPhase]);

  /**
   * Handles returning to start
   */
  function handleStartOver() {
    router.push('/');
  }

  return (
    <div className="flex flex-col items-center animate-fade-in max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
          <Heart className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-3">
          We Want to Help You Find the Right Support
        </h1>
        <p className="text-neutral-600 max-w-lg mx-auto">
          Based on your responses, we think you might benefit from a different
          type of support than what we currently offer. This doesn't mean
          you can't get help—it means we want to connect you with the
          best resources for your specific needs.
        </p>
      </div>

      {/* Reassurance card */}
      <div className="w-full bg-primary-50 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-neutral-800 mb-3">
          This is not a reflection of you
        </h2>
        <p className="text-sm text-neutral-700 mb-4">
          Reaching out for help takes courage. The fact that you completed this
          assessment shows you're taking an important step toward feeling better.
          Different people need different types of support, and there's no shame
          in that.
        </p>
        <ul className="space-y-2 text-sm text-neutral-700">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">✓</span>
            Your feelings are valid
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">✓</span>
            Help is available
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">✓</span>
            You deserve support that fits your needs
          </li>
        </ul>
      </div>

      {/* Resources */}
      <div className="w-full mb-8">
        <h2 className="text-lg font-semibold text-neutral-800 mb-4">
          Resources We Recommend
        </h2>
        <div className="space-y-3">
          {DEFAULT_RESOURCES.map((resource) => (
            <ResourceCard key={resource.name} resource={resource} />
          ))}
        </div>
      </div>

      {/* What's next */}
      <div className="w-full bg-white rounded-xl border border-neutral-200 p-6 mb-8">
        <h2 className="font-semibold text-neutral-800 mb-3">What You Can Do Next</h2>
        <ol className="space-y-3 text-sm text-neutral-700">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>
              <strong>If you're in crisis:</strong> Call 988 or text HOME to 741741
              for immediate support.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span>
              <strong>Talk to your doctor:</strong> Your primary care provider can
              provide referrals to specialists.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span>
              <strong>Use the resources above:</strong> These organizations specialize
              in connecting people with appropriate care.
            </span>
          </li>
        </ol>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col sm:flex-row gap-3 mb-8">
        <Button
          variant="outline"
          onClick={handleStartOver}
          className="flex-1"
        >
          Return to Home
        </Button>
        <a
          href="https://findtreatment.gov"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button className="w-full">
            Find Local Services
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>

      {/* Footer message */}
      <div className="text-center text-sm text-neutral-500 pb-8">
        <p>
          If your situation changes or you'd like to try our assessment again
          in the future, you're always welcome back.
        </p>
      </div>
    </div>
  );
}

/**
 * Resource card component
 */
function ResourceCard({ resource }: { resource: OffRampResource }) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-4 hover:border-primary-200 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-neutral-800">{resource.name}</h3>
          {resource.description && (
            <p className="text-sm text-neutral-600 mt-0.5">{resource.description}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {resource.phone && (
              <a
                href={`tel:${resource.phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <Phone className="w-4 h-4" />
                {resource.phone}
              </a>
            )}
            {resource.website && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                <Globe className="w-4 h-4" />
                Visit Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {resource.available && (
            <p className="text-xs text-neutral-500 mt-2">
              Available: {resource.available}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

