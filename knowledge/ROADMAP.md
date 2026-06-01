# Product Roadmap — Gigio Flow

> This file guides the prioritization of new features. The PM Agent and CEO Agent use and update it to keep focus on the medium and long-term product goals.

---

## 🎯 1. Delivery Vision (Goals by Phase)

### Phase 1: Studio V4 (Functional MVP) ← CURRENT
-   **Goal:** Launch the Studio as a configuration/visualization panel with a basic AI pipeline.
-   **Core Features:**
    -   [x] Visual setup wizard (filling out knowledge/)
    -   [x] Kanban synchronized with physical files
    -   [x] CEO Agent chat with Gemini/OpenAI
    -   [x] Multi-workspace management
    -   [x] Workspace health diagnostics
    -   [ ] **Drag-and-drop on Kanban** ← In execution
    -   [ ] **Full LLM pipeline (refine → estimate → QA → approve)** ← In execution
    -   [ ] **Card creation via UI** ← In execution
    -   [ ] **Linear API Integration** ← In execution
    -   [ ] **Backend/frontend refactoring into modules** ← In execution

### Phase 2: Intelligent Pipeline & Linear Bridge
-   **Goal:** Close the complete operational loop: ideation in Studio → execution in Linear → completion automatically recorded.
-   **Core Features:**
    -   [ ] Linear Webhook → automatic ESTADO_ATUAL.md update
    -   [ ] Estimation with historical calibration (based on HISTORICO.md)
    -   [ ] Technical QA with real code diff (git integration)
    -   [ ] Push notifications when card status changes in Linear
    -   [ ] Metrics dashboard: velocity, throughput, lead time

### Phase 3: Gigio Flow Cloud (SaaS)
-   **Goal:** Hosted version with sync, real-time collaboration, and authentication.
-   **Core Features:**
    -   [ ] Authentication (Clerk or Supabase Auth)
    -   [ ] Workspace sync via GitHub (private repository as backend)
    -   [ ] Real-time collaboration (multiple users in the same Studio)
    -   [ ] Premium template marketplace by vertical
    -   [ ] Gigio Flow AI (embedded AI without needing an external key)

### Phase 4: Scale & Ecosystem
-   **Goal:** Make Gigio Flow the market standard for AI-orchestrated projects.
-   **Core Features:**
    -   [ ] Plugin for VS Code and Cursor
    -   [ ] Integration with GitHub Issues, Jira, Asana
    -   [ ] Public API for external automation
    -   [ ] Gigio Flow for teams (Enterprise Tier with SSO and auditing)

---

## 📅 2. Current Sprint Planning

-   **Focus Module:** LLM Delivery Pipeline + Linear Integration + Code Refactoring
-   **Main Prioritized Tasks:**
    -   1. `[GIG-01]` Refactor server.js into modules (routes/, services/)
    -   2. `[GIG-02]` Refactor App.jsx into React components
    -   3. `[GIG-03]` Implement POST /api/workflow/refine (LLM + system context)
    -   4. `[GIG-04]` Implement POST /api/workflow/estimate (story points with LLM)
    -   5. `[GIG-05]` Implement POST /api/workflow/qa-review (LLM technical QA)
    -   6. `[GIG-06]` Implement native HTML5 drag-and-drop on Kanban
    -   7. `[GIG-07]` Create PipelineView.jsx (step-by-step flow visualization)
    -   8. `[GIG-08]` Linear API integration (create issue with checklist)
    -   9. `[GIG-09]` Fix security vulnerabilities (path traversal, CORS, rate limit)
    -   10. `[GIG-10]` Fill knowledge/ with real Gigio Flow data (dogfooding)
