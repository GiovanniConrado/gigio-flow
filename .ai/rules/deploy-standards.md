# Release and Deploy Standards — {{NOME_DO_PROJETO}}

> These rules are immutable and mandatory for ANY squad, AI agent, or human developer interacting with this repository.

---

## 🚀 1. Incremental and Atomic Delivery Philosophy (Atomic Releases)

To ensure the product is always in a stable and deployable state:
-   **Small, Focused Commits:** Avoid massive commits containing dozens of unrelated changes. Each commit must represent a single, atomic logical change.
-   **Work on Atomic Branches:** All development must be done on specific feature/bug branches (e.g., `feature/feature-name` or `bug/flow-fix`).
-   **Merging via Pull Request (PR):** Direct commits to the main branch (`main`/`master`) in production are expressly forbidden. All changes must go through Pull Requests validated by the QA Agent and approved by the founder.

---

## 🧪 2. Mandatory Static Tests and Linters (Pre-Release Validation)

Before opening any Pull Request or sending the task to QA:
-   **Static Type Checking:** The Dev Agent must mandatorily run the static compilation check for the compiler corresponding to the stack in use (e.g., `npm run tsc -- --noEmit`).
-   **Linter Execution:** The code must be free of warnings and style errors from the project's official linter (e.g., ESLint, Prettier):
    ```bash
    npm run lint
    ```
-   **Unit/Integration Test Execution:** If the project has an automated test suite (Jest, Vitest, Cypress), all tests must run with 100% success locally:
    ```bash
    npm run test
    ```
    Any unit test failure immediately blocks the delivery.

---

## 🛡️ 3. Environment Deploy Protocol (Deploy Pipeline)

The code lifecycle must rigorously respect the following environments:

1.  **Development / Local:** Where the Dev Agent codes and runs initial tests.
2.  **Staging / UAT:** An environment identical to production where the QA Agent performs complex manual tests, validates layouts on multiple devices, and simulates connections.
3.  **Production (Live):** The real customer environment. Deployment to production only occurs after the founder's formal "OK" in the Staging environment.

---

## 🔄 4. Rollback Strategy (Feature Toggles and Reversion)

-   **Feature Flags / Toggles:** For complex or high-risk features, implement feature flag locks so that new code can be remotely disabled on the backend without the need for a new emergency deploy.
-   **Emergency Rollback:** If a critical bug slips through and affects users in production, the CTO Agent and Dev Agent must be prepared to revert the problematic commit on the main branch in less than 5 minutes, restoring the last known stable version:
    ```bash
    git revert [FAULTY_COMMIT_HASH]
    ```
-   **Post-Mortem:** Every emergency reversion requires an audit meeting led by the Process Analyst to identify the failure in the QA process and update the corresponding security rules.
