# Process Audit - Workflow Hardening

> Date: 2026-06-15
> Persona: Process Analyst
> Scope: Gigio Flow operating model, agent rituals, local Markdown workflow, and Linear handoff.

---

## 1. Fact Mapping

Inspected sources:

- `AGENTS.md`
- `knowledge/ESTADO_ATUAL.md`
- `knowledge/HISTORICO.md`
- `.ai/squads/process-analyst.md`
- `.ai/skills/dev-cycle.md`
- `.ai/skills/prd-to-linear.md`
- `.ai/skills/retrospective.md`
- `.ai/templates/prd.md`
- `workflows/pendentes/drag-and-drop-kanban.md`

Current reality:

- Gigio Flow already decided that Linear is the operational source of truth after PRD approval.
- The local workflow folders still hold pre-operational artifacts: `propostas` and `pendentes`.
- `workflows/em-progresso/` was removed in the V5 repositioning, but some rituals and skills still referenced it.
- Session start rules existed, but they listed tasks before confirming the user's focus.
- Task structure existed for PRDs, but not for every operational issue.
- Evidence, authorship, official statuses, and two-layer QA were not yet standardized in one contract.

---

## 2. Bottleneck Diagnosis

### Drift Risk: Multiple Workflow Sources

AGENTS.md, skills, templates, and history repeated parts of the workflow. This makes future agents likely to follow whichever file they read last.

### Removed Folder Still Referenced

`workflows/em-progresso/` was removed from the actual operating model, but older instructions still told agents to read or move cards there.

### Task Selection Too Early

The old ritual asked agents to list pending work before asking the user's focus. That can create noisy sessions and wrong prioritization.

### Statuses Not Contracted

Linear is the operational source of truth, but official status names were not defined in one place.

### Evidence Not Mandatory Enough

Skills mentioned updates, but did not require evidence before every status change with a canonical comment format.

### QA and Approval Could Blur

The previous flow had technical QA and human approval, but did not strongly prevent agents from treating passing tests as launch approval.

---

## 3. Operational Proposal

The improved model is:

1. Keep `.ai/WORKFLOW_CONTRACT.md` as the single workflow contract.
2. Keep AGENTS.md as a loader and orientation file, not a duplicated rulebook.
3. Keep skills as execution playbooks that point back to the contract.
4. Keep PRD and task templates minimal but mandatory.
5. Use Linear for active status after approval.
6. Use local Markdown for knowledge, PRDs, decisions, and evidence archive.

Core policies now centralized:

- session start with real context and user focus
- official statuses
- task structure
- evidence before movement
- canonical evidence signature
- authorship labels
- proportional workflow by task size
- QA-Tecnica vs QA-Funcional
- closeout checklist
- drift resolution rules

---

## 4. Created or Updated Documents

Created:

- `.ai/WORKFLOW_CONTRACT.md`
- `.ai/templates/task.md`
- `.ai/templates/evidence-comment.md`
- `docs/PROCESS_AUDIT_WORKFLOW_HARDENING.md`

Updated:

- `AGENTS.md`
- `.ai/skills/dev-cycle.md`
- `.ai/skills/prd-to-linear.md`
- `.ai/skills/retrospective.md`
- `.ai/templates/prd.md`
- `knowledge/ESTADO_ATUAL.md`
- `knowledge/HISTORICO.md`

---

## 5. Target Operating Model

### Source of Truth

- Product/system state: `knowledge/ESTADO_ATUAL.md`
- Decisions: `knowledge/HISTORICO.md`
- Workflow contract: `.ai/WORKFLOW_CONTRACT.md`
- Active execution: Linear
- Pre-operational PRDs: `workflows/propostas/` and `workflows/pendentes/`
- Closed local evidence: `.ai/history/concluidos/`

### Official Statuses

`Backlog -> Todo -> Desenvolvimento -> QA-Tecnica -> QA-Funcional -> Concluido -> Em-Producao`

### Evidence Rule

No status move without a prior evidence comment containing:

- what changed
- how it was validated
- remaining risks
- next owner/status

### Canonical Signature

```markdown
[Gigio Flow Evidence] Papel=<role> | Plataforma=<tool/app> | Agente=<agent/model> | Data=<YYYY-MM-DD>
```

### Task Size Rules

- `micro`: compact evidence, direct validation.
- `pequena`: focused evidence, QA-Tecnica if code changed.
- `media`: full task structure, evidence per move, QA-Tecnica, QA-Funcional when user-facing.
- `critica`: full workflow plus explicit human approval before production.

---

## 6. Remaining Recommendations

- Add Studio diagnostics that check whether AGENTS.md and skills reference `.ai/WORKFLOW_CONTRACT.md`.
- Add a Linear status mapping screen or config file so local official names map to workspace-specific Linear state IDs.
- Add a lightweight evidence generator in Studio for agents and humans.
- Consider rotating old history into monthly files if `knowledge/HISTORICO.md` grows too large.

The workflow is now harder to drift because future agents have a single contract and smaller documents point back to it.
