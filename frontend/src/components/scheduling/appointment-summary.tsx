/**
 * @file AppointmentSummary Component
 * @description Summary card showing appointment details before confirmation.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import Image from 'next/image';
import { Calendar, Clock, Video, User } from 'lucide-react';
import type { Clinician } from '@/types/clinician';

/**
 * Props for AppointmentSummary component
 */
interface AppointmentSummaryProps {
  /** The clinician for the appointment */
  clinician: Clinician;
  /** Selected date in ISO format */
  date: string;
  /** Selected time (HH:MM format) */
  time: string;
  /** Session type */
  sessionType: string;
  /** Session duration in minutes */
  duration: number;
}

/**
 * Session type labels
 */
const SESSION_TYPE_LABELS: Record<string, string> = {
  initial: 'Initial Consultation',
  followup: 'Follow-up Session',
  assessment: 'Diagnostic Assessment',
  crisis: 'Crisis Support',
  therapy: 'Therapy Session',
};

/**
 * AppointmentSummary Component
 *
 * @description Displays a summary of the appointment being booked.
 *
 * @example
 * ```tsx
 * <AppointmentSummary
 *   clinician={selectedClinician}
 *   date="2024-01-20"
 *   time="10:00"
 *   sessionType="initial"
 *   duration={50}
 * />
 * ```
 */
export function AppointmentSummary({
  clinician,
  date,
  time,
  sessionType,
  duration,
}: AppointmentSummaryProps) {
  /**
   * Formats date for display
   */
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Formats time for display
   */
  function formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Calculates end time
   */
  function getEndTime(): string {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
      {/* Header */}
      <div className="bg-primary-50 px-6 py-4 border-b border-primary-100">
        <h3 className="font-semibold text-primary-700">Appointment Summary</h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Clinician */}
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {clinician.photoUrl ? (
              <Image
                src={clinician.photoUrl}
                alt={clinician.fullName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              {clinician.displayName}
            </p>
            <p className="text-sm text-muted-foreground">
              {SESSION_TYPE_LABELS[sessionType] || sessionType}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-primary-500" />
            <span className="text-foreground">{formatDate(date)}</span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-primary-500" />
            <span className="text-foreground">
              {formatTime(time)} - {formatTime(getEndTime())} ({duration}{' '}
              minutes)
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Video className="h-4 w-4 text-primary-500" />
            <span className="text-foreground">Telehealth Video Session</span>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="px-6 py-3 bg-neutral-50 border-t border-neutral-100">
        <p className="text-xs text-muted-foreground">
          You&apos;ll receive a confirmation email with the video link after
          booking.
        </p>
      </div>
    </div>
  );
}


