# Theme Rules

## Overview

This document defines the visual theme for the Parent Onboarding AI application. It serves as the single source of truth for colors, typography, spacing, and other design tokens used throughout the application.

**Design Style:** Warm Minimalism / Therapeutic Modern

---

## Color System

### Design Philosophy

Our color palette is designed to:
- Create a calm, supportive atmosphere
- Build trust and convey professionalism
- Maintain accessibility (WCAG AA minimum, AAA target)
- Work across all user types (parents, minors, friends)

---

### Core Palette

#### Primary Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `primary-50` | `#EDF5F8` | 237, 245, 248 | Subtle backgrounds |
| `primary-100` | `#D4E8EF` | 212, 232, 239 | Hover states, highlights |
| `primary-200` | `#A9D1DF` | 169, 209, 223 | Borders, dividers |
| `primary-300` | `#7BA3BC` | 123, 163, 188 | Secondary text, icons |
| `primary-400` | `#4E7A94` | 78, 122, 148 | Interactive elements |
| `primary-500` | `#2D5A7B` | 45, 90, 123 | **Primary brand color** |
| `primary-600` | `#244A65` | 36, 74, 101 | Hover on primary |
| `primary-700` | `#1B3A4F` | 27, 58, 79 | Active states |
| `primary-800` | `#122A39` | 18, 42, 57 | Dark accents |
| `primary-900` | `#091A23` | 9, 26, 35 | Near-black |

**Primary Color:** `#2D5A7B` (Trust Blue)
- Conveys calm, trust, and professionalism
- Medical/healthcare association without being cold
- Works well for buttons, links, and key UI elements

---

#### Warm Accent Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `accent-50` | `#FEF7ED` | 254, 247, 237 | Warm highlight backgrounds |
| `accent-100` | `#FCECD5` | 252, 236, 213 | Soft accent areas |
| `accent-200` | `#F8D9AB` | 248, 217, 171 | Borders, subtle accents |
| `accent-300` | `#F3C07D` | 243, 192, 125 | Icons, decorative elements |
| `accent-400` | `#E8A854` | 232, 168, 84 | Call-to-action highlights |
| `accent-500` | `#D4915D` | 212, 145, 93 | **Warm accent** |
| `accent-600` | `#B87A4A` | 184, 122, 74 | Hover states |
| `accent-700` | `#9A6339` | 154, 99, 57 | Active states |

**Warm Accent:** `#E8B87D` (Hope Amber)
- Adds warmth and humanity to the interface
- Used sparingly for highlights, success states, and hope
- Balances the cooler primary blue

---

#### Neutral Colors

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `neutral-50` | `#FAFAF8` | 250, 250, 248 | Page backgrounds (warm white) |
| `neutral-100` | `#F5F5F3` | 245, 245, 243 | Card backgrounds |
| `neutral-200` | `#E8E8E5` | 232, 232, 229 | Borders, dividers |
| `neutral-300` | `#D4D4D0` | 212, 212, 208 | Disabled states |
| `neutral-400` | `#A3A39E` | 163, 163, 158 | Placeholder text |
| `neutral-500` | `#737370` | 115, 115, 112 | Secondary text |
| `neutral-600` | `#5A5A57` | 90, 90, 87 | Body text |
| `neutral-700` | `#3D3D3B` | 61, 61, 59 | Headings |
| `neutral-800` | `#1F1F1E` | 31, 31, 30 | Primary text |
| `neutral-900` | `#0F0F0E` | 15, 15, 14 | High contrast text |

**Note:** Our neutrals have a warm undertone (slightly yellow/cream) to avoid clinical coldness.

---

#### Semantic Colors

| Token | Hex | Usage | Contrast on White |
|-------|-----|-------|-------------------|
| `success-50` | `#ECFDF5` | Success backgrounds | - |
| `success-500` | `#4A7C59` | Success text, icons | 4.7:1 ✓ |
| `success-600` | `#3D6B4A` | Success hover | 5.8:1 ✓ |
| `warning-50` | `#FFFBEB` | Warning backgrounds | - |
| `warning-500` | `#B8860B` | Warning text, icons | 4.5:1 ✓ |
| `warning-600` | `#996F09` | Warning hover | 5.5:1 ✓ |
| `error-50` | `#FEF2F2` | Error backgrounds | - |
| `error-500` | `#B85C5C` | Error text, icons | 4.5:1 ✓ |
| `error-600` | `#9A4A4A` | Error hover | 5.6:1 ✓ |
| `info-50` | `#EFF6FF` | Info backgrounds | - |
| `info-500` | `#3B82A0` | Info text, icons | 4.5:1 ✓ |

