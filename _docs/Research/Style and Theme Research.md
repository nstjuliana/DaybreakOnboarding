# Design Principles & Style Recommendations

Based on the project context—a mental health onboarding platform serving stressed, vulnerable users (parents, minors, concerned friends)—here are design principles and style recommendations that align with the goals of building trust, reducing anxiety, and guiding users through a sensitive process.

---

## Core Design Principles

### 1. **Therapeutic Calm**
Users arrive in a heightened emotional state—guilt, fear, uncertainty. The design must actively reduce anxiety, not add to it.

**Application:**
- Generous whitespace to prevent visual overwhelm
- Slow, subtle animations (no jarring transitions)
- Muted, desaturated color palette
- Soft, rounded corners over sharp edges
- Avoid red for errors; use softer alternatives (amber, coral)

---

### 2. **Progressive Disclosure**
The PRD calls for completing onboarding in 15 minutes. Showing too much at once creates cognitive overload and drop-offs.

**Application:**
- One primary action per screen
- Hide complexity until needed (accordion sections, tooltips)
- Phase indicators showing progress without overwhelming detail
- "Breathing room" between form sections
- Questions revealed one at a time in the AI chatbot

---

### 3. **Trust Architecture**
Parents are entrusting their child's mental health to this platform. Every visual choice must reinforce credibility and safety.

**Application:**
- Professional typography (not playful or childish)
- Consistent visual language across all phases
- Clear security indicators (HIPAA badges, encryption mentions)
- Real human faces (clinician photos, team images)
- Testimonials and trust signals integrated naturally

---

### 4. **Emotional Validation**
The research document emphasizes "Bounded Empathy"—the UI should acknowledge feelings without being saccharine.

**Application:**
- Supportive microcopy ("This is a safe space", "Many parents feel this way")
- Warm illustrations showing diverse families
- Success states that celebrate progress ("You're doing great")
- Error messages that are gentle, not accusatory
- Loading states with reassuring messages

---

### 5. **Accessibility-First**
WCAG compliance is required. Beyond compliance, accessible design serves stressed users who may have difficulty focusing.

**Application:**
- Minimum 4.5:1 contrast ratios (aim for AAA: 7:1)
- Large touch targets (minimum 44×44px)
- Clear focus states for keyboard navigation
- Readable font sizes (16px minimum body text)
- No information conveyed by color alone
- Reduced motion option for animations

---

### 6. **Mobile-Native Thinking**
Parents may be researching care on their phone during work breaks or late at night.

**Application:**
- Thumb-friendly navigation
- Single-column layouts that work on all devices
- Large, easy-to-tap buttons
- Optimized image loading
- Bottom-sheet modals over centered modals on mobile

---

## Visual Style Recommendations

### ✅ **Recommended: Warm Minimalism**

A refined, calming aesthetic that balances clinical professionalism with emotional warmth.

**Characteristics:**
- Clean layouts with generous whitespace
- Soft, warm neutral backgrounds (cream, warm gray, soft beige)
- Accent colors from nature (sage green, soft blue, muted terracotta)
- Subtle shadows for depth (not flat, not heavy)
- Rounded corners on cards and buttons (8-16px radius)
- High-quality, warm photography or soft illustrations

**Why it works for Daybreak:**
- Feels professional without being cold or institutional
- Aligns with "calm visual language" requirement
- Accessible and performant
- Timeless—won't feel dated in 2 years
- Works across all user types (parents, teens, friends)

**Example Palette:**
```
Background:     #FAFAF8 (warm white)
Surface:        #FFFFFF (pure white cards)
Primary:        #2D5A7B (trust blue - calming, professional)
Secondary:      #7BA3BC (soft blue - supportive)
Accent:         #E8B87D (warm amber - hope, warmth)
Text Primary:   #1A1A1A (near black - readable)
Text Secondary: #5A5A5A (gray - hierarchy)
Success:        #4A7C59 (sage green - growth, healing)
Warning:        #D4915D (soft orange - attention without alarm)
Error:          #C67B7B (muted red - serious but not aggressive)
```

---

### ✅ **Recommended: Therapeutic Modern**

A clean, contemporary healthcare aesthetic that builds trust through professionalism while remaining approachable.

