/**
 * @file CalendarView Component
 * @description Simple calendar for selecting appointment dates.
 *              Highlights dates with available slots.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Props for CalendarView component
 */
interface CalendarViewProps {
  /** Available dates (ISO format) */
  availableDates: string[];
  /** Currently selected date */
  selectedDate: string | null;
  /** Callback when date is selected */
  onSelectDate: (date: string) => void;
  /** Whether to disable the calendar */
  disabled?: boolean;
}

/**
 * CalendarView Component
 *
 * @description Renders a month calendar view for appointment date selection.
 *              Available dates are highlighted and selectable.
 *
 * @example
 * ```tsx
 * <CalendarView
 *   availableDates={['2024-01-15', '2024-01-16', '2024-01-17']}
 *   selectedDate={selectedDate}
 *   onSelectDate={setSelectedDate}
 * />
 * ```
 */
export function CalendarView({
  availableDates,
  selectedDate,
  onSelectDate,
  disabled = false,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Create set for O(1) lookup
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates]
  );

  /**
   * Gets the days to display for the current month
   */
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Build calendar grid
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month's leading days (fill to 42 cells for 6 rows)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentMonth]);

  /**
   * Formats date to ISO string (YYYY-MM-DD)
   */
  function formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Navigates to previous month
   */
  function handlePrevMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }

  /**
   * Navigates to next month
   */
  function handleNextMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-foreground">{monthLabel}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dateStr = formatDateISO(date);
          const isAvailable = availableDateSet.has(dateStr);
          const isSelected = selectedDate === dateStr;
          const isPast = date < today;
          const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

          const canSelect = isCurrentMonth && isAvailable && !isPast;

          return (
            <button
              key={index}
              type="button"
              disabled={!canSelect || disabled}
              onClick={() => canSelect && onSelectDate(dateStr)}
              className={cn(
                'aspect-square flex items-center justify-center text-sm rounded-md transition-colors',
                !isCurrentMonth && 'text-neutral-300',
                isCurrentMonth && !isAvailable && 'text-neutral-400',
                isCurrentMonth && isPast && 'text-neutral-300',
                canSelect &&
                  !isSelected &&
                  'text-foreground hover:bg-primary-100 cursor-pointer',
                isSelected &&
                  'bg-primary-500 text-white font-semibold hover:bg-primary-600',
                isToday && !isSelected && 'ring-1 ring-primary-300',
                isAvailable &&
                  !isSelected &&
                  !isPast &&
                  'bg-primary-50 text-primary-700',
                (!canSelect || disabled) && 'cursor-default'
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary-50 border border-primary-200" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary-500" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}

