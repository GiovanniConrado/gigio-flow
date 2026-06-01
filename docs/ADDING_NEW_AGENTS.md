# Adding New Agents (Squad Personas) to Gigio Flow

This guide explains how to design, build, and integrate a new AI squad persona into a Gigio Flow workspace. Follow these standards to ensure every new agent is consistent, well-scoped, and interoperable with the rest of the system.

---

## 🧠 Core Concepts

An **Agent** (or Squad Persona) in Gigio Flow is a Markdown file stored in `.ai/squads/` that defines:

- Who the agent **is** (identity, role, tone)
- What the agent **knows** (inputs to read at session start)
- What the agent **does** (rituals, outputs, responsibilities)
- What the agent **never does** (hard limits, anti-patterns)

Agents are loaded by AI tools (Codex, Claude Code, Cursor, etc.) as context files. They work in concert — a typical flow passes a task from **CEO → PM → CTO → Dev → QA**.

---

## 📁 File Location and Naming

```
.ai/squads/
└── <role-slug>.md      ← One file per persona
```

**Naming rules:**
- Lowercase, hyphenated (e.g., `security-auditor.md`, `data-analyst.md`)
- Use the role's function, not a person's name
- Keep it under 30 characters

---

## 📄 Standard Agent File Template

Every new agent MUST follow this exact structure:

```markdown
# [Role Name] — Gigio Flow Squad

> **Activation trigger:** [When should the AI adopt this persona?]
> **Priority:** [Where this persona fits in the compliance hierarchy]

---

## 🎭 Identity and Mandate

- **Who you are:** [1-2 sentences describing the persona's professional identity]
- **Your mandate:** [What problem this persona solves for the team]
- **Tone and style:** [How the agent communicates — e.g., "Direct, data-driven, skeptical"]

---

## 📚 Context to Read at Session Start

When activated, always read these files before responding:

1. `knowledge/ESTADO_ATUAL.md` — current system state
2. `knowledge/VISAO.md` — product vision and business model
3. `knowledge/ARQUITETURA.md` — technical architecture
4. [Add domain-specific files relevant to this persona]

---

## ✅ Responsibilities and Rituals

### What You Do
- [Bullet list of concrete actions this persona takes]
- [Use action verbs: "Review", "Generate", "Validate", "Estimate"]
- [Each item should be a discrete, observable output]

### Standard Output Format
Every output from this persona must include:

1. **[Output section 1]** — description
2. **[Output section 2]** — description
3. **Verdict / Recommendation** — clear, labeled conclusion (e.g., ✅ APPROVED / ❌ BLOCKED / ⚠️ NEEDS REVIEW)

### Session Ritual
At the end of every session as this persona:
- Update `knowledge/ESTADO_ATUAL.md` if any module changed
- Add an entry to `knowledge/HISTORICO.md`
- If a workflow card was moved: update its file with a `## [Persona] Review` section

---

## 🚫 Hard Limits (Never Do)

- [ ] Never [anti-pattern 1]
- [ ] Never [anti-pattern 2]
- [ ] Never take destructive action without explicit human approval
- [ ] Never commit secrets, tokens, or credentials
- [ ] Never skip the session closing ritual

---

## 🔗 Handoff Protocol

When this persona completes its work, it hands off to:

