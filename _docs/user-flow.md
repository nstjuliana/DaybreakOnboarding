# User Flow Document

## Overview

This document defines the user journey through the Parent Onboarding AI application. The flow is designed as a "Funnel of Trust" targeting completion in under 15 minutes for motivated users, with save and resume functionality for users who need to return later.

---

## User Types

The application supports three distinct user paths:

| User Type | Description | Primary Goal |
|-----------|-------------|--------------|
| **Parent/Guardian** | Parent seeking mental health services for their child | Secure care for their child with insurance/payment processing |
| **Self-Seeking Minor** | Child/Adolescent (13+) seeking help for themselves | Find a safe, non-judgmental space to get support |
| **Concerned Friend** | Friend or family member worried about someone | Get resources and guidance to help a loved one |

---

## Flow Phases

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PHASE 0: IDENTIFICATION LOBBY                      │
│                         "Who is looking for help today?"                     │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
       ┌─────────────┐        ┌─────────────┐        ┌─────────────┐
       │   Parent/   │        │ Self-Seeking│        │  Concerned  │
       │  Guardian   │        │    Minor    │        │   Friend    │
       └─────────────┘        └─────────────┘        └─────────────┘
              │                       │                       │
              └───────────────────────┼───────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1: REGULATE AND RELATE                          │
│                    Calm visuals, supportive messaging                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PHASE 1.5: TRIAGE PULSE (MATCHING)                      │
│              3-question screen to route to clinical pathway                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 2: HOLISTIC INTAKE                              │
│              AI-administered screener with branching logic                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    ▼                                   ▼
            ┌──────────────┐                   ┌──────────────┐
            │  Good Fit    │                   │ Not a Fit    │
            │  Continue    │                   │  Off-Ramp    │
            └──────────────┘                   └──────────────┘
                    │                                   │
                    ▼                                   ▼
┌─────────────────────────────────────────┐   ┌─────────────────────────┐
│     PHASE 3: LOGISTICS & MATCHING       │   │   RESOURCE REFERRAL     │
│  Account creation, Insurance, Provider  │   │   Alternative services  │
└─────────────────────────────────────────┘   └─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 4: COMMITMENT (CARE)                            │
│                    Book session with matched clinician                       │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: Identification Lobby

### Purpose
Identify the user's role to trigger the appropriate clinical, emotional, and regulatory pathways.

### Screen Elements
- Welcome message with calming design
- Prompt: "Who is looking for help today?"
- Three selection options:
  - "I'm a Parent/Guardian"
  - "I'm looking for help for myself" (13+)
  - "I'm worried about someone"

### User Path Routing

| Selection | Next Step |
|-----------|-----------|
| Parent/Guardian | Phase 1 (Parent Path) |
| Self-Seeking Minor | Age verification → Phase 1 (Minor Path with anonymity options) |
| Concerned Friend | Phase 1 (Advocate Path) |

### Self-Seeking Minor: Age Verification
- If under 13: Display message explaining parental consent requirement per COPPA, offer option to involve parent
- If 13+: Proceed with anonymous entry option and age-appropriate experience

---

## Phase 1: Regulate and Relate

### Purpose
Reduce user anxiety and establish emotional safety before data collection.

### Screen Elements
- Calm visual design (soft tones, organic shapes)
- Role-specific supportive messaging ("Just because you're struggling, doesn't mean you're broken.")
- Brief overview of what to expect in the process

### Role-Specific Messaging

| User Type | Messaging Theme |
|-----------|-----------------|
| Parent/Guardian | "You're taking an important step for your family. We're here to guide you." |
| Self-Seeking Minor | "This is a safe space. You're not broken—we're here to help you find your path." |
| Concerned Friend | "It takes courage to reach out for someone you care about. Let's explore how we can help." |

### Navigation
- "Continue" button to Phase 1.5

---

## Phase 1.5: Triage Pulse (Matching Layer)

### Purpose
Low-friction screening to route users to the appropriate clinical pathway and screener.

### Screen Elements
- 3 pulse-check questions OR area selection
- Progress indicator

### Interaction Options

