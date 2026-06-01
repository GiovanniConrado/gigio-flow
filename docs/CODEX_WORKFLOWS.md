# Codex Workflows

Gigio Flow is designed so Codex can operate inside a durable product and engineering process instead of starting from zero every session.

## Session Ritual

At the start of a session, Codex should read:

1. `AGENTS.md`
2. `knowledge/ESTADO_ATUAL.md`
3. `workflows/pendentes/`
4. `workflows/em-progresso/`
5. the relevant squad file in `.ai/squads/`

At the end of a completed task, Codex should update:

1. `knowledge/ESTADO_ATUAL.md`
2. `knowledge/HISTORICO.md`
3. the completed workflow card with a `## Resultado` section
4. the connected Linear issue, when configured

## Workflow 1: Idea to PRD

Use when the founder or maintainer has a raw idea.

1. CEO Agent evaluates strategic value.
2. PM Agent turns the idea into a PRD.
3. CTO Agent adds architecture, API, data, and risk notes.
4. QA Agent defines validation criteria.
5. The artifact is saved under `workflows/propostas/`.

Suggested Codex prompt:

```text
Act as CEO Agent, PM Agent, and CTO Agent. Turn this idea into a small product artifact using the Gigio Flow templates. Keep scope tight and include acceptance criteria.
```

## Workflow 2: PRD to Small Issue

Use when a proposal is approved but too broad for one implementation pass.

1. PM Agent slices the PRD into small issues.
2. CTO Agent identifies files, contracts, and risks.
3. QA Agent adds checks for behavior, security, and accessibility.
4. Gigio Flow estimates complexity.
5. The approved issue moves to `workflows/pendentes/`.

Suggested Codex prompt:

```text
Act as PM Agent and CTO Agent. Refine this PRD into one small Linear-ready issue with scope, acceptance criteria, technical notes, risks, and test plan.
```

## Workflow 3: Issue to Delivery

Use when a task is ready for implementation.

1. Dev Agent implements only the approved scope.
2. Codex runs lint/build/tests where available.
3. QA Agent reviews the result.
4. GitHub receives the branch or pull request.
5. Vercel preview is checked.
6. Knowledge files are updated.

Suggested Codex prompt:

```text
Act as Dev Agent for this approved card. Implement only the acceptance criteria, verify locally, then update the Gigio Flow knowledge base with what changed.
```

## Workflow 4: Maintenance Review

Use for existing open-source maintenance work.

1. Process Analyst detects stale tasks or bottlenecks.
2. CTO Agent checks architectural risk.
3. QA Agent checks regressions and missing tests.
4. PM Agent updates issue clarity.
5. Codex proposes the next smallest useful action.

Suggested Codex prompt:

```text
Review this repository as a Gigio Flow maintainer. Identify stale work, missing context, risky issues, and the next most valuable small contribution.
```
