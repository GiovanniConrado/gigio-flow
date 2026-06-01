# Changelog

All notable changes to Gigio Flow are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.1.0] — 2026-06-01

### Added
- **Open-source launch** under MIT License
- `README.md` in English with Codex-first positioning, Mermaid delivery diagram, and quickstart
- `AGENTS.md` for Codex/Claude/Cursor automatic context loading
- `CLAUDE.md` with session rituals and squad behavior rules
- `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` for community health
- `ROADMAP.md` (public) with 4-phase vision
- `.github/ISSUE_TEMPLATE/` with bug report and feature request templates
- `.github/PULL_REQUEST_TEMPLATE.md`
- `docs/CODEX_WORKFLOWS.md` — step-by-step Codex workflow guide
- `docs/DEMO_SCRIPT.md` — 7-step demo story for evaluators
- `docs/INTEGRATIONS.md` — Linear, GitHub, Vercel integration guide
- **Studio Backend V5** (`dashboard/server.js`): modular Express 5 with CORS, rate limiting, and shared state pattern
- **Route modules**: `routes/projects.js`, `routes/workflow.js`, `routes/system.js`, `routes/linear.js`
- **Services**: `services/files.js` (path traversal protection via `validatePath`), `services/llm.js` (Gemini + OpenAI connector)
- **Pipeline endpoints**: `POST /api/workflow/create-card`, `/refine`, `/estimate`, `/qa-review`, `/human-approve`
- **CEO Agent** with real LLM (`POST /api/workflow/approve-ceo-real`) and simulation fallback
- **Multi-workspace management** (`/api/projects` CRUD)
- **System diagnostics** (`GET /api/system/check`)
- **Workspace templates**: Lean, Enterprise, Tech presets
- **Knowledge base** (`knowledge/`): VISAO, ARQUITETURA, ESTADO_ATUAL, ROADMAP, HISTORICO, GLOSSARIO, DESIGN_SYSTEM — fully populated with real Gigio Flow data
- **AI squad personas** (`.ai/squads/`): CEO, PM, CTO, Dev, QA, Process Analyst
- **Immutable rules** (`.ai/rules/`): security, safety-locks, deploy-standards, product, obsidian-kanban
- **Automated test suite**: 25 tests with Vitest + Supertest covering path traversal security, Kanban workflow, LLM pipeline mocks, and Linear GraphQL integration

### Security
- `validatePath()` enforced on all filesystem I/O to prevent path traversal attacks
- CORS restricted to `localhost:5173` and `localhost:3000`
- Rate limiting on all LLM routes (10 req/min)
- LLM API keys stored in browser localStorage only — never persisted server-side
- `.gitignore` covers `.env`, `projects.json`, `linear-config.json`, private keys

---

## Unreleased

### In Progress
- Drag-and-drop on the Kanban board (HTML5 native)
- `POST /api/workflow/create-card` UI modal
- Linear API integration (create issue, webhook sync)
- Frontend component refactor (KanbanBoard, PipelineView)

### Planned
- GitHub branch and PR handoff
- Vercel preview/deployment status sync
- Linear webhook → automatic `ESTADO_ATUAL.md` update
- CI/CD pipeline with coverage reporting