**Note:** Error colors are muted red (not aggressive) to maintain calm tone.

---

### Surface Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `surface-page` | `#FAFAF8` | Main page background |
| `surface-card` | `#FFFFFF` | Card backgrounds |
| `surface-elevated` | `#FFFFFF` | Modals, dropdowns |
| `surface-overlay` | `rgba(15, 15, 14, 0.5)` | Modal backdrops |
| `surface-input` | `#FFFFFF` | Form input backgrounds |
| `surface-input-disabled` | `#F5F5F3` | Disabled inputs |

---

### Interactive States

| State | Primary Button | Secondary Button | Ghost Button |
|-------|----------------|------------------|--------------|
| Default | `bg: primary-500` | `border: primary-500` | `text: primary-500` |
| Hover | `bg: primary-600` | `bg: primary-50` | `bg: primary-50` |
| Active | `bg: primary-700` | `bg: primary-100` | `bg: primary-100` |
| Focus | `ring: primary-300` | `ring: primary-300` | `ring: primary-300` |
| Disabled | `bg: neutral-300` | `border: neutral-300` | `text: neutral-400` |

---

## Typography

### Font Family

```css
--font-sans: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

--font-display: 'Inter', var(--font-sans);
```

**Primary Font:** Inter
- Clean, modern, highly readable
- Excellent for both headings and body text
- Strong accessibility characteristics
- Variable font for performance

**Fallbacks:** System fonts for fast initial render

---

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-xs` | 12px | 16px (1.33) | 400 | Labels, captions |
| `text-sm` | 14px | 20px (1.43) | 400 | Secondary text, helper text |
| `text-base` | 16px | 24px (1.5) | 400 | Body text (default) |
| `text-lg` | 18px | 28px (1.56) | 400 | Emphasized body text |
| `text-xl` | 20px | 28px (1.4) | 500 | Card titles, subheadings |
| `text-2xl` | 24px | 32px (1.33) | 600 | Section headings |
| `text-3xl` | 30px | 36px (1.2) | 600 | Page headings |
| `text-4xl` | 36px | 40px (1.11) | 700 | Hero headings |
| `text-5xl` | 48px | 48px (1.0) | 700 | Display (rare) |

---

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text, paragraphs |
| `font-medium` | 500 | Emphasis, labels, buttons |
| `font-semibold` | 600 | Headings, important text |
| `font-bold` | 700 | Display headings, strong emphasis |

---

### Typography Rules

**Body Text:**
- Minimum size: 16px (never smaller for body content)
- Line length: 50-75 characters optimal
- Paragraph spacing: 1em (16px)

**Headings:**
- Use semibold (600) or bold (700)
- Maintain clear hierarchy
- Don't skip heading levels

**Links:**
- Color: `primary-500`
- Underline on hover (not always visible)
- Focus state: visible outline

**Microcopy:**
- Friendly, supportive tone
- Clear and concise
- No jargon

---

## Spacing

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | Reset |
| `space-1` | 4px | Tight spacing, icon gaps |
| `space-2` | 8px | Small gaps, inline elements |
| `space-3` | 12px | Related element spacing |
| `space-4` | 16px | Standard element spacing |
| `space-5` | 20px | Comfortable spacing |
| `space-6` | 24px | Section padding |
| `space-8` | 32px | Large section gaps |
| `space-10` | 40px | Section separation |
| `space-12` | 48px | Major section breaks |
| `space-16` | 64px | Page section spacing |
| `space-20` | 80px | Hero sections |
| `space-24` | 96px | Maximum spacing |

---

### Component Spacing

| Component | Padding | Gap |
|-----------|---------|-----|
| Button (default) | 12px 16px | - |
| Button (large) | 16px 32px | - |
| Card | 24px (mobile), 32px (desktop) | - |
| Form field | - | 16px between fields |
| Form group | - | 24px between groups |
| Section | 48px top/bottom | - |
| Page | 16px (mobile), 24px (desktop) | - |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-none` | 0px | Square elements |
| `rounded-sm` | 4px | Subtle rounding |
| `rounded` | 6px | Default small elements |
| `rounded-md` | 8px | Buttons, inputs |
| `rounded-lg` | 12px | Cards, containers |
| `rounded-xl` | 16px | Large cards, modals |
| `rounded-2xl` | 24px | Hero sections |
| `rounded-full` | 9999px | Pills, avatars |

