/**
 * @file Crisis Resources Component
 * @description Displays crisis hotlines and safety resources.
 *              Used in safety pivot and off-ramp pages.
 *
 * @see {@link frontend/src/lib/constants/safety-resources.ts}
 */

'use client';

import { Phone, MessageCircle, Globe, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CrisisResource } from '@/lib/constants/safety-resources';

/**
 * Props for CrisisResources component
 */
interface CrisisResourcesProps {
  /** Resources to display */
  resources: CrisisResource[];
  /** Whether to show as compact cards */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Crisis resources list component
 * Displays crisis hotlines with contact information
 *
 * @param props - Component props
 */
export function CrisisResources({
  resources,
  compact = false,
  className,
}: CrisisResourcesProps) {
  return (
    <div
      className={cn(
        'space-y-3',
        className
      )}
      role="list"
      aria-label="Crisis resources"
    >
      {resources.map((resource) => (
        <CrisisResourceCard
          key={resource.id}
          resource={resource}
          compact={compact}
        />
      ))}
    </div>
  );
}

/**
 * Individual crisis resource card
 */
function CrisisResourceCard({
  resource,
  compact,
}: {
  resource: CrisisResource;
  compact: boolean;
}) {
  const isEmergency = resource.type === 'emergency';

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        isEmergency
          ? 'bg-error-50 border-error-200'
          : 'bg-white border-neutral-200 hover:border-primary-200',
        compact && 'p-3'
      )}
      role="listitem"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            isEmergency ? 'bg-error-100' : 'bg-primary-100'
          )}
        >
          {isEmergency ? (
            <AlertTriangle className={cn('w-5 h-5', isEmergency ? 'text-error-600' : 'text-primary-600')} />
          ) : resource.type === 'text' ? (
            <MessageCircle className="w-5 h-5 text-primary-600" />
          ) : (
            <Phone className="w-5 h-5 text-primary-600" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold',
              isEmergency ? 'text-error-700' : 'text-neutral-800',
              compact ? 'text-sm' : 'text-base'
            )}
          >
            {resource.name}
          </h3>

          {!compact && (
            <p className="text-sm text-neutral-600 mt-0.5">
              {resource.description}
            </p>
          )}

          {/* Contact methods */}
          <div className="flex flex-wrap gap-3 mt-2">
            {resource.phone && (
              <a
                href={`tel:${resource.phone.replace(/\D/g, '')}`}
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium',
                  isEmergency
                    ? 'text-error-700 hover:text-error-800'
                    : 'text-primary-600 hover:text-primary-700'
                )}
              >
                <Phone className="w-4 h-4" />
                {resource.phone}
              </a>
            )}

            {resource.text && (
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium',
                  'text-primary-600'
                )}
              >
                <MessageCircle className="w-4 h-4" />
                {resource.text}
              </span>
            )}

            {resource.website && !compact && (
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-600"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
          </div>

          {/* Availability */}
          <p className="text-xs text-neutral-500 mt-2">
            Available: {resource.available}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact emergency banner for critical situations
 */
export function EmergencyBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-error-50 border border-error-200 rounded-xl p-4',
        className
      )}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-error-100 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-error-600" />
        </div>
        <div>
          <p className="font-semibold text-error-700">
            If you&apos;re in immediate danger, call 911
          </p>
          <a
            href="tel:911"
            className="text-sm font-medium text-error-600 hover:text-error-700"
          >
            Tap to call emergency services
          </a>
        </div>
      </div>
    </div>
  );
}

