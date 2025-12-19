# Phase 2: AI Integration & Screener

## Overview

This phase transforms the static screener from Phase 1 into an AI-powered conversational experience. The LLM chatbot will administer clinical screeners in a natural, empathetic manner while implementing critical safety features like crisis detection.

**Outcome:** Users interact with an AI chatbot that guides them through screening questions conversationally, with real-time crisis detection and appropriate safety pivots.

---

## Prerequisites

- Phase 1 completed (MVP deployed)
- OpenAI API access configured
- Crisis detection requirements reviewed
- Safety resources compiled (988 Lifeline, etc.)

---

## Deliverables

| Deliverable | Description |
|-------------|-------------|
| AI Chat Interface | Conversational UI for screener |
| LLM Integration | OpenAI GPT-4 with LangChain orchestration |
| Triage Pulse | Phase 1.5 routing based on initial responses |
| Crisis Detection | Real-time safety signal monitoring |
| Safety Pivot | Emergency resource display and human support option |
| Streaming Responses | Real-time AI response streaming |
| Session Persistence | Server-side chat history storage |

---

## Features

### 1. Chat Interface UI

Build the conversational interface for the AI-administered screener.

**Steps:**
1. Create ChatContainer component with message list and input area
2. Implement ChatMessage component with AI/User styling differentiation
3. Add TypingIndicator component for AI response streaming
4. Create QuickReplies component for suggested response options
5. Add auto-scroll and accessibility features (ARIA live regions)

**Acceptance Criteria:**
- Messages display in chronological order
- AI messages visually distinct from user messages
- Typing indicator shows during AI response
- Quick reply buttons work for common responses
- Keyboard accessible and screen reader friendly

**Files to Create:**
```
frontend/
├── components/chat/
│   ├── chat-container.tsx
│   ├── chat-message.tsx
│   ├── chat-input.tsx
│   ├── typing-indicator.tsx
│   └── quick-replies.tsx
└── app/(onboarding)/
    └── phase-2/
        └── page.tsx (updated)
```

---

### 2. LLM Service Integration

Integrate OpenAI GPT-4 with LangChain for conversation management.

**Steps:**
1. Install and configure langchainrb and ruby-openai gems
2. Create ScreenerChatService with system prompt for clinical screening
3. Implement conversation memory with sliding window (last 10 exchanges)
4. Add response streaming via Server-Sent Events
5. Create prompt templates for each screener type (PHQ-9A, SCARED, PSC-17)

**Acceptance Criteria:**
- AI maintains conversation context across messages
- Responses are empathetic and age-appropriate
- AI stays on-topic (screening questions)
- Streaming provides smooth typing effect
- Token usage tracked per session

**Files to Create:**
```
backend/
├── app/services/ai/
│   ├── screener_chat_service.rb
│   ├── prompt_builder.rb
│   └── conversation_memory.rb
├── app/controllers/api/v1/
│   └── chat_controller.rb
├── config/initializers/
│   └── openai.rb
└── lib/prompts/
    ├── screener_system.txt
    ├── phq9a_context.txt
    └── psc17_context.txt
```

---

### 3. Phase 1.5: Triage Pulse

Implement the routing layer that directs users to appropriate screeners.

**Steps:**
1. Create Phase 1.5 page with area-of-concern selection cards
2. Implement pulse-check questions (3 quick questions)
3. Build routing logic to determine appropriate screener
4. Store routing decision for analytics
5. Smooth transition to Phase 2 with selected screener

**Acceptance Criteria:**
- Users can select concern area (Mood, Anxiety, Behavior, etc.)
- OR answer 3 pulse-check questions
- System routes to correct screener based on input
- Routing decision logged for later analysis
- Clear explanation of why specific questions are asked

**Routing Logic:**
```
Mood selected → PHQ-9A (Depression)
Anxiety selected → SCARED (Anxiety)
Behavior selected → PSC-17 (Behavioral)
Not sure → PSC-17 (Broadband)
Multiple concerns → PSC-17 + Secondary screener
```

**Files to Create:**
```
frontend/
├── app/(onboarding)/
│   └── phase-1-5/
│       └── page.tsx
├── components/onboarding/
│   ├── concern-selector.tsx
│   └── pulse-questions.tsx
└── lib/utils/
    └── screener-router.ts
```

```
backend/
├── app/services/assessments/
│   └── routing_service.rb
└── app/models/
    └── assessment.rb (add screener_type routing)
```

---

### 4. Crisis Detection Service

Implement real-time monitoring for high-risk signals during conversation.

