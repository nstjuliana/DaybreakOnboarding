# Phase 3: Insurance, Matching & Scheduling

## Overview

This phase implements the logistics portion of onboarding: insurance capture with OCR, demographics collection, intelligent clinician matching, and appointment scheduling. These features complete the core onboarding flow from identification to booked appointment.

**Outcome:** Users can submit insurance information (via photo or manual entry), provide demographics, get matched with an appropriate clinician, and schedule their first appointment.

---

## Prerequisites

- Phase 2 completed (AI screener deployed)
- AWS Textract configured with HIPAA BAA
- Clinician availability data structure defined
- Payment processing requirements clarified (out of scope per PRD)

---

## Deliverables

| Deliverable | Description |
|-------------|-------------|
| Insurance Capture | Photo upload with OCR + manual entry fallback |
| Cost Estimation | Display estimated costs based on insurance |
| Demographics Forms | Role-appropriate information collection |
| Clinician Matching | Algorithm-based provider matching |
| Scheduling System | Calendar with availability selection |
| Appointment Confirmation | Booking confirmation with details |

---

## Features

### 1. Insurance Selection Flow

Create the payment method selection screen with three options.

**Steps:**
1. Create InsuranceSelector component with three card options
2. Implement "I have insurance" → Insurance capture flow
3. Implement "I will self-pay" → Pricing display
4. Implement "No insurance" → Pricing + financial assistance info
5. Add state management for payment method selection

**Acceptance Criteria:**
- Three visually distinct cards for payment options
- Clear descriptions of each path
- Selection persists through flow
- Users can change selection before submission
- Mobile-responsive card layout

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-3/
│       └── insurance/
│           └── page.tsx
└── components/forms/
    ├── insurance-selector.tsx
    └── payment-option-card.tsx
```

---

### 2. Insurance Card OCR

Implement photo upload with AWS Textract extraction.

**Steps:**
1. Create InsuranceUpload component with front/back card upload
2. Implement direct upload to S3 via Active Storage
3. Create InsuranceOcrService calling AWS Textract
4. Build field extraction and mapping logic
5. Display extracted data for user verification

**Acceptance Criteria:**
- Users can upload photos from camera or gallery
- Upload progress indicator shown
- Extracted fields display within 10 seconds
- Users can correct any misread fields
- Failed OCR gracefully falls back to manual entry

**Textract Field Mapping:**
```
Insurance Provider → FORM_KEY match
Member ID → Pattern: alphanumeric, 8-15 chars
Group Number → Pattern: alphanumeric, 5-10 chars
Policyholder Name → NAME entity
```

**Files to Create:**
```
frontend/
├── components/forms/
│   ├── insurance-upload.tsx
│   ├── insurance-card-preview.tsx
│   └── insurance-verification.tsx
└── hooks/
    └── use-insurance-upload.ts
```

```
backend/
├── app/services/insurance/
│   ├── ocr_service.rb
│   └── field_extractor.rb
├── app/models/
│   └── insurance_card.rb
├── app/jobs/
│   └── extract_insurance_job.rb
└── db/migrate/
    └── XXXXXX_create_insurance_cards.rb
```

---

### 3. Manual Insurance Entry

Create fallback form for manual insurance information input.

**Steps:**
1. Create InsuranceForm component with all required fields
2. Implement form validation with Zod schema
3. Add common insurance provider autocomplete
4. Include helper tooltips explaining each field
5. Validate format of member ID and group number

**Acceptance Criteria:**
- All required fields clearly labeled
- Provider autocomplete suggests major insurers
- Field-level validation with clear error messages
- Help tooltips explain where to find info on card
- Form submits to backend for storage

**Form Fields:**
```
- Insurance Provider (autocomplete)
- Member ID
- Group Number
- Policyholder Name
- Policyholder Date of Birth
- Relationship to Patient (dropdown)
```

**Files to Create:**
```
frontend/
├── components/forms/
│   ├── insurance-form.tsx
│   └── provider-autocomplete.tsx
└── lib/validation/
    └── insurance-schema.ts
```

```
backend/
├── app/controllers/api/v1/
│   └── insurance_controller.rb
└── app/validators/
    └── insurance_validator.rb
