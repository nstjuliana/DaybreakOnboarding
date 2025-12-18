Based on the Technical Requirements in the Project Overview and the features outlined in the user flow, here are my stack recommendations. I've organized them by category with an industry standard and popular alternative for each.

---

## Stack Recommendations

### Already Decided
| Component | Choice |
|-----------|--------|
| Backend Framework | Ruby on Rails |
| Database | PostgreSQL |

---

### 1. Frontend Framework

**PRD Specifies:** Next.js

| Option | Description |
|--------|-------------|
| **Industry Standard: Next.js** | React-based framework with SSR/SSG, API routes, and excellent performance. Strong ecosystem, great for SEO, and pairs well with Rails API backends. Ideal for the multi-phase onboarding flow with its file-based routing. |
| **Alternative: Remix** | Full-stack React framework focused on web standards and progressive enhancement. Better form handling out-of-box, excellent accessibility defaults. Newer but gaining traction. |

**Considerations for this project:**
- Next.js has more mature HIPAA-compliant deployment patterns
- Both support the phased user journey well
- Next.js has larger community for troubleshooting

---

### 2. API Layer

**PRD Specifies:** GraphQL

| Option | Description |
|--------|-------------|
| **Industry Standard: GraphQL (via graphql-ruby gem)** | Flexible querying, reduces over-fetching. Great for complex data relationships (users, assessments, clinicians, appointments). Single endpoint simplifies frontend data fetching. |
| **Alternative: REST with JSON:API** | Simpler to implement, easier caching, more straightforward debugging. Rails has excellent REST conventions built-in. JSON:API spec provides standardization. |

**Considerations for this project:**
- GraphQL shines with the varied data needs across user types (parent vs minor vs friend paths)
- REST may be simpler for MVP, easier for junior developers
- GraphQL requires additional security considerations for HIPAA

---

### 3. AI/LLM Integration

**PRD Specifies:** "Agnostic AI models"

| Option | Description |
|--------|-------------|
| **Industry Standard: OpenAI API (GPT-4)** | Most mature, best documentation, widest adoption. Strong at conversational interactions needed for the screener chatbot. BAA available for HIPAA compliance. |
| **Alternative: Anthropic Claude API** | Strong safety focus (important for mental health context), excellent at following nuanced instructions, constitutional AI approach. BAA available. |

**Considerations for this project:**
- Mental health context requires careful guardrails—Claude's safety focus may be advantageous
- OpenAI has more established healthcare use cases
- Consider an abstraction layer (LangChain or custom) to remain "agnostic"

---

### 4. LLM Orchestration/Abstraction

| Option | Description |
|--------|-------------|
| **Industry Standard: LangChain (via langchainrb gem)** | Provider-agnostic LLM abstraction, built-in prompt management, conversation memory, and chain-of-thought patterns. Active community. |
| **Alternative: Custom abstraction layer** | Build a thin wrapper around LLM APIs directly. Simpler, fewer dependencies, full control. Easier to audit for HIPAA compliance. |

**Considerations for this project:**
- LangChain provides quick scaffolding for the conversational screener
- Custom layer offers more control over data handling (PHI concerns)
- Safety Pivot logic may be easier to implement with custom approach

---

### 5. Real-time Communication (Support Chat)

| Option | Description |
|--------|-------------|
| **Industry Standard: Action Cable (Rails built-in)** | Native Rails WebSocket support, integrates seamlessly with Rails auth and models. No additional infrastructure needed. |
| **Alternative: Pusher or Ably** | Managed WebSocket services, easier scaling, built-in presence detection. Offloads infrastructure complexity. Both offer HIPAA-compliant tiers. |

**Considerations for this project:**
- Action Cable is sufficient for P1 support chat feature
- Managed services reduce DevOps burden but add cost and external dependency
- 1000 concurrent users is well within Action Cable's capability

---

### 6. Authentication

| Option | Description |
|--------|-------------|
| **Industry Standard: Devise (Rails gem)** | Battle-tested Rails authentication. Modular, extensible, handles sessions, password recovery, confirmations. Large community support. |
| **Alternative: Rodauth** | More modern, security-focused alternative. Better defaults, cleaner architecture, built-in multi-factor auth. Growing adoption. |

**Considerations for this project:**
- Need to support three user types with different permissions
- Anonymous/semi-authenticated flows for self-seeking minors
- Both can handle HIPAA requirements with proper configuration

---

### 7. Authorization (Role Management)

| Option | Description |
|--------|-------------|
| **Industry Standard: Pundit** | Simple, Ruby-object-based policies. Easy to understand, test, and audit. Maps well to the three user type paths. |
| **Alternative: CanCanCan** | Centralized ability definitions, more Rails-magic approach. Good for simpler permission structures. |

