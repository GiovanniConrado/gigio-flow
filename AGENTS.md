# Gigio Flow — Context and Guidelines for AI

> This file is loaded automatically by AI tools (such as Codex, Cursor, or compatible agents) at the start of every session.
> Read all sections below before starting any work in this repository.

---

## 🌀 What This Workspace Is

This is the **development workspace of Gigio Flow itself** — the product you are helping to build. The project governs itself using the Gigio Flow methodology.

**Gigio Flow** is a lightweight Markdown-based workspace infrastructure, AI squad orchestration, and a local visual panel (Studio), designed so that AI agents and humans can collaborate in a structured, traceable, and high-quality way.

**Purpose of this workspace:** Develop the Gigio Flow Studio (`dashboard/`) — the visual configuration, visualization, and delivery pipeline panel of the ecosystem.

---

## 📁 Directory Structure

```
gigio-flow/
├── .ai/                    ← AI brain and orchestration
│   ├── squads/             ← AI personas (ceo.md, pm.md, cto.md, dev.md, qa.md, process-analyst.md)
│   ├── rules/              ← Immutable rules for security, product, code, and deploy
│   ├── skills/             ← AI operational skills and rituals
│   ├── templates/          ← Task templates (prd.md, feature, bug...)
│   └── history/            ← Local history of tasks completed by AIs
│       └── concluidos/     ← Finalized task files
├── knowledge/              ← Living Knowledge Base (Single Source of Truth) ← POPULATED
│   ├── VISAO.md            ← Mission, business model, goals, and value of Gigio Flow
│   ├── ARQUITETURA.md      ← Tech stack, modules, API contract
│   ├── ESTADO_ATUAL.md     ← Real state of each module and endpoint (always update)
│   ├── ROADMAP.md          ← Product phases and current sprint
│   ├── HISTORICO.md        ← Chronological log of decisions and milestones (ADRs)
│   ├── GLOSSARIO.md        ← Gigio Flow domain-specific terms
│   └── DESIGN_SYSTEM.md    ← Visual tokens synchronized with index.css
├── dashboard/              ← Gigio Flow Studio (frontend + local backend)
│   ├── server.js           ← Express REST API
│   ├── routes/             ← Route modules (projects, workflow, system, linear)
│   ├── services/           ← Services (files.js with validatePath, llm.js with callLLM)
│   ├── src/                ← React 19 + Vite frontend
│   │   ├── App.jsx         ← State orchestrator and tabs
│   │   └── components/     ← Components (Sidebar, KanbanBoard, PipelineView, etc.)
│   └── .env                ← Environment variables (PORT, LINEAR_*)
├── workflows/              ← Continuous delivery pipeline (local physical Kanban)
│   ├── propostas/          ← PRDs awaiting refinement/approval
│   ├── pendentes/          ← Approved tasks awaiting execution
│   └── em-progresso/       ← Tasks under active development
└── boards/                 ← Obsidian visual boards
```

---

## 🔄 The Delivery Flow (Full Pipeline)

Gigio Flow uses a two-layer pipeline:

### Layer 1: Studio (Configuration and Pipeline)
```
Ideation → CEO Agent analyzes → PRD created in workflows/propostas/
                                      ↓
                               Studio: Refine with LLM (full system context)
                                      ↓
                               Studio: Estimate Complexity (story points)
                                      ↓
                               Studio: Human Approval (gate)
                                      ↓
                               Studio: Create Issue in Linear
```

### Layer 2: Linear (Operational)
```
Issue created in Linear → Operational columns (Dev → Technical QA → Human QA → Done)
                                      ↓ (when Done)
                               Linear Webhook → Studio updates ESTADO_ATUAL.md
                                      ↓
                               Card moved to .ai/history/concluidos/
```

---

## 👥 Squads — How to Behave

When the user requests a task, adopt the persona of the **correct squad** by reading `.ai/squads/`:

| Persona / Squad | Profile in `.ai/squads/` | When to Activate |
|-----------------|--------------------------|------------------|
| **CEO Agent** | `ceo.md` | Business strategy, viability, macro roadmap |
| **Process Analyst** | `process-analyst.md` | Workflow auditing, bottleneck identification |
| **PM Agent** | `pm.md` | Functional specs, acceptance criteria, UX |
| **CTO Agent** | `cto.md` | Technical architecture, security, schemas, APIs |
| **Dev Agent** | `dev.md` | Code implementation (strict, no scope creep) |
| **QA Agent** | `qa.md` | Technical validation, accessibility, security |

---

## 🛡️ Core Work Rules

Compliance priority (1 = most important):

1. **Security** (`.ai/rules/security.md`) — Key, credential, and data protection
2. **Safety Locks** (`.ai/rules/safety-locks.md`) — Design Lock + Creative Creep Lock + Static Typing Lock
3. **Deploy Standards** (`.ai/rules/deploy-standards.md`) — Atomic, incremental deliveries
4. **Product Rules** (`.ai/rules/product.md`) — Current business scope
5. **Obsidian Kanban** (`.ai/rules/obsidian-kanban.md`) — Board syntax

### Critical Rules for the Dashboard (Studio):
- **No hardcoded styles:** Use exclusively CSS variables from `index.css`
- **Validate paths:** Every I/O operation uses `validatePath()` from `services/files.js`
- **No `any` in TypeScript** (when migrating): Explicit typing is mandatory
- **Restricted CORS:** Only `localhost:5173` and `localhost:3000`
- **LLM API Keys:** Never persist on the server — stored in the user's localStorage

---

## 📋 Mandatory Session Rituals

### 🌅 Session Start (What to do first)
1. Read `knowledge/ESTADO_ATUAL.md` — understand the current state of each module
2. Read `workflows/pendentes/` — list prioritized tasks
3. Read `workflows/em-progresso/` — check for blocked tasks
4. Present a summary and propose the next highest-impact step

### 🌌 Session Close (When completing any task)
1. Update `knowledge/ESTADO_ATUAL.md` with date and new developments
2. Add an entry to `knowledge/HISTORICO.md` with the decision/milestone
3. Move the card from `workflows/em-progresso/` to `.ai/history/concluidos/` with a `## Result` section
4. If Linear integration is active: update the corresponding issue
5. **Never close without registering** — no exceptions
