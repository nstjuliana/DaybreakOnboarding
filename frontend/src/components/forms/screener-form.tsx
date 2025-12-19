/**
 * @file ScreenerForm Component
 * @description Main screener form container that displays questions
 *              and manages form state for the PSC-17 assessment.
 *
 * @see {@link _docs/user-flow.md} Phase 2: Holistic Intake
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScreenerQuestionCompact } from './screener-question';
import {
  PSC17_QUESTIONS,
  PSC17_RESPONSE_OPTIONS,
} from '@/lib/constants/screeners/psc-17';
import {
  calculatePSC17Score,
  isScreenerComplete,
  type Responses,
} from '@/lib/utils/score-calculator';

/**
 * ScreenerForm component props
 */
interface ScreenerFormProps {
  /** Initial responses (for resuming) */
  initialResponses?: Responses;
  /** Submit handler */
  onSubmit: (responses: Responses, score: number, severity: string) => Promise<void>;
  /** Save progress handler */
  onSaveProgress?: (responses: Responses) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Main screener form component
 * Displays all PSC-17 questions with progress tracking
 *
 * @param props - Component props
 */
export function ScreenerForm({
  initialResponses = {},
  onSubmit,
  onSaveProgress,
  className,
}: ScreenerFormProps) {
  const [responses, setResponses] = useState<Responses>(initialResponses);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isInitialMount = useRef(true);
  const onSaveProgressRef = useRef(onSaveProgress);

  // Keep ref updated with latest callback
  useEffect(() => {
    onSaveProgressRef.current = onSaveProgress;
  }, [onSaveProgress]);

  const questions = PSC17_QUESTIONS;
  const answeredCount = Object.keys(responses).length;
  const totalQuestions = questions.length;
  const isComplete = isScreenerComplete(responses, totalQuestions);
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  /**
   * Auto-save responses when they change (after initial mount)
   * Uses ref to avoid dependency on callback identity
   * Deferred via setTimeout to run after React's commit phase
   */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Defer to macrotask queue to avoid updating parent during React's commit
    const timeoutId = setTimeout(() => {
      onSaveProgressRef.current?.(responses);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [responses]);

  /**
   * Updates a single response
   */
  const handleResponseChange = useCallback(
    (questionId: string, value: number) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }));
    },
    []
  );

  /**
   * Handles form submission
   */
  async function handleSubmit() {
    if (!isComplete) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = calculatePSC17Score(responses);
      await onSubmit(responses, result.totalScore, result.severity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={cn('w-full max-w-2xl mx-auto', className)}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>
            {answeredCount} of {totalQuestions} questions
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-secondary/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Please indicate how often each statement applies to your child.
          Answer based on the <strong>past month</strong>.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((question, index) => (
          <ScreenerQuestionCompact
            key={question.id}
            question={question}
            questionNumber={index + 1}
            options={PSC17_RESPONSE_OPTIONS}
            value={responses[question.id]}
            onChange={(value) => handleResponseChange(question.id, value)}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Submit button */}
      <div className="mt-8 flex flex-col items-center gap-4">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={!isComplete || isSubmitting}
          className="min-w-[200px] gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        {!isComplete && (
          <p className="text-sm text-muted-foreground">
            Please answer all questions to continue
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Paginated screener form (one question at a time)
 * Alternative UX for step-by-step flow
 */
export function ScreenerFormPaginated({
  initialResponses = {},
  onSubmit,
  onSaveProgress,
  className,
}: ScreenerFormProps) {
  const [responses, setResponses] = useState<Responses>(initialResponses);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isInitialMount = useRef(true);
  const onSaveProgressRef = useRef(onSaveProgress);

  // Keep ref updated with latest callback
  useEffect(() => {
    onSaveProgressRef.current = onSaveProgress;
  }, [onSaveProgress]);

  const questions = PSC17_QUESTIONS;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const canGoNext = responses[currentQuestion.id] !== undefined;

  /**
   * Auto-save responses when they change (after initial mount)
   * Uses ref to avoid dependency on callback identity
   * Deferred via setTimeout to run after React's commit phase
   */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Defer to macrotask queue to avoid updating parent during React's commit
    const timeoutId = setTimeout(() => {
      onSaveProgressRef.current?.(responses);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [responses]);

  function handleResponseChange(value: number) {
    setResponses((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function handleNext() {
    if (!canGoNext) return;
    if (isLastQuestion) {
      handleSubmit();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePrevious() {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const result = calculatePSC17Score(responses);
      await onSubmit(responses, result.totalScore, result.severity);
    } finally {
      setIsSubmitting(false);
    }
  }

  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className={cn('w-full max-w-xl mx-auto', className)}>
      {/* Progress */}
      <div className="mb-8">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground text-center mt-2">
          {currentIndex + 1} of {totalQuestions}
        </p>
      </div>

      {/* Question card */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-md">
        <p className="text-xl font-medium text-foreground mb-8 text-center">
          Your child {currentQuestion.text.toLowerCase()}
        </p>

        <div className="flex flex-col gap-3">
          {PSC17_RESPONSE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleResponseChange(option.value)}
              className={cn(
                'p-4 rounded-lg border-2 text-left font-medium transition-all',
                responses[currentQuestion.id] === option.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Button
          variant="ghost"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canGoNext || isSubmitting}
          className="gap-2"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLastQuestion ? (
            'Submit'
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

