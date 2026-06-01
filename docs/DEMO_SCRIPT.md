# Demo Script

This script is designed for a short public demo, README video, or maintainer walkthrough.

## Goal

Show how Gigio Flow helps Codex move from product discovery to delivery while preserving project memory.

## Demo Setup

1. Start the Studio.

```bash
cd dashboard
npm install
npm run dev
```

2. Open `http://localhost:5173`.
3. Use the current repository as the active workspace.

## Demo Story

### 1. Discovery

Create a raw idea:

```text
Add a workflow that turns a PRD into a Linear issue with acceptance criteria, technical notes, and QA checks.
```

Expected result:

- CEO Agent evaluates strategic value.
- PM Agent frames the product artifact.
- CTO Agent flags integration and security needs.

### 2. Product Artifact

Save the proposal under `workflows/propostas/`.

Expected result:

- problem statement
- user journey
- acceptance criteria
- technical notes
- QA checklist

### 3. Refinement

Ask Codex to refine the proposal into the smallest useful issue.

Expected result:

- one issue-sized scope
- clear acceptance criteria
- story point estimate
- risk notes

### 4. Linear Handoff

Create a Linear issue from the refined artifact.

Expected result:

- title, description, labels, priority, and issue type are mapped
- the issue links back to the source Markdown artifact
- Linear becomes the visual operational board

### 5. GitHub Handoff

Use the issue to guide a branch or pull request.

Expected result:

- PR description includes context from the artifact
- QA checklist is included
- scope remains traceable to the original product decision

### 6. Vercel Preview

Attach or record the preview deployment.

Expected result:

- preview URL is associated with the delivery item
- release decision remains human-approved

### 7. Memory Update

Close the loop.

Expected result:

- `knowledge/ESTADO_ATUAL.md` records what changed
- `knowledge/HISTORICO.md` records the decision
- completed workflow card moves to `.ai/history/concluidos/`

## Demo Message

Gigio Flow does not replace Codex, Linear, GitHub, or Vercel. It gives them a shared operating context so product decisions, technical work, and delivery history stay connected.
