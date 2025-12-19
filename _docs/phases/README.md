# Development Phases

## Overview

This directory contains the iterative development plan for the Parent Onboarding AI project. Each phase builds on the previous one, progressing from initial setup to a production-ready application.

---

## Phase Summary

| Phase | Name | Duration | Description |
|-------|------|----------|-------------|
| **0** | [Setup](./phase-0-setup.md) | 5-7 days | Project scaffolding, Docker, CI/CD, Aptible deployment |
| **1** | [MVP](./phase-1-mvp.md) | 10-14 days | Core onboarding flow with static screener |
| **2** | [AI Integration](./phase-2-ai-integration.md) | 12-16 days | LLM chatbot, crisis detection, triage routing |
| **3** | [Insurance & Matching](./phase-3-insurance-matching.md) | 14-18 days | OCR, clinician matching, scheduling |
| **4** | [Polish](./phase-4-polish.md) | 10-14 days | Support chat, accessibility, UX refinement |
| **5** | [Production](./phase-5-production.md) | 10-14 days | Security, monitoring, compliance, launch |

---

## Timeline Visualization

```
Week  1  2  3  4  5  6  7  8  9  10  11  12  13
      ├──┴──┤                                      Phase 0: Setup
            ├──┴──┴──┤                              Phase 1: MVP
                     ├──┴──┴──┤                     Phase 2: AI Integration
                              ├──┴──┴──┴──┤         Phase 3: Insurance & Matching
                                          ├──┴──┤   Phase 4: Polish
                                                ├──┴──┤ Phase 5: Production
```

**Total: 11-15 weeks** (single developer)
**With 2-3 developers: 8-10 weeks**

---

## Phase Dependencies

```
Phase 0 ─────► Phase 1 ─────► Phase 2 ─────► Phase 3 ─────► Phase 4 ─────► Phase 5
  Setup         MVP        AI Screener    Insurance      Polish       Production
                                          & Scheduling
```

Each phase must be completed before the next begins, though some parallel work is possible within phases.

---

## Key Milestones

### End of Phase 0
✓ Hello World deployed to Aptible  
✓ CI/CD pipeline operational  
✓ Development environment documented

### End of Phase 1 (MVP)
✓ Users can complete basic onboarding  
✓ Account creation functional  
✓ Clinician displayed (random matching)

### End of Phase 2
✓ AI chatbot administers screeners  
✓ Crisis detection operational  
✓ Safety pivot implemented

### End of Phase 3
✓ Full end-to-end onboarding  
✓ Insurance capture with OCR  
✓ Appointment scheduling functional

### End of Phase 4
✓ Support chat available  
✓ WCAG 2.1 AA compliant  
✓ Performance optimized

### End of Phase 5 (Launch)
✓ Security audit passed  
✓ HIPAA compliance verified  
✓ Monitoring and alerting live  
✓ Production launch approved

---

## Success Metrics (from PRD)

These metrics should be tracked starting from Phase 1 deployment:

| Metric | Target | Measurement Start |
|--------|--------|-------------------|
| Onboarding completion rate | +40% improvement | Phase 1 |
| Time to complete | < 15 minutes | Phase 2 |
| Drop-off at insurance stage | 50% reduction | Phase 3 |
| Net Promoter Score | 70+ | Phase 3 |
| Service request increase | +30% | Phase 5 |

---

## How to Use These Documents

1. **Planning**: Review the full phase document before starting
2. **Execution**: Use feature checklists to track progress
3. **Definition of Done**: Verify all items before moving to next phase
4. **Estimation**: Adjust timelines based on team size and velocity

---

## Related Documentation

- [Project Overview](./../Project%20Overview.md) - PRD and requirements
- [User Flow](./../user-flow.md) - Complete user journey
- [Tech Stack](./../tech-stack.md) - Technology decisions
- [Project Rules](./../project-rules.md) - Coding conventions
- [UI Rules](./../ui-rules.md) - Design principles
- [Theme Rules](./../theme-rules.md) - Visual specifications

