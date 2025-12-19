/**
 * @file BookingConfirmation Component
 * @description Success screen after appointment is booked.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import { CheckCircle2, Calendar, Mail, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Clinician } from '@/types/clinician';

/**
 * Props for BookingConfirmation component
 */
interface BookingConfirmationProps {
  /** The appointment details */
  appointment: {
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    sessionType: string;
    telehealthUrl?: string;
  };
  /** The clinician */
  clinician: Clinician;
  /** Callback for done button */
  onComplete: () => void;
}

/**
 * BookingConfirmation Component
 *
 * @description Shows success confirmation after booking is complete.
 *
 * @example
 * ```tsx
 * <BookingConfirmation
 *   appointment={bookedAppointment}
 *   clinician={selectedClinician}
 *   onComplete={handleComplete}
 * />
 * ```
 */
export function BookingConfirmation({
  appointment,
  clinician,
  onComplete,
}: BookingConfirmationProps) {
  const appointmentDate = new Date(appointment.scheduledAt);

  /**
   * Formats date for display
   */
  function formatDate(): string {
    return appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Formats time for display
   */
  function formatTime(): string {
    return appointmentDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Generates calendar link
   */
  function getCalendarLink(): string {
    const endDate = new Date(
      appointmentDate.getTime() + appointment.durationMinutes * 60000
    );

    const formatForCalendar = (date: Date) =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `Daybreak Health - Session with ${clinician.displayName}`,
      dates: `${formatForCalendar(appointmentDate)}/${formatForCalendar(endDate)}`,
      details: `Video session with ${clinician.displayName}\n\nJoin link: ${appointment.telehealthUrl || 'Link will be sent via email'}`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  return (
    <div className="text-center space-y-8 animate-fade-in">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-success-50 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-success-500" />
        </div>
      </div>

      {/* Success message */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Appointment Confirmed!
        </h1>
        <p className="text-muted-foreground">
          Your session with {clinician.displayName} has been scheduled.
        </p>
      </div>

      {/* Appointment details card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 max-w-md mx-auto">
        <div className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary-500" />
            <div className="text-left">
              <p className="font-medium text-foreground">{formatDate()}</p>
              <p className="text-sm text-muted-foreground">
                {formatTime()} • {appointment.durationMinutes} minutes
              </p>
            </div>
          </div>

          {/* Video link info */}
          <div className="flex items-center gap-3">
            <Video className="h-5 w-5 text-primary-500" />
            <div className="text-left">
              <p className="font-medium text-foreground">Telehealth Session</p>
              <p className="text-sm text-muted-foreground">
                Video link will be in your confirmation email
              </p>
            </div>
          </div>

          {/* Email confirmation */}
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary-500" />
            <div className="text-left">
              <p className="font-medium text-foreground">
                Confirmation Email Sent
              </p>
              <p className="text-sm text-muted-foreground">
                Check your inbox for all the details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" asChild>
          <a href={getCalendarLink()} target="_blank" rel="noopener noreferrer">
            <Calendar className="h-4 w-4 mr-2" />
            Add to Calendar
          </a>
        </Button>
        <Button size="lg" onClick={onComplete}>
          Continue
        </Button>
      </div>

      {/* What's next */}
      <div className="max-w-md mx-auto pt-4 border-t border-neutral-200">
        <h3 className="font-medium text-foreground mb-3">What&apos;s Next?</h3>
        <ul className="text-sm text-muted-foreground space-y-2 text-left">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-1">•</span>
            Check your email for your confirmation and video link
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-1">•</span>
            You&apos;ll receive a reminder 24 hours before your session
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-1">•</span>
            Find a quiet, private space with good internet for your session
          </li>
        </ul>
      </div>
    </div>
  );
}

