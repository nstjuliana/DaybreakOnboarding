/**
 * @file Browse Clinicians Page
 * @description Allows users to browse all available clinicians.
 *              Provides filtering options for specialties and insurance.
 *
 * @see {@link _docs/user-flow.md} Phase 3D: Clinician Matching
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Filter, X, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClinicianCard, ClinicianCardCompact } from '@/components/onboarding/clinician-card';
import { apiGet } from '@/lib/api/client';
import type { Clinician } from '@/types/clinician';
import { cn } from '@/lib/utils';

/**
 * Filter options for clinician browsing
 */
interface FilterOptions {
  specialty: string | null;
  acceptsSelfPay: boolean;
  searchQuery: string;
}

/**
 * Mock clinicians for development
 */
const MOCK_CLINICIANS: Clinician[] = [
  {
    id: 'mock-1',
    firstName: 'Sarah',
    lastName: 'Chen',
    fullName: 'Sarah Chen',
    displayName: 'Dr. Sarah Chen',
    credentials: 'PhD, LMFT',
    bio: 'Dr. Chen specializes in adolescent mental health with over 10 years of experience helping young people navigate anxiety, depression, and life transitions. She uses a warm, collaborative approach.',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    specialties: ['Anxiety', 'Depression', 'Teen Therapy', 'Family Counseling'],
    status: 'active',
    acceptedInsurances: ['Aetna', 'Blue Cross Blue Shield', 'United Healthcare'],
    acceptsSelfPay: true,
    offersSlidingScale: false,
  },
  {
    id: 'mock-2',
    firstName: 'Michael',
    lastName: 'Torres',
    fullName: 'Michael Torres',
    displayName: 'Michael Torres, LCSW',
    credentials: 'LCSW',
    bio: 'Michael brings a compassionate, evidence-based approach to therapy. He specializes in helping children and adolescents with behavioral challenges, ADHD, and social skills development.',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    specialties: ['ADHD', 'Behavioral Issues', 'Social Skills', 'Play Therapy'],
    status: 'active',
    acceptedInsurances: ['Kaiser Permanente', 'Cigna', 'Anthem'],
    acceptsSelfPay: true,
    offersSlidingScale: true,
  },
  {
    id: 'mock-3',
    firstName: 'Emily',
    lastName: 'Rodriguez',
    fullName: 'Emily Rodriguez',
    displayName: 'Dr. Emily Rodriguez',
    credentials: 'PsyD',
    bio: 'Dr. Rodriguez is passionate about helping families build stronger connections. She specializes in trauma-informed care and works with children who have experienced difficult life events.',
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    specialties: ['Trauma', 'Grief', 'Family Therapy', 'Anxiety'],
    status: 'active',
    acceptedInsurances: ['Medicaid', 'Molina Healthcare'],
    acceptsSelfPay: true,
    offersSlidingScale: true,
  },
  {
    id: 'mock-4',
    firstName: 'James',
    lastName: 'Williams',
    fullName: 'James Williams',
    displayName: 'James Williams, LPC',
    credentials: 'LPC',
    bio: 'James specializes in working with pre-teens and teenagers dealing with anxiety, school stress, and identity exploration. He creates a safe, judgment-free space for young people.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    specialties: ['Anxiety', 'School Stress', 'Identity', 'Teen Therapy'],
    status: 'active',
    acceptedInsurances: ['Humana', 'Tricare', 'Oscar Health'],
    acceptsSelfPay: true,
    offersSlidingScale: false,
  },
  {
    id: 'mock-5',
    firstName: 'Lisa',
    lastName: 'Park',
    fullName: 'Lisa Park',
    displayName: 'Dr. Lisa Park',
    credentials: 'PhD',
    bio: 'Dr. Park has extensive experience in child psychology and developmental disorders. She works with families to create supportive environments for children with special needs.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
    specialties: ['Autism', 'Developmental Disorders', 'Family Support', 'CBT'],
    status: 'active',
    acceptedInsurances: ['Blue Cross Blue Shield', 'Medicare', 'Cigna'],
    acceptsSelfPay: false,
    offersSlidingScale: false,
  },
  {
    id: 'mock-6',
    firstName: 'David',
    lastName: 'Johnson',
    fullName: 'David Johnson',
    displayName: 'David Johnson, LMHC',
    credentials: 'LMHC',
    bio: 'David focuses on mood disorders and depression in adolescents. He uses a combination of CBT and DBT techniques to help young people develop coping skills and emotional regulation.',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    specialties: ['Depression', 'Mood Disorders', 'CBT', 'DBT'],
    status: 'active',
    acceptedInsurances: ['Aetna', 'United Healthcare'],
    acceptsSelfPay: true,
    offersSlidingScale: true,
  },
];

/**
 * Available specialty filters
 */
const SPECIALTY_FILTERS = [
  'Anxiety',
  'Depression',
  'ADHD',
  'Trauma',
  'Family Therapy',
  'Teen Therapy',
  'Behavioral Issues',
  'Social Skills',
];

/**
 * Browse Clinicians Page
 * Displays all clinicians with filtering options
 */