**Steps:**
1. Create CrisisDetector service with keyword/phrase matching
2. Add sentiment analysis via OpenAI for nuanced detection
3. Implement risk scoring (low, medium, high, critical)
4. Create turn-by-turn monitoring hook in chat service
5. Log all crisis detections for clinical review

**Acceptance Criteria:**
- Keywords like "suicide", "hurt myself", "end it" trigger detection
- Contextual analysis prevents false positives ("I used to feel...")
- Risk score calculated for each message
- Critical risk immediately triggers Safety Pivot
- All detections logged with timestamp and context

**Detection Signals:**
```
CRITICAL: suicide, kill myself, end my life, want to die
HIGH: self-harm, cutting, hurting myself, abuse
MEDIUM: hopeless, worthless, no point, can't go on
LOW: sad, anxious, worried, stressed
```

**Files to Create:**
```
backend/
├── app/services/ai/
│   ├── crisis_detector.rb
│   └── sentiment_analyzer.rb
├── app/models/
│   └── crisis_event.rb
└── db/migrate/
    └── XXXXXX_create_crisis_events.rb
```

---

### 5. Safety Pivot Flow

Create the emergency response flow when crisis is detected.

**Steps:**
1. Create SafetyPivot component with crisis resources
2. Implement soft-stop transition (compassionate handoff)
3. Display 988 Lifeline and other emergency resources
4. Offer option to connect with Daybreak human support
5. Allow user to continue if they indicate safety

**Acceptance Criteria:**
- Transition is gentle, not alarming
- Resources prominently displayed with click-to-call
- Human support option clearly available
- User can indicate they are safe and continue
- Session state preserved if user continues

**Safety Resources:**
```
- 988 Suicide & Crisis Lifeline (call or text)
- Crisis Text Line (text HOME to 741741)
- Emergency: 911
- Daybreak Support: [support number]
```

**Files to Create:**
```
frontend/
├── components/onboarding/
│   ├── safety-pivot.tsx
│   └── crisis-resources.tsx
└── lib/constants/
    └── safety-resources.ts
```

```
backend/
├── app/services/safety/
│   └── pivot_service.rb
└── app/mailers/
    └── crisis_alert_mailer.rb
```

---

### 6. Streaming Responses

Implement Server-Sent Events for real-time AI response streaming.

**Steps:**
1. Create SSE endpoint for chat streaming (`GET /api/v1/chat/stream`)
2. Implement EventSource handling in frontend
3. Add token-by-token rendering in chat UI
4. Handle connection errors and reconnection
5. Implement abort/cancel functionality

**Acceptance Criteria:**
- AI responses appear word-by-word (typing effect)
- No noticeable delay between tokens
- Connection errors handled gracefully
- User can cancel long responses
- Works on mobile browsers

**Files to Create:**
```
frontend/
├── hooks/
│   └── use-chat-stream.ts
└── lib/api/
    └── stream-client.ts
```

```
backend/
├── app/controllers/api/v1/
│   └── chat_controller.rb (add stream action)
└── lib/
    └── sse_renderer.rb
```

---

### 7. Conversation Persistence

Store chat history server-side for resume and clinical review.

**Steps:**
1. Create Conversation and Message models
2. Link conversations to assessments
3. Store messages with sender, content, metadata, timestamp
4. Implement conversation resume on return
5. Add clinical review interface (admin only)

**Acceptance Criteria:**
- All messages stored with assessment ID
- Conversation resumes from last message on return
- Metadata includes crisis flags, screener progress
- Admin can view conversation history
- HIPAA-compliant storage (encrypted at rest)

**Files to Create:**
```
backend/
├── app/models/
│   ├── conversation.rb
│   └── message.rb
├── db/migrate/
│   ├── XXXXXX_create_conversations.rb
│   └── XXXXXX_create_messages.rb
└── app/controllers/api/v1/
    └── conversations_controller.rb
```

---

### 8. Screener Question Extraction

Enable AI to extract structured responses from conversation.

**Steps:**
1. Create ResponseExtractor service using function calling
2. Define JSON schema for screener responses
3. Implement extraction after each question answered
4. Store extracted responses in assessment
5. Calculate running score as questions complete

**Acceptance Criteria:**
- AI recognizes when user answers a screener question
- Responses extracted to structured format (question_id, value)
- Partial progress stored (user can resume mid-screener)
- Running score updates in real-time
- Handles ambiguous responses (asks for clarification)

**Example Extraction:**
```json
{
  "question_id": "phq9a_q1",
  "question": "Little interest or pleasure in doing things",
  "response_text": "I feel that way almost every day",
  "extracted_value": 3,
  "confidence": 0.95
}
```