**Rules:**
- Inputs: 8px
- Buttons: 8px
- Cards: 12-16px
- Avatars: full (circular)
- Never use sharp corners (0px) for interactive elements

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow` | `0 4px 6px rgba(0,0,0,0.05)` | Cards, default elevation |
| `shadow-md` | `0 6px 12px rgba(0,0,0,0.08)` | Hover states |
| `shadow-lg` | `0 10px 25px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `shadow-xl` | `0 20px 40px rgba(0,0,0,0.12)` | Prominent overlays |

**Rules:**
- Shadows should be soft and diffused
- No harsh drop shadows
- Use shadow to indicate elevation/interactivity
- Increase shadow on hover for interactive cards

---

## Borders

| Token | Value | Usage |
|-------|-------|-------|
| `border-width` | 1px | Default border |
| `border-width-2` | 2px | Focus states, emphasis |
| `border-color-default` | `neutral-200` | Default borders |
| `border-color-focus` | `primary-300` | Focus rings |
| `border-color-error` | `error-500` | Error states |

---

## Animation & Transitions

### Duration

| Token | Value | Usage |
|-------|-------|-------|
| `duration-75` | 75ms | Instant feedback |
| `duration-150` | 150ms | Quick micro-interactions |
| `duration-200` | 200ms | Default transitions |
| `duration-300` | 300ms | Page transitions |
| `duration-500` | 500ms | Complex animations |

### Easing

| Token | Value | Usage |
|-------|-------|-------|
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |

### Common Transitions

```css
/* Buttons, links */
transition: all 150ms ease-out;

/* Cards, containers */
transition: all 200ms ease-in-out;

/* Page content */
transition: opacity 300ms ease-in-out;
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## Breakpoints

| Token | Min Width | Target |
|-------|-----------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

**Container Widths:**
- Max content width: 1280px
- Reading content: 720px
- Form width: 480px

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `z-0` | 0 | Default |
| `z-10` | 10 | Elevated cards |
| `z-20` | 20 | Sticky headers |
| `z-30` | 30 | Dropdowns |
| `z-40` | 40 | Fixed elements |
| `z-50` | 50 | Modal backdrops |
| `z-60` | 60 | Modals |
| `z-70` | 70 | Toasts, notifications |
| `z-max` | 9999 | Critical overlays |

---

## Component-Specific Tokens

### Buttons

```css
/* Primary Button */
--btn-primary-bg: var(--color-primary-500);
--btn-primary-bg-hover: var(--color-primary-600);
--btn-primary-text: #FFFFFF;
--btn-primary-shadow: var(--shadow-sm);

/* Secondary Button */
--btn-secondary-bg: transparent;
--btn-secondary-border: var(--color-primary-500);
--btn-secondary-text: var(--color-primary-500);

/* Button Sizes */
--btn-height-sm: 36px;
--btn-height-default: 44px;
--btn-height-lg: 52px;
--btn-padding-sm: 12px;
--btn-padding-default: 16px;
--btn-padding-lg: 24px;
```

### Inputs

```css
--input-height: 48px;
--input-padding-x: 16px;
--input-padding-y: 12px;
--input-border-radius: 8px;
--input-border-color: var(--color-neutral-200);
--input-border-color-focus: var(--color-primary-400);
--input-border-color-error: var(--color-error-500);
--input-bg: var(--color-surface-input);
--input-bg-disabled: var(--color-surface-input-disabled);
```

### Cards

```css
--card-bg: var(--color-surface-card);
--card-border-radius: 16px;
--card-padding: 24px;
--card-padding-lg: 32px;
--card-shadow: var(--shadow);
--card-shadow-hover: var(--shadow-md);
```

### Chat Interface

```css
/* AI Messages */
--chat-ai-bg: var(--color-primary-50);
--chat-ai-border: var(--color-primary-200);
--chat-ai-text: var(--color-neutral-800);

/* User Messages */
--chat-user-bg: var(--color-neutral-100);
--chat-user-text: var(--color-neutral-800);

