# Tech Stack

## Overview

This document defines the technology stack for the Parent Onboarding AI application. Choices are guided by the PRD Technical Requirements, HIPAA compliance needs, and alignment with the user flow architecture.

Each section includes best practices, limitations, conventions, and common pitfalls to guide implementation.

---

## Core Stack

| Layer | Technology | Version/Notes |
|-------|------------|---------------|
| **Backend Framework** | Ruby on Rails | Rails 8 |
| **Database** | PostgreSQL | Primary data store |
| **Frontend Framework** | Next.js | React-based with SSR/SSG |
| **API Layer** | REST | JSON responses, Rails conventions |

---

## Backend

### Ruby on Rails 8

Full-stack web framework with REST API conventions, handling authentication, authorization, and business logic.

#### Best Practices

- **Fat Models, Skinny Controllers**: Keep controllers focused on HTTP concerns; move business logic to models or service objects
- **Service Objects**: Extract complex business logic into POROs (Plain Old Ruby Objects) in `app/services/`
- **Form Objects**: Use form objects for complex form handling that spans multiple models
- **Query Objects**: Encapsulate complex database queries in dedicated classes
- **Concerns**: Use sparingly for truly shared behavior; avoid as a dumping ground
- **Background Jobs**: Always use async jobs for external API calls (LLM, OCR, email)
- **Strong Parameters**: Always use `params.require().permit()` for mass assignment protection
- **Database Transactions**: Wrap related database operations in transactions
- **Eager Loading**: Use `includes()` or `preload()` to avoid N+1 queries

```ruby
# Good: Service object pattern
class Assessment::CreateService
  def initialize(user:, screener_responses:)
    @user = user
    @screener_responses = screener_responses
  end

  def call
    ActiveRecord::Base.transaction do
      assessment = @user.assessments.create!(status: :pending)
      process_responses(assessment)
      determine_fit(assessment)
      assessment
    end
  end
end
```

#### Conventions

- **Naming**: Controllers plural (`UsersController`), models singular (`User`)
- **File Structure**: Follow Rails conventions exactly—don't reorganize `app/` directories
- **Routes**: Use resourceful routes; avoid custom routes when RESTful alternatives exist
- **Migrations**: One concern per migration; never modify existing migrations after deployment
- **Environment Config**: Use `Rails.application.credentials` for secrets, never commit `.env` files
- **API Versioning**: Namespace under `/api/v1/` from the start

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users, only: [:create, :show, :update]
      resources :assessments, only: [:create, :show]
      resources :appointments, only: [:create, :index]
    end
  end
end
```

#### Limitations

- **Concurrency**: Rails uses a thread-per-request model; CPU-bound tasks block the thread
- **Memory**: Rails apps typically consume 200-500MB+ RAM per process
- **Boot Time**: Cold starts can be slow (5-15 seconds); impacts serverless deployments
- **Monolith Tendency**: Easy to create tightly coupled code without discipline

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **N+1 Queries** | Use `includes()`, install `bullet` gem to detect in development |
| **Callback Hell** | Avoid `after_save` callbacks that trigger more saves; use service objects |
| **God Models** | Extract behavior into concerns, service objects, or new models |
| **Slow Tests** | Use `let!` sparingly, avoid hitting the database when possible |
| **Missing Indexes** | Always add indexes for foreign keys and frequently queried columns |
| **Blocking External Calls** | Never call external APIs synchronously in request cycle |
| **Secret Exposure** | Never log params that might contain PII/PHI; filter in `config/initializers/filter_parameter_logging.rb` |

```ruby
# config/initializers/filter_parameter_logging.rb
Rails.application.config.filter_parameters += [
  :password, :ssn, :insurance_number, :date_of_birth,
  :health_information, :diagnosis, :screener_responses
]
```

---

### PostgreSQL

Primary relational database, also used for caching (Solid Cache) and background jobs (GoodJob).

#### Best Practices

- **Connection Pooling**: Configure pool size based on Puma workers × threads
- **Indexes**: Add indexes for all foreign keys, unique constraints, and frequently filtered columns
- **Partial Indexes**: Use for queries that filter on specific values
- **JSONB**: Use for flexible schema data (screener responses); add GIN indexes for querying
- **UUIDs**: Consider for primary keys to prevent ID enumeration attacks (important for HIPAA)
- **Encryption**: Enable Transparent Data Encryption (TDE) at rest; use `pgcrypto` for column-level encryption
- **Query Analysis**: Use `EXPLAIN ANALYZE` regularly; monitor slow query log

```ruby
# migration with proper indexing
class CreateAssessments < ActiveRecord::Migration[8.0]
  def change
    create_table :assessments, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :status, null: false, default: 'pending'
      t.jsonb :screener_responses, default: {}
      t.jsonb :results, default: {}
      t.timestamps
    end

    add_index :assessments, :status
    add_index :assessments, :screener_responses, using: :gin
    add_index :assessments, [:user_id, :created_at]
  end
end
```

#### Conventions

- **Naming**: Snake_case for tables and columns
- **Timestamps**: Always include `created_at` and `updated_at`
- **Soft Deletes**: Use `discarded_at` column (via `discard` gem) for HIPAA audit trails
- **Enums**: Store as strings, not integers, for readability and safety

#### Limitations

- **Connection Limits**: Default 100 connections; plan for multiple app instances
- **Horizontal Scaling**: Read replicas are straightforward; write scaling requires sharding
- **Full-Text Search**: Built-in FTS is good but not as feature-rich as Elasticsearch
- **JSONB Queries**: Complex JSONB queries can be slow without proper indexing

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Connection Exhaustion** | Use PgBouncer or reduce pool size; monitor active connections |
| **Missing Foreign Key Constraints** | Always add `foreign_key: true` in migrations |
| **Integer Overflow** | Use `bigint` for IDs on tables expected to grow large |
| **Unoptimized Queries** | Enable `pg_stat_statements` extension for query analysis |
| **Lock Contention** | Avoid long transactions; use `SKIP LOCKED` for job queues |
| **No Backup Testing** | Regularly test backup restoration; Aptible handles this |

---

## Frontend

### Next.js

React-based framework for the onboarding UI with server-side rendering capabilities.

#### Best Practices

- **App Router**: Use the App Router (not Pages Router) for new projects
- **Server Components**: Default to Server Components; only use Client Components when needed
- **Streaming**: Use `loading.tsx` and Suspense for progressive loading
- **Route Groups**: Organize routes with `(group)` folders without affecting URL structure
- **Parallel Routes**: Use `@slot` for complex layouts (e.g., modal over page)
- **Server Actions**: Use for form submissions instead of API routes when possible
- **Image Optimization**: Always use `next/image` for automatic optimization
- **Metadata**: Use the Metadata API for SEO and accessibility

```typescript
// app/onboarding/[phase]/page.tsx
import { Suspense } from 'react';
import { PhaseContent } from './phase-content';
import { PhaseSkeleton } from './phase-skeleton';