**Considerations for this project:**
- Three distinct user paths (Parent, Minor, Friend) need clear authorization
- Pundit's explicit policies are easier to audit for compliance

---

### 8. File Storage (Insurance Cards)

**PRD Specifies:** AWS S3

| Option | Description |
|--------|-------------|
| **Industry Standard: AWS S3 with Active Storage** | Rails-native integration, mature, reliable. S3 offers HIPAA-eligible storage with proper configuration (encryption, access logging). |
| **Alternative: Google Cloud Storage** | Comparable features, potentially simpler IAM. Also HIPAA-eligible. Good if using other GCP services. |

**Considerations for this project:**
- S3 aligns with PRD and Aptible hosting
- Must enable encryption at rest and in transit for HIPAA
- Active Storage handles direct uploads well for insurance card images

---

### 9. OCR Service (Insurance Card Extraction)

| Option | Description |
|--------|-------------|
| **Industry Standard: AWS Textract** | Purpose-built for document extraction, handles insurance cards well. Integrates naturally with S3. HIPAA-eligible. |
| **Alternative: Google Document AI** | Strong accuracy, specialized processors for insurance cards. May have edge in complex card layouts. HIPAA-compliant with BAA. |

**Considerations for this project:**
- Both handle the P1 image-to-text insurance feature well
- Textract aligns with existing AWS stack
- Consider fallback to manual entry (already in user flow)

---

### 10. Background Jobs

| Option | Description |
|--------|-------------|
| **Industry Standard: Sidekiq** | Redis-backed, fast, reliable. Handles async tasks like email sending, OCR processing, LLM calls. Pro/Enterprise versions add features. |
| **Alternative: GoodJob** | PostgreSQL-backed (no Redis needed). Simpler infrastructure, good for smaller scale. Native Rails integration. |

**Considerations for this project:**
- LLM calls should be async (3-second response requirement)
- Sidekiq is proven at scale
- GoodJob reduces infrastructure complexity (no Redis)

---

### 11. Caching Layer

| Option | Description |
|--------|-------------|
| **Industry Standard: Redis** | Fast in-memory store. Used for caching, session storage, Sidekiq backend. Mature Rails integration. |
| **Alternative: PostgreSQL + Solid Cache (Rails 8)** | Use existing Postgres for caching. Simpler infrastructure, fewer moving parts. New in Rails but production-ready. |

**Considerations for this project:**
- Redis is standard if using Sidekiq
- Solid Cache reduces dependencies if using GoodJob
- Session storage needs careful HIPAA consideration

---

### 12. Hosting/Deployment

**PRD Specifies:** Aptible

| Option | Description |
|--------|-------------|
| **Industry Standard: Aptible** | HIPAA-compliant PaaS built for healthcare. Handles compliance controls, audit logging, encryption. Docker-based deployments. |
| **Alternative: AWS with HIPAA controls** | More flexibility, potentially lower cost at scale. Requires more DevOps expertise to maintain compliance. Use ECS or EKS for containers. |

**Considerations for this project:**
- Aptible significantly reduces HIPAA compliance burden
- AWS offers more control but more responsibility
- PRD specifies Aptible—recommend staying with it

---

### 13. CSS/Styling Framework

| Option | Description |
|--------|-------------|
| **Industry Standard: Tailwind CSS** | Utility-first CSS, rapid development, highly customizable. Great for the "calm visual design" requirement. Works well with Next.js. |
| **Alternative: CSS Modules + Design System** | Scoped CSS, no framework lock-in. Build custom design tokens for the specific emotional tone needed. More upfront work. |

**Considerations for this project:**
- Tailwind accelerates building the multi-phase UI
- Custom design system offers more control over "calm visual language"
- shadcn/ui (Tailwind-based) provides accessible component primitives

---

### 14. UI Component Library

| Option | Description |
|--------|-------------|
| **Industry Standard: shadcn/ui** | Copy-paste accessible components built on Radix UI primitives. Tailwind-styled, highly customizable. Not a dependency—you own the code. |
| **Alternative: Radix UI + custom styling** | Unstyled accessible primitives only. Full design control, no visual opinions. More work to style but complete flexibility. |

**Considerations for this project:**
- WCAG compliance is required—both options provide accessible primitives
- shadcn/ui speeds development while allowing customization
- "Calm visual language" may benefit from custom styling either way

---

### 15. Form Handling (Frontend)

| Option | Description |
|--------|-------------|
| **Industry Standard: React Hook Form** | Performant, minimal re-renders, great validation. Handles complex multi-step forms well (perfect for phased onboarding). |
| **Alternative: Formik** | More established, React-centric. Slightly more verbose but very readable. Large community. |

