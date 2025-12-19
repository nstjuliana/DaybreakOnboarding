# Phase 1: MVP - Core Onboarding Flow

## Overview

This phase implements the Minimum Viable Product (MVP) of the Parent Onboarding AI. The goal is to deliver a functional, end-to-end onboarding experience that users can actually complete—even if some features are simplified or stubbed.

**Outcome:** Users can identify themselves, proceed through a simplified screener, create an account, and view a matched clinician (without AI or complex matching logic).

---

## Prerequisites

- Phase 0 completed (deployed Hello World)
- Design mockups reviewed (from `_docs/ui-rules.md` and `_docs/theme-rules.md`)
- User flow understood (from `_docs/user-flow.md`)

---

## Deliverables

| Deliverable | Description |
|-------------|-------------|
| Phase 0: Identification Lobby | User type selection screen |
| Phase 1: Regulate and Relate | Calming welcome screen with messaging |
| Simplified Phase 2 | Static screener form (no AI yet) |
| Phase 3A: Account Creation | User registration with Devise |
| Basic Phase 4 | Display matched clinician (hardcoded) |
| Core Database Models | User, Assessment, Clinician |
| REST API Endpoints | CRUD for core resources |
| Save/Resume (Basic) | LocalStorage-based session persistence |

---

## Features

### 1. Database Schema & Models

Create the foundational data models for the onboarding system.

**Steps:**
1. Generate User model with Devise (email, password, user_type, phone, profile fields)
2. Generate Assessment model (user_id, status, screener_type, responses JSONB, results JSONB)
3. Generate Clinician model (name, credentials, specialties, bio, availability, photo_url)
4. Generate Appointment model (user_id, clinician_id, scheduled_at, status, session_type)
5. Add indexes, foreign keys, and enable UUID primary keys

**Acceptance Criteria:**
- All migrations run successfully
- Models have proper associations and validations
- Factory Bot factories created for all models
- Model specs pass with basic coverage

**Files to Create:**
```
backend/
├── app/models/
│   ├── user.rb
│   ├── assessment.rb
│   ├── clinician.rb
│   └── appointment.rb
├── db/migrate/
│   ├── XXXXXX_create_users.rb
│   ├── XXXXXX_create_assessments.rb
│   ├── XXXXXX_create_clinicians.rb
│   └── XXXXXX_create_appointments.rb
└── spec/factories/
    ├── users.rb
    ├── assessments.rb
    ├── clinicians.rb
    └── appointments.rb
```

---

### 2. Authentication System

Implement Devise authentication with JWT for API access.

**Steps:**
1. Configure Devise with JWT strategy (devise-jwt gem)
2. Create JwtDenylist model for token revocation
3. Implement registration endpoint (`POST /api/v1/auth/register`)
4. Implement login endpoint (`POST /api/v1/auth/login`)
5. Add current_user helper and authentication requirement to base controller

**Acceptance Criteria:**
- Users can register with email/password
- Users receive JWT token on login
- Protected endpoints require valid JWT
- Token expiration and refresh works correctly

**Files to Create:**
```
backend/
├── app/controllers/api/v1/
│   ├── auth_controller.rb
│   └── registrations_controller.rb
├── app/models/
│   └── jwt_denylist.rb
└── config/initializers/
    └── devise.rb (updated)
```

---

### 3. Phase 0: Identification Lobby UI

Create the user type selection screen as the entry point to onboarding.

**Steps:**
1. Create `app/(onboarding)/phase-0/page.tsx` with three selection cards
2. Implement UserTypeSelector component with Parent, Minor, and Friend options
3. Add calming visual design (soft colors, organic shapes) per theme-rules.md
4. Store selected user type in onboarding state context
5. Add navigation to Phase 1 on selection

**Acceptance Criteria:**
- Three visually distinct cards for user types
- Hover and selection states implemented
- Selection persists in state
- Redirects to Phase 1 after selection
- Mobile responsive design

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   ├── layout.tsx
│   └── phase-0/
│       ├── page.tsx
│       └── loading.tsx
├── components/onboarding/
│   ├── user-type-selector.tsx
│   └── user-type-card.tsx
└── stores/
    └── onboarding-store.ts
