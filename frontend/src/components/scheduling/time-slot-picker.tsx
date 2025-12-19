/**
 * @file TimeSlotPicker Component
 * @description Grid of available time slots for a selected date.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/hooks/use-availability';

/**
 * Props for TimeSlotPicker component
 */
interface TimeSlotPickerProps {
  /** Available time slots for the selected date */
  slots: TimeSlot[];
  /** Currently selected slot datetime */
  selectedSlot: string | null;
  /** Callback when slot is selected */
  onSelectSlot: (datetime: string) => void;
  /** Label for the date being displayed */
  dateLabel?: string;
  /** Whether to disable the picker */
  disabled?: boolean;
}

/**
 * TimeSlotPicker Component
 *
 * @description Renders a grid of available time slots for selection.
 *
 * @example
 * ```tsx
 * <TimeSlotPicker
 *   slots={slotsForDate}
 *   selectedSlot={selectedSlot}
 *   onSelectSlot={setSelectedSlot}
 *   dateLabel="Monday, January 15"
 * />
 * ```
 */
export function TimeSlotPicker({
  slots,
  selectedSlot,
  onSelectSlot,
  dateLabel,
  disabled = false,
}: TimeSlotPickerProps) {
  // Group slots by morning/afternoon
  const morningSlots = slots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour < 12;
  });

  const afternoonSlots = slots.filter((slot) => {
    const hour = parseInt(slot.time.split(':')[0], 10);
    return hour >= 12;
  });

  /**
   * Formats time for display (12-hour format)
   */
  function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No available times for this date</p>
        <p className="text-sm">Please select another date</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date label */}
      {dateLabel && (
        <h3 className="font-semibold text-foreground text-center">
          {dateLabel}
        </h3>
      )}

      {/* Morning slots */}
      {morningSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Morning
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {morningSlots.map((slot) => (
              <SlotButton
                key={slot.datetime}
                time={formatTime(slot.time)}
                isSelected={selectedSlot === slot.datetime}
                isAvailable={slot.available}
                disabled={disabled || !slot.available}
                onClick={() => slot.available && onSelectSlot(slot.datetime)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Afternoon slots */}
      {afternoonSlots.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Afternoon
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {afternoonSlots.map((slot) => (
              <SlotButton
                key={slot.datetime}
                time={formatTime(slot.time)}
                isSelected={selectedSlot === slot.datetime}
                isAvailable={slot.available}
                disabled={disabled || !slot.available}
                onClick={() => slot.available && onSelectSlot(slot.datetime)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Individual slot button
 */
interface SlotButtonProps {
  time: string;
  isSelected: boolean;
  isAvailable: boolean;
  disabled: boolean;
  onClick: () => void;
}

function SlotButton({
  time,
  isSelected,
  isAvailable,
  disabled,
  onClick,
}: SlotButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'px-3 py-2 text-sm rounded-md border transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400',
        isSelected
          ? 'bg-primary-500 border-primary-500 text-white font-medium'
          : isAvailable
            ? 'bg-white border-neutral-200 text-foreground hover:border-primary-400 hover:bg-primary-50'
            : 'bg-neutral-100 border-neutral-100 text-neutral-400 cursor-not-allowed',
        disabled && !isSelected && 'opacity-50 cursor-not-allowed'
      )}
    >
      {time}
    </button>
  );
}