export default function OnboardingPhase({ 
  params 
}: { 
  params: { phase: string } 
}) {
  return (
    <div className="onboarding-container">
      <Suspense fallback={<PhaseSkeleton />}>
        <PhaseContent phase={params.phase} />
      </Suspense>
    </div>
  );
}
```

#### Conventions

- **File Structure**: 
  - `app/` - Routes and layouts
  - `components/` - Reusable UI components
  - `lib/` - Utilities, API clients, helpers
  - `hooks/` - Custom React hooks
  - `types/` - TypeScript type definitions
- **Naming**: 
  - Components: PascalCase (`AssessmentForm.tsx`)
  - Utilities: camelCase (`formatDate.ts`)
  - Routes: kebab-case folders (`onboarding-phase/`)
- **Client Components**: Add `'use client'` directive at the top of files that need interactivity

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (onboarding)/
│   ├── layout.tsx
│   ├── phase-0/
│   ├── phase-1/
│   └── phase-2/
├── api/
│   └── [...]/
├── layout.tsx
└── page.tsx
components/
├── ui/           # shadcn components
├── forms/        # Form components
└── onboarding/   # Feature-specific
```

#### Limitations

- **Bundle Size**: Easy to accidentally ship large client bundles; monitor with `@next/bundle-analyzer`
- **Hydration Mismatches**: Server/client HTML must match exactly
- **Learning Curve**: App Router patterns differ significantly from Pages Router
- **Build Times**: Large apps can have slow builds; use Turbopack in development
- **Caching Complexity**: App Router caching is powerful but complex to understand

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Hydration Errors** | Avoid `Date.now()` or `Math.random()` in initial render; use `useEffect` |
| **Client Component Bloat** | Keep `'use client'` boundary as low as possible in component tree |
| **Waterfall Requests** | Use parallel data fetching with `Promise.all()` |
| **Missing Loading States** | Always add `loading.tsx` for async routes |
| **Stale Data** | Understand caching; use `revalidatePath()` or `revalidateTag()` |
| **Large Dependencies in Server Components** | Heavy libraries should only be in Client Components |
| **Environment Variable Exposure** | Only `NEXT_PUBLIC_*` vars are available client-side |

```typescript
// ❌ Bad: This causes hydration mismatch
function BadComponent() {
  return <span>Time: {Date.now()}</span>;
}

// ✅ Good: Handle dynamic content in useEffect
function GoodComponent() {
  const [time, setTime] = useState<number | null>(null);
  
  useEffect(() => {
    setTime(Date.now());
  }, []);
  
  return <span>Time: {time ?? 'Loading...'}</span>;
}
```

---

### Tailwind CSS

Utility-first CSS framework for rapid UI development.

#### Best Practices

