/**
 * @file Phase 4 Page
 * @description Commitment phase - Schedule appointment with matched clinician.
 *              Includes calendar, time slot selection, and booking confirmation.
 *
 * @see {@link _docs/user-flow.md} Phase 4: Commitment (Care)
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { useAvailability, type TimeSlot } from '@/hooks/use-availability';
import { isAuthenticated } from '@/lib/api/auth';
import { CalendarView } from '@/components/scheduling/calendar-view';
import { TimeSlotPicker } from '@/components/scheduling/time-slot-picker';
import { AppointmentSummary } from '@/components/scheduling/appointment-summary';
import { BookingConfirmation } from '@/components/scheduling/booking-confirmation';
import { apiPost, apiGet } from '@/lib/api/client';
import type { Clinician } from '@/types/clinician';

/**
 * Phase 4: Scheduling page
 * Book appointment with matched clinician
 */
export default function Phase4Page() {
  const router = useRouter();
  const { state, setPhase, completePhase, clearProgress } = useOnboarding();

  // Clinician state
  const [clinician, setClinician] = useState<Clinician | null>(null);
  const [isLoadingClinician, setIsLoadingClinician] = useState(true);

  // Selection state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Booking state
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookedAppointment, setBookedAppointment] = useState<Record<string, unknown> | null>(null);

  // Check if user is authenticated
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(true);
  
  useEffect(() => {
    setIsUserAuthenticated(isAuthenticated());
  }, []);

  // Availability hook
  const { fetchAvailability, getAvailableDates, getSlotsForDate } =
    useAvailability();

  // Set current phase
  useEffect(() => {
    setPhase('phase-4');
  }, [setPhase]);

  // Load clinician data
  useEffect(() => {
    async function loadClinician() {
      if (!state.clinicianId) {
        // No clinician selected, go back
        router.push('/phase-3/matching');
        return;
      }

      try {
        const response = await apiGet<Record<string, unknown>>(
          `/clinicians/${state.clinicianId}`
        );

        if (response.data) {
          setClinician({
            id: response.data.id as string,
            firstName: response.data.first_name as string,
            lastName: response.data.last_name as string,
            fullName: response.data.full_name as string,
            displayName: response.data.display_name as string,
            credentials: response.data.credentials as string,
            bio: response.data.bio as string,
            photoUrl: response.data.photo_url as string,
            videoUrl: response.data.video_url as string | undefined,
            specialties: response.data.specialties as string[],
            status: response.data.status as string,
          });

          // Load availability
          fetchAvailability(state.clinicianId);
        }
      } catch {
        // If can't load clinician, use mock data for demo
        setClinician({
          id: state.clinicianId,
          firstName: 'Sarah',
          lastName: 'Johnson',
          fullName: 'Sarah Johnson',
          displayName: 'Sarah Johnson, LCSW',
          credentials: 'LCSW',
          bio: 'Licensed Clinical Social Worker',
          photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
          specialties: ['anxiety', 'depression'],
          status: 'active',
        });
      } finally {
        setIsLoadingClinician(false);
      }
    }

    loadClinician();
  }, [state.clinicianId, router, fetchAvailability]);

  // Handle date selection
  const handleDateSelect = useCallback(
    (date: string) => {
      setSelectedDate(date);
      setSelectedSlot(null);
      setSelectedTime(null);
    },
    []
  );

  // Handle slot selection
  const handleSlotSelect = useCallback((datetime: string) => {
    setSelectedSlot(datetime);
    // Extract time from datetime
    const date = new Date(datetime);
    setSelectedTime(
      `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    );
  }, []);

  // Book appointment
  async function handleBook() {
    if (!clinician || !selectedSlot) return;

    setIsBooking(true);
    setBookingError(null);

    try {
      const response = await apiPost<Record<string, unknown>>('/appointments', {
        clinician_id: clinician.id,
        scheduled_at: selectedSlot,
        session_type: 'initial',
      });

      if (response.data) {
        setBookedAppointment(response.data);
      }
    } catch (err) {
      setBookingError(
        err instanceof Error ? err.message : 'Failed to book appointment'
      );
    } finally {
      setIsBooking(false);
    }
  }

  // Handle completion
  function handleComplete() {
    completePhase('phase-4');
    clearProgress();
    router.push('/');
  }

  // Handle back
  function handleBack() {
    router.push('/phase-3/matching');
  }

  // Loading state
  if (isLoadingClinician) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading scheduling...</p>
      </div>
    );
  }

  // Booking confirmation
  if (bookedAppointment && clinician) {
    return (
      <div className="max-w-xl mx-auto py-8">
        <BookingConfirmation
          appointment={{
            id: bookedAppointment.id as string,
            scheduledAt: bookedAppointment.scheduled_at as string,
            durationMinutes: bookedAppointment.duration_minutes as number,
            sessionType: bookedAppointment.session_type as string,
            telehealthUrl: bookedAppointment.telehealth_url as string | undefined,
          }}
          clinician={clinician}
          onComplete={handleComplete}
        />
      </div>
    );
  }

  // Get slots for selected date
  const slotsForSelectedDate = selectedDate ? getSlotsForDate(selectedDate) : [];
  const availableDates = getAvailableDates();

  // Generate mock availability if API doesn't return data
  const effectiveAvailableDates =
    availableDates.length > 0
      ? availableDates
      : generateMockDates();

  const effectiveSlots =
    slotsForSelectedDate.length > 0
      ? slotsForSelectedDate
      : selectedDate
        ? generateMockSlots(selectedDate)
        : [];

  // Format selected date for display
  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : undefined;

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8 max-w-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Schedule Your First Session
        </h1>
        <p className="text-muted-foreground">
          Select a date and time that works best for you.
        </p>
      </div>

      {/* Auth warning */}
      {!isUserAuthenticated && (
        <div className="w-full max-w-3xl mb-6 p-4 bg-warning-50 border border-warning-500/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning-600">Account required to book</p>
            <p className="text-sm text-warning-500 mt-1">
              Please{' '}
              <button
                onClick={() => router.push('/phase-3/account')}
                className="underline hover:no-underline font-medium"
              >
                create an account
              </button>
              {' '}to confirm your appointment.
            </p>
          </div>
        </div>
      )}

      {/* Error display */}
      {bookingError && (
        <div className="w-full max-w-3xl mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{bookingError}</p>
        </div>
      )}

      {/* Main content grid */}
      <div className="w-full max-w-4xl grid gap-8 md:grid-cols-2">
        {/* Left column: Calendar and time slots */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="font-semibold text-foreground mb-4">Select a Date</h3>
            <CalendarView
              availableDates={effectiveAvailableDates}
              selectedDate={selectedDate}
              onSelectDate={handleDateSelect}
              disabled={isBooking}
            />
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Select a Time
              </h3>
              <TimeSlotPicker
                slots={effectiveSlots}
                selectedSlot={selectedSlot}
                onSelectSlot={handleSlotSelect}
                dateLabel={selectedDateLabel}
                disabled={isBooking}
              />
            </div>
          )}
        </div>

        {/* Right column: Summary */}
        <div className="space-y-6">
          {clinician && selectedDate && selectedTime && (
            <>
              <AppointmentSummary
                clinician={clinician}
                date={selectedDate}
                time={selectedTime}
                sessionType="initial"
                duration={50}
              />

              <Button
                size="lg"
                className="w-full"
                onClick={handleBook}
                disabled={isBooking || !selectedSlot || !isUserAuthenticated}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </>
          )}

          {/* Instructions when nothing selected */}
          {(!selectedDate || !selectedTime) && (
            <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
              <h3 className="font-semibold text-foreground mb-2">
                Choose Your Appointment
              </h3>
              <p className="text-sm text-muted-foreground">
                {!selectedDate
                  ? 'Select an available date from the calendar to see available times.'
                  : 'Select a time slot for your appointment.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Back button */}
      <div className="mt-8">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Matching
        </Button>
      </div>
    </div>
  );
}

/**
 * Generates mock available dates for demo
 */
function generateMockDates(): string[] {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Skip weekends for demo
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      dates.push(date.toISOString().split('T')[0]);
    }
  }

  return dates;
}

/**
 * Generates mock time slots for demo
 */
function generateMockSlots(dateStr: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const baseDate = new Date(dateStr + 'T00:00:00');

  // Morning slots: 9 AM - 12 PM
  for (let hour = 9; hour < 12; hour++) {
    const startTime = new Date(baseDate);
    startTime.setHours(hour, 0, 0, 0);

    slots.push({
      date: dateStr,
      time: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${hour.toString().padStart(2, '0')}:50`,
      datetime: startTime.toISOString(),
      duration: 50,
      available: Math.random() > 0.3, // 70% available for demo
    });
  }

  // Afternoon slots: 1 PM - 5 PM
  for (let hour = 13; hour < 17; hour++) {
    const startTime = new Date(baseDate);
    startTime.setHours(hour, 0, 0, 0);

    slots.push({
      date: dateStr,
      time: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${hour.toString().padStart(2, '0')}:50`,
      datetime: startTime.toISOString(),
      duration: 50,
      available: Math.random() > 0.3,
    });
  }

  return slots;
}
