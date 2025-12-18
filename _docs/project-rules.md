# Project Rules

## Overview

This document defines the project structure, coding conventions, and development rules for the Parent Onboarding AI application. These rules ensure the codebase is **modular**, **scalable**, **AI-navigable**, and **easy to understand**.

**Philosophy:** AI-First Development
- Code should be readable by both humans and AI tools
- File structure should be highly navigable
- Documentation should be comprehensive and consistent
- Complexity should be distributed across small, focused files

---

## Core Principles

### 1. Modularity Over Monoliths
- Each file should do one thing well
- Functions should be small and focused
- Prefer composition over inheritance
- Extract reusable logic into shared utilities

### 2. Explicit Over Implicit
- Avoid magic strings and numbers
- Use constants and enums for fixed values
- Name things descriptively, even if verbose
- Document assumptions and edge cases

### 3. Consistency Over Preference
- Follow established patterns, even if you prefer alternatives
- Use automated formatting and linting
- Match existing code style when editing files
- Discuss convention changes before implementing

### 4. Documentation as Code
- Every file must have a header comment
- Every function must have JSDoc/RDoc/TSDoc
- Complex logic must have inline explanations
- README files in major directories

---

## File Size Limits

| File Type | Max Lines | Guidance |
|-----------|-----------|----------|
| **Source Files** | 500 | Split into smaller modules if exceeded |
| **Test Files** | 600 | Group related tests, split by feature |
| **Config Files** | 300 | Extract complex config into separate files |
| **Documentation** | No limit | But prefer focused documents over mega-docs |

**Rationale:** AI tools work best with focused, digestible files. Large files are harder to navigate, understand, and maintain.

---

## Project Directory Structure

### Root Structure

```
daybreak-onboarding/
├── _docs/                    # Project documentation
├── backend/                  # Rails API application
├── frontend/                 # Next.js application
├── shared/                   # Shared types, constants, utilities
├── infrastructure/           # Docker, CI/CD, deployment configs
├── scripts/                  # Development and automation scripts
├── .github/                  # GitHub workflows and templates
├── docker-compose.yml        # Local development environment
├── Makefile                  # Common development commands
└── README.md                 # Project overview and setup guide
```

---

### Documentation Structure (`_docs/`)

```
_docs/
├── Project Overview.md       # PRD and requirements
├── user-flow.md              # User journey documentation
├── tech-stack.md             # Technology choices and conventions
├── ui-rules.md               # UI design principles
├── theme-rules.md            # Visual theme specifications
├── project-rules.md          # This document
├── api/                      # API documentation
│   ├── endpoints.md          # API endpoint reference
│   └── schemas.md            # Request/response schemas
├── architecture/             # System design documents
│   ├── data-model.md         # Database schema documentation
│   └── integrations.md       # Third-party service integrations
└── Research/                 # Background research and references
```

---

### Backend Structure (`backend/`)

```
backend/
├── app/
│   ├── controllers/
│   │   └── api/
│   │       └── v1/           # Versioned API controllers
│   │           ├── base_controller.rb
│   │           ├── users_controller.rb
│   │           ├── assessments_controller.rb
│   │           ├── appointments_controller.rb
│   │           └── insurance_controller.rb
│   │
│   ├── models/               # ActiveRecord models
│   │   ├── user.rb
│   │   ├── assessment.rb
│   │   ├── appointment.rb
│   │   ├── clinician.rb
│   │   └── concerns/         # Shared model behavior
│   │       ├── auditable.rb
│   │       └── soft_deletable.rb
│   │
│   ├── services/             # Business logic (POROs)
│   │   ├── assessments/
│   │   │   ├── create_service.rb
│   │   │   ├── analyze_service.rb
│   │   │   └── score_calculator.rb
│   │   ├── scheduling/
│   │   │   ├── match_clinician_service.rb
│   │   │   └── availability_service.rb
│   │   ├── insurance/
│   │   │   ├── ocr_service.rb
│   │   │   └── verification_service.rb
│   │   └── ai/
│   │       ├── screener_chat_service.rb
│   │       ├── crisis_detector.rb
│   │       └── prompt_builder.rb
│   │
│   ├── jobs/                 # Background jobs (GoodJob)
│   │   ├── process_assessment_job.rb
│   │   ├── send_reminder_job.rb
│   │   └── extract_insurance_job.rb
│   │
│   ├── mailers/              # Email templates and logic
│   │   ├── application_mailer.rb
│   │   ├── user_mailer.rb
│   │   └── appointment_mailer.rb
│   │
│   ├── policies/             # Pundit authorization policies
│   │   ├── application_policy.rb
│   │   ├── assessment_policy.rb
│   │   └── appointment_policy.rb
│   │
│   ├── serializers/          # JSON response formatting
│   │   ├── user_serializer.rb
│   │   ├── assessment_serializer.rb
│   │   └── clinician_serializer.rb
│   │
│   └── validators/           # Custom validators
│       ├── email_validator.rb
│       └── insurance_validator.rb
│
├── config/
│   ├── routes.rb
│   ├── database.yml
│   ├── environments/
│   └── initializers/
│       ├── devise.rb
│       ├── good_job.rb
│       └── openai.rb
│
├── db/
│   ├── migrate/              # Database migrations
│   ├── seeds/                # Seed data (organized by environment)
│   │   ├── development.rb
│   │   └── production.rb
│   └── schema.rb
│
├── lib/
│   └── tasks/                # Rake tasks
│
├── spec/                     # RSpec tests
│   ├── models/
│   ├── requests/
│   ├── services/
│   ├── jobs/
│   ├── policies/
│   ├── factories/
│   └── support/
│
├── Gemfile
├── Dockerfile
└── README.md                 # Backend-specific setup
```

