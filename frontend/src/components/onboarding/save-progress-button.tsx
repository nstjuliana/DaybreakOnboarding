/**
 * @file SaveProgressButton Component
 * @description Button to save current progress for later resumption.
 *              Shows save status and timestamp.
 *
 * @see {@link _docs/user-flow.md} Save and Resume
 */

'use client';

import { useState } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/stores/onboarding-store';
import { cn } from '@/lib/utils';

/**
 * SaveProgressButton component props
 */
interface SaveProgressButtonProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Button to save onboarding progress
 * Shows feedback when save is successful
 *
 * @param props - Component props
 */
export function SaveProgressButton({ className }: SaveProgressButtonProps) {
  const { saveProgress, state } = useOnboarding();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  async function handleSave() {
    setSaveState('saving');

    // Simulate a brief delay for user feedback
    await new Promise((resolve) => setTimeout(resolve, 500));

    saveProgress();
    setSaveState('saved');

    // Reset to idle after showing success
    setTimeout(() => {
      setSaveState('idle');
    }, 2000);
  }

  // Format last saved time
  const lastSaved = state.lastSavedAt
    ? new Date(state.lastSavedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Last saved indicator */}
      {lastSaved && saveState === 'idle' && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Saved at {lastSaved}
        </span>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleSave}
        disabled={saveState === 'saving'}
        className="gap-2"
      >
        {saveState === 'saving' && (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Saving...</span>
          </>
        )}
        {saveState === 'saved' && (
          <>
            <Check className="h-4 w-4 text-success" />
            <span className="hidden sm:inline">Saved</span>
          </>
        )}
        {saveState === 'idle' && (
          <>
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save Progress</span>
          </>
        )}
      </Button>
    </div>
  );
}

