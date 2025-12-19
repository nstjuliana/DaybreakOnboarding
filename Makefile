# Makefile for Parent Onboarding AI
# 
# This Makefile provides common development commands for the project.
# Compatible with Windows PowerShell and Unix-like systems.
#
# Usage: make <target>

.PHONY: dev dev-backend dev-frontend test test-backend test-frontend lint lint-backend lint-frontend \
        db-migrate db-seed db-reset build clean setup help

# Default target
.DEFAULT_GOAL := help

# ============================================================================
# Development
# ============================================================================

## Start all services with Docker Compose
dev:
	docker compose up

## Start all services in detached mode
dev-detached:
	docker compose up -d

## Start Rails backend only
dev-backend:
	docker compose up backend db

## Start Next.js frontend only
dev-frontend:
	docker compose up frontend

## Stop all services
stop:
	docker compose down

## View logs for all services
logs:
	docker compose logs -f

## View backend logs
logs-backend:
	docker compose logs -f backend

## View frontend logs
logs-frontend:
	docker compose logs -f frontend

# ============================================================================
# Testing
# ============================================================================

## Run all tests
test: test-backend test-frontend

## Run Rails backend tests (RSpec)
test-backend:
	docker compose exec backend bundle exec rspec

## Run Next.js frontend tests
test-frontend:
	docker compose exec frontend npm run test

## Run end-to-end tests (Playwright)
test-e2e:
	docker compose exec frontend npm run test:e2e

# ============================================================================
# Code Quality
# ============================================================================

## Run all linters
lint: lint-backend lint-frontend

## Run RuboCop on backend
lint-backend:
	docker compose exec backend bundle exec rubocop

## Run ESLint on frontend
lint-frontend:
	docker compose exec frontend npm run lint

## Run TypeScript type checking
typecheck:
	docker compose exec frontend npm run typecheck

## Auto-format all code
format: format-backend format-frontend

## Auto-format backend code
format-backend:
	docker compose exec backend bundle exec rubocop -A

## Auto-format frontend code
format-frontend:
	docker compose exec frontend npm run format

# ============================================================================
# Database
# ============================================================================

## Run database migrations
db-migrate:
	docker compose exec backend bundle exec rails db:migrate

## Seed the database
db-seed:
	docker compose exec backend bundle exec rails db:seed

## Reset database (drop, create, migrate, seed)
db-reset:
	docker compose exec backend bundle exec rails db:reset

## Create database
db-create:
	docker compose exec backend bundle exec rails db:create

## Drop database
db-drop:
	docker compose exec backend bundle exec rails db:drop

## Open Rails console
console:
	docker compose exec backend bundle exec rails console

## Open database console
db-console:
	docker compose exec backend bundle exec rails dbconsole

# ============================================================================
# Build & Setup
# ============================================================================

## Build all Docker images
build:
	docker compose build

## Build without cache
build-clean:
	docker compose build --no-cache

## Initial project setup
setup:
	@echo "Setting up development environment..."
	powershell -ExecutionPolicy Bypass -File scripts/setup-dev.ps1

## Install backend dependencies
install-backend:
	docker compose exec backend bundle install

## Install frontend dependencies
install-frontend:
	docker compose exec frontend npm install

## Clean up Docker resources
clean:
	docker compose down -v --remove-orphans
	docker system prune -f

# ============================================================================
# Production
# ============================================================================

## Build production images
build-prod:
	docker compose -f docker-compose.prod.yml build

## Deploy to Aptible (requires Aptible CLI)
deploy:
	@echo "Deploying to Aptible..."
	@echo "Note: Ensure APTIBLE_USERNAME and APTIBLE_PASSWORD are set"

# ============================================================================
# Utilities
# ============================================================================

## Open a shell in the backend container
shell-backend:
	docker compose exec backend /bin/bash

## Open a shell in the frontend container
shell-frontend:
	docker compose exec frontend /bin/sh

## Check service status
status:
	docker compose ps

## Show this help message
help:
	@echo "Parent Onboarding AI - Development Commands"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development:"
	@echo "  dev             Start all services with Docker Compose"
	@echo "  dev-detached    Start all services in detached mode"
	@echo "  dev-backend     Start Rails backend only"
	@echo "  dev-frontend    Start Next.js frontend only"
	@echo "  stop            Stop all services"
	@echo "  logs            View logs for all services"
	@echo ""
	@echo "Testing:"
	@echo "  test            Run all tests"
	@echo "  test-backend    Run Rails backend tests (RSpec)"
	@echo "  test-frontend   Run Next.js frontend tests"
	@echo "  test-e2e        Run end-to-end tests (Playwright)"
	@echo ""
	@echo "Code Quality:"
	@echo "  lint            Run all linters"
	@echo "  lint-backend    Run RuboCop on backend"
	@echo "  lint-frontend   Run ESLint on frontend"
	@echo "  typecheck       Run TypeScript type checking"
	@echo "  format          Auto-format all code"
	@echo ""
	@echo "Database:"
	@echo "  db-migrate      Run database migrations"
	@echo "  db-seed         Seed the database"
	@echo "  db-reset        Reset database (drop, create, migrate, seed)"
	@echo "  console         Open Rails console"
	@echo ""
	@echo "Build & Setup:"
	@echo "  build           Build all Docker images"
	@echo "  setup           Initial project setup"
	@echo "  clean           Clean up Docker resources"
	@echo ""

