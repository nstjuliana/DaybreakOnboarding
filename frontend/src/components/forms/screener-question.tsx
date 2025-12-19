/**
 * @file ScreenerQuestion Component
 * @description Displays a single screener question with response options.
 *              Shows question number and text with Likert scale.
 *
 * @see {@link _docs/ui-rules.md} Forms
 */

'use client';

import { cn } from '@/lib/utils';
import { LikertScale } from './likert-scale';
import type { ScreenerQuestion as Question, ResponseOption } from '@/lib/constants/screeners/psc-17';

/**
 * ScreenerQuestion component props
 */
interface ScreenerQuestionProps {
  /** Question data */
  question: Question;
  /** Question number for display */
  questionNumber: number;
  /** Total number of questions */
  totalQuestions: number;
  /** Response options */
  options: ResponseOption[];
  /** Current response value */
  value?: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Whether the question is active/current */
  isActive?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Single screener question with Likert scale response
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <ScreenerQuestion
 *   question={questions[0]}
 *   questionNumber={1}
 *   totalQuestions={17}
 *   options={PSC17_RESPONSE_OPTIONS}
 *   value={responses[questions[0].id]}
 *   onChange={(v) => setResponse(questions[0].id, v)}
 * />
 * ```
 */
export function ScreenerQuestion({
  question,
  questionNumber,
  totalQuestions,
  options,
  value,
  onChange,
  isActive = true,
  className,
}: ScreenerQuestionProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 transition-all duration-200',
        isActive && 'shadow-md',
        !isActive && 'opacity-60',
        className
      )}
    >
      {/* Question header */}
      <div className="mb-4">
        <span className="text-sm text-muted-foreground">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <p className="text-lg font-medium text-foreground mb-6">
        {formatQuestionText(question.text)}
      </p>

      {/* Response options */}
      <LikertScale
        name={question.id}
        options={options}
        value={value}
        onChange={onChange}
      />

      {/* Helper text */}
      <p className="mt-4 text-xs text-muted-foreground text-center">
        Think about the past month when answering
      </p>
    </div>
  );
}

/**
 * Formats question text for parent context
 * Converts statements to child-focused phrasing
 */
function formatQuestionText(text: string): string {
  // Add "Your child" prefix if not already present
  if (!text.toLowerCase().startsWith('your child')) {
    return `Your child ${text.toLowerCase()}`;
  }
  return text;
}

/**
 * Compact question card for showing all questions
 */
export function ScreenerQuestionCompact({
  question,
  questionNumber,
  options,
  value,
  onChange,
  className,
}: Omit<ScreenerQuestionProps, 'totalQuestions' | 'isActive'>) {
  const isAnswered = value !== undefined;

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 transition-all duration-200',
        isAnswered && 'border-primary/30 bg-primary/5',
        className
      )}
    >
      {/* Question with number */}
      <div className="flex gap-3 mb-3">
        <span className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
          {questionNumber}
        </span>
        <p className="text-sm font-medium text-foreground">
          {formatQuestionText(question.text)}
        </p>
      </div>

      {/* Compact response options */}
      <LikertScale
        name={question.id}
        options={options}
        value={value}
        onChange={onChange}
        className="mt-2"
      />
    </div>
  );
}

