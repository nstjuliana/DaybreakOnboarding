[2 tools called]

Done! I've created `_docs/project-rules.md` with comprehensive guidelines for our AI-first codebase. Here's what it covers:

## Summary

### Core Principles
- **Modularity** - Each file does one thing well
- **Explicit** - No magic strings, clear naming
- **Consistent** - Follow patterns, use automated tools
- **Documented** - Every file and function has docs

### File Size Limits
| Type | Max Lines |
|------|-----------|
| Source files | 500 |
| Test files | 600 |
| Config files | 300 |

### Directory Structure
Complete structure for:
- `_docs/` - Documentation
- `backend/` - Rails API with services, jobs, policies
- `frontend/` - Next.js with App Router, components, hooks
- `shared/` - Cross-project types and constants
- `infrastructure/` - Docker, deployment configs

### Documentation Requirements

**File Headers (required):**
```typescript
/**
 * @file ComponentName
 * @description Brief description of what this file does
 * @see {@link _docs/relevant-doc.md}
 */
```

**Function Documentation (required):**
- JSDoc/TSDoc for TypeScript
- YARD/RDoc for Ruby
- Parameters, return types, examples, exceptions

### Naming Conventions
| Pattern | Usage |
|---------|-------|
| `kebab-case` | React files, routes, utilities |
| `snake_case` | Ruby files (Rails convention) |
| `PascalCase` | Only when matching component export |

### Other Standards
- Import ordering rules
- Constants extraction (no magic values)
- Git branch/commit conventions
- Environment variable patterns
- Quality checklist for PRs
- Command cheatsheet

This document complements the other docs—it tells developers **how to organize and write code**, while the others cover **what to build** (user-flow), **what tools to use** (tech-stack), and **how it should look** (ui-rules, theme-rules).