```

---

### 4. Phase 1: Regulate and Relate UI

Create the calming welcome screen that reduces anxiety before data collection.

**Steps:**
1. Create `app/(onboarding)/phase-1/page.tsx` with supportive messaging
2. Implement role-specific messaging based on user type from Phase 0
3. Add calming animations (gentle fade-ins, breathing animation)
4. Include "What to expect" overview of the process
5. Add "Continue" button to proceed to screener

**Acceptance Criteria:**
- Role-specific messaging displays correctly
- Calming visual aesthetic achieved
- Smooth animations enhance (not distract from) experience
- Clear CTA to continue
- Back navigation to Phase 0

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-1/
│       └── page.tsx
├── components/onboarding/
│   ├── welcome-message.tsx
│   └── process-overview.tsx
└── lib/constants/
    └── messaging.ts
```

---

### 5. Simplified Phase 2: Static Screener

Create a form-based screener (AI chatbot comes in Phase 2 of development).

**Steps:**
1. Create screener form using React Hook Form with Zod validation
2. Implement PSC-17 screener questions as static form fields
3. Display questions one at a time with progress indicator
4. Calculate basic score on submission (client-side)
5. Submit results to backend and proceed to Phase 3

**Acceptance Criteria:**
- All PSC-17 questions displayed correctly
- Likert scale inputs (Never, Sometimes, Often) work properly
- Progress indicator shows completion percentage
- Form validation prevents incomplete submission
- Results stored in Assessment model

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-2/
│       ├── page.tsx
│       └── loading.tsx
├── components/forms/
│   ├── screener-form.tsx
│   ├── screener-question.tsx
│   └── likert-scale.tsx
├── lib/constants/
│   └── screeners/
│       └── psc-17.ts
└── lib/utils/
    └── score-calculator.ts
```

```
backend/
├── app/controllers/api/v1/
│   └── assessments_controller.rb
└── app/services/assessments/
    └── create_service.rb
```

---

### 6. Phase 3A: Account Creation

Implement user registration at the account creation step.

**Steps:**
1. Create registration form with email, password, phone fields
2. Connect to Devise registration endpoint
3. Store JWT token in secure cookie or localStorage
4. Link assessment to newly created user
5. Redirect to Phase 3B (placeholder for insurance)

**Acceptance Criteria:**
- Users can create account with email/password
- Password requirements enforced (12+ chars, complexity)
- Error messages display clearly
- Token stored securely after registration
- Previous assessment data linked to new account

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-3/
│       ├── layout.tsx
│       └── account/
│           └── page.tsx
├── components/forms/
│   └── registration-form.tsx
└── hooks/
    └── use-auth.ts
```

---

### 7. Basic Phase 4: Clinician Display

Show a matched clinician (hardcoded/random for MVP).

**Steps:**
1. Create clinician profile card component
2. Seed database with 3-5 sample clinicians
3. Display "Finding your match" loading state
4. Show randomly selected clinician with profile details
5. Add "Request different match" button (just re-randomizes for MVP)

**Acceptance Criteria:**
- Clinician card displays photo, name, credentials, bio
- Loading state provides feedback during "matching"
- Different match button works
- "Continue to Scheduling" button visible
- Design matches therapeutic aesthetic

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-3/
│       └── matching/
│           └── page.tsx
└── components/onboarding/
    └── clinician-card.tsx
```

```
backend/
├── app/controllers/api/v1/
│   └── clinicians_controller.rb
├── app/serializers/
│   └── clinician_serializer.rb
└── db/seeds/
    └── clinicians.rb
```

---

### 8. Progress Indicator Component

Create a persistent progress indicator for the onboarding flow.

**Steps:**
1. Create ProgressIndicator component showing all phases
2. Implement phase states: completed, current, upcoming
3. Add to onboarding layout (visible on all phases)
4. Make clickable for completed phases (navigation)
5. Ensure mobile-responsive (collapsible or simplified)

**Acceptance Criteria:**
- Shows all 5 phases (0-4) with labels
- Current phase highlighted
- Completed phases show checkmark
- Clicking completed phase navigates back
- Looks good on mobile and desktop

**Files to Create:**
```
frontend/
└── components/onboarding/
    ├── progress-indicator.tsx
    └── progress-step.tsx
