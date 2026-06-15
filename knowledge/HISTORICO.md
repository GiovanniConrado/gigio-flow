# Decision History and Milestones — Gigio Flow

> Reverse chronological log of all architectural decisions (ADRs) and relevant delivery milestones. Updated by the AI at the end of each completed session.

---

### [2026-06-15] - Operational Contract v1
- **What changed:** Created `.ai/WORKFLOW_CONTRACT.md`, `.ai/templates/task.md`, and `.ai/templates/evidence-comment.md`; updated AGENTS.md and key skills to point to the central workflow contract.
- **Context & Motivation:** Process audit found drift risk between session rituals, removed `workflows/em-progresso/`, Linear-as-source-of-truth, and duplicated skill instructions. The new contract makes status, evidence, authorship, QA layers, proportional workflow, and session closeout explicit.
- **System Impact:** Future agents should start from one workflow contract, add evidence before moving statuses, separate QA-Tecnica from QA-Funcional, and distinguish technically ready from production ready.

---

### [2026-06-15] - Operational diagnostics and Linear status map
- **What changed:** Added `.ai/linear-status-map.json` and expanded Studio diagnostics to check workflow-contract coverage, legacy references, and missing official Linear status mappings.
- **Context & Motivation:** A written contract alone still leaves room for silent drift. The monitor now helps detect when docs and skills stop reflecting the real operating model.
- **System Impact:** `dashboard/routes/system.js` and `dashboard/src/components/Monitor.jsx` now expose operational health signals, while walkthrough and workflow docs were aligned with the Linear-first flow.

---

### [2026-06-06] — Skills v2 + MCP Linear + DeepSeek
- **What changed:** Created 4 operational skills (prd-to-linear, dev-cycle, retrospective, bootstrap), MCP server for Linear with 7 tools, DeepSeek LLM provider, PRD→issues route, project bootstrap route.
- **Context & Motivation:** Need for structured, repeatable, IDE-agnostic dev flow with Linear as operational source.
- **System Impact:** New: `.ai/skills/prd-to-linear.md`, `.ai/skills/dev-cycle.md`, `.ai/skills/retrospective.md`, `.ai/skills/bootstrap-project.md`, `dashboard/mcp-linear.js`, `.opencode/mcp.json`. Modified: `services/llm.js`, `routes/workflow.js`, `routes/system.js`, `PipelineView.jsx`, `AGENTS.md`.

---

### [2026-06-06] — Studio V5 Repositioned: Knowledge + AI Console
- **What changed:** Complete repositioning of the Studio. Removed KanbanBoard (replaced by Linear as visual board). New navigation: Overview, Knowledge, AI Console, Config, Diagnostics. Created 3 new components (Overview, KnowledgeEditor, AiConsole). Simplified PipelineView to 3 AI actions. Root cleanup: removed `.obsidian/`, `boards/`, `CLAUDE.md`, `ROADMAP.md`, `CHANGELOG.md`, `workflows/em-progresso/`. New README as main manual.
- **Context & Motivation:** Studio was trying to be a mini-Linear and failing. Linear is the operational source of truth. Studio now focuses on what Linear cannot do: knowledge management, AI pipeline (refine/estimate/QA), CEO ideation, diagnostics, bootstrap.
- **System Impact:** New: `Overview.jsx`, `KnowledgeEditor.jsx`, `AiConsole.jsx`. Removed: `KanbanBoard.jsx`, `boards/`, `.obsidian/`, `CLAUDE.md`, `ROADMAP.md`, `CHANGELOG.md`, `workflows/em-progresso/`. Modified: `App.jsx`, `Sidebar.jsx`, `PipelineView.jsx`, `routes/system.js` (+knowledge endpoints), `README.md`, `AGENTS.md`, `knowledge/`.