**Characteristics:**
- Crisp, modern typography (Inter, Plus Jakarta Sans, or similar)
- Primary palette of calming blues and greens
- Strategic use of gradients (subtle, not loud)
- Card-based layouts with clear hierarchy
- Micro-interactions that feel responsive and alive
- Illustrations with a human, hand-drawn quality

**Why it works for Daybreak:**
- Signals "modern healthcare"—innovative but trustworthy
- Blues/greens have clinical associations while remaining calm
- Clear visual hierarchy guides users through complex flows
- Feels contemporary without being trendy

**Example Palette:**
```
Background:     #F5F9FA (cool white)
Surface:        #FFFFFF
Primary:        #1E6B8C (deep teal - trust, depth)
Secondary:      #4EADC5 (light teal - friendly)
Accent:         #F0C987 (soft gold - hope)
Text Primary:   #1F2937 (slate)
Text Secondary: #64748B (muted slate)
Success:        #22C55E (green - but use sparingly)
```

---

### ⚠️ **Consider with Caution: Soft Glassmorphism**

Frosted glass effects with blur and transparency can feel modern and calming when done carefully.

**Characteristics:**
- Translucent cards with background blur
- Subtle borders and shadows
- Layered depth without heavy shadows
- Works best on gradient backgrounds

**Potential Issues:**
- Contrast problems (text on translucent backgrounds)
- Performance impact (blur is expensive)
- Can feel "trendy" and date quickly
- Harder to achieve WCAG compliance

**If used:**
- Apply only to non-critical decorative elements
- Ensure text is always on solid backgrounds
- Test extensively on mobile devices
- Have a fallback for reduced-motion preferences

---

### ❌ **Avoid: Neumorphism**

Soft, embossed UI elements that appear pushed into or out of the surface.

**Why it doesn't work:**
- Poor accessibility (low contrast, hard to distinguish interactive elements)
- Difficult to indicate button states (pressed, disabled, focused)
- Trend has passed—feels dated now
- Can increase cognitive load for stressed users
- Doesn't convey the professional credibility healthcare requires

---

### ❌ **Avoid: High-Contrast Brutalism**

Bold, stark, high-contrast designs with raw aesthetics.

**Why it doesn't work:**
- Feels aggressive and cold
- Increases anxiety rather than reducing it
- Wrong emotional tone for vulnerable users
- Can feel inaccessible despite high contrast

---

### ❌ **Avoid: Playful/Whimsical**

Bright colors, bouncy animations, cartoon illustrations.

**Why it doesn't work:**
- Doesn't convey seriousness of mental health
- May feel dismissive of parents' concerns
- Could undermine trust in clinical competence
- Inappropriate for the teen user path (feels childish)

---

## User-Type Specific Considerations

The three user paths may benefit from subtle variations while maintaining brand consistency:

| User Type | Design Adjustments |
|-----------|-------------------|
| **Parent/Guardian** | Warmer tones, family imagery, professional clinical language |
| **Self-Seeking Minor (13+)** | Slightly more modern feel, peer-appropriate imagery, less formal language, age-appropriate design without being patronizing |
| **Concerned Friend** | Supportive, peer-to-peer feel, focus on "how to help" without feeling clinical |

These adjustments should be subtle—different hero imagery, microcopy variations—not entirely different visual languages.

---

## Component-Level Recommendations

### Forms
```
- Single-column layout
- Floating labels or top-aligned labels
- Inline validation (after blur, not while typing)
- Clear error states with helpful messages
- Progress saved indicator visible
- Generous spacing between fields (24-32px)
```

### Buttons
```
- Primary: Filled with primary color, high contrast
- Secondary: Outlined or soft fill
- Minimum height: 48px (mobile-friendly)
- Border radius: 8-12px (soft but not pill-shaped)
- Disabled states clearly visible but not harsh
```

### Cards
```
- Background: Pure white on warm/cool tinted background
- Border radius: 12-16px
- Shadow: Subtle (0 4px 6px rgba(0,0,0,0.05))
- Padding: 24-32px
- Clear hierarchy within cards
```

### Progress Indicators
```
- Horizontal stepper for phases
- Show completed, current, upcoming
- Use checkmarks for completed steps
- Don't show all phases at once on mobile (collapse to current)
```