```

---

### 9. Save and Resume (Basic)

Implement localStorage-based session persistence.

**Steps:**
1. Create useFormPersistence hook that saves form state to localStorage
2. Add "Save and Continue Later" button to Phase 2 and beyond
3. On return, detect saved state and prompt to resume
4. Clear saved state on completion or explicit discard
5. Add session expiration (30 days)

**Acceptance Criteria:**
- Partially completed form data persists across browser close
- Resume prompt appears on return
- Users can choose to resume or start fresh
- Data clears after successful completion
- Works for unauthenticated users (pre-account creation)

**Files to Create:**
```
frontend/
├── hooks/
│   └── use-form-persistence.ts
├── components/onboarding/
│   ├── save-progress-button.tsx
│   └── resume-prompt.tsx
└── lib/utils/
    └── storage.ts
```

---

### 10. REST API Endpoints

Implement core API endpoints for frontend consumption.

**Steps:**
1. Create assessments controller (create, show, update)
2. Create clinicians controller (index, show)
3. Create appointments controller (create, show) - stub for MVP
4. Add request specs for all endpoints
5. Document endpoints in `_docs/api/endpoints.md`

**Acceptance Criteria:**
- All endpoints follow REST conventions
- Proper HTTP status codes returned
- Error responses follow standard format
- Authentication required where appropriate
- Request specs achieve 90%+ coverage

**API Endpoints:**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
DELETE /api/v1/auth/logout

GET    /api/v1/users/me
PATCH  /api/v1/users/me

POST   /api/v1/assessments
GET    /api/v1/assessments/:id
PATCH  /api/v1/assessments/:id

GET    /api/v1/clinicians
GET    /api/v1/clinicians/:id
```

---

## File Structure After Phase 1

```
frontend/
├── app/
│   └── (onboarding)/
│       ├── layout.tsx
│       ├── phase-0/page.tsx
│       ├── phase-1/page.tsx
│       ├── phase-2/page.tsx
│       └── phase-3/
│           ├── account/page.tsx
│           └── matching/page.tsx
├── components/
│   ├── ui/ (shadcn)
│   ├── forms/
│   │   ├── registration-form.tsx
│   │   ├── screener-form.tsx
│   │   └── likert-scale.tsx
│   └── onboarding/
│       ├── user-type-selector.tsx
│       ├── progress-indicator.tsx
│       ├── clinician-card.tsx
│       └── save-progress-button.tsx
├── hooks/
│   ├── use-auth.ts
│   ├── use-onboarding-state.ts
│   └── use-form-persistence.ts
├── stores/
│   └── onboarding-store.ts
└── lib/
    ├── api/
    │   ├── client.ts
    │   └── endpoints.ts
    └── constants/
        ├── phases.ts
        ├── messaging.ts
        └── screeners/psc-17.ts

backend/
├── app/
│   ├── controllers/api/v1/
│   │   ├── base_controller.rb
│   │   ├── auth_controller.rb
│   │   ├── users_controller.rb
│   │   ├── assessments_controller.rb
│   │   └── clinicians_controller.rb
│   ├── models/
│   │   ├── user.rb
│   │   ├── assessment.rb
│   │   ├── clinician.rb
│   │   └── appointment.rb
│   ├── services/assessments/
│   │   └── create_service.rb
│   └── policies/
│       ├── application_policy.rb
│       └── assessment_policy.rb
└── spec/
    ├── models/
    ├── requests/
    └── factories/
```

---

## Definition of Done

- [ ] User can select user type (Parent/Minor/Friend)
- [ ] User sees calming welcome message
- [ ] User can complete static PSC-17 screener
- [ ] User can create account with email/password
- [ ] User sees a matched clinician profile
- [ ] Progress indicator shows current phase
- [ ] Partial progress saves to localStorage
- [ ] All API endpoints functional and tested
- [ ] Frontend and backend deployed to Aptible
- [ ] Mobile responsive design verified

---

## Estimated Duration

**10-14 days** for a single developer:
- Database models and auth: 2-3 days
- Phase 0 and Phase 1 UI: 2 days
- Phase 2 screener form: 2-3 days
- Phase 3 account and matching: 2-3 days
- Progress indicator and save/resume: 2 days
- Testing and polish: 2 days

---

## Next Phase

Upon completion, proceed to **Phase 2: AI Integration & Screener** to replace the static screener with an AI-powered conversational experience, add crisis detection, and implement the Triage Pulse routing.

