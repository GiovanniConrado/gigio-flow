# Integrations

Gigio Flow treats external tools as the delivery layer, not the source of product memory.

## Linear

Linear is the visual operational board for approved work.

Planned responsibilities:

- create issues from refined Markdown cards
- set team, project, priority, labels, and issue type
- include acceptance criteria and technical notes
- link back to the source artifact
- receive webhook events when issues move to Done
- update `knowledge/ESTADO_ATUAL.md`
- move completed cards to `.ai/history/concluidos/`

## GitHub

GitHub is the source code and collaboration layer.

Planned responsibilities:

- connect Linear issues to branches and pull requests
- generate pull request descriptions from the workflow card
- include QA checklist and risk notes
- update changelog and release notes
- keep open-source contribution templates aligned with Gigio Flow artifacts

## Vercel

Vercel is the deployment and preview layer.

Planned responsibilities:

- read preview deployment URLs
- attach preview URLs to Linear/GitHub metadata
- check deployment status before human approval
- record production releases in `knowledge/HISTORICO.md`

## Secret Handling

Tokens for Linear, GitHub, Vercel, and LLM providers must remain local.

- Do not commit `.env`.
- Do not hardcode tokens in source files.
- Prefer environment variables or local config files ignored by Git.
- Use least-privilege tokens whenever possible.
