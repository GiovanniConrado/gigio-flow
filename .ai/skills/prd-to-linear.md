# Skill: PRD to Linear Issues (PRD to Linear) — {{NOME_DO_PROJETO}}

> This skill teaches the CTO Agent how to transform an approved PRD into atomic,
> actionable issues in Linear. Each issue must be implementable in a single
> AI session without exceeding context limits.

---

## When to Activate

This skill runs AFTER the human has approved the PRD scope (Gate 1). The PRD
card is in `workflows/pendentes/` and the `## Aprovação de Escopo` section
shows `✅ APROVADO`.

---

## Prerequisites

- Linear MCP Server running (tools: `linear_list_teams`, `linear_create_issue`,
  `linear_search_issues`)
- Linear teamId known (from Studio config or `linear_list_teams`)
- PRD card content read and available

---

## The Protocol (Step by Step)

> Canonical workflow, status, evidence, authorship, and proportionality rules
> live in `.ai/WORKFLOW_CONTRACT.md`. This skill only describes how to split an
> approved PRD into Linear issues.

### Step 1: Read the PRD

Read the PRD card from `workflows/pendentes/`. Extract:

- **`## 🎯 1. Overview and Business Context`** — The business goal
- **`## 🎨 2. User Journey & UX`** — The golden path and edge cases
- **`## 🛠️ 3. Technical Specification & Architecture`** — DB, APIs, state
- **`## 🧪 4. Acceptance Criteria & QA Checklist`** — Testable criteria
- **`## 📋 5. Agile Task Slicing`** — Any pre-sliced tasks (PM/DEV/QA)

### Step 2: Identify Atomic Work Items

Apply the **Session Atomicity Rule** from `llm-refinement.md`:

| Rule | Break apart if... |
|---|---|
| **File Limit** | Task touches >3 code files |
| **Layer Separation** | Task mixes DB + UI in one issue |
| **External Integration** | Task has payments/auth as separate concern |
| **Risk Isolation** | Schema changes must be isolated from business logic |

For each atomic work item, define:

```
Title:    [prefix] verb + component
          e.g. "[DEV] Create payments table and RLS policies"
               "[DEV] Integrate Stripe checkout API"
               "[DEV] Build checkout UI with design tokens"

Scope:    1-2 sentences maximum
Files:    Exact file paths to be created/modified
Criteria: 3-5 testable acceptance criteria (from PRD, decomposed)
Blocked:  IDs of issues that must be done first
Squad:    DEV / QA / PM
Estimate: Story points (1, 2, 3, 5, 8)
Size:     micro / pequena / media / critica
Authorship label: autor:codex / autor:humano / autor:studio / ...
```

### Step 3: Create Issues in Linear

Use MCP tool `linear_create_issue` for each atomic item:

```
Tool:  linear_create_issue
Input: {
  title:       "[DEV] Create payments table and RLS policies",
  description: "## Scope\n\nCreate the payments table...\n\n## Acceptance Criteria\n- [ ] ...",
  teamId:      "<teamId>",
  priority:    2,          // 0=none, 1=urgent, 2=high, 3=medium, 4=low
  estimate:    3,          // story points
  stateId:     "<backlog-or-todo-state-id>"
}
```

**Important:** Issues with dependencies must be created in order. Use
`linear_update_issue` to set parent/child relationships if Linear supports it,
or add a `## Depends On` section in the description.

Every issue description must include the required sections from
`.ai/WORKFLOW_CONTRACT.md`: Contexto, Criterios de aceite, Refinamento
operacional, and Como validar.

### Step 4: Annotate the PRD Card

After creating all issues, append to the PRD card file:

```markdown
## 🔗 Issues no Linear

| Issue | Title | URL |
|-------|-------|-----|
| GIG-42 | [DEV] Create payments table... | https://linear.app/... |
| GIG-43 | [DEV] Integrate Stripe... | https://linear.app/... |
| GIG-44 | [QA] Validate payment flow... | https://linear.app/... |
```

Then keep the PRD card in `workflows/pendentes/` with links to the Linear issues
or archive it only when the full PRD cycle is closed. Active operational status
now lives in Linear, not in `workflows/em-progresso/`.

### Step 5: Update State

Update `knowledge/ESTADO_ATUAL.md`:

```markdown
### [YYYY-MM-DD] — PRD "[PRD Title]" quebrado em issues no Linear
- **Issues criadas:** GIG-42, GIG-43, GIG-44
- **Total story points:** XX
```

---

## Quality Gates (Never Skip)

- [ ] Each issue has exactly **one** clear deliverable
- [ ] Each issue lists the **exact file paths** to modify
- [ ] Each issue has **3-5 testable** acceptance criteria
- [ ] Each issue has Contexto, Criterios de aceite, Refinamento operacional, Como validar
- [ ] Each issue has one authorship label
- [ ] Dependencies between issues are documented
- [ ] No issue exceeds **8 story points** (if it does, split again)
