# UI Rules

## Overview

This document defines the UI design principles and patterns for the Parent Onboarding AI application. These rules ensure a consistent, accessible, and emotionally supportive user experience across all phases of the onboarding flow.

---

## Core Design Philosophy

### The "Funnel of Trust"

Our UI must transform a moment of vulnerability into a moment of hope. Users arrive stressed, confused, and often afraid. Every design decision should:

1. **Reduce anxiety** rather than add to it
2. **Build confidence** in the care their child will receive
3. **Simplify decisions** without being patronizing
4. **Validate emotions** without dwelling on them

---

## Design Principles

### 1. Therapeutic Calm

**Principle:** The interface should feel like a calm, supportive environment—not a clinical form or a corporate website.

**Rules:**
- Use generous whitespace (minimum 24px between major sections)
- Limit visual elements per screen to reduce cognitive load
- Avoid visual clutter: one primary action per view
- Use soft, rounded corners (never sharp edges)
- Animations should be subtle and purposeful (no bouncing, spinning, or attention-grabbing effects)
- Background should feel warm and inviting, not stark white

**Anti-patterns:**
- ❌ Dense forms with many fields visible at once
- ❌ Bright, saturated colors competing for attention
- ❌ Pop-ups, modals, or interstitials that interrupt flow
- ❌ Progress bars that create pressure or urgency

---

### 2. Progressive Disclosure

**Principle:** Show only what's needed, when it's needed. Complexity should unfold gradually.

**Rules:**
- One question or topic per screen in the AI chatbot
- Form sections should expand/collapse based on relevance
- Use "Continue" buttons rather than showing all steps at once
- Hide advanced options behind "More options" or expandable sections
- Error messages appear only after user interaction (not on page load)
- Loading states should be calm, not anxiety-inducing

**Implementation:**
```
Phase 0 → Phase 1 → Phase 1.5 → Phase 2 → Phase 3 → Phase 4
   ↓          ↓          ↓          ↓          ↓          ↓
1 choice  1 message  3 questions  Chat flow  Forms     Calendar
```

---

### 3. Trust Architecture

**Principle:** Every visual element should reinforce that Daybreak is professional, competent, and trustworthy.

**Rules:**
- Use consistent visual language across all phases
- Display security indicators where appropriate (not excessive)
- Show real clinician photos with warm, approachable expressions
- Include trust signals naturally (not as badges or banners)
- Typography should feel professional but not cold
- Avoid stock photography that feels generic or inauthentic

**Trust Signals:**
- HIPAA compliance mention (footer, not prominent)
- Clinician credentials displayed clearly
- "Your information is secure" microcopy where relevant
- Real testimonials (if available)

---

### 4. Emotional Validation

**Principle:** Acknowledge the user's emotional state without being saccharine or dismissive.

**Rules:**
- Microcopy should normalize the experience ("Many parents feel this way")
- Use second person ("you") to create direct connection
- Avoid clinical jargon unless necessary
- Success states should celebrate progress without being over-the-top
- Error states should be gentle and solution-focused
- Never blame the user for mistakes

**Microcopy Examples:**
```
✅ "It's okay to not have all the answers right now."
✅ "You're taking an important step for your family."
✅ "Let's figure this out together."

❌ "Error: Invalid input"
❌ "You must complete this field"
❌ "Warning: This action cannot be undone"
```

---

### 5. Accessibility First

**Principle:** Accessible design is good design. Build for everyone from the start.

**Rules:**
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Target contrast ratio: 7:1 (WCAG AAA) where possible
- Touch targets: minimum 44×44px on mobile
- Focus states must be clearly visible
- All interactive elements must be keyboard accessible
- No information conveyed by color alone
- Form labels must be visible (not placeholder-only)
- Error messages must be associated with their fields
- Support reduced motion preferences

