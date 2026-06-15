# Skill: Development Cycle (Dev Cycle) — {{NOME_DO_PROJETO}}

> This skill teaches the Dev Agent how to pick up a Linear issue, implement it,
> verify it, and deliver it — using the Gigio Flow workspace for context and
> Linear MCP for status tracking.

---

## When to Activate

This skill runs when you (the human) are ready to start working on a Linear
issue. It can be triggered from **any IDE** (Opencode, VS Code + Cursor,
Cline, etc.) as long as the agent has access to:
1. The Gigio Flow workspace files
2. The Linear MCP tools

---

## The Protocol (Step by Step)

> Canonical workflow rules live in `.ai/WORKFLOW_CONTRACT.md`. This skill only
> details the Dev Agent implementation cycle. If anything conflicts, follow the
> contract first.

### Step 0: Session Start Ritual

Before starting any development:

1. Read `knowledge/ESTADO_ATUAL.md` — understand current project state
2. Read `knowledge/ARQUITETURA.md` — understand the tech stack and patterns
3. Read `knowledge/GLOSSARIO.md` — ensure terminology consistency
4. Read `.ai/rules/` — refresh security, safety-locks, deploy standards
5. Read `.ai/WORKFLOW_CONTRACT.md`
6. Confirm the user's focus or issue ID before listing tasks
7. Check active operational tasks in Linear

### Step 1: Pick Up the Next Issue

After the user confirms the focus, use MCP `linear_search_issues` to find the
next pending issue in an official status from `.ai/WORKFLOW_CONTRACT.md`:

```
Tool:  linear_search_issues
Input: {
  query: "",
  teamId: "<teamId>",
  stateFilter: "<backlog-or-todo-state-id>"
}
```

Or the human may provide an issue ID directly (e.g., "work on GIG-42").

Read the issue details:
```
Tool:  linear_get_issue
Input: { id: "GIG-42" }
```

Extract: title, description (including acceptance criteria), priority,
estimate, dependencies.

### Step 2: Load Context

Before writing code, load the full context:

1. **PRD Context** — Find the original PRD card in `workflows/`
   (search for `GIG-42` or the parent PRD reference)
2. **Existing Code** — Read the files listed in the issue's `## Files Involved`
3. **Design System** — Read `knowledge/DESIGN_SYSTEM.md` for visual tokens
4. **Similar Patterns** — Look at existing, similar files in the codebase
   for conventions

### Step 3: Plan

Present a brief implementation plan:

```
## Plan for GIG-42

**Files to modify:**
- `src/components/PaymentForm.jsx` (create)
- `src/services/payment.js` (create)
- `src/App.jsx` (modify — add route)

**Approach:**
1. Create the payment service with Stripe integration
2. Build the PaymentForm component using design tokens
3. Wire up the route in App.jsx

**Estimated time:** 1 session
**Risks:** Stripe API key needed for testing
```

For medium or critical work, wait for the human to say "go ahead" or suggest
changes. For small work with an already explicit request, proceed after the
plan unless the user redirects.

### Step 4: Implement

Develop the solution:

1. **One file at a time** — create/modify files in dependency order
2. **Follow existing patterns** — match the codebase conventions
3. **Use the project's tools** — if there's a linter (`npm run lint`), run it
4. **No scope creep** — implement ONLY what's in the acceptance criteria

### Step 5: Verify

Run the verification commands specified by the project:

```
npm run lint     # or the project's equivalent
npm run test     # unit/integration tests
npm run typecheck  # if applicable
```

Fix any issues found.

### Step 6: Commit

Commit with a message that references the Linear issue:

```
git add -A
git commit -m "GIG-42: implement payment form with Stripe integration

- Create PaymentForm component with card input
- Add payment service with Stripe API client
- Wire checkout route in App.jsx
- Add form validation and error states"
```

### Step 7: Add Evidence, Then Update Linear Status

Before moving the issue, add an evidence comment using
`.ai/templates/evidence-comment.md`. Include what changed, validation performed,
remaining risks, and the next owner/status.

Use MCP `linear_update_issue` to move the issue to the next state:

```
Tool:  linear_update_issue
Input: {
  id: "GIG-42",
  stateId: "<tech-qa-state-id>",
  comment: "Implementado em abc1234. Pendente de QA técnico."
}
```

### Step 8: Update Local Records

If a local PRD/card exists, append a summary or link to the Linear evidence.
Do not rely on `workflows/em-progresso/`; active execution lives in Linear.

```markdown
## Evidence Link

**Linear:** GIG-42
**Evidence comment:** [link or timestamp]
**Technical result:** implemented in abc1234 and ready for QA-Tecnica.
**Production readiness:** not approved until QA-Funcional and human approval.
```

Then update `knowledge/ESTADO_ATUAL.md` with a brief note when the real product
or system state changed.

---

## Contract (Never Break)

- [ ] Always read `AGENTS.md` at session start
- [ ] Always follow `.ai/WORKFLOW_CONTRACT.md`
- [ ] Run lint + test before every commit
- [ ] Add evidence before every status move
- [ ] Reference the Linear issue in the commit message
- [ ] Never modify files outside the issue scope
- [ ] Never hardcode API keys or secrets
- [ ] Use only CSS variables from `DESIGN_SYSTEM.md`
