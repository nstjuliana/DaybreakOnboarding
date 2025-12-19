/**
 * @file Concern Selector Component
 * @description Allows users to select their primary concern areas
 *              to route them to the appropriate screener.
 *
 * @see {@link _docs/user-flow.md} Phase 1.5: Triage Pulse
 */

'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  CONCERN_AREAS,
  type ConcernArea,
  type ConcernConfig,
  isValidConcernSelection,
} from '@/lib/utils/screener-router';

/**
 * Props for ConcernSelector component
 */
interface ConcernSelectorProps {
  /** Initial selected concerns */
  initialSelected?: ConcernArea[];
  /** Callback when selection changes */
  onSelectionChange?: (concerns: ConcernArea[]) => void;
  /** Callback when user confirms selection */
  onConfirm: (concerns: ConcernArea[]) => void;
  /** Maximum number of concerns to select */
  maxSelections?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Concern card component for individual concern selection
 */
function ConcernCard({
  concern,
  isSelected,
  onToggle,
  disabled,
}: {
  concern: ConcernConfig;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled && !isSelected}
      className={cn(
        'relative p-5 rounded-xl border-2 text-left transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2',
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : 'border-neutral-200 bg-white hover:border-primary-300 hover:shadow-sm',
        disabled && !isSelected && 'opacity-50 cursor-not-allowed'
      )}
      aria-pressed={isSelected}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Icon */}
      <div className="text-3xl mb-3" role="img" aria-hidden="true">
        {concern.icon}
      </div>

      {/* Label */}
      <h3 className="text-lg font-semibold text-neutral-800 mb-1">
        {concern.label}
      </h3>

      {/* Description */}
      <p className="text-sm text-neutral-600">{concern.description}</p>

      {/* Examples (shown on hover/selection) */}
      <div
        className={cn(
          'mt-3 space-y-1 overflow-hidden transition-all duration-200',
          isSelected ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
          Examples:
        </p>
        <ul className="text-xs text-neutral-500 space-y-0.5">
          {concern.examples.slice(0, 2).map((example, idx) => (
            <li key={idx} className="flex items-start gap-1">
              <span className="text-primary-400">•</span>
              {example}
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

/**
 * Concern selector component
 * Allows multi-select of concern areas with visual feedback
 *
 * @param props - Component props
 */
export function ConcernSelector({
  initialSelected = [],
  onSelectionChange,
  onConfirm,
  maxSelections = 3,
  className,
}: ConcernSelectorProps) {
  const [selected, setSelected] = useState<ConcernArea[]>(initialSelected);

  // Notify parent when selection changes (after render, not during)
  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected, onSelectionChange]);

  /**
   * Toggles a concern selection
   */
  function handleToggle(concernId: ConcernArea) {
    setSelected((prev) =>
      prev.includes(concernId)
        ? prev.filter((id) => id !== concernId)
        : [...prev, concernId]
    );
  }

  /**
   * Handles confirm button click
   */
  function handleConfirm() {
    if (isValidConcernSelection(selected)) {
      onConfirm(selected);
    }
  }

  const isMaxSelected = selected.length >= maxSelections;
  const isValid = isValidConcernSelection(selected);

  return (
    <div className={cn('w-full', className)}>
      {/* Instructions */}
      <div className="mb-6 text-center">
        <p className="text-neutral-600">
          Select up to {maxSelections} areas that best describe your concerns.
        </p>
        <p className="text-sm text-neutral-500 mt-1">
          This helps us ask the right questions.
        </p>
      </div>

      {/* Selection counter */}
      <div className="mb-4 text-center">
        <span
          className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            selected.length === 0
              ? 'bg-neutral-100 text-neutral-500'
              : 'bg-primary-100 text-primary-700'
          )}
        >
          {selected.length} of {maxSelections} selected
        </span>
      </div>

      {/* Concern grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        role="group"
        aria-label="Concern areas"
      >
        {CONCERN_AREAS.map((concern) => (
          <ConcernCard
            key={concern.id}
            concern={concern}
            isSelected={selected.includes(concern.id)}
            onToggle={() => handleToggle(concern.id)}
            disabled={isMaxSelected}
          />
        ))}
      </div>

      {/* Confirm button */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          size="lg"
          onClick={handleConfirm}
          disabled={!isValid}
          className="min-w-[200px]"
        >
          Continue
        </Button>

        {!isValid && selected.length === 0 && (
          <p className="text-sm text-neutral-500">
            Please select at least one area of concern
          </p>
        )}
      </div>
    </div>
  );
}