**Files to Create:**
```
backend/
├── app/services/ai/
│   └── response_extractor.rb
└── app/models/
    └── screener_response.rb
```

---

### 9. Assessment Completion & Fit Determination

Process completed assessments and determine service fit.

**Steps:**
1. Create AssessmentAnalyzeService for scoring and interpretation
2. Implement fit determination logic based on scores
3. Generate summary for clinician review
4. Route to Phase 3 (good fit) or Off-Ramp (not a fit)
5. Store results with clinical context

**Acceptance Criteria:**
- Scores calculated correctly per screener guidelines
- Fit determination follows clinical thresholds
- Not-a-fit users see Resource Referral screen
- Good-fit users proceed to Phase 3
- Results include severity level and recommendations

**Fit Criteria:**
```
Good Fit: Mild to moderate symptoms, no imminent risk
Not a Fit: Severe symptoms requiring higher level of care,
           active crisis, specialized needs outside scope
```

**Files to Create:**
```
backend/
├── app/services/assessments/
│   ├── analyze_service.rb
│   └── fit_determinator.rb
└── app/controllers/api/v1/
    └── assessments_controller.rb (add analyze action)
```

```
frontend/
├── app/(onboarding)/
│   └── off-ramp/
│       └── page.tsx
└── components/onboarding/
    └── resource-referral.tsx
```

---

### 10. Background Job Processing

Move LLM calls to background jobs for reliability.

**Steps:**
1. Create ProcessChatJob for handling LLM requests
2. Implement job queuing for concurrent users
3. Add retry logic with exponential backoff
4. Create job status tracking endpoint
5. Handle timeout and failure scenarios

**Acceptance Criteria:**
- LLM calls don't block request cycle
- Jobs retry on transient failures
- Users see appropriate loading state
- Failed jobs trigger fallback (retry prompt)
- Job status visible in GoodJob dashboard

**Files to Create:**
```
backend/
├── app/jobs/
│   ├── process_chat_job.rb
│   └── analyze_assessment_job.rb
└── config/initializers/
    └── good_job.rb (update queues)
```

---

## File Structure After Phase 2

```
frontend/
├── app/(onboarding)/
│   ├── phase-1-5/page.tsx
│   ├── phase-2/page.tsx (AI chat)
│   └── off-ramp/page.tsx
├── components/
│   └── chat/
│       ├── chat-container.tsx
│       ├── chat-message.tsx
│       ├── chat-input.tsx
│       ├── typing-indicator.tsx
│       └── quick-replies.tsx
│   └── onboarding/
│       ├── safety-pivot.tsx
│       └── resource-referral.tsx
└── hooks/
    └── use-chat-stream.ts

backend/
├── app/
│   ├── controllers/api/v1/
│   │   ├── chat_controller.rb
│   │   └── conversations_controller.rb
│   ├── models/
│   │   ├── conversation.rb
│   │   ├── message.rb
│   │   └── crisis_event.rb
│   ├── services/
│   │   └── ai/
│   │       ├── screener_chat_service.rb
│   │       ├── crisis_detector.rb
│   │       ├── response_extractor.rb
│   │       └── prompt_builder.rb
│   │   └── assessments/
│   │       ├── analyze_service.rb
│   │       └── fit_determinator.rb
│   └── jobs/
│       ├── process_chat_job.rb
│       └── analyze_assessment_job.rb
└── lib/prompts/
    ├── screener_system.txt
    └── crisis_response.txt
```

---

## Definition of Done

- [ ] AI chatbot administers screener conversationally
- [ ] Triage Pulse routes to appropriate screener
- [ ] Crisis detection identifies high-risk signals
- [ ] Safety Pivot displays with appropriate resources
- [ ] Responses stream in real-time
- [ ] Conversation persists across sessions
- [ ] Fit determination routes users correctly
- [ ] Off-ramp provides helpful resources
- [ ] All LLM calls processed via background jobs
- [ ] Crisis events logged for clinical review

---

## Estimated Duration

**12-16 days** for a single developer:
- Chat UI components: 3 days
- LLM integration and streaming: 3-4 days
- Crisis detection and safety pivot: 3-4 days
- Triage Pulse and routing: 2 days
- Assessment analysis and fit: 2-3 days
- Testing and refinement: 2 days

---

## Next Phase

Upon completion, proceed to **Phase 3: Insurance, Matching & Scheduling** to implement insurance capture (including OCR), clinician matching algorithm, and appointment scheduling.