**Option A: Area Selection**
User selects "Areas of Support":
- Mood (sadness, depression)
- Anxiety (worry, fear)
- Behavior (acting out, rule-breaking)
- Life Changes (family, school, relationships)
- Not sure / Multiple concerns

**Option B: Pulse Questions**
Example: "In the last week, how often has [you/your child] felt sad or hopeless?"
- Never
- Sometimes
- Often
- Almost always

### Routing Logic

| Selection/Response | Routed Screener |
|--------------------|-----------------|
| Mood selected | PHQ-9A (Depression) |
| Anxiety selected | SCARED (Anxiety Disorders) |
| Behavior selected | PSC-17 (Behavioral) |
| Not sure / Broad concerns | PSC-17 (Broadband) |
| Multiple high-intensity responses | PSC-17 + Secondary screener |

### Navigation
- Brief explanation of why the next questions are being asked
- "Continue" to Phase 2

---

## Phase 2: Holistic Intake

### Purpose
AI-administered clinical screener to assess needs and determine fit.

### Screen Elements
- Conversational AI interface
- Progress indicator
- "Save and continue later" option
- Support chat access

### Screener Administration

The AI chatbot administers the role-appropriate screener identified in Phase 1.5:

| Screener | Target Domain | Used For |
|----------|---------------|----------|
| PSC-17/35 | Cognitive, Emotional, Behavioral | Broad screening |
| PHQ-9A | Depression and Suicide Risk | Mood concerns |
| GAD-7 | Generalized Anxiety | Anxiety symptoms |
| SCARED | Specific Anxiety Disorders | Childhood anxiety |
| CRAFFT | Substance Use Risk | Youth 12-21 |

### Branching Logic
- Questions adapt based on response intensity
- Follow-up questions triggered by concerning responses
- Conversational tone with empathetic acknowledgments

### Safety Pivot (Crisis Detection)
If high-risk responses are detected (suicide ideation, self-harm, abuse):

1. **Turn-by-turn monitoring** checks each response for risk signals
2. **Soft Stop** activated - session transitions to safety protocol
3. Display: Immediate resources (988 Suicide & Crisis Lifeline)
4. Offer: Connection to human support from Daybreak team
5. **Safety blocking**: Never provide harmful information

### Fit Determination

| Assessment Result | Next Step |
|-------------------|-----------|
| Good fit for Daybreak services | Continue to Phase 3 |
| Not a fit (needs higher level of care, specialized services, etc.) | Off-Ramp: Resource Referral screen |

### Off-Ramp: Resource Referral
- Empathetic messaging: "Based on what you've shared, we believe [X type of care] may be a better fit right now."
- List of recommended resources and alternative providers
- Option to contact Daybreak support for guidance
- Option to save contact info for future reference

### Navigation
- "Continue" to Phase 3 (if good fit)
- "View Resources" (if not a fit)
- "Save and Continue Later" (at any point)

---

## Phase 3: Logistics and Matching

### Purpose
Account creation, payment/insurance setup, and clinician matching.

### Sub-Phase 3A: Account Creation

#### Screen Elements
- Account creation form
- Email/password or SSO options

#### Required Information
- Email address
- Password
- Phone number (for appointment reminders)

#### Save Point
- Progress saved to account
- Session can be resumed via login

---

### Sub-Phase 3B: Payment/Insurance

#### Screen Elements
- Three card options for payment method selection

#### Payment Options

| Card | Description | Next Step |
|------|-------------|-----------|
| "I have insurance" | User has insurance to submit | Insurance capture flow |
| "I will self-pay" | User chooses to pay out-of-pocket | Self-pay pricing display |
| "I don't have insurance" | User lacks insurance coverage | Self-pay pricing display + Financial assistance info |

---

#### Insurance Capture Flow

**Step 1: Image Upload (P1 Feature)**
- Prompt to upload front and back of insurance card
- OCR extracts insurance information automatically

**Step 2: Verification**
- Display extracted information for user confirmation
- If OCR fails or user prefers: "Enter manually" option

**Step 3: Manual Input Fallback**
- Form fields for:
  - Insurance provider
  - Member ID
  - Group number
  - Policyholder name
  - Policyholder date of birth
  - Relationship to patient

**Step 4: Cost Estimation (P1 Feature)**
- Display estimated cost based on insurance information
- Note: "This is an estimate. Actual costs may vary based on your plan."

