# Skill: AI Backlog Refinement (LLM Refinement) — {{NOME_DO_PROJETO}}

> This skill describes the recommended billing and task refinement practice designed specifically for Artificial Intelligence agents, replacing traditional human story point estimates.

---

## 🧠 The Premise: Why Don't Story Points Work for AI?

Language models (LLMs) have no concept of "human work hours" or "sprint velocity." An AI's ability to execute a task successfully and without regression errors depends essentially on three factors:

1.  **Context Size:** How many files it needs to read and modify simultaneously.
2.  **Ambiguities:** How detailed, logical, and testable the Acceptance Criteria in the issue are.
3.  **Edit Scope:** Tasks involving many parallel modifications across different layers (database, API routes, global state store, user interface) generate a high probability of code hallucination and metadata forgetting.

Therefore, refinement in **Gigio Flow** measures complexity based on **AI Session Atomicity**.

---

## 📏 The Golden Rule: Session Atomicity

> **A task is excellently refined when it can be fully implemented, statically tested, and approved by QA in a single conversation (session), without exceeding the AI's context limit.**

### Split Thresholds for Task Slicing

The PM Agent and CTO Agent must mandatorily break down a feature proposal into smaller, atomic tasks if it violates any of the following limits:

-   **Modified Files Limit:** The task requires changing more than **3 code files** simultaneously (excluding configuration files such as `package.json`, `pnpm-lock.yaml`, or `CLAUDE.md`).
-   **Responsibility Limit (Database vs UI):** The task involves modifying the database (schemas, RLS, migrations) AND the visual interface (CSS, HTML, React, etc.).
    -   *How to slice:* Divide into ordered sub-tasks:
        1.  `TASK-A` (Backend: Create Table/Fields/Migration and Security Policies).
        2.  `TASK-B` (Integration: Connect API, manage global states and stores).
        3.  `TASK-C` (UI: Visual screens, navigation, responsiveness and accessibility).
-   **External Integrations Limit:** Changes involving API keys and payment flows or third-party gateways (e.g., Stripe, RevenueCat, local gateways) must be fully isolated from cosmetic visual implementations.

---

## 📊 Context Complexity Classification

Instead of points (1, 2, 3, 5, 8), tasks are classified by **Context Effort Level**:

| Classification | File Impact | Regression Risk | Required Test Type |
| :--- | :--- | :--- | :--- |
| **Easy (Low)** | 1 file | Low | Basic visual rendering test |
| **Medium** | 1 to 2 files | Medium | Full flow test (Golden Path) |
| **Complex (High)** | 2 to 3 files | High | Offline test + connection failure simulation |
| **Critical** | Touches RLS, Payments, or Authentication | Very High | Security audit + Data Privacy logs + Staging environment test |

---

## 📋 Refinement Checklist (Definition of Ready)

Before moving a task from the `workflows/propostas/` folder to `workflows/pendentes/` (signaling it is ready for the Dev Agent to start), the PM and CTO must sign off on the following refinement checklist:

-   [ ] **Atomic Criteria:** Do the acceptance criteria describe single, easily verifiable end-to-end behaviors?
-   [ ] **File Mapping:** Have the exact files to be modified been identified and listed in the issue?
-   [ ] **Defined Metrics:** Does the issue specify which log should be generated or which analytics metric should be impacted?
-   [ ] **Declared Dependencies:** Is it clear whether this task depends on external API keys or other completed issues?
-   [ ] **Design Lock:** Is there a visual reference (Figma link, layout system, or design tokens) so the AI does not invent styles?
-   [ ] **Kanban Registration:** Have the tasks been mandatorily added to the Backlog column of the correct Kanban board in the `boards/` folder?
