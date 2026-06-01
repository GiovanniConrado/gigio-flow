# Glossary of Terms — Gigio Flow

> Dictionary of Gigio Flow domain-specific terms. The AI uses this glossary to ensure semantic consistency across all documentation, code, and communication.

---

## Fundamental Terms

**Workspace**
: A project root folder that follows the Gigio Flow structure (contains `.ai/`, `knowledge/`, `workflows/`, `boards/`). A workspace represents a project, product, or startup.

**Squad**
: A specialized AI persona with identity, responsibilities, and non-negotiable rules defined in `.ai/squads/`. Each squad acts as a specific role in a product team: CEO, PM, CTO, Dev, QA, Process Analyst.

**Studio**
: The local visual panel (dashboard/) that serves as the configuration, visualization, and control interface of the Gigio Flow workspace. Runs at `http://localhost:5173` (frontend) and `http://localhost:3001` (backend).

**Delivery Pipeline**
: The sequential flow of a task from ideation to production: Proposal → LLM Refinement → Estimation → Human Approval → Execution → Technical QA → Human QA → Linear → Done.

**Knowledge Base**
: The `knowledge/` folder containing the 7 fundamental project documents: VISAO, ARQUITETURA, ESTADO_ATUAL, ROADMAP, HISTORICO, GLOSSARIO, DESIGN_SYSTEM. It is the project's persistent memory.

**Session Ritual**
: Mandatory protocol the AI follows at startup (`knowledge/ESTADO_ATUAL.md` → pending tasks → proposal) and at close (update ESTADO_ATUAL → record in HISTORICO → move card).

**Self-Evolution**
: The skill that instructs the AI to autonomously update the knowledge files after each delivery, ensuring the workspace is always the up-to-date Source of Truth.

**Safety Lock**
: An immutable rule in `.ai/rules/safety-locks.md` that blocks undesired AI behaviors: ad-hoc styles, scope creep, use of `any` in TypeScript, destructive database changes.

**Design Lock**
: The specific rule that prohibits the AI from using hardcoded style values (hex colors, magic margins). All styles must come from the tokens in `DESIGN_SYSTEM.md`.

**Strategic Viability Assessment**
: The structured document that the CEO Agent generates when analyzing a new idea. Contains: Value Thesis, Cost vs. Impact, Mapped Risks, and Verdict (Proceed/Modify/Shelve).

**Card**
: A Markdown file within one of the workflow folders (`propostas/`, `pendentes/`, `em-progresso/`) representing a task or specification.

**Delivery Pipeline (physical)**
: The set of workflow folders (`workflows/`) that form the local physical Kanban: propostas → pendentes → em-progresso → concluídos (`.ai/history/concluidos/`).

**PRD (Product Requirements Document)**
: The functional specification document for a feature or task. Created by the PM Agent using the template at `.ai/templates/prd.md`.

**Story Points**
: Unit of measurement for task complexity, estimated by the CTO Agent based on analysis of the technical scope, impacted files, and regression risk.

**LLM Refinement**
: The process of enriching a raw PRD with atomic acceptance criteria, technical dependencies, and risks, using the full system context as input for the LLM.

**Approval Gate**
: A human checkpoint in the pipeline where the founder/PM validates whether the proposal or QA result can advance to the next stage.

**Dogfooding**
: The practice of using Gigio Flow itself to manage the development of Gigio Flow. The workspace at `c:\Users\conra\Desktop\gigio-flow` is the real-world use case of the product.