**Testing Checklist:**
- [ ] Screen reader navigable
- [ ] Keyboard-only navigation works
- [ ] Passes automated accessibility scan
- [ ] Color contrast verified
- [ ] Focus order is logical
- [ ] Zoom to 200% doesn't break layout

---

### 6. Mobile-Native Thinking

**Principle:** Design for mobile first; desktop is the enhancement.

**Rules:**
- Single-column layouts as default
- Touch-friendly spacing between interactive elements
- Bottom-aligned primary actions (thumb-reachable)
- Avoid hover-dependent interactions
- Use bottom sheets instead of centered modals on mobile
- Minimize typing with smart defaults and selection options
- Support native input types (date pickers, phone keyboards)

---

## Component Patterns

### Buttons

| Type | Usage | Visual Treatment |
|------|-------|------------------|
| **Primary** | Main action per screen | Filled, high contrast |
| **Secondary** | Alternative actions | Outlined or soft fill |
| **Ghost** | Tertiary actions | Text only with hover state |
| **Destructive** | Dangerous actions | Muted red, requires confirmation |

**Rules:**
- One primary button per view
- Button text should be action-oriented ("Continue", "Save Progress", "Book Appointment")
- Minimum height: 48px (mobile), 44px (desktop)
- Full-width on mobile, auto-width on desktop
- Loading states should replace text with spinner + "Processing..."
- Disabled states should be clearly distinguishable but not invisible

---

### Forms

**Layout:**
- Single column for all form layouts
- Labels above inputs (not beside)
- Group related fields visually
- 16px minimum gap between fields
- 24px gap between field groups

**Inputs:**
- Height: 48px minimum
- Border radius: 8px
- Clear focus state with primary color ring
- Placeholder text is supplementary, not primary label
- Error messages below field, not in tooltip

**Validation:**
- Validate on blur, not on every keystroke
- Show success state for valid fields (subtle checkmark)
- Error messages should explain how to fix, not just what's wrong

```
✅ "Please enter a valid email address (example@domain.com)"
❌ "Invalid email"
```

---

### Cards

**Usage:** Container for grouped information or selectable options

**Rules:**
- Background: white or slightly elevated from page background
- Border radius: 12-16px
- Padding: 24px (mobile), 32px (desktop)
- Shadow: subtle elevation (not harsh drop shadows)
- Interactive cards should have clear hover/focus states
- Selection state should be obvious (border, background change, checkmark)

---

### Progress Indicators

**Usage:** Show users where they are in the onboarding flow

**Rules:**
- Horizontal stepper for desktop
- Simplified indicator for mobile (current phase only or minimal dots)
- Show: completed, current, upcoming states
- Don't show exact step counts that create pressure
- Use checkmarks for completed phases
- Current phase should be visually prominent

**Pattern:**
```
[✓ Identify] → [● Assess] → [○ Details] → [○ Schedule]
```

---

### AI Chat Interface

**Layout:**
- Full-width message bubbles with max-width constraint
- Clear visual distinction between user and AI messages
- AI messages: left-aligned, brand color accent
- User messages: right-aligned, neutral color
- Typing indicator when AI is "thinking"

**Rules:**
- AI avatar should feel warm, not robotic
- Messages should appear with subtle fade-in
- Quick-reply chips for common responses
- Scroll to latest message automatically
- "Save and continue later" always accessible
- Crisis resources visible but not intrusive

---

### Modals & Dialogs

**Usage:** Confirmations, important information, focused tasks

**Rules:**
- Use sparingly—prefer inline content when possible
- On mobile: full-screen or bottom sheet
- On desktop: centered with backdrop
- Always include a clear close action
- Trap focus within modal when open
- Close on backdrop click and Escape key

---

### Navigation

**Header:**
- Logo (links to start)
- Progress indicator (when in flow)
- Save & Exit option
- Help/Support access

**Rules:**
- Minimal navigation during onboarding flow
- Don't distract with links to other sections
- Back button should be obvious and functional
- Exit should prompt to save progress

---

