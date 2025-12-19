# Daybreak Onboarding Backend

Rails 8 API backend for the Parent Onboarding AI application.

## Overview

This is a REST API built with Ruby on Rails 8 in API-only mode. It provides:

- Health check endpoint for monitoring
- HIPAA-compliant parameter filtering
- PostgreSQL database with UUID primary keys
- GoodJob for background processing
- Solid Cache for caching (Rails 8)
- Rate limiting with Rack::Attack

## Requirements

- Ruby 3.3.0
- PostgreSQL 15+
- Docker (recommended for development)

## Quick Start with Docker

The easiest way to run the backend is with Docker Compose from the project root:

```powershell
# From project root
docker compose up backend db
```

The API will be available at http://localhost:3000

## Local Development Setup

If you prefer to run without Docker:

```powershell
# Install dependencies
bundle install

# Setup database
rails db:create db:migrate db:seed

# Start server
rails server -p 3000
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```powershell
Copy-Item .env.example .env
```

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `FRONTEND_URL` - Frontend origin for CORS
- `SECRET_KEY_BASE` - Rails secret (generate with `rails secret`)

## API Endpoints

### Health Check

```
GET /api/v1/health
```

Returns system health status:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "0.1.0",
  "environment": "development",
  "services": {
    "database": "ok",
    "cache": "ok"
  }
}
```

## Testing

```powershell
# Run all tests
bundle exec rspec

# Run with coverage
COVERAGE=true bundle exec rspec

# Run specific tests
bundle exec rspec spec/requests/
```

## Code Quality

```powershell
# Run RuboCop
bundle exec rubocop

# Auto-fix issues
bundle exec rubocop -A

# Security scan
bundle exec brakeman
```

## Directory Structure

```
backend/
├── app/
│   ├── controllers/api/v1/    # API controllers
│   ├── models/                # ActiveRecord models
│   ├── services/              # Business logic (POROs)
│   ├── jobs/                  # Background jobs
│   ├── mailers/               # Email templates
│   ├── policies/              # Pundit authorization
│   └── serializers/           # JSON serializers
├── config/
│   ├── environments/          # Environment configs
│   └── initializers/          # Rails initializers
├── db/
│   └── migrate/               # Database migrations
├── spec/
│   ├── requests/              # Request specs
│   ├── models/                # Model specs
│   └── services/              # Service specs
└── Dockerfile
```

## HIPAA Compliance

This backend is configured for HIPAA compliance:

- **Parameter Filtering**: PII/PHI filtered from logs
- **Encryption**: TLS required in production
- **Session Timeout**: 15-minute timeout
- **Audit Logging**: All changes tracked
- **Rate Limiting**: Prevents abuse

See `_docs/tech-stack.md` for full compliance details.

