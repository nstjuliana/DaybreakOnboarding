/**
 * @file Resource Referral Component
 * @description Displays resource recommendations for off-ramp users.
 *
 * @see {@link frontend/src/app/(onboarding)/off-ramp/page.tsx}
 */

'use client';

import { ExternalLink, Phone, Globe, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Resource type definition
 */
export interface ReferralResource {
  id: string;
  name: string;
  description: string;
  type: 'crisis' | 'treatment' | 'information' | 'local';
  phone?: string;
  website?: string;
  available?: string;
}

/**
 * Props for ResourceReferral component
 */
interface ResourceReferralProps {
  /** Resources to display */
  resources: ReferralResource[];
  /** Title for the section */
  title?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Resource referral component
 * Displays a list of recommended resources with contact info
 *
 * @param props - Component props
 */
export function ResourceReferral({
  resources,
  title = 'Recommended Resources',
  className,
}: ResourceReferralProps) {
  // Group resources by type
  const crisisResources = resources.filter((r) => r.type === 'crisis');
  const treatmentResources = resources.filter((r) => r.type === 'treatment');
  const infoResources = resources.filter((r) => r.type === 'information');

  return (
    <div className={cn('space-y-6', className)}>
      <h2 className="text-xl font-semibold text-neutral-800">{title}</h2>

      {/* Crisis resources first */}
      {crisisResources.length > 0 && (
        <ResourceSection
          title="Immediate Support"
          resources={crisisResources}
          variant="crisis"
        />
      )}

      {/* Treatment resources */}
      {treatmentResources.length > 0 && (
        <ResourceSection
          title="Find Treatment"
          resources={treatmentResources}
          variant="treatment"
        />
      )}

      {/* Information resources */}
      {infoResources.length > 0 && (
        <ResourceSection
          title="Learn More"
          resources={infoResources}
          variant="info"
        />
      )}
    </div>
  );
}

/**
 * Resource section component
 */
function ResourceSection({
  title,
  resources,
  variant,
}: {
  title: string;
  resources: ReferralResource[];
  variant: 'crisis' | 'treatment' | 'info';
}) {
  const variantStyles = {
    crisis: 'bg-error-50 border-error-200',
    treatment: 'bg-primary-50 border-primary-200',
    info: 'bg-neutral-50 border-neutral-200',
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-600 mb-3">{title}</h3>
      <div className="space-y-3">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className={cn(
              'rounded-xl border p-4',
              variantStyles[variant]
            )}
          >
            <h4 className="font-semibold text-neutral-800">{resource.name}</h4>
            <p className="text-sm text-neutral-600 mt-1">{resource.description}</p>

            <div className="flex flex-wrap gap-3 mt-3">
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
                  Website
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
        ))}
      </div>
    </div>
  );
}

/**
 * Local services finder component
 */
export function LocalServicesFinder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-primary-50 rounded-xl border border-primary-200 p-6',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
          <MapPin className="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-800">
            Find Services Near You
          </h3>
          <p className="text-sm text-neutral-600 mt-1">
            SAMHSA's treatment locator helps you find mental health services,
            substance use treatment, and support groups in your area.
          </p>
          <a
            href="https://findtreatment.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Find Treatment
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