| Next Persona | Trigger Condition |
|---|---|
| [Next Role] | [When this persona's output is approved] |
| [Alt Role] | [When a specific condition is met] |

---

## 💡 Example Activation Prompt

```
Act as the [Role Name] of this project.
Read `.ai/squads/[role-slug].md` for your complete identity and rules.
Read `knowledge/ESTADO_ATUAL.md` for current system state.
Task: [describe the specific task]
```
```

---

## 🏗️ Step-by-Step: Adding a New Agent

### Step 1 — Define the Scope
Before writing anything, answer:
- What **specific problem** does this agent solve that no existing agent covers?
- What are the **inputs** (files it reads)?
- What are the **outputs** (artifacts it produces)?
- Who **activates** it and who **receives** its output?

> **Anti-pattern:** Don't create an agent that duplicates an existing one with a slightly different name. Extend existing agents via the Responsibilities section instead.

### Step 2 — Write the Agent File
Use the template above. Store it at:
```
.ai/squads/<role-slug>.md
```

Minimum viable file size: ~2KB. A well-scoped agent file is typically 3–5KB.

### Step 3 — Register in AGENTS.md and CLAUDE.md
Add a row to the squad table in both `AGENTS.md` and `CLAUDE.md`:

```markdown
| **[Role Name]** | `[role-slug].md` | [One-line description of when to activate] |
```

### Step 4 — Register in README.md
Add the new agent to the "What It Does" or "Squad" section of `README.md` so external contributors can discover it.

### Step 5 — Update ESTADO_ATUAL.md
Add a row to the module table in `knowledge/ESTADO_ATUAL.md`:
```markdown
| [Role Name] Agent | ✅ Active | [Your name] | [today's date] |
```

### Step 6 — Add an Entry to HISTORICO.md
Document the decision in `knowledge/HISTORICO.md`:
```markdown
### [YYYY-MM-DD] — New Agent: [Role Name]
- **What changed:** Added `.ai/squads/[role-slug].md`
- **Context & Motivation:** [Why this agent was needed]
- **System Impact:** [How it integrates with existing agents]
```

### Step 7 — Test the Agent
Before merging, test with at least one real scenario:
1. Load the workspace in Codex/Claude Code/Cursor
2. Activate the persona using the example prompt from the agent file
3. Verify it reads the correct context files
4. Verify the output matches the Standard Output Format
5. Verify it follows the Session Ritual and updates the correct files

---

## 🧩 Agent Design Patterns

### Pattern A — Reviewer Agent
Reads an artifact, validates it against rules, produces a pass/fail verdict.

**Examples:** QA Agent, Security Auditor Agent, Compliance Agent

**Key design principle:** Output must always include a binary verdict with emoji (✅ / ❌ / ⚠️) and a numbered list of findings.

### Pattern B — Generator Agent
Takes a brief or idea and produces a structured artifact (PRD, spec, architecture doc).

**Examples:** PM Agent, CTO Agent, CEO Agent

**Key design principle:** Output must follow a fixed template stored in `.ai/templates/`. Never freestyle structure.

### Pattern C — Orchestrator Agent
Reads the overall state, decides what to do next, and delegates to other agents.

**Examples:** Process Analyst

**Key design principle:** Never implements directly. Always produces a prioritized action plan and identifies the correct next agent.

### Pattern D — Specialist Agent
Handles a narrow, deep domain (e.g., security, performance, accessibility, data modeling).

**Examples:** Security Auditor, Data Analyst, Accessibility Reviewer

**Key design principle:** Has a strict input contract (specific files to read) and a strict output contract (specific checklist format).

---

## 📐 Quality Standards for Agent Files

| Criterion | Standard |
|---|---|
| **Specificity** | Each responsibility is a concrete, observable action — not vague guidance |
| **Tone definition** | The tone/style section must be actionable (e.g., "Use numbered lists for all recommendations") |
| **Hard limits** | At least 4 explicit "Never do" rules |
| **Output format** | Exactly defined sections and verdict format |
| **Handoff** | Clear successor agent for at least 2 conditions |
| **Context files** | At least 2 files to read at session start |
| **File size** | Between 2KB and 8KB (concise but complete) |

---

## 🔐 Security Rules for Agent Files

- **Never include real credentials** in agent files, even as examples
- **Never instruct the agent to write outside the active workspace** (`validatePath()` must be respected)
- **Never give an agent unconditional write access** to `knowledge/HISTORICO.md` without also requiring a structured entry format
- **Rate-limit-aware agents** (those calling LLMs) must reference the rate limiter in their ritual

---

## 📚 Existing Agents for Reference

| File | Role | Pattern |
|---|---|---|
| `.ai/squads/ceo.md` | Strategic business analysis and viability | Generator |
| `.ai/squads/pm.md` | Product specs, acceptance criteria, UX | Generator |
| `.ai/squads/cto.md` | Architecture, security, API design | Generator + Reviewer |
| `.ai/squads/dev.md` | Code implementation | Generator |
| `.ai/squads/qa.md` | Technical validation, accessibility | Reviewer |
| `.ai/squads/process-analyst.md` | Workflow auditing, bottleneck detection | Orchestrator |

Use these as reference implementations when building new agents.
