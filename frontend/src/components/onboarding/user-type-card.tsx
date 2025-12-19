/**
 * @file UserTypeCard Component
 * @description Selectable card for user type selection in Phase 0.
 *              Includes icon, title, description, and selection state.
 *
 * @see {@link _docs/ui-rules.md} Cards
 */

'use client';

import { Users, User, Heart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserType } from '@/types/user';

/**
 * Icon type for user type cards
 */
type IconType = 'family' | 'person' | 'heart';

/**
 * UserTypeCard component props
 */
interface UserTypeCardProps {
  /** User type this card represents */
  userType: UserType;
  /** Card title */
  title: string;
  /** Card description */
  description: string;
  /** Icon to display */
  icon: IconType;
  /** Whether this card is selected */
  isSelected: boolean;
  /** Click handler */
  onClick: () => void;
}

/**
 * Maps icon type to Lucide icon component
 */
const iconMap: Record<IconType, React.ComponentType<{ className?: string }>> = {
  family: Users,
  person: User,
  heart: Heart,
};

/**
 * Selectable card for user type selection
 *
 * @param props - Component props
 *
 * @example
 * ```tsx
 * <UserTypeCard
 *   userType="parent"
 *   title="I'm a Parent or Guardian"
 *   description="Seeking mental health support for my child"
 *   icon="family"
 *   isSelected={selectedType === 'parent'}
 *   onClick={() => setSelectedType('parent')}
 * />
 * ```
 */
export function UserTypeCard({
  userType,
  title,
  description,
  icon,
  isSelected,
  onClick,
}: UserTypeCardProps) {
  const IconComponent = iconMap[icon];

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full rounded-xl border-2 p-6 text-left transition-all duration-200',
        'hover:border-primary/50 hover:shadow-md',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        isSelected
          ? 'border-primary bg-secondary shadow-md'
          : 'border-border bg-card'
      )}
      aria-pressed={isSelected}
      data-user-type={userType}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          'absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'border-2 border-muted-foreground/30 bg-transparent'
        )}
      >
        {isSelected && <Check className="h-4 w-4" />}
      </div>

      {/* Icon */}
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        )}
      >
        <IconComponent className="h-6 w-6" />
      </div>

      {/* Content */}
      <h3
        className={cn(
          'text-lg font-semibold transition-colors duration-200',
          isSelected ? 'text-primary' : 'text-foreground'
        )}
      >
        {title}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </button>
  );
}

