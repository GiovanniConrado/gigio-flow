# Gigio Flow — Context and Guidelines for AI

> This file is loaded automatically by AI tools (such as Codex, Cursor, or compatible agents) at the start of every session.

---

## ⚡ Quick Start (leia ANTES de qualquer ação)

**O agente faz TUDO.** O painel visual (`http://localhost:5173`) é só um monitor de status.

**Contrato operacional:** `.ai/WORKFLOW_CONTRACT.md` é a fonte viva do fluxo.
Se houver conflito entre AGENTS.md, skills, templates ou histórico antigo, siga
o contrato e depois corrija a instrução duplicada.

### Comandos mais comuns

| Comando do usuário | O que o agente faz |
|---|---|
| **"Mapeie o projeto em `<path>`"** | Chama `POST /api/project/bootstrap`, detecta stack, cria workspace, preenche knowledge |
| **"Crie um workspace novo em `<path>` com `<stack>`"** | Cria estrutura `.ai/`, `knowledge/`, `workflows/`, pergunta missão, squads, Linear |
| **"Configure o que está faltando"** | Lê `GET /api/workspace/status`, identifica arquivos vazios/placeholders, preenche um por um |
| **"Crie uma PRD para `<título>`"** | Cria card em `workflows/propostas/` com template `.ai/templates/prd.md` |
| **"Execute o skill `<nome>`"** | Lê `.ai/skills/<nome>.md` e segue as instruções passo a passo |
| **"Crie issues no Linear"** | Executa `prd-to-linear.md` via MCP `linear_create_issue` |

### Fluxo visual (monitor)

```
Studio → http://localhost:5173 → health score + arquivos + pipeline
Linear → https://linear.app     → issues operacionais (Dev, QA, Deploy)
```

### Se algo está vermelho no monitor

Pergunte ao agente: **"O que está faltando?"** ou **"Corrija os arquivos com placeholder"**.

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
│   ├── skills/             ← AI operational skills and rituals (8 skills)
│   ├── templates/          ← Task templates (prd.md, feature, bug...)
│   └── history/            ← Local history of tasks completed by AIs
│       └── concluidos/     ← Finalized task files
├── .opencode/              ← Opencode MCP config (Linear integration)
│   └── mcp.json            ← MCP server config for Linear
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
│   ├── services/           ← Services (files.js, llm.js with DeepSeek/Gemini/OpenAI)
│   ├── mcp-linear.js       ← MCP Server for Linear (standalone, any IDE can use)
│   ├── src/                ← React 19 + Vite frontend
│   │   ├── App.jsx         ← State orchestrator and tabs
│   │   └── components/     ← Components (Monitor, WorkspaceExplorer, PipelineProgress, etc.)
│   └── .env                ← Environment variables (PORT, LINEAR_*, DEEPSEEK_*)
├── workflows/              ← Continuous delivery pipeline (local physical Kanban)
│   ├── propostas/          ← PRDs awaiting refinement/approval
│   ├── pendentes/          ← Approved PRDs awaiting issue creation
│   └── (active work lives in Linear; closed local records go to .ai/history/concluidos/)
└── boards/                 ← Legacy/optional Obsidian boards, when present
```

---

## 🔄 The Delivery Flow (Full Pipeline)

Gigio Flow uses a two-layer pipeline with **Linear as the operational source of truth**.

```
PRD criado em workflows/propostas/
       ↓
[Studio] Refinamento LLM (refine)
       ↓
[Studio] Estimativa (estimate)
       ↓
[Studio] ▼ GATE 1: Humano aprova escopo
       ↓
[Agente via MCP] PRD → Issues atômicas criadas no Linear
       ├── Usa skill .ai/skills/prd-to-linear.md
       └── Cria issues via MCP linear_create_issue
       ↓
[Agente via MCP] Dev implementa cada issue
       ├── Usa skill .ai/skills/dev-cycle.md
       ├── Carrega contexto de knowledge/
       ├── Commita com referência (ex: "GIG-42: ...")
       └── Atualiza status no Linear via MCP
       ↓
[Studio] QA Técnico (LLM) revisa código
       ↓
[Studio] ▼ GATE 2: Humano aprova QA final
       ↓
[Agente via MCP] Deploy para desenvolvimento
       ↓
[Agente via MCP] Retrospectiva e auto-alimentação
       ├── Usa skill .ai/skills/retrospective.md
       └── Skills se auto-modificam para melhorar o próximo ciclo
```

### Camadas

| Camada | O que faz | Como acessa |
|--------|-----------|-------------|
| **Studio (dashboard/)** | Refinamento, estimativa, QA técnico, diagnóstico | REST API `localhost:3001` |
| **MCP Linear (mcp-linear.js)** | Ponte direta entre IA e Linear | MCP Protocol via `.opencode/mcp.json` |
| **Skills (.ai/skills/)** | Guiam o comportamento do agente em qualquer IDE | Lidos pelo agente na sessão |
| **Linear** | Fonte da verdade operacional (colunas: Backlog → Todo → Desenvolvimento → QA-Tecnica → QA-Funcional → Concluido → Em-Producao) | API GraphQL |

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

## 🎯 Available Skills

Skills provide specialized instructions for each stage of the pipeline:

| Skill | When to use |
|-------|-------------|
| `.ai/skills/prd-to-linear.md` | After PRD is approved — break it into Linear issues |
| `.ai/skills/dev-cycle.md` | When picking up a Linear issue for implementation |
| `.ai/skills/retrospective.md` | After deploy — review and improve the workflow |
| `.ai/skills/bootstrap-project.md` | When mapping an existing project into Gigio Flow |
| `.ai/skills/auto-evolucao.md` | Session close — update knowledge base |
| `.ai/skills/llm-refinement.md` | Refinement methodology for AI tasks |
| `.ai/skills/release-checklist.md` | Final QA checklist before deploy |

## 🔧 MCP Linear Tools

The MCP server (`dashboard/mcp-linear.js`) exposes these tools for any AI agent:

| Tool | Purpose |
|------|---------|
| `linear_list_teams` | List teams |
| `linear_list_states` | List workflow columns |
| `linear_create_issue` | Create issue with title, description, priority |
| `linear_get_issue` | Get issue details |
| `linear_search_issues` | Search issues by query or state |
| `linear_update_issue` | Update status, priority, assignee |
| `linear_add_comment` | Add comment to issue |

Configure in `.opencode/mcp.json` or your IDE's MCP settings.

## 📋 Mandatory Session Rituals

Follow `.ai/WORKFLOW_CONTRACT.md`. It is the living operational contract for
session start, official statuses, evidence comments, authorship labels, QA
layers, proportional workflow, and session closeout.

### Session Start
1. Read `knowledge/ESTADO_ATUAL.md`
2. Read recent `knowledge/HISTORICO.md`
3. Read `.ai/WORKFLOW_CONTRACT.md`
4. Confirm the user's focus before listing tasks, unless the user already gave a clear objective
5. Then consult the relevant source: `workflows/propostas/`, `workflows/pendentes/`, or Linear

### Session Close
Use the checklist in `.ai/WORKFLOW_CONTRACT.md`: update current state/history
when needed, add evidence before status moves, keep Linear/local records aligned,
and separate technical readiness from production readiness.