- **Design Tokens**: Define custom colors, spacing, fonts in `tailwind.config.js`
- **Component Extraction**: Extract repeated patterns into components, not `@apply` classes
- **Responsive Design**: Mobile-first approach; use `sm:`, `md:`, `lg:` breakpoints
- **Dark Mode**: Use `dark:` variant with CSS variables for theming
- **Custom Utilities**: Use plugins for project-specific utilities
- **Purging**: Ensure all template paths are in `content` array

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Calm visual language colors
        'daybreak': {
          'calm': '#E8F4F8',
          'trust': '#2D5A7B',
          'hope': '#7BA3BC',
          'safe': '#F5F9FA',
        },
      },
      fontFamily: {
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

#### Conventions

- **Class Order**: Follow consistent ordering (layout → spacing → typography → colors → effects)
- **Arbitrary Values**: Use sparingly; prefer extending theme config
- **State Variants**: Order as `hover:` → `focus:` → `active:` → `disabled:`
- **Group/Peer**: Use for parent/sibling state-based styling

#### Limitations

- **HTML Verbosity**: Long class strings can reduce readability
- **No Runtime Styles**: Cannot generate classes dynamically at runtime
- **Learning Curve**: Requires memorizing utility class names
- **Design Constraints**: Can encourage "utility soup" without design system discipline

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Duplicate Styles** | Extract into components, not `@apply` chains |
| **Missing Content Paths** | Styles not applying? Check `content` array in config |
| **Dynamic Classes Not Working** | Tailwind can't detect `bg-${color}-500`; use complete class names |
| **Overriding Component Libraries** | Use `!important` modifier (`!text-red-500`) sparingly |
| **Large Production Bundle** | Ensure purging is configured correctly |

```typescript
// ❌ Bad: Dynamic class generation doesn't work
function BadButton({ color }: { color: string }) {
  return <button className={`bg-${color}-500`}>Click</button>;
}

// ✅ Good: Use complete class names with mapping
const colorClasses = {
  blue: 'bg-blue-500 hover:bg-blue-600',
  green: 'bg-green-500 hover:bg-green-600',
};

function GoodButton({ color }: { color: 'blue' | 'green' }) {
  return <button className={colorClasses[color]}>Click</button>;
}
```

---

### shadcn/ui

Accessible component primitives built on Radix UI, styled with Tailwind.

#### Best Practices

- **Copy, Don't Install**: Components are copied to your codebase—you own them
- **Customize Freely**: Modify components to match your design system
- **Maintain Accessibility**: Don't remove ARIA attributes or keyboard handling
- **Use Variants**: Leverage the `class-variance-authority` pattern for component variants
- **Compound Components**: Use Radix patterns for complex components

```typescript
// components/ui/button.tsx - customized for Daybreak
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-daybreak-trust text-white hover:bg-daybreak-trust/90',
        secondary: 'bg-daybreak-calm text-daybreak-trust hover:bg-daybreak-calm/80',
        ghost: 'hover:bg-daybreak-safe',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-12 px-8 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

#### Conventions

- **Component Location**: Keep in `components/ui/` directory
- **Naming**: Match shadcn naming conventions for consistency
- **Exports**: Re-export from `components/ui/index.ts` for clean imports
- **Primitives**: Import Radix primitives directly for advanced customization

#### Limitations

- **Not a Package**: No automatic updates; you maintain the code
- **Learning Curve**: Understanding Radix patterns takes time
- **Bundle Size**: Each component adds to bundle; only add what you need

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Breaking Accessibility** | Never remove `aria-*` attributes or keyboard handlers |
| **Style Conflicts** | Use CSS variables for theming, not direct Tailwind overrides |
| **Missing Dependencies** | Components may require multiple Radix packages |
| **Inconsistent Customization** | Maintain a single source of truth for variants |

---

### React Hook Form

Performant form handling for multi-step onboarding.

#### Best Practices

- **Zod Integration**: Use `@hookform/resolvers/zod` for type-safe validation
- **Uncontrolled by Default**: Let RHF manage inputs; avoid unnecessary `useState`
- **Form Context**: Use `FormProvider` for nested form components
- **Field Arrays**: Use `useFieldArray` for dynamic fields (e.g., multiple children)
- **Watch Sparingly**: `watch()` causes re-renders; use `useWatch` in isolated components
- **Mode Selection**: Use `mode: 'onBlur'` or `mode: 'onChange'` based on UX needs

```typescript
// Multi-step form with Zod validation
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const assessmentSchema = z.object({
  userType: z.enum(['parent', 'minor', 'friend']),
  concernAreas: z.array(z.string()).min(1, 'Select at least one area'),
  responses: z.record(z.number().min(0).max(4)),
});

type AssessmentForm = z.infer<typeof assessmentSchema>;

function OnboardingForm() {
  const methods = useForm<AssessmentForm>({
    resolver: zodResolver(assessmentSchema),
    mode: 'onBlur',
    defaultValues: {
      userType: undefined,
      concernAreas: [],
      responses: {},
    },
  });

  const onSubmit = async (data: AssessmentForm) => {
    // Handle submission
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* Multi-step form content */}
      </form>
    </FormProvider>
  );
}
```

#### Conventions

- **Schema Co-location**: Define Zod schemas next to form components
- **Error Display**: Use `formState.errors` with consistent error components
- **Default Values**: Always provide `defaultValues` for predictable behavior
- **Reset Behavior**: Use `reset()` with new values when loading saved data

#### Limitations

- **Complex Nested Forms**: Deep nesting can be cumbersome
- **Server-Side Validation**: Client-side only; always validate on server too
- **File Inputs**: Requires special handling for file uploads

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Unnecessary Re-renders** | Use `useWatch` in isolated child components |
| **Lost Form State** | Store in context or persist to localStorage for save/resume |
| **Validation Timing** | Match `mode` to user expectations (onBlur vs onChange) |
| **Type Mismatches** | Use `zodResolver` with inferred types from schema |
| **Uncontrolled to Controlled** | Don't mix RHF with `value`/`onChange` props |

---

## API Layer

### REST API

Standard Rails resource-based routing with JSON responses.

#### Best Practices

- **Consistent Response Format**: Use a standard envelope for all responses
- **HTTP Status Codes**: Use appropriate codes (200, 201, 400, 401, 403, 404, 422, 500)
- **Pagination**: Implement for all list endpoints from the start
- **Versioning**: Always version the API (`/api/v1/`)
- **Error Handling**: Return structured error objects
- **Rate Limiting**: Implement using `rack-attack` gem

```ruby
# Standard response format
module Api
  module V1
    class BaseController < ApplicationController
      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity

      private

      def render_success(data, status: :ok)
        render json: { success: true, data: data }, status: status
      end

      def render_error(message, errors: [], status: :unprocessable_entity)
        render json: { 
          success: false, 
          error: message, 
          errors: errors 
        }, status: status
      end

      def not_found
        render_error('Resource not found', status: :not_found)
      end

      def unprocessable_entity(exception)
        render_error(
          'Validation failed',
          errors: exception.record.errors.full_messages,
          status: :unprocessable_entity
        )
      end
    end
  end
end
```

#### Conventions

- **Resource Naming**: Plural nouns (`/users`, `/assessments`)
- **HTTP Methods**: GET (read), POST (create), PATCH (update), DELETE (destroy)
- **Nested Resources**: Max one level deep (`/users/:id/assessments`)
- **Query Parameters**: Use for filtering, sorting, pagination

**Key Endpoints Structure:**
```
GET    /api/v1/users/:id
POST   /api/v1/users
PATCH  /api/v1/users/:id

POST   /api/v1/assessments
GET    /api/v1/assessments/:id
PATCH  /api/v1/assessments/:id

GET    /api/v1/screeners/:type
POST   /api/v1/screeners/:type/responses

GET    /api/v1/clinicians
GET    /api/v1/clinicians/:id/availability

POST   /api/v1/appointments
GET    /api/v1/appointments/:id