---

#### Self-Pay Flow
- Display session pricing
- Payment method collection
- For "I don't have insurance": Include financial assistance program information

---

### Sub-Phase 3C: Demographics Collection

#### Screen Elements
- Form for demographic and contact information

#### Information Collected (Role-Dependent)

**For Parent/Guardian:**
- Parent contact information
- Child's name and date of birth
- Child's school (optional)
- Emergency contact
- Preferred contact method

**For Self-Seeking Minor:**
- Name and date of birth
- Emergency contact (if comfortable sharing)
- School (optional)

**For Concerned Friend:**
- Friend's contact information (to receive resources)
- Relationship to person they're concerned about

---

### Sub-Phase 3D: Clinician Matching

#### Screen Elements
- "Finding your match" loading state
- Matched clinician profile card

#### Matching Criteria
Based on:
- Assessment results from Phase 2
- Presenting concerns
- Age of patient
- Insurance/availability
- Preferences (if collected)

#### Clinician Profile Display
- Photo
- Name and credentials
- Video bio (to humanize the clinician)
- Specialties
- Brief introduction

#### Navigation
- "Continue to Scheduling" to Phase 4
- "Request a different match" option

---

## Phase 4: Commitment (Care)

### Purpose
Book first session with matched clinician.

### Screen Elements
- Calendar with clinician's availability
- Session type selection
- Confirmation summary

### Scheduling Flow

**Step 1: Session Type**
- 30-minute kickoff call
- Full diagnostic session
- (Options may vary based on insurance/assessment)

**Step 2: Calendar Selection**
- Display matched clinician's available time slots
- User selects preferred date and time
- Time zone confirmation

**Step 3: Confirmation**
- Summary of appointment details:
  - Clinician name
  - Date and time
  - Session type
  - Location (telehealth link info)
- Option to add to calendar
- "Confirm Booking" button

### Post-Booking

#### Confirmation Screen
- Success message
- Appointment details
- "What to expect" information

#### Immediate Follow-up
- Confirmation email sent
- Access to secure patient portal
- Orientation materials provided
- Reminder scheduling (SMS/email preferences)

---

## Cross-Cutting Features

### Save and Resume
- Available from Phase 1.5 onward (before account creation, uses email/code)
- Full save after account creation in Phase 3A
- Resume link sent via email
- Session state preserved for 30 days

### Support Interface (P1 Feature)
- Chat widget available throughout all phases
- Connects to Daybreak support team
- Available for questions about:
  - Insurance
  - Process
  - General inquiries
- Does NOT replace crisis support (handled by Safety Pivot)

### Progress Indicator
- Visual progress bar showing current phase
- Phase labels visible throughout flow

### Accessibility
- WCAG compliant
- Screen reader support
- Keyboard navigation
- High contrast mode option

---

## Path-Specific Variations

### Parent/Guardian Path
- Full flow as described above
- Includes: Insurance capture, developmental history questions, child demographics

### Self-Seeking Minor Path
- Anonymous browsing option in Phase 0-2
- Age-appropriate language and design
- Parental consent integration when required (based on state laws and service type)
- Youth Self-Report (YSR) versions of screeners
- May skip insurance (handled by parent later)

### Concerned Friend Path
- Phase 2 focuses on observations rather than direct symptoms
- "Bridge to Care" resources provided
- Options:
  - "Share resources with your friend"
  - "Help them start their own journey"
  - "Talk to someone about how to help"
- May not proceed to Phase 3/4 (provides resources and guidance instead)

---

## Error States and Edge Cases

| Scenario | Handling |
|----------|----------|
| Session timeout | Prompt to save progress, offer resume link |
| Insurance OCR failure | Fall back to manual input form |
| No available appointments | Waitlist option, notification when slots open |
| Payment failure | Retry option, alternative payment method |
| User under 13 attempts self-seeking | Redirect to parent involvement flow |
| High-risk assessment | Safety Pivot with crisis resources |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Onboarding completion rate | +40% improvement |
| Time to complete | < 15 minutes |
| Drop-off at insurance stage | 50% reduction |
| Net Promoter Score | 70+ |
| Service request increase | +30% |