---

### Frontend Structure (`frontend/`)

```
frontend/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Authentication routes (grouped)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (onboarding)/         # Onboarding flow routes (grouped)
│   │   ├── layout.tsx        # Shared onboarding layout
│   │   ├── phase-0/          # Identification Lobby
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── phase-1/          # Regulate and Relate
│   │   │   └── page.tsx
│   │   ├── phase-1-5/        # Triage Pulse
│   │   │   └── page.tsx
│   │   ├── phase-2/          # Holistic Intake (AI Chat)
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   ├── phase-3/          # Logistics & Matching
│   │   │   ├── account/
│   │   │   │   └── page.tsx
│   │   │   ├── insurance/
│   │   │   │   └── page.tsx
│   │   │   ├── demographics/
│   │   │   │   └── page.tsx
│   │   │   └── matching/
│   │   │       └── page.tsx
│   │   └── phase-4/          # Commitment (Scheduling)
│   │       └── page.tsx
│   │
│   ├── api/                  # API routes (BFF patterns if needed)
│   │   └── [...]/
│   │
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles
│   └── not-found.tsx         # 404 page
│
├── components/
│   ├── ui/                   # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   └── index.ts          # Barrel export
│   │
│   ├── forms/                # Form components
│   │   ├── user-type-selector.tsx
│   │   ├── insurance-form.tsx
│   │   ├── demographics-form.tsx
│   │   └── form-field.tsx
│   │
│   ├── chat/                 # AI chat interface
│   │   ├── chat-container.tsx
│   │   ├── chat-message.tsx
│   │   ├── chat-input.tsx
│   │   ├── typing-indicator.tsx
│   │   └── quick-replies.tsx
│   │
│   ├── onboarding/           # Onboarding-specific components
│   │   ├── phase-header.tsx
│   │   ├── progress-indicator.tsx
│   │   ├── save-progress-button.tsx
│   │   └── clinician-card.tsx
│   │
│   ├── scheduling/           # Scheduling components
│   │   ├── calendar-view.tsx
│   │   ├── time-slot-picker.tsx
│   │   └── appointment-summary.tsx
│   │
│   └── layout/               # Layout components
│       ├── header.tsx
│       ├── footer.tsx
│       └── page-container.tsx
│
├── hooks/                    # Custom React hooks
│   ├── use-form-persistence.ts
│   ├── use-onboarding-state.ts
│   ├── use-chat.ts
│   ├── use-auth.ts
│   └── use-api.ts
│
├── lib/                      # Utilities and helpers
│   ├── api/                  # API client
│   │   ├── client.ts         # Base API client
│   │   ├── endpoints.ts      # Endpoint definitions
│   │   └── types.ts          # API response types
│   │
│   ├── utils/                # Utility functions
│   │   ├── cn.ts             # Class name merger
│   │   ├── format-date.ts
│   │   ├── validation.ts
│   │   └── storage.ts        # LocalStorage helpers
│   │
│   └── constants/            # Application constants
│       ├── phases.ts         # Onboarding phase definitions
│       ├── screeners.ts      # Screener configurations
│       └── routes.ts         # Route path constants
│
├── stores/                   # State management (if needed)
│   └── onboarding-store.ts
│
├── types/                    # TypeScript type definitions
│   ├── user.ts
│   ├── assessment.ts
│   ├── appointment.ts
│   └── api.ts
│
├── styles/                   # Additional styles
│   └── tokens.css            # CSS custom properties
│
├── public/                   # Static assets
│   ├── images/
│   └── icons/
│
├── tests/                    # Frontend tests
│   ├── components/
│   ├── hooks/
│   └── e2e/                  # Playwright tests
│
├── tailwind.config.js
├── next.config.js
├── tsconfig.json
├── package.json
├── Dockerfile
└── README.md                 # Frontend-specific setup
```