POST   /api/v1/insurance/verify
POST   /api/v1/insurance/upload
```

#### Limitations

- **Over/Under Fetching**: Unlike GraphQL, clients get fixed response shapes
- **Multiple Round Trips**: Complex UIs may need several API calls
- **Documentation**: Requires manual documentation effort (use OpenAPI/Swagger)

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Inconsistent Responses** | Use a base controller with standard methods |
| **Missing Pagination** | Add from day one; retrofitting is painful |
| **Verb-Based Routes** | `/api/v1/users/login` → POST `/api/v1/sessions` |
| **Sensitive Data in Logs** | Filter parameters in Rails config |
| **No Rate Limiting** | Implement with `rack-attack` before launch |

---

## AI/LLM Integration

### OpenAI API (GPT-4)

Powers the conversational screener chatbot with natural language understanding.

#### Best Practices

- **System Prompts**: Define clear role and boundaries in system message
- **Streaming**: Use streaming responses for better perceived performance
- **Temperature**: Use low temperature (0.3-0.5) for consistent clinical assessments
- **Token Management**: Track usage; implement hard limits per session
- **Retry Logic**: Implement exponential backoff for rate limits
- **Content Filtering**: Pre-filter user input; post-filter model output
- **Conversation History**: Maintain context but limit to relevant messages

```ruby
# app/services/screener_chat_service.rb
class ScreenerChatService
  SYSTEM_PROMPT = <<~PROMPT
    You are a compassionate mental health screening assistant for Daybreak Health.
    Your role is to guide users through standardized screening questions in a 
    conversational, non-judgmental manner.
    
    IMPORTANT BOUNDARIES:
    - Never provide diagnoses or medical advice
    - If user expresses crisis (suicide, self-harm), immediately activate safety protocol
    - Stay focused on the screening questions
    - Use empathetic, age-appropriate language
    - Do not discuss topics outside mental health screening
  PROMPT

  def initialize(assessment:)
    @assessment = assessment
    @client = OpenAI::Client.new
  end

  def process_message(user_message)
    # Pre-filter for crisis signals
    if crisis_detected?(user_message)
      return safety_pivot_response
    end

    response = @client.chat(
      parameters: {
        model: 'gpt-4',
        messages: build_messages(user_message),
        temperature: 0.4,
        max_tokens: 500,
        stream: true,
      }
    )

    # Post-filter response
    filter_response(response)
  end

  private

  def crisis_detected?(message)
    CrisisDetector.analyze(message).high_risk?
  end

  def safety_pivot_response
    {
      type: 'safety_pivot',
      message: "I hear that you're going through something really difficult...",
      resources: SafetyResources.immediate
    }
  end
end
```

#### Conventions

- **Async Processing**: Always call LLM APIs via background jobs
- **Timeout Handling**: Set reasonable timeouts (30s) with graceful fallbacks
- **Cost Tracking**: Log token usage per user/session for billing awareness
- **Model Versioning**: Pin to specific model versions in production

#### Limitations

- **Latency**: API calls take 1-10+ seconds depending on complexity
- **Cost**: GPT-4 is expensive; monitor and optimize token usage
- **Hallucinations**: Model may generate plausible but incorrect information
- **Context Window**: Limited to ~8K-128K tokens depending on model
- **Rate Limits**: Implement queuing for high traffic

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Blocking Request Cycle** | Always use background jobs for LLM calls |
| **Prompt Injection** | Sanitize user input; use system prompt boundaries |
| **Runaway Costs** | Set per-user/per-session token limits |
| **No Fallback** | Have graceful degradation if API is down |
| **Inconsistent Responses** | Lower temperature; use structured output format |
| **Missing Safety Checks** | Implement both pre and post content filtering |

---

### LangChain (langchainrb gem)

LLM abstraction layer for provider flexibility and conversation management.

#### Best Practices

- **Chain Composition**: Build modular chains for different screener phases
- **Memory Management**: Use appropriate memory type (buffer, summary, etc.)
- **Prompt Templates**: Externalize prompts for easy iteration
- **Output Parsing**: Define structured output formats
- **Provider Abstraction**: Configure to swap LLM providers easily

```ruby
# app/services/screener_chain.rb
class ScreenerChain
  def initialize(screener_type:)
    @llm = Langchain::LLM::OpenAI.new(
      api_key: Rails.application.credentials.openai_api_key,
      default_options: { temperature: 0.4, chat_model: 'gpt-4' }
    )
    
    @memory = Langchain::Memory::ConversationBufferWindowMemory.new(
      llm: @llm,
      k: 10  # Keep last 10 exchanges
    )
    
    @prompt = load_prompt(screener_type)
  end

  def chat(user_input)
    @memory.add_user_message(user_input)
    
    response = @llm.chat(
      messages: @memory.messages,
      system: @prompt
    )
    
    @memory.add_ai_message(response.chat_completion)
    response.chat_completion
  end
end
```

#### Limitations

- **Abstraction Overhead**: Additional layer may complicate debugging
- **Version Compatibility**: Ruby gem may lag behind Python version features
- **Memory Consumption**: Conversation memory grows over time

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Memory Leaks** | Implement memory windowing or summarization |
| **Over-Abstraction** | Use LangChain for complex chains; direct API for simple calls |
| **Debugging Difficulty** | Add extensive logging at each chain step |

---

## Authentication & Authorization

### Devise

Rails authentication solution handling registration, login, and session management.

#### Best Practices

- **JWT for API**: Use `devise-jwt` gem for stateless API authentication
- **Secure Defaults**: Enable `:lockable`, `:timeoutable`, `:trackable` modules
- **Password Policy**: Enforce strong passwords (length, complexity)
- **Email Confirmation**: Require for parent accounts; consider skip for minors
- **Session Management**: Short session timeouts for HIPAA compliance
- **Audit Logging**: Log all authentication events

```ruby
# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable, :recoverable,
         :rememberable, :validatable, :confirmable, :lockable,
         :timeoutable, :trackable, :jwt_authenticatable,
         jwt_revocation_strategy: JwtDenylist

  # HIPAA-compliant password requirements
  validates :password, 
    length: { minimum: 12 },
    format: { 
      with: /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+\z/,
      message: 'must include uppercase, lowercase, number, and special character'
    },
    if: :password_required?
end

# config/initializers/devise.rb
Devise.setup do |config|
  config.timeout_in = 15.minutes  # HIPAA: short session timeout
  config.lock_strategy = :failed_attempts
  config.maximum_attempts = 5
  config.password_length = 12..128