```

---

### 4. Cost Estimation Display

Show estimated costs based on submitted insurance.

**Steps:**
1. Create CostEstimation component displaying estimated amounts
2. Implement estimation logic based on insurance type
3. Add disclaimer about estimates vs actual costs
4. Show comparison for insured vs self-pay
5. Include contact option for billing questions

**Acceptance Criteria:**
- Estimates display clearly after insurance submission
- Disclaimer prominently shown
- Range displayed when exact cost unknown
- Self-pay option shown as alternative
- "Questions about cost?" support link

**Files to Create:**
```
frontend/
└── components/onboarding/
    ├── cost-estimation.tsx
    └── pricing-disclaimer.tsx
```

```
backend/
├── app/services/insurance/
│   └── cost_estimator.rb
└── lib/
    └── insurance_rates.yml
```

---

### 5. Demographics Collection

Create role-appropriate demographics forms.

**Steps:**
1. Create DemographicsForm component with conditional fields
2. Implement Parent form (parent + child info)
3. Implement Minor form (self info, optional emergency contact)
4. Implement Friend form (contact info, relationship)
5. Add address autocomplete and phone formatting

**Acceptance Criteria:**
- Form fields adapt to user type
- Required vs optional fields clearly marked
- Address autocomplete works
- Phone numbers formatted consistently
- Data validated before submission

**Parent Form Fields:**
```
Parent: Full name, email, phone, address, preferred contact method
Child: Name, date of birth, school (optional), gender, pronouns
Emergency: Contact name, relationship, phone
```

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-3/
│       └── demographics/
│           └── page.tsx
├── components/forms/
│   ├── demographics-form.tsx
│   ├── parent-fields.tsx
│   ├── child-fields.tsx
│   └── emergency-contact-fields.tsx
└── lib/validation/
    └── demographics-schema.ts
```

```
backend/
├── app/models/
│   ├── patient.rb
│   └── emergency_contact.rb
└── db/migrate/
    ├── XXXXXX_create_patients.rb
    └── XXXXXX_create_emergency_contacts.rb
```

---

### 6. Clinician Matching Algorithm

Implement intelligent matching based on assessment and preferences.

**Steps:**
1. Create MatchClinicianService with scoring algorithm
2. Define matching criteria (specialties, availability, insurance)
3. Implement weighted scoring system
4. Add preference consideration (gender, time preferences)
5. Return ranked list of matches (top 3)

**Acceptance Criteria:**
- Matching considers assessment results
- Insurance acceptance verified
- Availability conflicts detected
- Preferences influence but don't override fit
- No match scenario handled gracefully

**Matching Criteria Weights:**
```
Clinical fit (specialty match): 40%
Insurance acceptance: 25%
Availability overlap: 20%
Patient preferences: 15%
```

**Files to Create:**
```
backend/
├── app/services/scheduling/
│   ├── match_clinician_service.rb
│   └── scoring_calculator.rb
└── app/models/
    └── clinician_specialty.rb
```

---

### 7. Clinician Profile Display

Show matched clinician with detailed profile.

**Steps:**
1. Create ClinicianProfile component with full details
2. Add video bio player (if available)
3. Display specialties and credentials
4. Show availability summary
5. Add "Request different match" functionality

**Acceptance Criteria:**
- Profile photo displays prominently
- Video bio plays inline (optional)
- Credentials and specialties listed
- Availability summary shown
- Different match request works (shows next best match)

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-3/
│       └── matching/
│           └── page.tsx (enhanced)
├── components/onboarding/
│   ├── clinician-profile.tsx
│   ├── video-bio-player.tsx
│   └── specialties-list.tsx
└── hooks/
    └── use-clinician-match.ts
```

---

### 8. Availability Calendar

Create calendar interface showing clinician availability.

**Steps:**
1. Create CalendarView component with week view
2. Implement TimeSlotPicker for available slots
3. Add timezone detection and display
4. Create slot selection state management
5. Show selected slot summary before confirmation

**Acceptance Criteria:**
- Calendar shows next 2 weeks of availability
- Unavailable slots clearly marked
- User's timezone detected and displayed
- Selected slot highlighted
- Easy navigation between weeks

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-4/
│       └── page.tsx
├── components/scheduling/
│   ├── calendar-view.tsx
│   ├── time-slot-picker.tsx
│   ├── day-column.tsx
│   └── time-slot.tsx
└── hooks/
    └── use-availability.ts
```

```
backend/
├── app/controllers/api/v1/
│   └── availability_controller.rb
├── app/services/scheduling/
│   └── availability_service.rb
└── app/models/
    └── availability_slot.rb
```

---

### 9. Appointment Booking

Implement appointment creation and confirmation.

**Steps:**
1. Create AppointmentSummary component showing booking details
2. Implement booking confirmation flow
3. Create appointment in database
4. Generate telehealth link (placeholder)
5. Trigger confirmation notifications

