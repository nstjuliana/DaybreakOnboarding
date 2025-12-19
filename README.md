# Parent Onboarding AI

**Organization:** Daybreak Health  
**Stack:** Ruby on Rails 8 · Next.js 14 · PostgreSQL · OpenAI

---

## Overview

Parent Onboarding AI is a HIPAA-compliant onboarding system designed to streamline the process of connecting families with pediatric mental health services. The application uses AI to guide parents through mental health assessments, simplify insurance submission, and match families with appropriate clinicians.

### Key Goals

| Metric | Target |
|--------|--------|
| Onboarding completion rate | +40% improvement |
| Time to complete | < 15 minutes |
| Drop-off at insurance stage | 50% reduction |
| Net Promoter Score | 70+ |
| Service request increase | +30% |

### User Paths

The application supports three distinct user journeys:

- **Parent/Guardian** – Seeking mental health services for their child
- **Self-Seeking Minor (13+)** – Adolescent seeking help for themselves
- **Concerned Friend** – Someone worried about a loved one

---

## Tech Stack

### Core Technologies

| Layer | Technology | Notes |
|-------|------------|-------|
| **Backend** | Ruby on Rails 8 | REST API with JSON responses |
| **Database** | PostgreSQL | Primary data store, caching (Solid Cache), jobs (GoodJob) |
| **Frontend** | Next.js 14 | App Router, Server Components, TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui | Accessible component primitives |
| **AI** | OpenAI GPT-4 + LangChain | Conversational screener chatbot |
| **Auth** | Devise + Pundit | JWT authentication, policy-based authorization |
| **Hosting** | Aptible | HIPAA-compliant PaaS |

### Key Integrations

- **AWS S3** – Secure file storage for insurance cards
- **AWS Textract** – OCR for insurance card processing
- **SendGrid** – Transactional email delivery

---

## Project Structure

```
daybreak-onboarding/
├── _docs/                    # Project documentation
│   ├── Project Overview.md   # PRD and requirements
│   ├── user-flow.md          # User journey specification
│   ├── tech-stack.md         # Technology choices and conventions
│   ├── project-rules.md      # Coding conventions and standards
│   ├── ui-rules.md           # UI design principles
│   └── theme-rules.md        # Visual theme specifications
├── backend/                  # Rails API application
├── frontend/                 # Next.js application
├── shared/                   # Shared types, constants, utilities
├── infrastructure/           # Docker, CI/CD, deployment configs
├── scripts/                  # Development and automation scripts
├── docker-compose.yml        # Local development environment
└── Makefile                  # Common development commands
```

---

## Onboarding Flow

The application implements a "Funnel of Trust" designed for completion in under 15 minutes:

```
Phase 0: Identification Lobby     → "Who is looking for help today?"
Phase 1: Regulate and Relate      → Calm visuals, supportive messaging
Phase 1.5: Triage Pulse           → 3-question routing screen
Phase 2: Holistic Intake          → AI-administered clinical screener
Phase 3: Logistics & Matching     → Account, insurance, clinician match
Phase 4: Commitment               → Book first session
```

**Cross-Cutting Features:**
- Save and resume functionality (sessions preserved 30 days)
- Support chat widget available throughout
- WCAG-compliant accessibility
- Crisis detection with immediate safety resources

---

## Development Conventions

### AI-First Philosophy

This codebase is designed for AI-assisted development:

- **Files ≤ 500 lines** – Split larger files into focused modules
- **Descriptive naming** – Use auxiliary verbs (`isLoading`, `hasError`)
- **Comprehensive documentation** – Every file has a header comment; every function has JSDoc/RDoc

### Code Style

| Principle | Guideline |
|-----------|-----------|
| **Modularity** | Each file does one thing well |
| **Explicit > Implicit** | No magic strings; use constants |
| **Consistency** | Follow established patterns |
| **Documentation** | Block comments on all functions |

### File Headers

Every file must include a header comment:

```typescript
/**
 * @file ComponentName
 * @description Brief description of the file's purpose.
 * @see {@link _docs/relevant-doc.md} for specification
 */
```

### Git Conventions

**Branch Naming:**
```
feature/phase-2-chat-interface
bugfix/progress-indicator-mobile
hotfix/auth-token-expiry
```

**Commit Messages:**
```
feat(chat): add typing indicator for AI responses
fix(forms): resolve validation timing on blur
docs(api): document assessment endpoints
```

---

## HIPAA Compliance

All components are configured for HIPAA compliance:

| Component | Compliance Measure |
|-----------|-------------------|
| **Aptible** | HIPAA-compliant hosting, BAA included |
| **PostgreSQL** | Encryption at rest, access logging, audit trails |
| **AWS S3** | SSE-KMS encryption, bucket policies |
| **OpenAI** | BAA available for healthcare use |
| **Application** | 15-minute session timeout, parameter filtering |

**Sensitive Data Handling:**
- Filter all PII/PHI from logs
- Use UUIDs to prevent ID enumeration
- Short-lived signed URLs for file access (5-15 minutes)
- Soft deletes with `discarded_at` for audit trails

---

## Quick Reference

### Key Documentation

| Need | File |
|------|------|
| Requirements & goals | `_docs/Project Overview.md` |
| User journey | `_docs/user-flow.md` |
| Tech decisions | `_docs/tech-stack.md` |
| Coding standards | `_docs/project-rules.md` |
| UI patterns | `_docs/ui-rules.md` |
| Visual theme | `_docs/theme-rules.md` |

### Development Commands

```powershell
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
```

---

## Getting Started

### Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker Engine (Linux)
- **Git**
- **Make** (optional, but recommended)

### Quick Start (Recommended)

The easiest way to get started is with Docker:

```powershell
# 1. Clone the repository
git clone <repository-url>
cd daybreak-onboarding

# 2. Run the setup script (Windows)
.\scripts\setup-dev.ps1

# 3. Start all services
make dev
# Or without Make:
docker compose up
```

The application will be available at:
- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000/api/v1/health

### Manual Setup

If you prefer to run services locally without Docker:

```powershell
# Backend setup
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 3000

# Frontend setup (in separate terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy the example environment files before starting:

```powershell
# Backend
Copy-Item backend\.env.example backend\.env

# Frontend
Copy-Item frontend\.env.example frontend\.env.local
```

See `backend/.env.example` and `frontend/.env.example` for required variables.

---

## License

Proprietary – Daybreak Health