## User-Type Specific Adjustments

While maintaining brand consistency, subtle adjustments for each user path:

### Parent/Guardian Path
- Imagery: diverse families, parent-child moments
- Tone: supportive, empowering
- Emphasis: "for your child", "your family"

### Self-Seeking Minor Path
- Imagery: teens, young people, peers (not childish)
- Tone: direct, non-judgmental, peer-like
- Language: simpler, avoid clinical terms
- Emphasis: autonomy, privacy, "your choice"

### Concerned Friend Path
- Imagery: friendship, support
- Tone: collaborative, guiding
- Emphasis: "someone you care about", "how to help"

---

## Responsive Breakpoints

| Breakpoint | Name | Target Devices |
|------------|------|----------------|
| < 640px | `sm` | Mobile phones |
| 640px - 768px | `md` | Large phones, small tablets |
| 768px - 1024px | `lg` | Tablets |
| 1024px - 1280px | `xl` | Laptops |
| > 1280px | `2xl` | Desktops |

**Mobile-First Rules:**
- Default styles are mobile
- Use `sm:`, `md:`, `lg:` to add complexity
- Test on actual devices, not just browser resize

---

## Animation & Motion

### Principles
- Motion should be **subtle** and **purposeful**
- Use motion to:
  - Guide attention
  - Show state changes
  - Create continuity between views
- Never use motion that:
  - Draws attention away from content
  - Creates urgency or pressure
  - Could trigger motion sensitivity

### Timing
| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | 150-200ms | ease-out |
| Page transitions | 200-300ms | ease-in-out |
| Expanding content | 200-250ms | ease-out |
| Loading states | continuous | linear |

### Reduced Motion
Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Error Handling

### Error Message Guidelines
- Be specific about what went wrong
- Explain how to fix it
- Use a calm, helpful tone
- Don't blame the user

### Visual Treatment
- Error color: muted red (not aggressive)
- Icon: subtle warning indicator
- Position: below the relevant field
- Don't use red for the entire input border (accessibility)

### Examples
```
Field Error:
"Please enter your email address so we can save your progress."

Form Error:
"A few things need your attention before we continue."

System Error:
"Something went wrong on our end. Your progress has been saved. 
Please try again, or contact support if this continues."
```

---

## Loading States

### Principles
- Never leave users wondering if something is happening
- Use reassuring messages, not just spinners
- Indicate progress when possible

### Patterns
| Context | Treatment |
|---------|-----------|
| Page load | Skeleton screens (not spinners) |
| Form submission | Button shows loading state |
| AI response | Typing indicator with calming message |
| File upload | Progress bar with percentage |

### AI Loading Messages
Rotate through reassuring messages:
- "Taking a moment to understand..."
- "Thinking about the best way to help..."
- "Almost there..."

---

## Empty States

When there's no content to show:

**Rules:**
- Provide context for why it's empty
- Suggest an action if appropriate
- Use friendly, supportive illustration
- Don't make the user feel they did something wrong

---

## Do's and Don'ts Summary

### Do ✅
- Use generous whitespace
- Keep one primary action per screen
- Validate emotions with supportive microcopy
- Design mobile-first
- Test with real users in emotional states
- Provide clear feedback for every action
- Make progress saving obvious and reliable

### Don't ❌
- Overwhelm with dense forms or too many options
- Use urgent or pressuring language
- Rely on color alone to convey meaning
- Use clinical jargon without explanation
- Create dead ends or confusing navigation
- Hide important actions behind menus
- Use animations that feel playful or energetic

---

## Quality Checklist

Before shipping any UI:

- [ ] Single primary action is clear
- [ ] Mobile experience tested on real device
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Loading states implemented
- [ ] Error states designed
- [ ] Empty states designed
- [ ] Microcopy reviewed for tone
- [ ] Contrast ratios verified
- [ ] Touch targets are 44px+
- [ ] Reduced motion respected
- [ ] Save/resume functionality works