---

### Shared Resources (`shared/`)

```
shared/
├── types/                    # Shared TypeScript types
│   ├── user.ts
│   ├── assessment.ts
│   └── api.ts
│
├── constants/                # Shared constants
│   ├── screeners.ts
│   ├── user-types.ts
│   └── phases.ts
│
└── validation/               # Shared validation schemas (Zod)
    ├── user.ts
    └── assessment.ts
```

---

### Infrastructure (`infrastructure/`)

```
infrastructure/
├── docker/
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── nginx.conf
│
├── terraform/                # If using Terraform for AWS/Aptible
│   └── .../
│
└── scripts/
    ├── setup-dev.sh
    └── deploy.sh
```

---

## File Naming Conventions

### General Rules

| Convention | Examples | Usage |
|------------|----------|-------|
| **kebab-case** | `user-profile.tsx`, `format-date.ts` | React components, utilities, routes |
| **snake_case** | `user_mailer.rb`, `create_service.rb` | Ruby files (Rails convention) |
| **PascalCase** | `UserProfile.tsx` | Only for React component files when matching export |
| **SCREAMING_SNAKE** | `API_ENDPOINTS.ts` | Constants-only files |

### Specific Patterns

**React Components:**
```
component-name.tsx          # Component file
component-name.test.tsx     # Test file
component-name.stories.tsx  # Storybook (if used)
```

**Ruby Files:**
```
model_name.rb               # Model
model_name_controller.rb    # Controller
model_name_service.rb       # Service
model_name_policy.rb        # Policy
model_name_spec.rb          # Test
```

**Hooks:**
```
use-feature-name.ts         # Custom hook
use-feature-name.test.ts    # Hook test
```

**Utilities:**
```
utility-name.ts             # Utility function(s)
utility-name.test.ts        # Utility test
```

---

## File Header Requirements

### Every File Must Have a Header Comment

**TypeScript/JavaScript:**
```typescript
/**
 * @file UserTypeSelector Component
 * @description Renders the Phase 0 user type selection interface.
 *              Allows users to identify as Parent, Minor, or Concerned Friend.
 * 
 * @see {@link _docs/user-flow.md} for Phase 0 specification
 */
```

**Ruby:**
```ruby
# frozen_string_literal: true

##
# AssessmentAnalyzeService
#
# Processes completed assessment responses using LLM analysis.
# Determines fit for Daybreak services and routes to appropriate next steps.
#
# @see Assessment model
# @see ScreenerChatService for chat-based assessment
#
```

**CSS:**
```css
/**
 * @file globals.css
 * @description Global styles and CSS custom properties for the application.
 *              Implements the theme defined in _docs/theme-rules.md.
 */
```

---

## Function Documentation

### TypeScript/JavaScript (JSDoc/TSDoc)

```typescript
/**
 * Calculates the assessment score based on screener responses.
 * 
 * @description Uses weighted scoring algorithm appropriate for the screener type.
 *              Higher scores indicate greater severity of symptoms.
 * 
 * @param responses - Map of question IDs to response values (0-4)
 * @param screenerType - The type of screener (PHQ9A, SCARED, PSC17, etc.)
 * @returns Calculated score with severity classification
 * 
 * @example
 * ```ts
 * const result = calculateScore(
 *   { q1: 2, q2: 3, q3: 1 },
 *   'PHQ9A'
 * );
 * // { score: 12, severity: 'moderate', recommendation: 'continue' }
 * ```
 * 
 * @throws {InvalidScreenerError} If screenerType is not recognized
 */
function calculateScore(
  responses: Record<string, number>,
  screenerType: ScreenerType
): ScoreResult {
  // Implementation
}
```

### React Components

```typescript
/**
 * ChatMessage Component
 * 
 * @description Renders a single message in the AI chat interface.
 *              Handles both AI and user messages with appropriate styling.
 * 
 * @param props - Component props
 * @param props.message - The message content
 * @param props.sender - Who sent the message ('ai' | 'user')
 * @param props.timestamp - When the message was sent
 * @param props.isLoading - Whether the message is still being typed (AI only)
 * 
 * @example
 * ```tsx
 * <ChatMessage
 *   message="How can I help you today?"
 *   sender="ai"
 *   timestamp={new Date()}
 * />
 * ```
 */
interface ChatMessageProps {
  message: string;
  sender: 'ai' | 'user';
  timestamp: Date;
  isLoading?: boolean;
}

export function ChatMessage({ message, sender, timestamp, isLoading }: ChatMessageProps) {
  // Implementation
}
```