end
```

#### Conventions

- **Custom Controllers**: Inherit from Devise controllers for customization
- **View Customization**: Generate views with `rails generate devise:views`
- **Route Scoping**: Use `devise_for :users, path: 'auth'`

#### Limitations

- **API Complexity**: Devise is session-focused; JWT requires additional setup
- **Customization Learning Curve**: Override hooks can be confusing
- **Multi-Tenancy**: Requires additional gems/configuration

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Session Fixation** | Devise handles this by default; don't disable |
| **Password Reset Security** | Use short-lived tokens (2 hours max) |
| **Email Enumeration** | Use `paranoid` mode in config |
| **Token Leakage in Logs** | Filter `:reset_password_token` in logs |
| **Missing HTTPS** | Always require HTTPS in production |

---

### Pundit

Policy-based authorization with clear, auditable permission logic.

#### Best Practices

- **One Policy Per Model**: Keep policies focused and testable
- **Policy Scopes**: Use scopes for filtering collections
- **Fail Closed**: Default to denying access
- **Explicit Authorization**: Call `authorize` in every controller action
- **Testing**: Write policy specs for every policy method

```ruby
# app/policies/assessment_policy.rb
class AssessmentPolicy < ApplicationPolicy
  def show?
    owner? || clinician_assigned?
  end

  def update?
    owner? && record.editable?
  end

  def view_results?
    owner? || clinician_assigned? || admin?
  end

  class Scope < Scope
    def resolve
      case user.role
      when 'admin'
        scope.all
      when 'clinician'
        scope.where(clinician_id: user.id)
      else
        scope.where(user_id: user.id)
      end
    end
  end

  private

  def owner?
    record.user_id == user.id
  end

  def clinician_assigned?
    user.clinician? && record.clinician_id == user.id
  end
end

# app/controllers/api/v1/assessments_controller.rb
class Api::V1::AssessmentsController < Api::V1::BaseController
  def show
    @assessment = Assessment.find(params[:id])
    authorize @assessment
    render_success(@assessment)
  end

  def index
    @assessments = policy_scope(Assessment)
    render_success(@assessments)
  end
end
```

#### Conventions

- **Naming**: `ModelPolicy` with methods matching controller actions
- **Location**: `app/policies/` directory
- **Base Policy**: Define `ApplicationPolicy` with common logic

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Forgetting to Authorize** | Use `after_action :verify_authorized` |
| **Missing Policy Scope** | Use `after_action :verify_policy_scoped` for index actions |
| **Complex Conditionals** | Extract to private methods with clear names |
| **God Policy** | Split into role-specific concerns if too large |

---

## Real-time Communication

### Action Cable

Rails-native WebSocket support for the support chat feature.

#### Best Practices

- **Authentication**: Verify user in `ApplicationCable::Connection`
- **Channel Organization**: One channel per feature/concern
- **Message Format**: Use consistent JSON structure
- **Error Handling**: Gracefully handle disconnections
- **Rate Limiting**: Prevent message flooding

```ruby
# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      if (user = User.find_by(id: decoded_token[:user_id]))
        user
      else
        reject_unauthorized_connection
      end
    end

    def decoded_token
      JWT.decode(
        request.params[:token],
        Rails.application.credentials.secret_key_base
      ).first.symbolize_keys
    rescue JWT::DecodeError
      reject_unauthorized_connection
    end
  end
end

# app/channels/support_chat_channel.rb
class SupportChatChannel < ApplicationCable::Channel
  def subscribed
    @conversation = Conversation.find(params[:conversation_id])
    
    if authorized?
      stream_for @conversation
    else
      reject
    end
  end

  def send_message(data)
    message = @conversation.messages.create!(
      user: current_user,
      content: data['content']
    )
    
    SupportChatChannel.broadcast_to(@conversation, {
      type: 'message',
      message: message.as_json
    })
  end

  private

  def authorized?
    @conversation.participants.include?(current_user)
  end
end
```

#### Limitations

- **Horizontal Scaling**: Requires Redis adapter for multi-server deployments
- **Connection Limits**: Each WebSocket holds server resources
- **Mobile Support**: Some mobile browsers have WebSocket limitations

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Memory Leaks** | Properly unsubscribe on disconnect |
| **Missing Authentication** | Always verify user in Connection |
| **Blocking Operations** | Use background jobs for heavy processing |
| **No Reconnection Logic** | Implement client-side reconnection |

---

## Background Processing

### GoodJob

PostgreSQL-backed job queue eliminating Redis dependency.

#### Best Practices

- **Job Design**: Keep jobs small, idempotent, and retryable
- **Concurrency**: Configure based on available database connections
- **Unique Jobs**: Use `good_job_control_concurrency_with` for deduplication
- **Timeouts**: Set `execution_timeout` for long-running jobs
- **Error Handling**: Implement retry strategies with backoff
- **Priority Queues**: Separate critical from background work

```ruby
# app/jobs/process_assessment_job.rb
class ProcessAssessmentJob < ApplicationJob
  queue_as :default
  
  retry_on StandardError, wait: :polynomially_longer, attempts: 5
  discard_on ActiveRecord::RecordNotFound
  
  good_job_control_concurrency_with(
    perform_limit: 1,
    key: -> { "process_assessment_#{arguments.first}" }
  )

  def perform(assessment_id)
    assessment = Assessment.find(assessment_id)
    
    # Process with LLM
    result = ScreenerAnalysisService.new(assessment).analyze
    
    assessment.update!(
      results: result,
      status: :completed,
      completed_at: Time.current
    )
    
    # Notify user
    UserMailer.assessment_complete(assessment).deliver_later
  end
end

# config/initializers/good_job.rb
Rails.application.configure do
  config.good_job.execution_mode = :async
  config.good_job.queues = 'critical:5;default:3;low:1'
  config.good_job.max_threads = 5
  config.good_job.poll_interval = 5
  config.good_job.shutdown_timeout = 25
  
  # Dashboard authentication
  config.good_job.dashboard_enabled = true
