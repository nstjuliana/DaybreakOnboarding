# Phase 0: Setup

## Overview

This phase establishes the foundational infrastructure for the Parent Onboarding AI project. The goal is to create a barebones but functional setup with both backend and frontend scaffolded, containerized, and deployed to Aptible with a working CI/CD pipeline.

**Outcome:** A "Hello World" version of the application deployed to production with all infrastructure in place.

---

## Prerequisites

- Access to GitHub repository
- Aptible account with HIPAA-compliant environment
- AWS account with S3, Textract access
- OpenAI API key
- SendGrid account
- Docker Desktop installed locally

---

## Deliverables

| Deliverable | Description |
|-------------|-------------|
| Rails 8 API | Scaffolded backend with health endpoint |
| Next.js Frontend | Scaffolded frontend with basic page |
| Docker Configuration | Multi-stage Dockerfiles for both services |
| CI/CD Pipeline | GitHub Actions workflow for testing and deployment |
| Aptible Deployment | Both services running in production |
| Development Environment | Docker Compose for local development |

---

## Features

### 1. Rails Backend Scaffolding

Create a new Rails 8 API-only application with PostgreSQL and essential gems.

**Steps:**
1. Initialize Rails 8 app with `rails new backend --api --database=postgresql --skip-javascript`
2. Add core gems to Gemfile (devise, pundit, good_job, solid_cache, rack-cors, rack-attack)
3. Configure database.yml for PostgreSQL with UUID primary keys
4. Create health check endpoint at `GET /api/v1/health`
5. Configure CORS, parameter filtering, and environment credentials

**Acceptance Criteria:**
- `rails server` starts without errors
- Health endpoint returns `{ status: 'ok', timestamp: <ISO8601> }`
- RSpec runs with 0 tests (green)

---

### 2. Next.js Frontend Scaffolding

Create a new Next.js 14 application with App Router, Tailwind CSS, and shadcn/ui.

**Steps:**
1. Initialize Next.js with `npx create-next-app@latest frontend --typescript --tailwind --app --src-dir`
2. Install dependencies (react-hook-form, zod, @hookform/resolvers, date-fns, clsx, tailwind-merge)
3. Initialize shadcn/ui with `npx shadcn@latest init`
4. Configure Tailwind with theme tokens from `_docs/theme-rules.md`
5. Create basic home page with "Parent Onboarding AI" title and health check display

**Acceptance Criteria:**
- `npm run dev` starts without errors
- Home page renders with proper styling
- ESLint and TypeScript checks pass

---

### 3. Docker Configuration

Create Dockerfiles for both services and a Docker Compose file for local development.

**Steps:**
1. Create multi-stage Dockerfile for Rails (builder + runtime stages)
2. Create multi-stage Dockerfile for Next.js (deps + builder + runner stages)
3. Create docker-compose.yml with postgres, backend, and frontend services
4. Add .dockerignore files to both projects
5. Test full stack startup with `docker compose up`

**Acceptance Criteria:**
- `docker compose up` starts all services
- Backend accessible at http://localhost:3000
- Frontend accessible at http://localhost:3001
- Database migrations run on startup

---

### 4. CI/CD Pipeline

Set up GitHub Actions for automated testing and deployment.

**Steps:**
1. Create `.github/workflows/ci.yml` with backend and frontend test jobs
2. Create `.github/workflows/deploy.yml` for Aptible deployment on main branch
3. Add Aptible CLI setup and deployment steps
4. Configure GitHub secrets for Aptible credentials and API keys
5. Test pipeline with initial commit

**Acceptance Criteria:**
- Push to PR triggers CI tests
- Push to main triggers deployment
- Failed tests block deployment
- Deployment logs accessible in GitHub Actions

---

### 5. Aptible Deployment

Deploy both services to Aptible's HIPAA-compliant infrastructure.

**Steps:**
1. Create Aptible apps: `daybreak-api-production`, `daybreak-frontend-production`
2. Provision PostgreSQL database with encryption at rest
3. Configure environment variables in Aptible dashboard
4. Deploy initial containers via GitHub Actions
5. Configure custom domains and SSL certificates

**Acceptance Criteria:**
- Backend health endpoint accessible at production URL
- Frontend home page accessible at production URL
- Database connection verified in production
- SSL certificates active (HTTPS only)

---

### 6. Local Development Environment

Create Makefile and scripts for streamlined local development.

**Steps:**
1. Create `Makefile` with common commands (dev, test, lint, db-migrate, etc.)
2. Create `scripts/setup-dev.ps1` for Windows development setup
3. Document environment variable requirements in `.env.example` files
4. Create seed data script for development database
5. Write `README.md` with setup instructions

**Acceptance Criteria:**
- New developer can set up project with documented steps
- `make dev` starts entire stack
- `make test` runs all tests
- `make lint` checks code quality

---

## File Structure After Phase 0

```
daybreak-onboarding/
├── _docs/
│   └── phases/
│       └── phase-0-setup.md
├── backend/
│   ├── app/
│   │   └── controllers/
│   │       └── api/
│   │           └── v1/
│   │               └── health_controller.rb
│   ├── config/
│   │   ├── database.yml
│   │   ├── routes.rb
│   │   └── initializers/
│   │       └── cors.rb
│   ├── spec/
│   │   └── requests/
│   │       └── health_spec.rb
│   ├── Dockerfile
│   ├── Gemfile
│   └── README.md
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/
│   │       └── (shadcn components)
│   ├── lib/
│   │   └── utils/
│   │       └── cn.ts
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## Environment Variables

### Backend (.env.example)

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/daybreak_development

# Rails
RAILS_ENV=development
SECRET_KEY_BASE=generate-with-rails-secret
RAILS_MASTER_KEY=your-master-key

# CORS
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.example)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1

# App
NEXT_PUBLIC_APP_ENV=development
```

---

## Definition of Done

- [ ] Rails backend starts and serves health endpoint
- [ ] Next.js frontend starts and renders home page
- [ ] Docker Compose starts full local environment
- [ ] CI pipeline runs tests on pull requests
- [ ] CD pipeline deploys to Aptible on merge to main
- [ ] Production URLs are accessible with valid SSL
- [ ] README documentation complete for new developers
- [ ] All code follows project-rules.md conventions

---

## Estimated Duration

**5-7 days** for a single developer, accounting for:
- Initial setup and configuration: 2 days
- Docker and CI/CD: 2 days
- Aptible deployment and debugging: 1-2 days
- Documentation and polish: 1 day

---

## Next Phase

Upon completion, proceed to **Phase 1: MVP - Core Onboarding Flow** to implement the user identification, basic onboarding screens, and authentication system.