/* Message Sizing */
--chat-message-max-width: 85%;
--chat-message-padding: 16px;
--chat-message-radius: 16px;
--chat-gap: 16px;
```

---

## Tailwind Configuration

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
        primary: {
          50: '#EDF5F8',
          100: '#D4E8EF',
          200: '#A9D1DF',
          300: '#7BA3BC',
          400: '#4E7A94',
          500: '#2D5A7B',
          600: '#244A65',
          700: '#1B3A4F',
          800: '#122A39',
          900: '#091A23',
        },
        accent: {
          50: '#FEF7ED',
          100: '#FCECD5',
          200: '#F8D9AB',
          300: '#F3C07D',
          400: '#E8A854',
          500: '#D4915D',
          600: '#B87A4A',
          700: '#9A6339',
        },
        neutral: {
          50: '#FAFAF8',
          100: '#F5F5F3',
          200: '#E8E8E5',
          300: '#D4D4D0',
          400: '#A3A39E',
          500: '#737370',
          600: '#5A5A57',
          700: '#3D3D3B',
          800: '#1F1F1E',
          900: '#0F0F0E',
        },
        success: {
          50: '#ECFDF5',
          500: '#4A7C59',
          600: '#3D6B4A',
        },
        warning: {
          50: '#FFFBEB',
          500: '#B8860B',
          600: '#996F09',
        },
        error: {
          50: '#FEF2F2',
          500: '#B85C5C',
          600: '#9A4A4A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
        '5xl': ['48px', { lineHeight: '48px' }],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 4px 6px rgba(0, 0, 0, 0.05)',
        md: '0 6px 12px rgba(0, 0, 0, 0.08)',
        lg: '0 10px 25px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 40px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## CSS Custom Properties

```css
/* globals.css */
:root {
  /* Colors */
  --color-primary: #2D5A7B;
  --color-primary-light: #7BA3BC;
  --color-primary-dark: #1B3A4F;
  --color-accent: #E8B87D;
  --color-background: #FAFAF8;
  --color-surface: #FFFFFF;
  --color-text-primary: #1F1F1E;
  --color-text-secondary: #5A5A57;
  --color-text-muted: #A3A39E;
  --color-border: #E8E8E5;
  --color-success: #4A7C59;
  --color-warning: #B8860B;
  --color-error: #B85C5C;

  /* Typography */
  --font-sans: 'Inter', sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;

  /* Spacing */
  --space-unit: 4px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-in-out;
  --transition-slow: 300ms ease-in-out;

  /* Layout */
  --max-width-content: 1280px;
  --max-width-reading: 720px;
  --max-width-form: 480px;
}

/* Dark mode (if implemented) */
@media (prefers-color-scheme: dark) {
  :root {
    /* Override with dark mode colors */
  }
}
```

---

## Accessibility Compliance

### Contrast Ratios

All color combinations must meet WCAG AA (4.5:1 for text, 3:1 for large text):

| Combination | Ratio | Status |
|-------------|-------|--------|
| `neutral-800` on `neutral-50` | 12.6:1 | ✅ AAA |
| `neutral-600` on `neutral-50` | 6.4:1 | ✅ AAA |
| `primary-500` on white | 5.8:1 | ✅ AA |
| `primary-500` on `primary-50` | 5.2:1 | ✅ AA |
| `error-500` on white | 4.5:1 | ✅ AA |
| `success-500` on white | 4.7:1 | ✅ AA |

### Focus States

All interactive elements must have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--color-primary-400);
  outline-offset: 2px;
}
```

---

## Usage Examples

### Button

```jsx
<button className="
  bg-primary-500 
  hover:bg-primary-600 
  text-white 
  font-medium 
  px-4 py-3 
  rounded-md 
  shadow-sm
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2
  disabled:bg-neutral-300 disabled:cursor-not-allowed
">
  Continue
</button>
```

### Card

```jsx
<div className="
  bg-white 
  rounded-xl 
  shadow 
  p-6 
  hover:shadow-md 
  transition-shadow duration-200
">
  <h3 className="text-xl font-semibold text-neutral-800">Card Title</h3>
  <p className="text-neutral-600 mt-2">Card content goes here.</p>
</div>
```

### Input

```jsx
<div className="space-y-1">
  <label className="text-sm font-medium text-neutral-700">
    Email Address
  </label>
  <input
    type="email"
    className="
      w-full h-12 px-4
      border border-neutral-200 rounded-md
      focus:border-primary-400 focus:ring-2 focus:ring-primary-100
      placeholder:text-neutral-400
      transition-colors duration-150
    "
    placeholder="you@example.com"
  />
</div>
```

---

## File Structure

```
styles/
├── globals.css          # CSS custom properties, base styles
├── tokens/
│   ├── colors.ts        # Color tokens exported for JS
│   ├── typography.ts    # Typography tokens
│   └── spacing.ts       # Spacing tokens
└── tailwind.config.js   # Tailwind configuration
```

