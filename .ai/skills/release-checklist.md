# Skill: Final Acceptance Checklist (Release Checklist) — {{NOME_DO_PROJETO}}

> This is the official and mandatory protocol for quality assurance and technical compliance to be executed by the QA Agent and CTO Agent before authorizing any merge or production deployment.

---

## 📋 The Final Acceptance Protocol

No code is sent to production without rigorous validation of the following four quality pillars of **Gigio Flow**:

### 1. Functionality & Golden Path (Approved by QA)
-   [ ] **Acceptance Criteria met:** All points listed in the PRD/Issue have been validated and marked as successfully completed.
-   [ ] **No Critical Bugs:** The main flow works flawlessly without layout breaks, crashes, or logic errors in the console.
-   [ ] **Offline / Failure Resilience:** The system gracefully handles network failures (shows loading state, allows retry, and displays friendly error messages).
-   [ ] **Input Testing:** Form fields and user inputs have active format validations (e.g., email, phone, passwords) and prevent blank or broken submissions.

### 2. Design System & Accessibility (Design Lock)
-   [ ] **No Hardcoded Styles:** All new visual styles use the variables/tokens from the Design System described in `knowledge/DESIGN_SYSTEM.md`.
-   [ ] **Contrast & Typography:** The visual contrast of new colors meets readability standards and typographies follow the established hierarchy.
-   [ ] **Active Accessibility:** All modified buttons, links, modals, and interactive elements have appropriate accessibility tags (`accessibilityLabel`, `accessibilityRole`, or ARIA equivalents).

### 3. Security, Data Privacy & RLS (Security Lock)
-   [ ] **No Credential Leaks:** No API key, database password, or private token has been exposed in code files or version control (Git).
-   [ ] **Row Level Security (RLS) active:** New database tables or views have tested and active RLS policies.
-   [ ] **Data Privacy:** No sensitive customer data (phone numbers, emails, payment data) is printed in console logs or public analytics tools.

### 4. Repository Integrity (Self-Evolution Lock)
-   [ ] **TypeScript & Clean Compilation:** The code compiles without static errors and is free of `any` usage to silence TypeScript warnings.
-   [ ] **Current State Updated:** The `knowledge/ESTADO_ATUAL.md` file has been properly modified containing the current date and version changes.
-   [ ] **History Recorded:** The decision log in `knowledge/HISTORICO.md` has the corresponding new chronological entry.
-   [ ] **Obsidian Boards updated:** The task card has been moved and marked as completed (`- [x]`) in the corresponding Kanban board in `boards/`.
