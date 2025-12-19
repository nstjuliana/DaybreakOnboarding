/**
 * @file InsuranceSelector Component
 * @description Three-card payment method selection for Phase 3 insurance flow.
 *              Allows users to choose between insurance, self-pay, or no insurance.
 *
 * @see {@link _docs/phases/phase-3-insurance-matching.md}
 */

'use client';

import { Shield, CreditCard, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/insurance';

/**
 * Props for InsuranceSelector component
 */
interface InsuranceSelectorProps {
  /** Currently selected payment method */
  value: PaymentMethod | null;
  /** Callback when selection changes */
  onChange: (method: PaymentMethod) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

/**
 * Payment option configuration
 */
const PAYMENT_OPTIONS: Array<{
  method: PaymentMethod;
  icon: React.ElementType;
  title: string;
  description: string;
}> = [
  {
    method: 'insurance',
    icon: Shield,
    title: 'I have insurance',
    description: 'Submit your insurance information for coverage verification',
  },
  {
    method: 'self_pay',
    icon: CreditCard,
    title: 'I will self-pay',
    description: 'Pay out-of-pocket for services at our standard rates',
  },
  {
    method: 'no_insurance',
    icon: HelpCircle,
    title: "I don't have insurance",
    description: 'Learn about payment options and financial assistance programs',
  },
];

/**
 * InsuranceSelector Component
 *
 * @description Renders three selectable cards for payment method choice.
 *              Uses accessible radio button pattern with visual card styling.
 *
 * @example
 * ```tsx
 * <InsuranceSelector
 *   value={selectedMethod}
 *   onChange={setSelectedMethod}
 * />
 * ```
 */
export function InsuranceSelector({
  value,
  onChange,
  disabled = false,
}: InsuranceSelectorProps) {
  return (
    <div
      className="grid gap-4 md:grid-cols-3"
      role="radiogroup"
      aria-label="Payment method selection"
    >
      {PAYMENT_OPTIONS.map((option) => {
        const isSelected = value === option.method;
        const Icon = option.icon;

        return (
          <button
            key={option.method}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChange(option.method)}
            className={cn(
              'relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200',
              'text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2',
              isSelected
                ? 'border-primary-500 bg-primary-50 shadow-md'
                : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-neutral-50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Selection indicator */}
            <div
              className={cn(
                'absolute top-4 right-4 h-5 w-5 rounded-full border-2 transition-colors',
                isSelected
                  ? 'border-primary-500 bg-primary-500'
                  : 'border-neutral-300 bg-white'
              )}
            >
              {isSelected && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  className="h-full w-full p-0.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>

            {/* Icon */}
            <div
              className={cn(
                'mb-4 p-3 rounded-full transition-colors',
                isSelected
                  ? 'bg-primary-500 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              )}
            >
              <Icon className="h-6 w-6" />
            </div>

            {/* Content */}
            <h3
              className={cn(
                'text-lg font-semibold mb-2 text-center',
                isSelected ? 'text-primary-700' : 'text-neutral-800'
              )}
            >
              {option.title}
            </h3>
            <p className="text-sm text-neutral-600 text-center">
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}


