# Skill: Cycle Retrospective (Retrospective) — {{NOME_DO_PROJETO}}

> This skill teaches the Process Analyst how to review a completed delivery
> cycle, identify bottlenecks, and **improve the workflow itself** by editing
> the skills in `.ai/skills/`. This is how Gigio Flow self-evolves.

---

## When to Activate

This skill runs AFTER a card moves to `concluidos` (done). It can be triggered:
- Automatically by the Studio after `POST /api/workflow/complete`
- Manually by the human after any deploy

---

## The Protocol (Step by Step)

> Canonical closeout and evidence rules live in `.ai/WORKFLOW_CONTRACT.md`.
> This skill reviews completed cycles and improves skills without redefining the
> workflow.

### Step 1: Gather Data

Read the following sources:

**A. The completed card** (`.ai/history/concluidos/<card>.md`)
- `## Resultado` — What was delivered
- `## 💻 Desenvolvimento` — What was built, commits
- `## 🧪 Relatório de QA Técnico` — QA findings
- `## 👤 Aprovação...` — What was approved/rejected
- `## 🔗 Issues no Linear` — Which Linear issues were created
- The `## ⚖️ Estimativa de Complexidade` — Estimated vs actual effort

**B. Knowledge base**
- `knowledge/HISTORICO.md` — Chronological log
- `knowledge/ESTADO_ATUAL.md` — Module state

**C. Linear (via MCP)**
- `linear_search_issues` — Find all issues related to this cycle
- `linear_get_issue` — Check each issue's timestamps (created → done)

### Step 2: Analyze

Answer these questions:

**Accuracy**
- Was the estimate accurate? (story points vs actual sessions)
- Were the acceptance criteria clear enough?
- Was anything reworked? Why?

**Blockers**
- Were there external dependencies that blocked progress?
- Was context missing? (architecture, design, API docs)
- Was the PRD complete enough?

**Process**
- Did the handoff between stages work smoothly?
- Were the QA gates effective? (caught real bugs?)
- Did the MCP tools work correctly?

**Time**
- How long from PRD approval to deploy?
- Longest waiting period between stages?

### Step 3: Generate Improvements

For each issue found, suggest a concrete fix:

| Problem | Fix |
|---------|-----|
| "PRD was missing edge cases" | Update `llm-refinement.md` to require edge case section |
| "Estimate was off by 2x" | Update `prd-to-linear.md` with calibration note |
| "QA found security issues" | Update `safety-locks.md` with new rule |
| "Context was incomplete" | Update `dev-cycle.md` to load additional files |
| "MCP tool failed" | Document workaround or fix the MCP server |

### Step 4: Apply Improvements

**Edit the relevant skill file** in `.ai/skills/`. Add a section or modify
existing instructions. Each change should be:

1. **Specific** — "Always check for X before Y"
2. **Testable** — The next cycle can verify compliance
3. **Dated** — Use `[YYYY-MM-DD]` annotation

Example edit to `.ai/skills/prd-to-linear.md`:

```markdown
> [2026-06-06] Retrospective finding: Estimates were 2x off for DB tasks.
> Added explicit "database complexity" factor to estimation guidance.

### Estimation Calibration

When estimating database-related tasks, multiply the raw story points
by 1.5x to account for migration + rollback + seeding overhead.
```

**Do NOT** change rules (`.ai/rules/`) without human approval — they are
immutable by design. Only skills can be auto-edited.

### Step 5: Log the Retrospective

Add an entry to `knowledge/HISTORICO.md`:

```markdown
### [YYYY-MM-DD] — Retrospective: [Card Title]
- **O que melhorou:** [1 sentence]
- **Skill alterado:** `.ai/skills/[skill-name].md`
- **Impacto esperado:** [What the next cycle will do differently]
```

---

## Self-Evolution Contract

- [ ] Every completed cycle MUST have a retrospective (even if 2 lines)
- [ ] The session close checklist in `.ai/WORKFLOW_CONTRACT.md` was completed
- [ ] Skills evolve; rules are immutable without human approval
- [ ] If the same problem appears twice, the fix was insufficient — iterate
- [ ] Celebrate what went well too — document patterns worth repeating
