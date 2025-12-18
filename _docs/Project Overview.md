# Parent Onboarding AI

**Organization:** Daybreak Health
---

# Product Requirements Document (PRD) for Parent Onboarding AI

## 1. Executive Summary

The Parent Onboarding AI is a new feature developed by Daybreak Health aimed at enhancing the onboarding experience for parents seeking mental health services for their children. The solution addresses key pain points in the current process—understanding a child's mental health needs, providing insurance information, and managing parental emotions during onboarding. By leveraging AI, the feature aims to streamline the onboarding process, reduce drop-offs, and ultimately increase the number of children receiving timely mental health care.

## 2. Problem Statement

Daybreak Health's current onboarding process for parents is fraught with challenges, leading to significant drop-offs. Parents struggle to understand their child's mental health needs, are intimidated by the insurance submission process, and often experience personal emotional stress. These factors contribute to a bottleneck in converting interested parties into active patients. The goal is to simplify this process, making it intuitive and supportive, thereby increasing engagement and satisfaction.

## 3. Goals & Success Metrics

- **Increase in Service Requests:** Elevate the number of parents requesting Daybreak services by 30%.
- **Insurance Submission Completion:** Achieve a 50% reduction in drop-offs at the insurance submission stage.
- **Onboarding Completion Rate:** Boost the percentage of parents completing the onboarding flow by 40%.
- **Time Efficiency:** Ensure the onboarding process is completed within 15 minutes for a motivated user.
- **Patient Longevity:** Improve patient retention by 20% to ensure comprehensive care.
- **Parent Satisfaction:** Achieve a parent Net Promoter Score (NPS) of 70+ post-onboarding and post-first appointment.

## 4. Target Users & Personas

**Primary User:** Parents of children requiring mental health services.
- **Needs:** Clarity on child’s mental health requirements, simplified insurance submission, emotional support.
- **Pain Points:** Confusion about symptoms, insurance complexities, emotional stress.

## 5. User Stories

1. **As a parent,** I want to assess if Daybreak Health services are suitable for my child so that I can make informed decisions about their mental health care.
2. **As a parent,** I want to submit insurance information easily so that I can quickly move forward with the onboarding process.
3. **As a parent,** I want to receive support and reassurance throughout the onboarding process so that I feel confident in the care my child will receive.

## 6. Functional Requirements

### P0: Must-have
- **AI-Powered Assessment Module:** Integrate an LLM-powered chatbot to guide parents through a mental health screener, providing clear, non-intimidating feedback.
- **Streamlined Onboarding Flow:** Develop an intuitive interface for demographic, insurance, and clinical intake.
- **Enhanced Scheduling Module:** Create an AI-assisted scheduling system that simplifies matching and allows limited self-scheduling.

### P1: Should-have
- **Image-to-Text Insurance Submission:** Implement a feature allowing parents to upload insurance cards, automatically extracting necessary data.
- **Cost Estimation Tool:** Provide an upfront cost estimation based on insurance information.
- **Support Interface:** Include a chat option for real-time support from Daybreak's team.

### P2: Nice-to-have
- **Emotional Support Content:** Offer curated content to help parents manage stress during the onboarding process.
- **Self-Help Resources:** Provide access to resources for parents to better understand mental health symptoms.

## 7. Non-Functional Requirements

- **Performance:** Support up to 1000 concurrent users with a response time of under 3 seconds for AI interactions.
- **Security:** Ensure compliance with HIPAA and PII regulations.
- **Scalability:** Easily scale to accommodate growth in user base.
- **Usability:** Ensure the interface is user-friendly and accessible to individuals with varying technical skills.

## 8. User Experience & Design Considerations

- **Workflow Simplicity:** Design a clear, logical flow from assessment to onboarding completion.
- **Accessibility:** Ensure compliance with WCAG standards for accessibility.
- **Emotional Tone:** Maintain a supportive and reassuring tone throughout the interface.

## 9. Technical Requirements

- **Back-end:** Ruby/Ruby on Rails, PostgreSQL for database management.
- **Front-end:** JavaScript/Next.js for responsive user interfaces.
- **AI Frameworks:** Use of agnostic AI models for assessment and scheduling.
- **Dev Tools:** Docker for containerization, Postman for API testing.
- **Cloud Platforms:** AWS (S3) for storage, Aptible for hosting.
- **APIs & Integration:** GraphQL for efficient data querying.

## 10. Dependencies & Assumptions

- **Assumption:** Parents have access to basic digital devices and internet connectivity.
- **Dependency:** Availability of a robust AI framework capable of handling natural language processing.
- **Assumption:** Daybreak’s internal team will support the AI model with necessary training data.

## 11. Out of Scope

- **Long-term Therapy Outcome Tracking:** The feature will not include post-care tracking or long-term therapy outcomes.
- **Billing and Payment Processing:** Direct billing or payment processing functionalities are not part of this feature.

This PRD outlines a comprehensive plan to address the current challenges in Daybreak Health's onboarding process, leveraging AI to provide a seamless, supportive experience for parents seeking mental health services for their children. By focusing on user needs and leveraging technology, the Parent Onboarding AI aims to significantly improve engagement and care conversion rates.