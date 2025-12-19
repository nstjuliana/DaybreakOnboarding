/**
 * @file ClinicianCard Component
 * @description Displays a clinician profile card for the matching step.
 *              Shows photo, name, credentials, bio, specialties, and insurance match status.
 *
 * @see {@link _docs/user-flow.md} Phase 3D: Clinician Matching
 */

'use client';

import Image from 'next/image';
import { User, CheckCircle, Shield } from 'lucide-react';
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
  /** User's insurance provider for match highlighting */
  userInsuranceProvider?: string | null;
  /** User's insurance status */
  userInsuranceStatus?: 'insured' | 'self_pay' | 'uninsured' | null;
}

/**
 * Checks if a clinician accepts the user's insurance
 *
 * @param clinician - The clinician to check
 * @param userProvider - The user's insurance provider name
 * @returns boolean indicating if there's a match
 */
function checkInsuranceMatch(clinician: Clinician, userProvider: string | null): boolean {
  if (!userProvider || !clinician.acceptedInsurances?.length) return false;
  
  const normalizedUserProvider = userProvider.toLowerCase();
  return clinician.acceptedInsurances.some((insurance) => {
    const normalizedInsurance = insurance.toLowerCase();
    return normalizedInsurance.includes(normalizedUserProvider) ||
           normalizedUserProvider.includes(normalizedInsurance);
  });
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
 *   userInsuranceProvider="Aetna"
 *   userInsuranceStatus="insured"
 * />
 * ```
 */
export function ClinicianCard({
  clinician,
  isSelected,
  onClick,
  className,
  userInsuranceProvider,
  userInsuranceStatus,
}: ClinicianCardProps) {
  const hasInsuranceMatch = userInsuranceStatus === 'insured' && 
    checkInsuranceMatch(clinician, userInsuranceProvider ?? null);

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
      {/* Insurance Match Banner */}
      {hasInsuranceMatch && (
        <div className="bg-emerald-500 text-white px-4 py-2 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">
            In-Network with your {userInsuranceProvider} insurance
          </span>
        </div>
      )}

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

        {/* Insurance and payment badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* In-network badge (only if user has insurance and matches) */}
          {hasInsuranceMatch && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              <Shield className="h-3 w-3" />
              In-Network
            </span>
          )}
          {clinician.acceptsSelfPay && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Self-pay friendly
            </span>
          )}
          {clinician.offersSlidingScale && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              Sliding scale
            </span>
          )}
        </div>

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
  userInsuranceProvider,
  userInsuranceStatus,
}: ClinicianCardProps) {
  const hasInsuranceMatch = userInsuranceStatus === 'insured' && 
    checkInsuranceMatch(clinician, userInsuranceProvider ?? null);

  return (
    <div
      className={cn(
        'flex gap-4 p-4 rounded-lg border-2 transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50',
        hasInsuranceMatch && 'ring-2 ring-emerald-500/20',
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
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-foreground">
            {clinician.displayName}
          </h4>
          {hasInsuranceMatch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              <Shield className="h-3 w-3" />
              In-Network
            </span>
          )}
        </div>
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

