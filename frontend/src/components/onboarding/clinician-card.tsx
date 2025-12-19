/**
 * @file ClinicianCard Component
 * @description Displays a clinician profile card for the matching step.
 *              Shows photo, name, credentials, bio, and specialties.
 *
 * @see {@link _docs/user-flow.md} Phase 3D: Clinician Matching
 */

'use client';

import Image from 'next/image';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Clinician } from '@/types/clinician';
import { getSpecialtyLabel } from '@/types/clinician';

/**
 * ClinicianCard component props
 */
interface ClinicianCardProps {
  /** Clinician data */
  clinician: Clinician;
  /** Whether this clinician is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Clinician profile card component
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <ClinicianCard
 *   clinician={matchedClinician}
 *   isSelected={true}
 * />
 * ```
 */
export function ClinicianCard({
  clinician,
  isSelected,
  onClick,
  className,
}: ClinicianCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-card overflow-hidden transition-all duration-200',
        isSelected
          ? 'border-primary shadow-lg'
          : 'border-border hover:border-primary/50 hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Photo section */}
      <div className="relative aspect-[4/3] bg-muted">
        {clinician.photoUrl ? (
          <Image
            src={clinician.photoUrl}
            alt={`Photo of ${clinician.displayName}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-20 w-20 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="p-6">
        {/* Name and credentials */}
        <div className="mb-3">
          <h3 className="text-xl font-semibold text-foreground">
            {clinician.displayName}
          </h3>
          {clinician.credentials && (
            <p className="text-sm text-muted-foreground">
              {getCredentialDescription(clinician.credentials)}
            </p>
          )}
        </div>

        {/* Bio */}
        {clinician.bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
            {clinician.bio}
          </p>
        )}

        {/* Specialties */}
        {clinician.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {clinician.specialties.slice(0, 5).map((specialty) => (
              <span
                key={specialty}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {getSpecialtyLabel(specialty)}
              </span>
            ))}
            {clinician.specialties.length > 5 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                +{clinician.specialties.length - 5} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact clinician card for lists
 */
export function ClinicianCardCompact({
  clinician,
  isSelected,
  onClick,
  className,
}: ClinicianCardProps) {
  return (
    <div
      className={cn(
        'flex gap-4 p-4 rounded-lg border-2 transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Avatar */}
      <div className="relative h-16 w-16 rounded-full bg-muted overflow-hidden flex-shrink-0">
        {clinician.photoUrl ? (
          <Image
            src={clinician.photoUrl}
            alt={clinician.displayName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-8 w-8 text-muted-foreground/50" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground">
          {clinician.displayName}
        </h4>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {clinician.bio}
        </p>
      </div>
    </div>
  );
}

/**
 * Gets a human-readable description for credential abbreviations
 */
function getCredentialDescription(credentials: string): string {
  const descriptions: Record<string, string> = {
    LCSW: 'Licensed Clinical Social Worker',
    PhD: 'Doctor of Philosophy in Psychology',
    PsyD: 'Doctor of Psychology',
    LMFT: 'Licensed Marriage and Family Therapist',
    LPC: 'Licensed Professional Counselor',
    LMHC: 'Licensed Mental Health Counselor',
  };

  return descriptions[credentials] || credentials;
}

