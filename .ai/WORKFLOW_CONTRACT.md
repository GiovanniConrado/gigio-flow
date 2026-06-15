# Gigio Flow Operational Contract

> This is the living contract for how agents and humans operate Gigio Flow.
> If another file conflicts with this one, this file wins. Other files may
> specialize a step, but must not redefine the workflow rules.

---

## 1. Source of Truth

Gigio Flow uses two complementary sources of truth:

- `knowledge/ESTADO_ATUAL.md` is the source of truth for the real product and system state.
- Linear is the source of truth for operational task status after scope approval.

Supporting files have narrower roles:

- `knowledge/HISTORICO.md` records decisions and milestones.
- `workflows/propostas/` stores proposed PRDs before scope approval.
- `workflows/pendentes/` stores approved PRDs waiting to become Linear issues.
- `.ai/history/concluidos/` stores closed local cards and final evidence.
- `.ai/skills/` gives step-by-step execution details, but must point back to this contract.

Do not duplicate the full workflow in skills, rules, templates, or AGENTS.md.

---

## 2. Session Start

Every work session starts with real context before task selection:

1. Read `knowledge/ESTADO_ATUAL.md`.
2. Read the newest relevant entries in `knowledge/HISTORICO.md`.
3. Read this contract.
4. Ask or confirm the user's focus before listing tasks, unless the user already gave a clear issue, PRD, or objective.
5. Only then list tasks filtered by that focus:
   - proposed scope: `workflows/propostas/`
   - approved PRDs awaiting Linear split: `workflows/pendentes/`
   - active operational work: Linear
6. If Linear is unavailable, say so and continue only with local artifacts that can be verified.

The agent must not auto-pick broad "next best" work before understanding the user's focus.

---

## 3. Official Statuses

Use only these operational statuses in Linear or equivalent task systems:

1. `Backlog`
2. `Todo`
3. `Desenvolvimento`
4. `QA-Tecnica`
5. `QA-Funcional`
6. `Concluido`
7. `Em-Producao`

Local PRD folders are pre-operational stages, not execution statuses:

- `workflows/propostas/`: proposed or draft scope.
- `workflows/pendentes/`: human-approved scope waiting for issue creation.
- `.ai/history/concluidos/`: archived local records after closure.

Do not invent generic statuses unless they are explicitly mapped to an official
status in the evidence comment.

---

## 4. Role Separation

Keep these responsibilities separate:

- Planning: PM/CTO/Process Analyst define scope, risks, acceptance criteria, and task slicing.
- Technical execution: Dev Agent implements only the approved issue scope.
- QA-Tecnica: Agent validates code, tests, build, lint/type-check, security, performance, and regressions as applicable.
- QA-Funcional: Human/founder/responsible person validates UX, real behavior, device/browser reality, and business acceptance.
- Final approval and production readiness: Human/founder/responsible person only.

An agent may say "technically ready for QA-Funcional". An agent must not say
"approved for production" when human validation, external review, deployment, or
business approval is still pending.

---

## 5. Task Structure

Every created task must include at least:

```markdown
## Contexto
[Why this task exists and what problem it solves.]

## Criterios de aceite
- [ ] [Testable expected behavior]

## Refinamento operacional
- Tamanho: micro | pequena | media | critica
- Papel principal: PM | CTO | Dev | QA | Process Analyst
- Dependencias: [None or task IDs]
- Fora de escopo: [Explicit exclusions]

## Como validar
- [Command, manual step, screenshot, device check, or review required]
```

Use `.ai/templates/task.md` for operational tasks and `.ai/templates/prd.md` for PRDs.

---

## 6. Evidence Before Status Change

Every status change requires an evidence comment before the move.

The comment must answer:

- What changed?
- How was it validated?
- What risks remain?
- What is the next status or next owner?

Never batch-move tasks at the end of a session without individual evidence.
If evidence is missing, add it first, then move the task.

Use `.ai/templates/evidence-comment.md` as the canonical format.

---

## 7. Canonical Signature and Authorship Labels

Every operational comment starts with this signature:

```markdown
[Gigio Flow Evidence] Papel=<role> | Plataforma=<tool/app> | Agente=<agent/model> | Data=<YYYY-MM-DD>
```

Every task should carry one authorship label:

- `autor:humano`
- `autor:codex`
- `autor:studio`
- `autor:cursor`
- `autor:linear-mcp`
- `autor:outro-agente`

Use exactly one primary authorship label. Add role labels separately when useful:
`role:pm`, `role:cto`, `role:dev`, `role:qa`, `role:process`.

---

## 8. Proportional Workflow

Use the smallest workflow that preserves traceability.

| Size | When to use | Required path |
|---|---|---|
| `micro` | typo, copy tweak, tiny doc correction, no behavior risk | one short evidence comment, direct validation, close |
| `pequena` | one focused change, low risk, usually <=2 files | evidence comment, focused validation, QA-Tecnica if code changed |
| `media` | multi-file change, user-facing behavior, integration, schema, workflow rule | full task structure, evidence before each status move, QA-Tecnica, QA-Funcional when behavior matters |
| `critica` | auth, billing, security, release, data loss, production path, irreversible workflow change | full workflow, explicit blockers, QA-Tecnica, QA-Funcional, human approval before production |

When in doubt, classify one level higher and explain why.

---

## 9. QA Rules

QA-Tecnica is agent-owned and must include the relevant subset of:

- tests
- build
- lint/type-check
- code review
- security review
- performance/regression review
- path and secret handling review for Studio/backend changes

QA-Funcional is human-owned and should validate:

- real UX and copy
- expected behavior in the actual app
- browser/device/runtime reality
- business acceptance
- release or production approval

Passing tests/build means "technical signal is green"; it does not mean
"ready for production".

---

## 10. Session Mini-Checks

At every change of subject or completed block, the agent asks internally:

> Does the task system reflect what I just did?

If the answer is no, update the relevant comment, status, local file, or history
before continuing.

---

## 11. Session Close

Before ending a completed work session, show or perform this checklist:

- [ ] `knowledge/ESTADO_ATUAL.md` reflects the real current state.
- [ ] `knowledge/HISTORICO.md` has the decision or milestone when one occurred.
- [ ] Each touched task has evidence before any status change.
- [ ] Linear reflects active operational status, or the limitation is stated.
- [ ] Local cards were moved or archived only when appropriate.
- [ ] Old/large history was archived or left alone with a note if not relevant.
- [ ] Technical readiness and production readiness are stated separately.
- [ ] Answered: "Does the management system reflect what was done?"

Do not close a session by only saying the code is done.

---

## 12. Drift Control

When a contradiction appears:

1. Prefer this contract.
2. Record the contradiction in the evidence or audit note.
3. Update the smaller, duplicated instruction to point here.
4. If a rule file in `.ai/rules/` must change, ask the human first.

The goal is a workflow that future agents can follow without guessing.