### AI Chat Interface
```
- Clear visual distinction between user and AI messages
- AI avatar should feel warm but professional (not robotic)
- Typing indicators to show AI is "thinking"
- Timestamps subtle or hidden
- Quick-reply chips for common responses
```

---

## Typography Recommendations

| Element | Recommendation |
|---------|----------------|
| **Font Family** | Inter, Plus Jakarta Sans, DM Sans, or Source Sans 3 |
| **Body Size** | 16-18px |
| **Line Height** | 1.5-1.6 for body text |
| **Headings** | Same family or a complementary serif for warmth (e.g., Lora, Merriweather) |
| **Weight Range** | 400 (regular), 500 (medium), 600 (semibold) |

**Avoid:**
- Thin weights (hard to read)
- All caps for long text
- Overly decorative fonts
- Font sizes below 14px

---

## Recommended Direction Summary

| Aspect | Recommendation |
|--------|----------------|
| **Primary Style** | Warm Minimalism or Therapeutic Modern |
| **Color Mood** | Calm, desaturated, nature-inspired |
| **Typography** | Clean sans-serif, generous sizing |
| **Illustrations** | Soft, human, diverse, not cartoonish |
| **Animations** | Subtle, purposeful, respect reduced-motion |
| **Overall Feel** | "A trusted friend who happens to be a healthcare professional" |

---

## Next Steps

Would you like me to:
1. Create a detailed design tokens file (colors, spacing, typography) for the chosen style?
2. Provide component-level specifications for key UI elements?
3. Create a mood board or reference sites that exemplify the recommended style?
4. Document accessibility requirements in detail?



I'll create both files with comprehensive design guidance based on the project requirements.

[3 tools called]

Done! I've created both documentation files:

## `ui-rules.md` - Design Principles

Covers the **behavioral** aspects of the UI:

| Section | What It Covers |
|---------|----------------|
| **Core Philosophy** | "Funnel of Trust" concept |
| **Design Principles** | Therapeutic Calm, Progressive Disclosure, Trust Architecture, Emotional Validation, Accessibility First, Mobile-Native |
| **Component Patterns** | Buttons, Forms, Cards, Progress Indicators, Chat Interface, Modals, Navigation |
| **User-Type Adjustments** | Specific guidance for Parent, Minor, and Friend paths |
| **Animation & Motion** | Timing, easing, reduced motion support |
| **Error Handling** | Tone, visual treatment, examples |
| **Loading States** | Patterns for different contexts |
| **Do's and Don'ts** | Quick reference checklist |

---

## `theme-rules.md` - Visual Theme

Covers the **visual** specifications:

| Section | What It Covers |
|---------|----------------|
| **Color System** | Full palette with Primary (Trust Blue), Accent (Hope Amber), Neutrals (warm undertones), Semantic colors |
| **Typography** | Inter font, complete type scale, weights, rules |
| **Spacing** | 4px-based scale, component-specific spacing |
| **Border Radius** | Scale from 4px to full, component defaults |
| **Shadows** | Soft, diffused shadow scale |
| **Animations** | Duration, easing, keyframes |
| **Breakpoints** | Mobile-first responsive scale |
| **Z-Index** | Layer management scale |
| **Component Tokens** | Button, Input, Card, Chat-specific variables |
| **Tailwind Config** | Ready-to-use configuration |
| **CSS Custom Properties** | Complete `:root` variables |
| **Accessibility** | Contrast ratio verification |

---

### Key Design Decisions

| Choice | Rationale |
|--------|-----------|
| **Warm neutrals** (`#FAFAF8` not `#FFFFFF`) | Avoids clinical coldness |
| **Trust Blue** (`#2D5A7B`) | Calm, professional, healthcare-appropriate |
| **Hope Amber** (`#E8B87D`) | Adds warmth without being playful |
| **Muted error red** (`#B85C5C`) | Serious but not aggressive |
| **Soft shadows** | Creates depth without harshness |
| **8-12px border radius** | Soft feel without being too rounded |
| **Inter font** | Clean, readable, professional |

Both files work together—`ui-rules.md` tells you **how** to design, while `theme-rules.md` tells you **what values** to use.