# Contributing to Gigio Flow

Thanks for helping improve Gigio Flow.

Gigio Flow is an open-source workspace protocol and local Studio for Codex-powered AI squads. Contributions should preserve that focus: durable project context, product artifacts, safe agent workflows, and delivery orchestration through Linear, GitHub, and Vercel.

## Good First Contributions

- improve documentation and examples
- add Codex workflow recipes
- improve product artifact templates
- harden Linear, GitHub, or Vercel integration behavior
- improve local setup reliability
- add security checks around filesystem and token handling

## Working Principles

- Keep changes small and reviewable.
- Prefer Markdown-readable workflows and portable files.
- Do not introduce vendor lock-in without a clear fallback.
- Do not commit secrets, local config, or generated dependency folders.
- Keep the Studio local-first unless the issue explicitly targets cloud behavior.
- Treat Linear as the visual operational board and Gigio Flow as the context and orchestration layer.

## Local Development

```bash
cd dashboard
npm install
npm run dev
```

Before opening a pull request:

```bash
cd dashboard
npm run lint
npm run build
```

## Pull Request Checklist

- [ ] The change is scoped to one clear purpose.
- [ ] Documentation is updated when behavior changes.
- [ ] No secrets or local-only files are committed.
- [ ] Lint and build pass locally when code changes are included.
- [ ] The PR explains impact on Codex, squads, workflows, or integrations.

## Commit Style

Use clear, plain-language commits:

```text
docs: clarify Codex workflow
feat: add Linear issue metadata
fix: validate workflow file paths
```