**Considerations for this project:**
- Multi-phase forms with save/resume need robust form state
- React Hook Form's performance advantage matters for mobile users
- Both integrate well with validation libraries (Zod, Yup)

---

### 16. Calendar/Scheduling

| Option | Description |
|--------|-------------|
| **Industry Standard: Custom implementation with date-fns** | Build scheduling UI with a date library. Full control over availability logic, matching algorithm, and UX. |
| **Alternative: Cal.com (embed or API)** | Open-source scheduling platform. Embed or use API for clinician availability. Reduces development time significantly. |

**Considerations for this project:**
- "Limited self-scheduling" needs custom matching logic
- Cal.com handles availability but may not fit the AI-assisted matching
- Custom likely needed for clinician-patient matching algorithm

---

### 17. Email Service

| Option | Description |
|--------|-------------|
| **Industry Standard: SendGrid** | Reliable transactional email, good deliverability, templates. HIPAA-compliant with BAA. |
| **Alternative: Postmark** | Focused on transactional email, excellent deliverability, simpler pricing. Also offers BAA for HIPAA. |

**Considerations for this project:**
- Confirmation emails, resume links, reminders all require reliable delivery
- Both are solid choices with HIPAA compliance available

---

### 18. Testing

**PRD Specifies:** Postman for API testing

| Option | Description |
|--------|-------------|
| **Industry Standard: RSpec + Capybara (Rails) / Jest + Playwright (Next.js)** | RSpec for Rails unit/integration tests, Capybara for system tests. Jest for React, Playwright for E2E. |
| **Alternative: Minitest (Rails) / Vitest + Cypress (Next.js)** | Minitest is Rails-native, faster. Vitest is Vite-native. Cypress has better DX for E2E but slower than Playwright. |

**Considerations for this project:**
- RSpec is Rails community standard
- Playwright recommended for testing multi-step onboarding flows
- Postman/Newman for API contract testing as specified

---

## Summary Table

| Category | PRD Specified | Industry Standard | Alternative |
|----------|---------------|-------------------|-------------|
| Backend | Ruby on Rails | ✓ (decided) | — |
| Database | PostgreSQL | ✓ (decided) | — |
| Frontend | Next.js | Next.js | Remix |
| API Layer | GraphQL | graphql-ruby | REST + JSON:API |
| LLM Provider | Agnostic | OpenAI GPT-4 | Anthropic Claude |
| LLM Orchestration | — | LangChain (langchainrb) | Custom abstraction |
| Real-time | — | Action Cable | Pusher/Ably |
| Authentication | — | Devise | Rodauth |
| Authorization | — | Pundit | CanCanCan |
| File Storage | AWS S3 | S3 + Active Storage | Google Cloud Storage |
| OCR | — | AWS Textract | Google Document AI |
| Background Jobs | — | Sidekiq | GoodJob |
| Caching | — | Redis | Solid Cache (Postgres) |
| Hosting | Aptible | Aptible | AWS (ECS/EKS) |
| CSS Framework | — | Tailwind CSS | CSS Modules |
| UI Components | — | shadcn/ui | Radix UI |
| Forms | — | React Hook Form | Formik |
| Scheduling | — | Custom + date-fns | Cal.com |
| Email | — | SendGrid | Postmark |
| Testing | Postman | RSpec + Playwright | Minitest + Cypress |

---

[2 tools called]

Done! I've created `_docs/tech-stack.md` with the finalized stack. Here's a quick summary of the key decisions:

## Final Stack Summary

| Category | Choice |
|----------|--------|
| **Backend** | Ruby on Rails 8 |
| **Database** | PostgreSQL |
| **Frontend** | Next.js |
| **API** | REST |
| **Caching** | Solid Cache (PostgreSQL-backed) |
| **Background Jobs** | GoodJob (PostgreSQL-backed) |
| **LLM** | OpenAI GPT-4 + LangChain |
| **Auth** | Devise + Pundit |
| **Real-time** | Action Cable |
| **Storage** | AWS S3 + Active Storage |
| **OCR** | AWS Textract |
| **Hosting** | Aptible |
| **UI** | Tailwind CSS + shadcn/ui |
| **Forms** | React Hook Form |
| **Email** | SendGrid |
| **Testing** | RSpec + Playwright |

**Notable benefit of your choices:** By using Solid Cache and GoodJob (both PostgreSQL-backed), you eliminate Redis as a dependency entirely. This simplifies infrastructure—PostgreSQL handles data, caching, and job queues all in one place.