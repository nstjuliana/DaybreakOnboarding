# Daybreak Onboarding Frontend

Next.js 14 frontend for the Parent Onboarding AI application.

## Overview

This is a React application built with Next.js 14 using:

- **App Router** with Server Components
- **Tailwind CSS** for styling
- **shadcn/ui** for accessible components
- **TypeScript** for type safety
- **React Hook Form** with Zod validation

## Requirements

- Node.js 20+
- Docker (recommended for development)

## Quick Start with Docker

The easiest way to run the frontend is with Docker Compose from the project root:

```powershell
# From project root
docker compose up frontend
```

The application will be available at http://localhost:3001

## Local Development Setup

If you prefer to run without Docker:

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3001 in your browser.

## Environment Variables

Copy `.env.example` to `.env.local`:

```powershell
Copy-Item .env.example .env.local
```

Key variables:
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api/v1)
- `NEXT_PUBLIC_APP_ENV` - Application environment

## Available Scripts

```powershell
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npm run typecheck

# Run tests
npm run test
```

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Authentication routes
│   │   ├── (onboarding)/       # Onboarding flow routes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── components/
│   │   └── ui/                 # shadcn/ui components
│   ├── lib/
│   │   ├── api/                # API client
│   │   ├── utils/              # Utility functions
│   │   └── constants/          # Application constants
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── tailwind.config.ts          # Tailwind configuration
└── Dockerfile
```

## Theme

The application uses a custom "Warm Minimalism" theme:

- **Primary Color:** Trust Blue (#2D5A7B)
- **Accent Color:** Hope Amber (#E8B87D)
- **Background:** Warm White (#FAFAF8)
- **Font:** Inter

See `_docs/theme-rules.md` for complete theme specifications.

## Adding Components

To add new shadcn/ui components:

```powershell
npx shadcn@latest add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

## Design Principles

1. **Therapeutic Calm** - Generous whitespace, soft colors
2. **Progressive Disclosure** - One step at a time
3. **Accessibility First** - WCAG AA compliant
4. **Mobile-First** - Responsive design

See `_docs/ui-rules.md` for complete UI guidelines.