### Ruby (RDoc/YARD)

```ruby
##
# Matches a user with the most appropriate clinician.
#
# Uses assessment results, insurance information, and clinician availability
# to find the best match. Considers specialties, schedule, and patient preferences.
#
# @param user [User] The user to match
# @param assessment [Assessment] The completed assessment with results
# @param preferences [Hash] Optional matching preferences
# @option preferences [Array<String>] :preferred_times Preferred appointment times
# @option preferences [String] :gender_preference Clinician gender preference
#
# @return [Clinician, nil] The matched clinician, or nil if no match found
#
# @raise [AssessmentIncompleteError] If assessment is not yet analyzed
#
# @example
#   clinician = MatchClinicianService.new(user, assessment).call
#   if clinician
#     # Proceed to scheduling
#   else
#     # Add to waitlist
#   end
#
class MatchClinicianService
  def initialize(user, assessment, preferences = {})
    @user = user
    @assessment = assessment
    @preferences = preferences
  end

  def call
    # Implementation
  end
end
```

---

## Code Organization Rules

### Single Responsibility

**Each file should have one primary purpose:**

```
✅ user-type-selector.tsx     # One component
✅ format-date.ts             # Date formatting utilities
✅ use-chat.ts                # Chat-related hook

❌ utils.ts                   # Too generic, split by domain
❌ helpers.tsx                # Mix of utilities and components
❌ index.ts (with logic)      # Index files should only re-export
```

### Barrel Exports

**Use index.ts for clean imports, but keep them simple:**

```typescript
// components/ui/index.ts
export { Button } from './button';
export { Card } from './card';
export { Input } from './input';
export { Dialog } from './dialog';

// DO NOT put logic or component code in index files
```

### Import Order

**Organize imports consistently:**

```typescript
// 1. External packages
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// 2. Internal aliases (@/)
import { Button, Card } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api/client';

// 3. Relative imports
import { ChatMessage } from './chat-message';
import type { MessageProps } from './types';

// 4. Styles (if any)
import './styles.css';
```

### Constants Extraction

**Never use magic strings or numbers:**

```typescript
// ❌ Bad
if (score > 15) {
  return 'severe';
}

// ✅ Good
const SEVERITY_THRESHOLDS = {
  MILD: 5,
  MODERATE: 10,
  SEVERE: 15,
} as const;

if (score > SEVERITY_THRESHOLDS.SEVERE) {
  return 'severe';
}
```

---

## Component Patterns

### File Structure for Components

```typescript
// components/onboarding/progress-indicator.tsx

/**
 * @file ProgressIndicator Component
 * @description Shows user's progress through the onboarding phases.
 */

import { cn } from '@/lib/utils/cn';
import { PHASES } from '@/lib/constants/phases';

// Types at the top
interface ProgressIndicatorProps {
  currentPhase: number;
  completedPhases: number[];
  className?: string;
}

// Component
export function ProgressIndicator({
  currentPhase,
  completedPhases,
  className,
}: ProgressIndicatorProps) {
  return (
    <nav className={cn('progress-indicator', className)} aria-label="Onboarding progress">
      {/* Implementation */}
    </nav>
  );
}

// Sub-components (if small, keep in same file)
function PhaseStep({ phase, status }: { phase: Phase; status: 'completed' | 'current' | 'upcoming' }) {
  // Implementation
}

// Exported for testing if needed
export { PhaseStep };
```

### Hooks Pattern

```typescript
// hooks/use-onboarding-state.ts

/**
 * @file useOnboardingState Hook
 * @description Manages the onboarding flow state including current phase,
 *              collected data, and navigation between phases.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';
import type { OnboardingState } from '@/types/onboarding';

interface UseOnboardingStateReturn {
  state: OnboardingState;
  currentPhase: number;
  goToPhase: (phase: number) => void;
  saveProgress: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Manages onboarding flow state with persistence.
 * 
 * @param initialState - Optional initial state from saved progress
 * @returns Onboarding state and control functions
 */
export function useOnboardingState(
  initialState?: Partial<OnboardingState>
): UseOnboardingStateReturn {
  // Implementation
}
```

---

## Testing Rules

### Test File Location

**Tests live alongside source files or in dedicated test directories:**