end
```

#### Conventions

- **Naming**: `VerbNounJob` (e.g., `ProcessAssessmentJob`, `SendReminderJob`)
- **Queue Names**: `critical`, `default`, `low`, `scheduled`
- **Arguments**: Pass IDs, not full objects (serialization issues)

#### Limitations

- **PostgreSQL Load**: Heavy job processing adds database load
- **No Built-in Scheduling UI**: Use separate scheduler for recurring jobs
- **Monitoring**: Less mature than Sidekiq's monitoring tools

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Passing ActiveRecord Objects** | Pass IDs and reload in job |
| **No Idempotency** | Design jobs to be safely re-runnable |
| **Missing Timeouts** | Set `execution_timeout` for external API calls |
| **Connection Pool Exhaustion** | Match concurrency to pool size |
| **Silent Failures** | Implement error tracking (Sentry, etc.) |

---

## Caching

### Solid Cache (Rails 8)

PostgreSQL-backed caching eliminating Redis dependency.

#### Best Practices

- **Cache Keys**: Use consistent, versioned key patterns
- **Expiration**: Always set expiration; don't rely on LRU alone
- **Fragment Caching**: Cache view partials for complex UI elements
- **Low-Level Caching**: Use for expensive computations/API calls
- **Cache Warming**: Pre-populate critical caches on deploy

```ruby
# config/environments/production.rb
config.cache_store = :solid_cache_store

# app/controllers/api/v1/clinicians_controller.rb
class Api::V1::CliniciansController < Api::V1::BaseController
  def index
    @clinicians = Rails.cache.fetch(
      clinicians_cache_key,
      expires_in: 1.hour
    ) do
      Clinician.active.includes(:specialties).to_a
    end
    
    render_success(@clinicians)
  end

  private

  def clinicians_cache_key
    max_updated = Clinician.maximum(:updated_at)&.to_i || 0
    "clinicians/all/#{max_updated}"
  end
end

# Caching expensive LLM results
class ScreenerAnalysisService
  def analyze
    Rails.cache.fetch(cache_key, expires_in: 24.hours) do
      perform_analysis
    end
  end

  private

  def cache_key
    "analysis/#{@assessment.id}/#{@assessment.responses_hash}"
  end
end
```

#### Conventions

- **Key Patterns**: `model_name/scope/version` or `model_name/id/attribute`
- **Versioning**: Include `updated_at` or content hash in keys
- **Namespacing**: Prefix with feature area for easier invalidation

#### Limitations

- **PostgreSQL Dependency**: Adds load to primary database
- **Not as Fast as Redis**: Slightly higher latency for cache hits
- **No Pub/Sub**: Can't use for real-time cache invalidation signals

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Cache Stampede** | Use `race_condition_ttl` option |
| **Stale Data** | Implement proper cache invalidation on updates |
| **Over-Caching** | Only cache expensive operations |
| **Missing Expiration** | Always set `expires_in` |
| **Key Collisions** | Use specific, namespaced keys |

---

## File Storage

### AWS S3 + Active Storage

Secure file storage for insurance card images and documents.

#### Best Practices

- **Direct Uploads**: Use Active Storage direct uploads to bypass server
- **Encryption**: Enable SSE-S3 or SSE-KMS for HIPAA compliance
- **Bucket Policies**: Restrict access; no public buckets
- **Signed URLs**: Use presigned URLs with short expiration
- **Variants**: Define image variants for thumbnails
- **Content Type Validation**: Validate MIME types server-side

```ruby
# config/storage.yml
amazon:
  service: S3
  access_key_id: <%= Rails.application.credentials.dig(:aws, :access_key_id) %>
  secret_access_key: <%= Rails.application.credentials.dig(:aws, :secret_access_key) %>
  region: us-east-1
  bucket: daybreak-insurance-cards-<%= Rails.env %>
  upload:
    server_side_encryption: 'aws:kms'
    ssekms_key_id: <%= Rails.application.credentials.dig(:aws, :kms_key_id) %>

# app/models/insurance_card.rb
class InsuranceCard < ApplicationRecord
  belongs_to :user
  
  has_one_attached :front_image
  has_one_attached :back_image
  
  validates :front_image, 
    attached: true,
    content_type: ['image/png', 'image/jpeg', 'image/webp'],
    size: { less_than: 10.megabytes }
    
  def front_url
    front_image.url(expires_in: 5.minutes)
  end
end
```

#### Conventions

- **Bucket Naming**: `{app}-{resource}-{environment}`
- **Folder Structure**: `uploads/{model}/{id}/{attachment}/`
- **Lifecycle Policies**: Archive old files to Glacier

#### Limitations

- **Eventual Consistency**: S3 operations may have slight delays
- **Cost**: Storage + request costs add up with many files
- **Large File Handling**: Need multipart upload for files >5GB

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Public Buckets** | Never; always use signed URLs |
| **Missing Encryption** | Enable SSE by default |
| **No Content Validation** | Validate MIME type and file size |
| **Long-Lived URLs** | Short expiration (5-15 minutes) for PHI |
| **CORS Issues** | Configure CORS for direct uploads |

---

## OCR Service

### AWS Textract

Document text extraction for insurance cards.

#### Best Practices

- **Async Processing**: Use `StartDocumentAnalysis` for large documents
- **Confidence Thresholds**: Only accept results above confidence threshold
- **Fallback UI**: Always provide manual entry option
- **Field Mapping**: Map extracted text to expected fields
- **Validation**: Cross-validate extracted data (e.g., member ID format)

```ruby
# app/services/insurance_ocr_service.rb
class InsuranceOcrService
  CONFIDENCE_THRESHOLD = 80

  def initialize(insurance_card:)
    @insurance_card = insurance_card
    @client = Aws::Textract::Client.new
  end

  def extract
    front_result = process_image(@insurance_card.front_image)
    back_result = process_image(@insurance_card.back_image)
    
    {
      provider: extract_field(front_result, :provider),
      member_id: extract_field(front_result, :member_id),
      group_number: extract_field(front_result, :group_number),
      confidence: calculate_overall_confidence(front_result, back_result),
      raw_data: { front: front_result, back: back_result }
    }
  rescue Aws::Textract::Errors::ServiceError => e
    Rails.logger.error("Textract error: #{e.message}")
    { error: 'OCR processing failed', fallback: :manual_entry }
  end

  private

  def process_image(attachment)
    response = @client.analyze_document({
      document: {
        s3_object: {
          bucket: attachment.blob.service.bucket.name,
          name: attachment.blob.key
        }
      },
      feature_types: ['FORMS', 'TABLES']
    })
    
    parse_response(response)
  end

  def extract_field(result, field_type)
    field = result[:fields].find { |f| f[:type] == field_type }
    return nil unless field && field[:confidence] >= CONFIDENCE_THRESHOLD
    
    field[:value]
  end
