# syntax=docker/dockerfile:1
#
# Dockerfile for Daybreak Onboarding Backend
#
# Multi-stage build for Rails 8 API application.
# Optimized for production deployment on Aptible.
#
# Build: docker build -t daybreak-backend .
# Run:   docker run -p 3000:3000 daybreak-backend
#

# ==============================================================================
# Stage 1: Base image with Ruby
# ==============================================================================
FROM ruby:3.3-slim AS base

# Set working directory
WORKDIR /app

# Install base dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Set environment variables
ENV RAILS_ENV=production \
    BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_WITHOUT=development:test

# ==============================================================================
# Stage 2: Build stage - install gems and precompile assets
# ==============================================================================
FROM base AS build

# Install build dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    build-essential \
    git \
    libpq-dev \
    libyaml-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Install gems (lock is optional for fresh builds)
COPY Gemfile ./
COPY Gemfile.lock* ./
RUN bundle install --jobs 4 --retry 3 && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Copy application code
COPY . .

# Precompile bootsnap code for faster boot times
RUN bundle exec bootsnap precompile app/ lib/

# ==============================================================================
# Stage 3: Production image
# ==============================================================================
FROM base AS production

# Create non-root user for security
RUN groupadd --gid 1000 rails && \
    useradd --uid 1000 --gid rails --create-home --shell /bin/bash rails

# Copy built artifacts from build stage
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build --chown=rails:rails /app /app

# Switch to non-root user
USER rails

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start command - database setup and server
CMD ["sh", "-c", "bundle exec rails db:prepare && bundle exec puma -C config/puma.rb"]

# ==============================================================================
# Stage 4: Development image
# ==============================================================================
FROM base AS development

# Install development dependencies
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    build-essential \
    git \
    libpq-dev \
    libyaml-dev \
    pkg-config \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* /var/cache/apt/archives/*

# Reset bundle configuration for development
ENV RAILS_ENV=development \
    BUNDLE_DEPLOYMENT=0 \
    BUNDLE_WITHOUT=""

# Copy Gemfile (lock is optional for fresh builds)
COPY Gemfile ./
COPY Gemfile.lock* ./

# Install all gems including dev/test
RUN bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Create directories for Rails
RUN mkdir -p tmp/pids tmp/cache tmp/sockets log storage

# Expose port
EXPOSE 3000

# Default command for development
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0", "-p", "3000"]