**Acceptance Criteria:**
- Summary shows all appointment details
- Confirmation requires explicit action
- Appointment created with correct data
- User receives confirmation on screen
- Email confirmation sent

**Appointment Data:**
```
- Clinician name and photo
- Date and time with timezone
- Session type (kickoff vs full)
- Duration
- Location (telehealth link)
```

**Files to Create:**
```
frontend/
└── components/scheduling/
    ├── appointment-summary.tsx
    └── booking-confirmation.tsx
```

```
backend/
├── app/controllers/api/v1/
│   └── appointments_controller.rb
├── app/services/scheduling/
│   └── book_appointment_service.rb
└── app/jobs/
    └── send_confirmation_job.rb
```

---

### 10. Email Notifications

Implement transactional emails for onboarding milestones.

**Steps:**
1. Configure SendGrid with Rails Action Mailer
2. Create appointment confirmation email template
3. Create welcome email template
4. Create reminder email template (24hr before)
5. Add email preferences to user settings

**Acceptance Criteria:**
- Confirmation email sent immediately on booking
- Welcome email includes next steps
- Reminder sent 24 hours before appointment
- Emails render correctly across clients
- Unsubscribe link included

**Email Templates:**
```
- Welcome to Daybreak
- Appointment Confirmed
- Appointment Reminder (24hr)
- Appointment Reminder (1hr)
```

**Files to Create:**
```
backend/
├── app/mailers/
│   ├── application_mailer.rb
│   ├── user_mailer.rb
│   └── appointment_mailer.rb
├── app/views/
│   └── mailers/
│       ├── welcome.html.erb
│       ├── appointment_confirmed.html.erb
│       └── appointment_reminder.html.erb
└── app/jobs/
    ├── send_welcome_email_job.rb
    └── send_reminder_job.rb
```

---

## File Structure After Phase 3

```
frontend/
├── app/(onboarding)/
│   └── phase-3/
│       ├── insurance/page.tsx
│       ├── demographics/page.tsx
│       └── matching/page.tsx
│   └── phase-4/
│       └── page.tsx (scheduling)
├── components/
│   ├── forms/
│   │   ├── insurance-selector.tsx
│   │   ├── insurance-upload.tsx
│   │   ├── insurance-form.tsx
│   │   └── demographics-form.tsx
│   ├── onboarding/
│   │   ├── clinician-profile.tsx
│   │   └── cost-estimation.tsx
│   └── scheduling/
│       ├── calendar-view.tsx
│       ├── time-slot-picker.tsx
│       └── appointment-summary.tsx
└── hooks/
    ├── use-insurance-upload.ts
    ├── use-clinician-match.ts
    └── use-availability.ts

backend/
├── app/
│   ├── controllers/api/v1/
│   │   ├── insurance_controller.rb
│   │   ├── availability_controller.rb
│   │   └── appointments_controller.rb
│   ├── models/
│   │   ├── insurance_card.rb
│   │   ├── patient.rb
│   │   └── availability_slot.rb
│   ├── services/
│   │   ├── insurance/
│   │   │   ├── ocr_service.rb
│   │   │   └── cost_estimator.rb
│   │   └── scheduling/
│   │       ├── match_clinician_service.rb
│   │       ├── availability_service.rb
│   │       └── book_appointment_service.rb
│   ├── mailers/
│   │   └── appointment_mailer.rb
│   └── jobs/
│       ├── extract_insurance_job.rb
│       └── send_confirmation_job.rb
└── db/migrate/
    └── (new migrations)
```

---

## Definition of Done

- [ ] Insurance selector shows three payment options
- [ ] Insurance card OCR extracts information correctly
- [ ] Manual insurance form works as fallback
- [ ] Cost estimation displays with disclaimer
- [ ] Demographics form adapts to user type
- [ ] Clinician matching returns appropriate matches
- [ ] Availability calendar shows real availability
- [ ] Appointments can be booked successfully
- [ ] Confirmation email sends on booking
- [ ] End-to-end flow works from identification to booking

---

## Estimated Duration

**14-18 days** for a single developer:
- Insurance selection and OCR: 4-5 days
- Demographics forms: 2-3 days
- Clinician matching: 3-4 days
- Scheduling calendar: 3-4 days
- Email notifications: 2 days
- Integration and testing: 2 days

---

## Next Phase

Upon completion, proceed to **Phase 4: Polish & Enhancement** to add support chat, improve UX with animations, implement accessibility audit fixes, and add self-help resources.