end
```

#### Limitations

- **Accuracy Variability**: Results depend on image quality
- **Cost**: Per-page pricing can add up
- **Processing Time**: 1-5 seconds per image
- **Format Support**: Best with standard document formats

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Poor Image Quality** | Provide upload guidance; validate image dimensions |
| **Blocking API Calls** | Always process in background job |
| **Missing Fallback** | Always offer manual entry form |
| **No Validation** | Verify extracted data against expected formats |
| **Ignoring Confidence** | Use confidence scores to flag uncertain results |

---

## Email Service

### SendGrid

Transactional email delivery for account and appointment communications.

#### Best Practices

- **Templates**: Use SendGrid dynamic templates for consistency
- **Deliverability**: Authenticate domain (SPF, DKIM, DMARC)
- **Unsubscribe**: Include unsubscribe links (required by law)
- **Bounce Handling**: Process bounce webhooks
- **Testing**: Use sandbox mode in development

```ruby
# config/initializers/sendgrid.rb
ActionMailer::Base.smtp_settings = {
  user_name: 'apikey',
  password: Rails.application.credentials.sendgrid_api_key,
  domain: 'daybreakhealth.com',
  address: 'smtp.sendgrid.net',
  port: 587,
  authentication: :plain,
  enable_starttls_auto: true
}

# app/mailers/appointment_mailer.rb
class AppointmentMailer < ApplicationMailer
  def confirmation(appointment)
    @appointment = appointment
    @user = appointment.user
    @clinician = appointment.clinician
    
    mail(
      to: @user.email,
      subject: 'Your Daybreak Health Appointment is Confirmed',
      template_id: 'd-appointment-confirmation-template-id',
      dynamic_template_data: {
        user_name: @user.first_name,
        clinician_name: @clinician.display_name,
        appointment_date: @appointment.scheduled_at.strftime('%B %d, %Y'),
        appointment_time: @appointment.scheduled_at.strftime('%I:%M %p %Z'),
        telehealth_link: @appointment.telehealth_url
      }
    )
  end
end
```

#### Limitations

- **Rate Limits**: Free tier has daily sending limits
- **Deliverability**: Shared IPs may have reputation issues
- **Template Editing**: Limited template editor in free tier

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Hitting Spam Folders** | Proper authentication; warm up sending |
| **Missing Unsubscribe** | Always include; required for CAN-SPAM |
| **No Bounce Handling** | Set up webhook for bounce processing |
| **Hardcoded Content** | Use templates for easy updates |

---

## Hosting & Infrastructure

### Docker

Containerization for consistent environments and Aptible deployment.

#### Best Practices

- **Multi-Stage Builds**: Separate build and runtime stages
- **Layer Caching**: Order Dockerfile commands by change frequency
- **Non-Root User**: Run application as non-root user
- **.dockerignore**: Exclude unnecessary files
- **Health Checks**: Define container health checks
- **Environment Variables**: Never bake secrets into images

```dockerfile
# Dockerfile
# Stage 1: Build
FROM ruby:3.3-slim AS builder

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle config set --local deployment 'true' && \
    bundle config set --local without 'development test' && \
    bundle install

COPY . .
RUN bundle exec rails assets:precompile

# Stage 2: Runtime
FROM ruby:3.3-slim

RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -s /bin/bash app

WORKDIR /app
USER app

COPY --from=builder --chown=app:app /app /app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
```

#### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| **Large Images** | Use multi-stage builds; slim base images |
| **Running as Root** | Create and use non-root user |
| **Secrets in Image** | Use environment variables at runtime |
| **Missing .dockerignore** | Exclude `node_modules`, `.git`, logs |
| **No Health Check** | Define health check for orchestration |

---

### Aptible

HIPAA-compliant PaaS simplifying compliance burden.

#### Best Practices

- **Environment Isolation**: Separate staging and production accounts
- **Database Encryption**: Enable encryption at rest
- **Log Drains**: Configure for compliance audit trails
- **Backup Verification**: Test restore procedures regularly
- **SSH Access Control**: Limit SSH access to necessary personnel

#### Conventions

- **App Naming**: `daybreak-{service}-{environment}`
- **Environment Variables**: Use Aptible configuration for all secrets
- **Scaling**: Configure containers based on load testing

---

## Testing

### RSpec (Rails)

Behavior-driven testing framework for Rails backend.

#### Best Practices

- **Test Organization**: `spec/models`, `spec/requests`, `spec/services`
- **Factories over Fixtures**: Use FactoryBot for test data
- **Request Specs**: Test API endpoints end-to-end
- **Mocking External Services**: Use VCR for HTTP recordings
- **Database Cleaner**: Use transactions for speed

```ruby
# spec/requests/api/v1/assessments_spec.rb
RSpec.describe 'Api::V1::Assessments', type: :request do
  let(:user) { create(:user) }
  let(:auth_headers) { authenticate(user) }

  describe 'POST /api/v1/assessments' do
    let(:valid_params) do
      {
        assessment: {
          screener_type: 'PHQ9A',
          responses: { q1: 2, q2: 1, q3: 3 }
        }
      }
    end

    it 'creates an assessment' do
      expect {
        post '/api/v1/assessments', 
             params: valid_params, 
             headers: auth_headers
      }.to change(Assessment, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response[:data][:status]).to eq('pending')
    end

    it 'enqueues processing job' do
      expect {
        post '/api/v1/assessments', 
             params: valid_params, 
             headers: auth_headers
      }.to have_enqueued_job(ProcessAssessmentJob)
    end
  end
