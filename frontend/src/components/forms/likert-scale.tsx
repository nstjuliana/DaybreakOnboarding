/**
 * @file LikertScale Component
 * @description Radio button group for Likert scale responses
 *              (Never / Sometimes / Often).
 *
 * @see {@link _docs/ui-rules.md} Forms
 */

'use client';

import { cn } from '@/lib/utils';
import type { ResponseOption } from '@/lib/constants/screeners/psc-17';

/**
 * LikertScale component props
 */
interface LikertScaleProps {
  /** Question ID for form binding */
  name: string;
  /** Response options to display */
  options: ResponseOption[];
  /** Currently selected value */
  value?: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Likert scale input for screener questions
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <LikertScale
 *   name="psc17_1"
 *   options={PSC17_RESPONSE_OPTIONS}
 *   value={responses.psc17_1}
 *   onChange={(v) => setResponse('psc17_1', v)}
 * />
 * ```
 */
export function LikertScale({
  name,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: LikertScaleProps) {
  return (
    <div
      className={cn('flex gap-2 sm:gap-4', className)}
      role="radiogroup"
      aria-label="Response options"
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const inputId = `${name}-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={inputId}
            className={cn(
              'flex-1 cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <input
              type="radio"
              id={inputId}
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className="sr-only"
              aria-describedby={option.description ? `${inputId}-desc` : undefined}
            />
            <div
              className={cn(
                'flex flex-col items-center justify-center rounded-lg border-2 p-3 sm:p-4 transition-all duration-200',
                'hover:border-primary/50',
                'focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2',
                isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-foreground hover:bg-muted/50'
              )}
            >
              <span className="text-sm sm:text-base font-medium">
                {option.label}
              </span>
            </div>
            {option.description && (
              <span id={`${inputId}-desc`} className="sr-only">
                {option.description}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

/**
 * Vertical variant for mobile or longer labels
 */
export function LikertScaleVertical({
  name,
  options,
  value,
  onChange,
  disabled = false,
  className,
}: LikertScaleProps) {
  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      role="radiogroup"
      aria-label="Response options"
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const inputId = `${name}-${option.value}`;

        return (
          <label
            key={option.value}
            htmlFor={inputId}
            className={cn(
              'cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <input
              type="radio"
              id={inputId}
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className="sr-only"
            />
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg border-2 p-3 transition-all duration-200',
                'hover:border-primary/50',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:bg-muted/50'
              )}
            >
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                  isSelected
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/50'
                )}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                )}
              </div>
              <span
                className={cn(
                  'font-medium',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}
              >
                {option.label}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}