```
Frontend (Next.js):
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx      # Co-located

├── tests/
│   └── e2e/                     # E2E tests in dedicated folder
│       └── onboarding.spec.ts

Backend (Rails):
├── app/
│   └── services/
│       └── assessment_analyze_service.rb

├── spec/
│   └── services/
│       └── assessment_analyze_service_spec.rb  # Mirrored structure
```

### Test Naming

```
[subject].test.ts               # Unit tests
[subject].spec.ts               # Integration tests
[feature].e2e.ts                # End-to-end tests
```

### Test Documentation

```typescript
/**
 * @file ProgressIndicator Tests
 * @description Unit tests for the ProgressIndicator component
 */

describe('ProgressIndicator', () => {
  /**
   * Tests that completed phases display checkmarks
   */
  it('shows checkmark for completed phases', () => {
    // Implementation
  });

  /**
   * Tests that current phase is visually highlighted
   */
  it('highlights the current phase', () => {
    // Implementation
  });
});
```

---

## API Routes Conventions

### Endpoint Naming

```
GET    /api/v1/users/:id              # Fetch single user
POST   /api/v1/users                  # Create user
PATCH  /api/v1/users/:id              # Update user
DELETE /api/v1/users/:id              # Delete user

GET    /api/v1/assessments            # List assessments
POST   /api/v1/assessments            # Create assessment
GET    /api/v1/assessments/:id        # Fetch assessment
PATCH  /api/v1/assessments/:id        # Update assessment

POST   /api/v1/chat/messages          # Send chat message
GET    /api/v1/chat/messages          # Get chat history
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "pagination": { ... }
  }
}

{
  "success": false,
  "error": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

---

## Git Conventions

### Branch Naming

```
feature/phase-2-chat-interface
feature/insurance-ocr
bugfix/progress-indicator-mobile
hotfix/auth-token-expiry
chore/update-dependencies
docs/api-endpoints
```

### Commit Messages

```
type(scope): description

feat(chat): add typing indicator for AI responses
fix(forms): resolve validation timing on blur
docs(api): document assessment endpoints
refactor(services): extract crisis detection logic
test(chat): add unit tests for message formatting
chore(deps): update react-hook-form to v7.50
```

### Pull Request Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Related Issues
Closes #123

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] All files have proper documentation
- [ ] No files exceed 500 lines
- [ ] Accessibility requirements met
```

---

## Environment Configuration

### Environment Variables

```
# .env.example (commit this)
# .env.local (don't commit)
# .env.production (don't commit)

DATABASE_URL=
REDIS_URL=
OPENAI_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SENDGRID_API_KEY=
```

### Frontend Environment

```
# Only NEXT_PUBLIC_ prefixed vars are available client-side
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_ENV=

# Server-only
API_SECRET_KEY=
```

### Rails Credentials

```bash
# Edit credentials
EDITOR="code --wait" rails credentials:edit

# Access in code
Rails.application.credentials.openai_api_key
```

---

## Quality Checklist

### Before Every PR

**Code Quality:**
- [ ] All files have header comments
- [ ] All functions have JSDoc/RDoc documentation
- [ ] No files exceed 500 lines
- [ ] No magic strings or numbers
- [ ] Imports are organized
- [ ] No unused code or imports

**Testing:**
- [ ] Unit tests pass
- [ ] New code has test coverage
- [ ] E2E tests pass (if applicable)

**Accessibility:**
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast verified

**Documentation:**
- [ ] README updated if needed
- [ ] API docs updated if endpoints changed
- [ ] Inline comments for complex logic

---

## Quick Reference

### Command Cheatsheet

```bash
# Development
make dev                    # Start all services
make backend                # Start Rails only
make frontend               # Start Next.js only

# Testing
make test                   # Run all tests
make test-backend           # Run Rails tests
make test-frontend          # Run Next.js tests
make test-e2e               # Run Playwright tests

# Code Quality
make lint                   # Run all linters
make format                 # Auto-format code
make typecheck              # TypeScript checking

# Database
make db-migrate             # Run migrations
make db-seed                # Seed database
make db-reset               # Reset and reseed
```

### Key Files Quick Reference

| Need | File Location |
|------|---------------|
| User flow details | `_docs/user-flow.md` |
| Tech decisions | `_docs/tech-stack.md` |
| UI patterns | `_docs/ui-rules.md` |
| Color/typography | `_docs/theme-rules.md` |
| API endpoints | `_docs/api/endpoints.md` |
| Database schema | `_docs/architecture/data-model.md` |
| Tailwind config | `frontend/tailwind.config.js` |
| Rails routes | `backend/config/routes.rb` |

