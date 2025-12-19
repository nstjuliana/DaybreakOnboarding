/**
 * @file UserTypeSelector Component
 * @description Container component for user type selection in Phase 0.
 *              Renders all user type cards and handles selection.
 *
 * @see {@link _docs/user-flow.md} Phase 0: Identification Lobby
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserTypeCard } from './user-type-card';
import { useOnboarding } from '@/stores/onboarding-store';
import { USER_TYPE_CARDS } from '@/lib/constants/messaging';
import type { UserType } from '@/types/user';

/**
 * UserTypeSelector component props
 */
interface UserTypeSelectorProps {
  /** Optional callback when selection is made */
  onSelect?: (userType: UserType) => void;
}

/**
 * User type selection container
 * Renders all options and handles navigation to Phase 1
 *
 * @param props - Component props
 */
export function UserTypeSelector({ onSelect }: UserTypeSelectorProps) {
  const router = useRouter();
  const { setUserType, completePhase, setPhase } = useOnboarding();
  const [selectedType, setSelectedType] = useState<UserType | null>(null);

  /**
   * Handles user type selection
   */
  function handleSelect(userType: UserType) {
    setSelectedType(userType);
    onSelect?.(userType);
  }

  /**
   * Handles continue button click
   */
  function handleContinue() {
    if (!selectedType) return;

    // Update store
    setUserType(selectedType);
    completePhase('phase-0');
    setPhase('phase-1');

    // Navigate to Phase 1
    router.push('/phase-1');
  }

  const userTypes: UserType[] = ['parent', 'minor', 'friend'];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Cards */}
      <div className="grid gap-4">
        {userTypes.map((type) => {
          const card = USER_TYPE_CARDS[type];
          return (
            <UserTypeCard
              key={type}
              userType={type}
              title={card.title}
              description={card.description}
              icon={card.icon}
              isSelected={selectedType === type}
              onClick={() => handleSelect(type)}
            />
          );
        })}
      </div>

      {/* Continue button */}
      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={handleContinue}
          disabled={!selectedType}
          className="min-w-[200px] gap-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Helper text */}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Your selection helps us personalize your experience.
        You can always change this later.
      </p>
    </div>
  );
}