---### [2026-06-01] — Automated Test Suite with Vitest and Supertest
- **What changed:** Implementation of 25 automated unit and integration tests covering disk I/O security against Path Traversal, local Kanban routes, advanced LLM pipeline simulations (refine, estimate, qa-review), and Linear webhooks/APIs.
- **Context & Motivation:** Technical preparation of the repository for OpenAI's Codex for Open Source program. The absence of automated tests was the main technical bottleneck for approval in open-source excellence programs.
- **System Impact:** Installation of `vitest` and `supertest` in the Studio development environment. Creation of the `dashboard/tests/` folder containing 100% isolated tests that run offline, fast (680ms), and without modifying real production files of the user.

---

### [2026-05-27] — Full LLM Pipeline + Linear Integration Started
- **What changed:** Start of the implementation of the complete delivery pipeline: LLM refinement with system context, complexity estimation, automated technical QA, human approval gate, and Linear API integration.
- **Context & Motivation:** Critical analysis of the project revealed that the Studio was incomplete as a configuration panel and that the operational flow needed to be connected to Linear as the execution tool. Decision to use Linear as the task operating system and the Studio as the configuration/visualization/pipeline panel.
- **System Impact:** Addition of 4 new backend endpoints (refine, estimate, qa-review, create-card), new PipelineView.jsx component, refactoring of server.js into routes/ and services/ modules. Installation of dotenv and express-rate-limit.

---

### [2026-05-27] — Dogfooding: knowledge/ Filled with Real Data
- **What changed:** All files in the `knowledge/` folder were filled with the real data of Gigio Flow itself as a product.
- **Context & Motivation:** Contradiction identified: the project promoted structured knowledge management but did not apply it to itself. VISAO.md, ESTADO_ATUAL.md, ROADMAP.md, ARQUITETURA.md, HISTORICO.md, GLOSSARIO.md, and DESIGN_SYSTEM.md now contain real information.
- **System Impact:** The AI now has real context about the product itself when working on Gigio Flow, making LLM refinement much more precise.

---

### [2026-05-26] — Studio V4 Launched with Real CEO Agent
- **What changed:** Publication of Gigio Flow Studio V4 with support for Gemini 2.5 Flash and GPT-4o-mini for real strategic analysis by the CEO Agent. Multi-workspace feature implemented.
- **Context & Motivation:** Previous Studio versions (V1-V3) had only simulated analysis. V4 connects with real LLM APIs, enabling genuine strategic debates.
- **System Impact:** Addition of `/api/workflow/approve-ceo-real` and `/api/workflow/approve-ceo` (simulation fallback) routes. `llmConfig` state in the frontend to manage provider/key.

---

### [2026-05-25] — Markdown-as-Database Architecture Consolidated
- **What changed:** Definitive decision to use Markdown files as the system's single source of truth, without a relational or NoSQL database.
- **Context & Motivation:** We evaluated using SQLite for Studio persistence, but concluded that Markdown is superior for Gigio Flow's purpose: it is human-readable, AI-readable, portable, versionable with git, and requires no additional infrastructure.
- **System Impact:** All I/O goes through `fs.readFileSync/writeFileSync`. Server state is volatile (restarting the server reloads from disk), which is the correct behavior.

---

### [2026-05-24] — Squad Structure and Rules Defined
- **What changed:** Creation of the 6 Squad personas (.ai/squads/), 5 immutable rules (.ai/rules/), 3 operational skills (.ai/skills/), and 4 templates (.ai/templates/).
- **Context & Motivation:** The central hypothesis of Gigio Flow is that AIs work better with specific personas, strict rules, and defined session rituals. The file structure materializes this hypothesis.
- **System Impact:** Each squad file has ~3.5KB of rich context. The AI automatically loads the correct persona when opening the workspace in Claude Code/Cursor.

---

### [2026-06-01] - Open Source Launch Pack for Codex
- **What changed:** Repository prepared for MIT open source publication with a Codex-first README, LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, issue templates, PR template, `.gitignore`, `.env.example`, public roadmap, and workflows/integrations documentation.
- **Context & Motivation:** Decision to position Gigio Flow as a local protocol/workspace for AI squads with Codex, combining product artifacts, technical memory, and integrations with Linear, GitHub, and Vercel.
- **System Impact:** The public base now explains that Linear is the operational visual board, while Gigio Flow controls context, discovery, PRDs, refinement, technical handoff, and historical records for agents.
