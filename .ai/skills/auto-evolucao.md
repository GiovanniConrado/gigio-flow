# Skill: Workspace Self-Evolution (Self-Evolution Skill) — {{NOME_DO_PROJETO}}

> This skill teaches AI agents to autonomously update the project's state and knowledge base after each delivery, ensuring the repository is self-documented.

---

## 🧠 The Philosophy of Self-Evolution

In typical agile projects, technical documentation (architecture, current state of screens, decision logs) quickly becomes outdated because human developers prioritize writing code over writing explanatory text.

In **Gigio Flow**, AI solves this problem through the **Self-Evolution** ritual. Every time a task is completed or a relevant architectural decision is made, the AI itself actively records that change in the knowledge base, ensuring the repository is the one and definitive Single Source of Truth — updated in real time.

---

## 🛠️ The Execution Protocol (Step by Step)

Immediately after receiving the final validation (APPROVED) from the QA Agent for a task, the **Process Analyst Agent** or the **CTO Agent** must run the following steps:

### Step 1: Update `knowledge/ESTADO_ATUAL.md`
-   Open the file [`knowledge/ESTADO_ATUAL.md`](file:///c:/Users/conra/Desktop/gigio-flow/knowledge/ESTADO_ATUAL.md).
-   Locate the section corresponding to the modified component.
-   Update the "Last Modified" date to the current date.
-   Write an objective summary of the new functions implemented, files created, and new active endpoints.
-   If there is a technical refactoring, record the impact on the final application size or performance.

### Step 2: Add an entry to `knowledge/HISTORICO.md`
-   Open the file [`knowledge/HISTORICO.md`](file:///c:/Users/conra/Desktop/gigio-flow/knowledge/HISTORICO.md).
-   Insert a new line or block at the top of the chronological milestone list with the current date.
-   Entry Structure:
    ```markdown
    ### [YYYY-MM-DD] — [Short Decision/Delivery Title]
    - **What changed:** [1-sentence summary of the delivery]
    - **Context & Motivation:** [Why this decision was made or what motivated the change]
    - **System Impact:** [Which files/tables were impacted and risks mitigated]
    ```

### Step 3: Record and Archive the completed task locally
-   Move the corresponding task markdown file from `workflows/em-progresso/` to the `.ai/history/concluidos/` folder (or create the folder if it does not exist).
-   Add a special section at the end of the markdown file called `## Execution Result` detailing:
    -   Commits generated (hashes and messages).
    -   Evidence of static and manual tests run by QA.
    -   Completion date and time.

---

## 🚫 Rules the AI never breaks

-   **No Unregistered Sessions:** It is expressly forbidden for the AI to complete a code or PRD change and close the session without performing Steps 1 and 2.
-   **Date Rigor:** All dates must follow the standard international ISO format: `YYYY-MM-DD` (e.g., `2026-05-27`).
-   **Humble Clarity:** The writing of history and current-state logs must be technical, precise, concise, and humble — avoiding promotional or superlative terms.
