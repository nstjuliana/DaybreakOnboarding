/**
 * @file Safety Pivot Component
 * @description Full-screen safety intervention displayed when crisis is detected.
 *              Shows crisis resources and provides safe continuation options.
 *
 * @see {@link frontend/src/lib/constants/safety-resources.ts}
 */

'use client';

import { useState } from 'react';
import { Heart, ArrowRight, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CrisisResources, EmergencyBanner } from './crisis-resources';
import {
  PRIMARY_CRISIS_RESOURCES,
  SECONDARY_CRISIS_RESOURCES,
  getRandomAffirmation,
} from '@/lib/constants/safety-resources';

/**
 * Props for SafetyPivot component
 */
interface SafetyPivotProps {
  /** Risk level that triggered the pivot */
  riskLevel: 'high' | 'critical';
  /** Callback when user confirms they are safe */
  onConfirmSafe: () => void;
  /** Callback when user wants to exit */
  onExit?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Safety pivot component
 * Full-screen intervention for crisis situations
 *
 * @param props - Component props
 */
export function SafetyPivot({
  riskLevel,
  onConfirmSafe,
  onExit,
  className,
}: SafetyPivotProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [affirmation] = useState(getRandomAffirmation);

  const isCritical = riskLevel === 'critical';

  /**
   * Handles "I'm safe" button click
   */
  function handleImSafe() {
    setShowConfirmation(true);
  }

  /**
   * Handles confirmation of safety
   */
  function handleConfirmSafety() {
    onConfirmSafe();
  }

  /**
   * Handles going back to resources
   */
  function handleBackToResources() {
    setShowConfirmation(false);
  }

  // Show safety confirmation dialog
  if (showConfirmation) {
    return (
      <SafetyConfirmation
        onConfirm={handleConfirmSafety}
        onBack={handleBackToResources}
        className={className}
      />
    );
  }

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col bg-gradient-to-b from-primary-50 to-white',
        className
      )}
      role="alertdialog"
      aria-labelledby="safety-title"
      aria-describedby="safety-description"
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
          <Heart className="w-8 h-8 text-primary-600" />
        </div>
        <h1
          id="safety-title"
          className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2"
        >
          We're Here For You
        </h1>
        <p
          id="safety-description"
          className="text-neutral-600 max-w-md mx-auto"
        >
          {affirmation}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Emergency banner for critical */}
          {isCritical && <EmergencyBanner />}

          {/* Main resources */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-3">
              Talk to Someone Now
            </h2>
            <CrisisResources resources={PRIMARY_CRISIS_RESOURCES} />
          </div>

          {/* Additional resources */}
          <div>
            <h2 className="text-lg font-semibold text-neutral-800 mb-3">
              Additional Support
            </h2>
            <CrisisResources
              resources={SECONDARY_CRISIS_RESOURCES}
              compact
            />
          </div>

          {/* Reassurance message */}
          <div className="bg-primary-50 rounded-xl p-4 text-center">
            <Shield className="w-8 h-8 text-primary-500 mx-auto mb-2" />
            <p className="text-sm text-neutral-700">
              Everything you've shared with us is confidential.
              <br />
              Taking care of your mental health is important.
            </p>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex-shrink-0 p-4 bg-white border-t border-neutral-200">
        <div className="max-w-lg mx-auto space-y-3">
          <Button
            variant="outline"
            onClick={handleImSafe}
            className="w-full"
          >
            I'm Safe - Continue Assessment
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {onExit && (
            <Button
              variant="ghost"
              onClick={onExit}
              className="w-full text-neutral-500"
            >
              Save and Exit for Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Safety confirmation dialog
 */
function SafetyConfirmation({
  onConfirm,
  onBack,
  className,
}: {
  onConfirm: () => void;
  onBack: () => void;
  className?: string;
}) {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const confirmationItems = [
    'I am not in immediate danger',
    'I have someone I can reach out to if needed',
    'I feel ready to continue',
  ];

  const allChecked = checkedItems.size === confirmationItems.length;

  function toggleItem(index: number) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col bg-white p-6',
        className
      )}
    >
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto">
        <h2 className="text-xl font-semibold text-neutral-800 mb-2 text-center">
          Before We Continue
        </h2>
        <p className="text-neutral-600 mb-6 text-center">
          Please confirm the following to continue with the assessment.
        </p>

        <div className="space-y-3 mb-8">
          {confirmationItems.map((item, index) => (
            <label
              key={index}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                checkedItems.has(index)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-200'
              )}
            >
              <input
                type="checkbox"
                checked={checkedItems.has(index)}
                onChange={() => toggleItem(index)}
                className="w-5 h-5 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-neutral-700">{item}</span>
            </label>
          ))}
        </div>

        <div className="space-y-3">
          <Button
            onClick={onConfirm}
            disabled={!allChecked}
            className="w-full"
          >
            Continue Assessment
          </Button>
          <Button
            variant="ghost"
            onClick={onBack}
            className="w-full"
          >
            Back to Resources
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline safety banner for chat interface
 */
export function SafetyBanner({
  onShowResources,
  className,
}: {
  onShowResources: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-primary-50 border border-primary-200 rounded-xl p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Heart className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-neutral-700">
            If you're struggling, you don't have to face it alone.
            Help is available 24/7.
          </p>
          <button
            onClick={onShowResources}
            className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-2"
          >
            View Crisis Resources →
          </button>
        </div>
      </div>
    </div>
  );
}

