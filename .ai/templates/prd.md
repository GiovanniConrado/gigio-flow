# [PRD] — [Feature / Resource Title]

> **Authors:** PM Agent & CTO Agent
> **Date:** [YYYY-MM-DD]
> **Status:** ⏳ Under Review (Awaiting human approval with "OK")
> **Issue ID:** [GIG-XX]

---

## 🎯 1. Overview and Business Context (PM)

### Objective
[What real customer or business problem does this feature solve? A clear, easy-to-understand sentence.]

### Affected Personas
- [ ] **[Persona A Name]:** [E.g., End customer seeking agility.]
- [ ] **[Persona B Name]:** [E.g., Administrator managing reports.]

### Metrics Impact
[Which success indicator (KPI) do we intend to impact? E.g., Increase conversion rate by 5%, reduce bounce rate, etc.]

---

## 🎨 2. User Journey & UX (PM)

### Ideal Flow (Golden Path)
- **Step 1:** [Initial user action] ➔ **Result:** [What the system shows/does]
- **Step 2:** [Second action] ➔ **Result:** [What the system shows/does]

### Edge Cases
- **No Network Connection:** [How the system reacts]
- **Blank / Invalid Fields:** [How forms display validation errors]

---

## 🛠️ 3. Technical Specification & Architecture (CTO)

### Data Modeling (Database)
*Describe changes to tables, columns, primary keys, and RLS/Security policies.*

```sql
-- Suggested SQL Migration Script:
-- CREATE TABLE public.example (
--     id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
--     created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
-- );
```

### State Management & APIs
- **Global Stores:** [Store file path and variables to create]
- **API Routes / Endpoints:** [New endpoints or microservice connections]

### Design Lock (Design System)
- **Colors / Tokens Used:** [Tokens to import from knowledge/DESIGN_SYSTEM.md]
- **Reusable UI Components:** [Existing components to reuse]

---

## 🧪 4. Acceptance Criteria & QA Checklist

### Functional Acceptance Criteria
- [ ] **Action:** [Testable step by step] ➔ **Expected result:** [Correct behavior]
- [ ] **Action:** [Testable step by step] ➔ **Expected result:** [Correct behavior]

### Accessibility
- [ ] Every modified interactive component has `accessibilityLabel` or equivalent tags.
- [ ] Visual contrast meets WCAG specifications.

---

## 📋 5. Agile Task Slicing (Linear/GitHub/Obsidian)

*Task breakdown following the AI Session Atomicity rule.*

### 👥 PM Squad (Specifications & Copy)
- **Title:** [PM] Detail copy and flows for [Feature]
- **Priority:** [High/Medium/Low]
- **Criteria:**
  - [ ] Copy validated and free of spelling errors.

### 💻 DEV Squad (Coding)
- **Title:** [DEV] Implement backend/store for [Feature]
- **Priority:** [High/Medium/Low]
- **Criteria:**
  - [ ] Create tables and API routes as per the CTO's technical specification.
- **Title:** [DEV] Implement visual screens for [Feature]
- **Priority:** [High/Medium/Low]
- **Criteria:**
  - [ ] Implement screens using strictly the official design tokens.

### 🛡️ QA Squad (Acceptance Testing)
- **Title:** [QA] Validate flows and security of [Feature]
- **Priority:** [High/Medium/Low]
- **Criteria:**
  - [ ] Validate all functional Acceptance Criteria in Staging.
  - [ ] Audit data security policies and accessibility.
