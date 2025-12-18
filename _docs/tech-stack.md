# Tech Stack

## Overview

This document defines the technology stack for the Parent Onboarding AI application. Choices are guided by the PRD Technical Requirements, HIPAA compliance needs, and alignment with the user flow architecture.

---

## Core Stack

| Layer | Technology | Version/Notes |
|-------|------------|---------------|
| **Backend Framework** | Ruby on Rails | Rails 8 |
| **Database** | PostgreSQL | Primary data store |
| **Frontend Framework** | Next.js | React-based with SSR/SSG |
| **API Layer** | REST | JSON responses, Rails conventions |

---

## Detailed Stack

### Backend

#### Ruby on Rails 8
- Full-stack web framework with REST API conventions
- Handles authentication, authorization, business logic
- Active Record ORM for PostgreSQL
- Active Storage for file uploads
- Action Cable for WebSocket connections

#### PostgreSQL
- Primary relational database
- Stores users, assessments, appointments, clinical data
- HIPAA-compliant with encryption at rest
- Also used for caching (Solid Cache) and background jobs (GoodJob)

---

### Frontend

#### Next.js
- React-based framework for the onboarding UI
- Server-side rendering for initial page loads
- File-based routing maps well to phased onboarding flow
- API routes for BFF (Backend for Frontend) patterns if needed

#### Tailwind CSS
- Utility-first CSS framework
- Enables rapid UI development
- Customizable design tokens for "calm visual language"
- Responsive design out of the box

#### shadcn/ui
- Accessible component primitives built on Radix UI
- WCAG-compliant components
- Copy-paste ownership (not a dependency)
- Tailwind-styled, highly customizable

#### React Hook Form
- Performant form handling for multi-step onboarding
- Minimal re-renders
- Built-in validation support
- Handles save/resume state well

---

### API Layer

#### REST API
- Standard Rails resource-based routing
- JSON request/response format
- Follows Rails conventions for CRUD operations
- Simpler caching, debugging, and testing than GraphQL

**Key Endpoints Structure:**
```
/api/v1/users
/api/v1/assessments
/api/v1/screeners
/api/v1/appointments
/api/v1/clinicians
/api/v1/insurance
```

---

### AI/LLM Integration

#### OpenAI API (GPT-4)
- Powers the conversational screener chatbot
- Handles mental health assessment conversations
- BAA available for HIPAA compliance
- 3-second response target achievable with streaming

#### LangChain (langchainrb gem)
- LLM abstraction layer for provider flexibility
- Conversation memory management
- Prompt template management
- Chain-of-thought patterns for screener logic

**Safety Implementation:**
- Turn-by-turn content monitoring
- Crisis keyword detection
- Safety Pivot trigger logic
- Response filtering and guardrails

---

### Authentication & Authorization

#### Devise
- Rails authentication solution
- Handles registration, login, password recovery
- Session management
- Email confirmation flows
- Supports the three user type paths (Parent, Minor, Friend)

#### Pundit
- Policy-based authorization
- Clear, auditable permission logic
- Maps to user types and flow phases
- Easy to test and maintain

---

### Real-time Communication

#### Action Cable
- Rails-native WebSocket support
- Powers the P1 Support Chat feature
- Integrates with Rails authentication
- Sufficient for 1000 concurrent users target

---

### Background Processing

#### GoodJob
- PostgreSQL-backed job queue
- No Redis dependency (aligns with Solid Cache choice)
- Handles async tasks:
  - LLM API calls
  - OCR processing
  - Email sending
  - Appointment reminders
- Dashboard for job monitoring

---

### Caching

#### Solid Cache (Rails 8)
- PostgreSQL-backed caching
- Eliminates Redis infrastructure dependency
- Native Rails 8 integration
- Handles session caching, fragment caching, API response caching

---

### File Storage

#### AWS S3 + Active Storage
- Secure file storage for insurance card images
- HIPAA-eligible with proper configuration:
  - Encryption at rest (SSE-S3 or SSE-KMS)
  - Encryption in transit (HTTPS)
  - Access logging enabled
  - Bucket policies restricting access
- Direct upload support via Active Storage
- Integrates with Textract for OCR

---

### OCR Service

#### AWS Textract
- Document text extraction for insurance cards
- Handles varied card formats and layouts
- HIPAA-eligible service
- Integrates naturally with S3 storage
- Fallback to manual entry on failure

---

### Email Service

#### SendGrid
- Transactional email delivery
- Templates for:
  - Account confirmation
  - Save/resume links
  - Appointment confirmations
  - Reminders
- BAA available for HIPAA compliance
- Delivery tracking and analytics