end
```

### Playwright (Frontend)

End-to-end testing for the onboarding flow.

#### Best Practices

- **Page Object Model**: Encapsulate page interactions
- **Test Isolation**: Each test should be independent
- **Waiting**: Use Playwright's auto-waiting; avoid arbitrary sleeps
- **Screenshots on Failure**: Capture for debugging

```typescript
// e2e/onboarding.spec.ts
import { test, expect } from '@playwright/test';
import { OnboardingPage } from './pages/onboarding-page';

test.describe('Parent Onboarding Flow', () => {
  let onboarding: OnboardingPage;

  test.beforeEach(async ({ page }) => {
    onboarding = new OnboardingPage(page);
    await onboarding.goto();
  });

  test('completes Phase 0: Identification', async () => {
    await onboarding.selectUserType('parent');
    
    await expect(onboarding.heading).toContainText('Welcome');
    await expect(onboarding.progressIndicator).toHaveAttribute(
      'data-phase', 
      '1'
    );
  });

  test('handles save and resume', async ({ page }) => {
    await onboarding.selectUserType('parent');
    await onboarding.completePhase1();
    await onboarding.clickSaveProgress();
    
    // Simulate returning later
    await page.reload();
    await onboarding.enterResumeCode('test@example.com');
    
    await expect(onboarding.progressIndicator).toHaveAttribute(
      'data-phase', 
      '1.5'
    );
  });
});
```

---

## HIPAA Compliance Considerations

| Component | Compliance Measure |
|-----------|-------------------|
| **Aptible** | HIPAA-compliant hosting, BAA included |
| **PostgreSQL** | Encryption at rest, access logging, audit trails |
| **AWS S3** | SSE-KMS encryption, bucket policies, access logging |
| **AWS Textract** | HIPAA-eligible, BAA available |
| **OpenAI** | BAA available for healthcare use |
| **SendGrid** | BAA available |
| **Solid Cache** | Data stays in PostgreSQL (already compliant) |
| **GoodJob** | Data stays in PostgreSQL (already compliant) |
| **Application** | Session timeouts, audit logging, parameter filtering |

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
| **Bullet** | N+1 query detection |
| **Brakeman** | Security vulnerability scanning |

---

## Key Dependencies Summary

### Rails (Gemfile)
```ruby
# Core
gem 'rails', '~> 8.0'
gem 'pg'
gem 'puma'
gem 'solid_cache'
gem 'good_job'

# Authentication & Authorization
gem 'devise'
gem 'devise-jwt'
gem 'pundit'

# API
gem 'jbuilder'
gem 'rack-cors'
gem 'rack-attack'

# AI
gem 'langchainrb'
gem 'ruby-openai'

# File Storage
gem 'aws-sdk-s3'
gem 'aws-sdk-textract'

# Utilities
gem 'discard'  # Soft deletes

# Development & Testing
group :development, :test do
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
  gem 'bullet'
  gem 'brakeman'
end

group :test do
  gem 'vcr'
  gem 'webmock'
  gem 'shoulda-matchers'
end
```

### Next.js (package.json)
```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^3.x",
    "zod": "^3.x",
    "date-fns": "^3.x",
    "@radix-ui/react-dialog": "^1.x",
    "@radix-ui/react-select": "^2.x",
    "@radix-ui/react-tabs": "^1.x",
    "tailwindcss": "^3.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^2.x"
  },
  "devDependencies": {
    "@playwright/test": "^1.x",
    "jest": "^29.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "typescript": "^5.x",
    "@types/react": "^18.x",
    "@types/node": "^20.x",
    "eslint": "^8.x",
    "eslint-config-next": "^14.x",
    "prettier": "^3.x",
    "prettier-plugin-tailwindcss": "^0.5.x"
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

### Recommended CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          bundler-cache: true
      - run: bundle exec rails db:setup
      - run: bundle exec rspec
      - run: bundle exec brakeman -q
      - run: bundle exec rubocop

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
        working-directory: frontend
      - run: npm run lint
        working-directory: frontend
      - run: npm run test
        working-directory: frontend
      - run: npm run build
        working-directory: frontend

  e2e:
    needs: [backend, frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Aptible Deployment Pipeline

For production deployment to Aptible, we use the official `aptible/aptible-deploy-action`:

```yaml
# .github/workflows/deploy.yml (simplified)
- name: Deploy to Aptible
  uses: aptible/aptible-deploy-action@v5
  with:
    type: git
    app: daybreak-api-production
    environment: daybreak-onboarding
    username: ${{ secrets.APTIBLE_USERNAME }}
    password: ${{ secrets.APTIBLE_PASSWORD }}
```

**Monorepo Pattern:** Since backend and frontend are subdirectories, each deploy job:
1. Checks out the full repo
2. Moves the subdirectory contents to workspace root
3. Commits and deploys via the Aptible action

**Required GitHub Secrets:**

| Secret | Description |
|--------|-------------|
| `APTIBLE_USERNAME` | Aptible account email |
| `APTIBLE_PASSWORD` | Aptible account password |

**Aptible Apps:**
- `daybreak-api-production` — Rails backend
- `daybreak-frontend-production` — Next.js frontend
- `daybreak-db` — PostgreSQL database

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

## Next Steps

1. Initialize Rails 8 API application with `rails new backend --api --database=postgresql`
2. Initialize Next.js frontend with `npx create-next-app@latest frontend`
3. Configure Docker Compose for local development
4. Set up Aptible deployment pipeline
5. Configure AWS services (S3, Textract) with HIPAA settings
6. Implement Devise authentication with JWT
7. Build Phase 0 (Identification Lobby) UI
8. Implement save/resume functionality
