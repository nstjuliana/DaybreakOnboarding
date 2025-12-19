/**
 * @file Phase 3D Matching Page
 * @description Clinician matching page where users see their matched clinician.
 *              For MVP, displays a random clinician with option to re-match.
 *
 * @see {@link _docs/user-flow.md} Phase 3D: Clinician Matching
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { ClinicianCard } from '@/components/onboarding/clinician-card';
import type { Clinician } from '@/types/clinician';

/**
 * Phase 3D: Clinician Matching page
 * Shows matched clinician with option to request different match
 */
export default function Phase3MatchingPage() {
  const router = useRouter();
  const { setPhase, completePhase, setClinicianId } = useOnboarding();
  const [clinician, setClinician] = useState<Clinician | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set current phase
  useEffect(() => {
    setPhase('phase-3');
  }, [setPhase]);

  /**
   * Fetches a random clinician from the API
   */
  const fetchClinician = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // For MVP, we'll use mock data since backend might not be running
      // In production, this would be: const result = await apiGet<Clinician>('/clinicians/random');
      
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockClinicians: Clinician[] = [
        {
          id: '1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          fullName: 'Sarah Johnson',
          displayName: 'Sarah Johnson, LCSW',
          credentials: 'LCSW',
          bio: 'I believe every young person deserves a safe space to explore their feelings and develop coping skills. With over 10 years of experience working with children and adolescents, I specialize in helping families navigate anxiety, depression, and life transitions.',
          photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
          specialties: ['anxiety', 'depression', 'adolescents', 'family_therapy'],
          status: 'active',
        },
        {
          id: '2',
          firstName: 'Michael',
          lastName: 'Chen',
          fullName: 'Michael Chen',
          displayName: 'Michael Chen, PhD',
          credentials: 'PhD',
          bio: 'As a clinical psychologist, I am passionate about helping teens and their families build resilience and find their strengths. I use evidence-based approaches including CBT and DBT to help young people manage difficult emotions.',
          photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
          specialties: ['anxiety', 'depression', 'behavioral_issues', 'cbt'],
          status: 'active',
        },
        {
          id: '3',
          firstName: 'Emily',
          lastName: 'Rodriguez',
          fullName: 'Emily Rodriguez',
          displayName: 'Emily Rodriguez, LMFT',
          credentials: 'LMFT',
          bio: 'I am dedicated to supporting families through challenging times with compassion and expertise. My background in family systems therapy helps me work with the whole family unit, not just the individual.',
          photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
          specialties: ['family_therapy', 'adolescents', 'mood_disorders'],
          status: 'active',
        },
      ];

      // Pick a random clinician
      const randomClinician =
        mockClinicians[Math.floor(Math.random() * mockClinicians.length)];
      
      setClinician(randomClinician);
      setClinicianId(randomClinician.id);
    } catch {
      setError('Unable to find a clinician match. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [setClinicianId]);

  // Fetch clinician on mount
  useEffect(() => {
    fetchClinician();
  }, [fetchClinician]);

  /**
   * Handles continuing to scheduling
   */
  function handleContinue() {
    completePhase('phase-3');
    setPhase('phase-4');
    // For MVP, just show completion message since we don't have scheduling
    router.push('/phase-4');
  }

  /**
   * Handles requesting a different match
   */
  function handleRequestDifferent() {
    fetchClinician(true);
  }

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          {isLoading ? 'Finding Your Match' : "We've Found Your Match"}
        </h1>
        <p className="text-muted-foreground">
          {isLoading
            ? 'Looking for the perfect clinician for your needs...'
            : 'Based on your responses, we think this clinician would be a great fit.'}
        </p>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              Matching you with a clinician...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchClinician()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Clinician card */}
      {clinician && !isLoading && (
        <>
          <div className="w-full max-w-md">
            <ClinicianCard clinician={clinician} isSelected />
          </div>

          {/* Action buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Button
              variant="outline"
              onClick={handleRequestDifferent}
              disabled={isRefreshing}
              className="gap-2"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Request Different Match
            </Button>

            <Button size="lg" onClick={handleContinue} className="gap-2">
              Continue to Scheduling
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      {/* Info text */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-xs text-muted-foreground">
          You&apos;ll have the opportunity to connect with your clinician before
          committing to ongoing care. If it&apos;s not the right fit, we&apos;ll help
          you find someone else.
        </p>
      </div>
    </div>
  );
}

