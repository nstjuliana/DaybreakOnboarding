# syntax=docker/dockerfile:1
#
# Dockerfile for Daybreak Onboarding Frontend
#
# Multi-stage build for Next.js 14 application.
# Optimized for production deployment on Aptible.
#
# Build: docker build -t daybreak-frontend .
# Run:   docker run -p 3001:3000 daybreak-frontend
#

# ==============================================================================
# Stage 1: Dependencies - Install all npm packages
# ==============================================================================
FROM node:20-alpine AS deps

# Add libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# ==============================================================================
# Stage 2: Builder - Build the Next.js application
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build argument for API URL (must be set at build time for NEXT_PUBLIC_* vars)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Build the application
RUN npm run build

# ==============================================================================
# Stage 3: Runner - Production image
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next && \
    chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]

# ==============================================================================
# Stage 4: Development image
# ==============================================================================
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies for development
RUN apk add --no-cache libc6-compat git

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies including devDependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]


