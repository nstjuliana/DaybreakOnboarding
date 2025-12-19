/**
 * @file Quick Replies Component
 * @description Provides quick response options as buttons for Likert scale answers.
 *
 * @see {@link _docs/theme-rules.md} Button tokens
 */

'use client';

import { cn } from '@/lib/utils';

/**
 * Quick reply option
 */
export interface QuickReplyOption {
  value: number;
  label: string;
  description?: string;
}

/**
 * Props for QuickReplies component
 */
interface QuickRepliesProps {
  /** Available options */
  options: QuickReplyOption[];
  /** Callback when option is selected */
  onSelect: (option: QuickReplyOption) => void;
  /** Whether selection is disabled */
  disabled?: boolean;
  /** Layout orientation */
  layout?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Quick replies component
 * Displays selectable response options as buttons
 *
 * @param props - Component props
 */
export function QuickReplies({
  options,
  onSelect,
  disabled = false,
  layout = 'horizontal',
  className,
}: QuickRepliesProps) {
  return (
    <div
      className={cn(
        'animate-fade-in',
        layout === 'horizontal'
          ? 'flex flex-wrap gap-2 justify-center'
          : 'flex flex-col gap-2',
        className
      )}
      role="group"
      aria-label="Response options"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option)}
          disabled={disabled}
          className={cn(
            'px-4 py-2 rounded-full border-2 text-sm font-medium',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2',
            disabled
              ? 'border-neutral-200 text-neutral-400 cursor-not-allowed'
              : 'border-primary-300 text-primary-700 bg-white hover:bg-primary-50 hover:border-primary-500 active:bg-primary-100'
          )}
          aria-label={`Select: ${option.label}${option.description ? ` - ${option.description}` : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Likert scale quick replies for screeners
 * Pre-configured with common response options
 */
export function LikertQuickReplies({
  scale = 'frequency',
  onSelect,
  disabled = false,
  className,
}: {
  scale?: 'frequency' | 'agreement' | 'phq9a' | 'psc17';
  onSelect: (option: QuickReplyOption) => void;
  disabled?: boolean;
  className?: string;
}) {
  const scaleOptions: Record<string, QuickReplyOption[]> = {
    frequency: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Sometimes' },
      { value: 2, label: 'Often' },
    ],
    agreement: [
      { value: 0, label: 'Not true' },
      { value: 1, label: 'Somewhat true' },
      { value: 2, label: 'Very true' },
    ],
    phq9a: [
      { value: 0, label: 'Not at all' },
      { value: 1, label: 'Several days' },
      { value: 2, label: 'More than half the days' },
      { value: 3, label: 'Nearly every day' },
    ],
    psc17: [
      { value: 0, label: 'Never' },
      { value: 1, label: 'Sometimes' },
      { value: 2, label: 'Often' },
    ],
  };

  return (
    <QuickReplies
      options={scaleOptions[scale]}
      onSelect={onSelect}
      disabled={disabled}
      layout="vertical"
      className={className}
    />
  );
}

/**
 * Yes/No quick replies
 */
export function YesNoQuickReplies({
  onSelect,
  disabled = false,
  className,
}: {
  onSelect: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  const options: QuickReplyOption[] = [
    { value: 1, label: 'Yes' },
    { value: 0, label: 'No' },
  ];

  return (
    <QuickReplies
      options={options}
      onSelect={(opt) => onSelect(opt.value === 1)}
      disabled={disabled}
      layout="horizontal"
      className={className}
    />
  );
}