---

### Scheduling

#### Custom Implementation
- **date-fns** for date manipulation
- Custom availability logic for clinician calendars
- Matching algorithm based on:
  - Assessment results
  - Clinician specialties
  - Insurance compatibility
  - Availability windows
- Time zone handling for telehealth

---

### Hosting & Infrastructure

#### Aptible
- HIPAA-compliant PaaS
- Docker-based deployments
- Built-in compliance controls:
  - Audit logging
  - Encryption
  - Access controls
  - Backup management
- Managed PostgreSQL available
- Simplifies HIPAA compliance burden

#### Docker
- Containerization for consistent environments
- Local development parity with production
- Required for Aptible deployment

---

### Testing

#### Backend (Rails)
- **RSpec** - Unit and integration testing
- **Factory Bot** - Test data generation
- **VCR** - HTTP interaction recording for LLM tests

#### Frontend (Next.js)
- **Jest** - Unit testing for React components
- **React Testing Library** - Component testing
- **Playwright** - End-to-end testing for onboarding flows

#### API Testing
- **Postman** - API development and manual testing
- **Newman** - Postman CLI for CI/CD integration

---

## Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  APTIBLE                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Docker Containers                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │   Rails     │  │   Next.js   │  │   GoodJob   │                  │    │
│  │  │   API       │  │   Frontend  │  │   Workers   │                  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                  │    │
│  │         │                │                │                          │    │
│  │         └────────────────┴────────────────┘                          │    │
│  │                          │                                           │    │
│  │                 ┌────────┴────────┐                                  │    │
│  │                 │   PostgreSQL    │                                  │    │
│  │                 │  (Data, Cache,  │                                  │    │
│  │                 │   Job Queue)    │                                  │    │
│  │                 └─────────────────┘                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
      ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
      │   AWS S3     │       │   OpenAI     │       │  SendGrid    │
      │  (Storage)   │       │   API        │       │  (Email)     │
      └──────┬───────┘       └──────────────┘       └──────────────┘
             │
             ▼
      ┌──────────────┐
      │ AWS Textract │
      │   (OCR)      │
      └──────────────┘
```

---

## HIPAA Compliance Considerations

| Component | Compliance Measure |
|-----------|-------------------|
| **Aptible** | HIPAA-compliant hosting, BAA included |
| **PostgreSQL** | Encryption at rest, access logging |
| **AWS S3** | SSE encryption, bucket policies, access logging |
| **AWS Textract** | HIPAA-eligible, BAA available |
| **OpenAI** | BAA available for healthcare use |
| **SendGrid** | BAA available |
| **Solid Cache** | Data stays in PostgreSQL (already compliant) |
| **GoodJob** | Data stays in PostgreSQL (already compliant) |

---

## Development Tools

| Tool | Purpose |
|------|---------|
| **Docker** | Local development containers |
| **Docker Compose** | Multi-service local environment |
| **Postman** | API development and testing |
| **ESLint + Prettier** | Frontend code quality |
| **RuboCop** | Rails code quality |
| **Husky** | Git hooks for pre-commit checks |

---

## Key Dependencies Summary

### Rails (Gemfile)
```ruby
# Core
gem 'rails', '~> 8.0'
gem 'pg'
gem 'solid_cache'
gem 'good_job'

# Authentication & Authorization
gem 'devise'
gem 'pundit'

# API
gem 'jbuilder'  # JSON responses

# AI
gem 'langchainrb'
gem 'ruby-openai'

# File Storage
gem 'aws-sdk-s3'
gem 'aws-sdk-textract'

# Real-time
gem 'actioncable'

# Background Jobs
gem 'good_job'

# Testing
gem 'rspec-rails'
gem 'factory_bot_rails'
gem 'vcr'
```

### Next.js (package.json)
```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-hook-form": "^7.x",
    "date-fns": "^3.x",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^3.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@playwright/test": "^1.x",
    "jest": "^29.x",
    "@testing-library/react": "^14.x",
    "eslint": "^8.x",
    "prettier": "^3.x"
  }
}
```

---

## Version Control & CI/CD

| Tool | Purpose |
|------|---------|
| **Git** | Version control |
| **GitHub** | Repository hosting |
| **GitHub Actions** | CI/CD pipelines |
| **Dependabot** | Dependency updates |

---

## Next Steps

1. Initialize Rails 8 API application
2. Initialize Next.js frontend application
3. Configure Docker Compose for local development
4. Set up Aptible deployment pipeline
5. Configure AWS services (S3, Textract)
6. Implement authentication flow
7. Build Phase 0 (Identification Lobby) UI

