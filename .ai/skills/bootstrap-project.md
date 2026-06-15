# Skill: Bootstrap Project (Bootstrap) — {{NOME_DO_PROJETO}}

> This skill teaches the agent how to map an existing project folder into a
> Gigio Flow workspace — detecting its tech stack, structure, and filling the
> knowledge base automatically.

---

## When to Activate

This skill runs when the human says:
- "I want to start using Gigio Flow on [project path]"
- "Map my existing project"
- "Bootstrap this folder"

---

## The Protocol (Step by Step)

### Step 1: Detect the Tech Stack

Read the project root for clues:

| File | Stack Detected |
|------|----------------|
| `package.json` | Node.js / TypeScript / React / Vue / Next.js |
| `requirements.txt` or `pyproject.toml` | Python / Django / FastAPI |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `Gemfile` | Ruby / Rails |
| `composer.json` | PHP / Laravel |
| `pubspec.yaml` | Flutter / Dart |
| `.csproj` or `*.sln` | C# / .NET |

Read the primary config file and extract:
- Project name (from `name` field)
- Version
- Dependencies (top 10-15)
- Scripts / commands (dev, build, test, lint)

### Step 2: Scan Directory Structure

Analyze the folder tree (top 3 levels):

```
project/
├── src/          ← source code
├── tests/        ← test files
├── public/       ← static assets
├── docs/         ← documentation
├── config/       ← configuration
└── ...
```

Identify:
- Entry point(s) — `main.ts`, `index.js`, `app.py`, `main.rs`
- Framework config — `vite.config.ts`, `next.config.js`, `Django settings`
- Database — `schema.prisma`, `migrations/`, `models/`
- API routes — `routes/`, `api/`, `controllers/`

### Step 3: Generate Knowledge Base

Create the workspace structure:

```
<project>/
├── .ai/
│   ├── squads/     ← copy from Gigio Flow default
│   ├── rules/      ← copy from Gigio Flow default
│   ├── skills/     ← copy from Gigio Flow default
│   ├── templates/  ← copy from Gigio Flow default
│   └── history/
│       └── concluidos/
├── knowledge/
│   ├── VISAO.md         ← generated from README + package.json
│   ├── ARQUITETURA.md   ← generated from stack + structure
│   ├── ESTADO_ATUAL.md  ← template
│   ├── ROADMAP.md       ← template
│   ├── HISTORICO.md     ← empty, with header
│   ├── GLOSSARIO.md     ← empty, with header
│   └── DESIGN_SYSTEM.md  ← placeholder or detected
├── workflows/
│   ├── propostas/
│   ├── pendentes/
│   └── em-progresso/
└── boards/
```

### Step 4: Fill Knowledge Files

**`knowledge/VISAO.md`** — Business Context
- Project name from `package.json` name field
- Description from README.md first paragraph
- If no README, prompt the human: "What problem does this solve?"

**`knowledge/ARQUITETURA.md`** — Technical Context

```markdown
## 🛠️ Technology Stack (Auto-Detected)

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite |
| Backend  | Express 5 |
| Database | PostgreSQL (via Prisma) |
| Testing  | Vitest |

## 📁 Directory Structure

```
Auto-generated from scan...
```

## 🚀 Commands

- dev: `npm run dev`
- build: `npm run build`
- test: `npm run test`
- lint: `npm run lint`
```

**`knowledge/ESTADO_ATUAL.md`** — Current State

```markdown
# Current Product State — [Project Name]

> **Last Update:** YYYY-MM-DD
> **Status:** ⏳ Recém-inicializado via Bootstrap

## Módulos Detectados

| Module | Status | Notes |
|--------|--------|-------|
| [from scan] | ⏳ Pending | Auto-detected |
```

### Step 5: Validate

After generation, run diagnostics:

```
Tool: GET /api/system/check
```

Or manually verify:
```
.ai/squads/    ← 6 files present
.ai/rules/     ← 5 files present
.ai/templates/ ← 4 files present
knowledge/     ← 7 files present
workflows/     ← 3 folders present
```

### Step 6: Report to Human

Present a summary:

```
## ✅ Workspace Criado: [Project Name]

**Stack detectado:** React 19 + Express 5
**Comandos:** npm run dev | npm run build | npm run test
**Arquivos criados:** 25

**Próximos passos sugeridos:**
1. Revisar `knowledge/VISAO.md` — adicione o contexto de negócio
2. Revisar `knowledge/ARQUITETURA.md` — confirme o stack detectado
3. Configurar Linear via Studio (integrações)
4. Criar sua primeira PRD em `workflows/propostas/`
```

---

## Quality Gates

- [ ] All 7 knowledge files exist and are filled
- [ ] All 3 workflow folders exist
- [ ] All 6 squads + 5 rules + 4 templates copied
- [ ] Project name and stack detected correctly
- [ ] The human confirms the VISAO.md is accurate