export default function BrowseCliniciansPage() {
  const router = useRouter();
  const [clinicians, setClinicians] = useState<Clinician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    specialty: null,
    acceptsSelfPay: false,
    searchQuery: '',
  });

  /**
   * Maps API clinician response to frontend type
   */
  const mapApiClinician = useCallback((data: Record<string, unknown>): Clinician => ({
    id: data.id as string,
    firstName: data.first_name as string,
    lastName: data.last_name as string,
    fullName: data.full_name as string,
    displayName: data.display_name as string,
    credentials: data.credentials as string,
    bio: data.bio as string,
    photoUrl: data.photo_url as string | undefined,
    videoUrl: data.video_url as string | undefined,
    specialties: data.specialties as string[],
    status: data.status as 'active' | 'inactive' | 'on_leave',
  }), []);

  /**
   * Fetches clinicians from API
   */
  const fetchClinicians = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiGet<Record<string, unknown>[]>('/clinicians');
      
      if (response && Array.isArray(response)) {
        setClinicians(response.map(mapApiClinician));
      } else if (response && 'data' in response && Array.isArray(response.data)) {
        setClinicians((response.data as Record<string, unknown>[]).map(mapApiClinician));
      } else {
        // Use mock data if API returns unexpected format
        setClinicians(MOCK_CLINICIANS);
      }
    } catch {
      console.log('[BrowseClinicians] API unavailable, using mock data');
      setClinicians(MOCK_CLINICIANS);
    } finally {
      setIsLoading(false);
    }
  }, [mapApiClinician]);

  // Fetch clinicians on mount
  useEffect(() => {
    fetchClinicians();
  }, [fetchClinicians]);

  /**
   * Filters clinicians based on current filter options
   */
  const filteredClinicians = clinicians.filter((clinician) => {
    // Filter by specialty
    if (filters.specialty) {
      const hasSpecialty = clinician.specialties.some(
        (s) => s.toLowerCase() === filters.specialty?.toLowerCase()
      );
      if (!hasSpecialty) return false;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = clinician.fullName.toLowerCase().includes(query);
      const matchesBio = clinician.bio?.toLowerCase().includes(query);
      const matchesSpecialty = clinician.specialties.some((s) =>
        s.toLowerCase().includes(query)
      );
      if (!matchesName && !matchesBio && !matchesSpecialty) return false;
    }

    return true;
  });

  /**
   * Handles clinician selection
   */
  function handleSelectClinician(clinician: Clinician) {
    // Navigate to clinician detail or matching page
    router.push(`/phase-3/matching?clinician=${clinician.id}`);
  }

  /**
   * Handles clearing all filters
   */
  function handleClearFilters() {
    setFilters({
      specialty: null,
      acceptsSelfPay: false,
      searchQuery: '',
    });
  }

  /**
   * Handles back navigation
   */
  function handleBack() {
    router.back();
  }

  const hasActiveFilters = filters.specialty || filters.acceptsSelfPay || filters.searchQuery;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="container-content py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Browse Clinicians
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredClinicians.length} clinicians available
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="hidden sm:flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'px-3 py-1.5 text-sm transition-colors',
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'px-3 py-1.5 text-sm transition-colors',
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-muted'
                  )}
                >
                  List
                </button>
              </div>

              {/* Filter toggle */}
              <Button
                variant={showFilters ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-foreground text-primary rounded-full">
                    {[filters.specialty, filters.acceptsSelfPay, filters.searchQuery].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, specialty, or keyword..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters({ ...filters, searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg animate-fade-in">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Specialty
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SPECIALTY_FILTERS.map((specialty) => (
                      <button
                        key={specialty}
                        onClick={() =>
                          setFilters({
                            ...filters,
                            specialty: filters.specialty === specialty ? null : specialty,
                          })
                        }
                        className={cn(
                          'px-3 py-1 text-sm rounded-full transition-colors',
                          filters.specialty === specialty
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border border-border text-muted-foreground hover:bg-muted'
                        )}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="ml-auto gap-2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container-content py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading clinicians...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchClinicians} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredClinicians.length === 0 && (
          <div className="text-center py-16">
            <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No clinicians found
            </h2>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query.
            </p>
            {hasActiveFilters && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            )}
          </div>
        )}

        {/* Clinician grid/list */}
        {!isLoading && !error && filteredClinicians.length > 0 && (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
                : 'space-y-4'
            )}
          >
            {filteredClinicians.map((clinician) =>
              viewMode === 'grid' ? (
                <ClinicianCard
                  key={clinician.id}
                  clinician={clinician}
                  onClick={() => handleSelectClinician(clinician)}
                />
              ) : (
                <ClinicianCardCompact
                  key={clinician.id}
                  clinician={clinician}
                  onClick={() => handleSelectClinician(clinician)}
                />
              )
            )}
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <footer className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-border py-4">
        <div className="container-content text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Not sure who to pick? Let us help you find the best match.
          </p>
          <Button
            onClick={() => router.push('/phase-3/coverage')}
            variant="outline"
          >
            Get Matched Automatically
          </Button>
        </div>
      </footer>
    </div>
  );
}

