# Security Policy

Gigio Flow is local-first, but it can touch sensitive tokens for LLM providers, Linear, GitHub, and Vercel. Security issues are treated seriously.

## Supported Versions

The project is currently pre-1.0. Security fixes target the latest public version of the repository.

## Reporting a Vulnerability

If you find a vulnerability, please open a private report through GitHub Security Advisories when the public repository is available. Until then, contact the primary maintainer directly.

Please include:

- affected files or endpoints
- steps to reproduce
- expected impact
- suggested fix, if known

## Secret Handling Rules

- Never commit `.env`, `.env.local`, API tokens, private keys, or local integration config files.
- Use `.env.example` for documentation only.
- Prefer least-privilege tokens.
- Do not log user secrets or provider tokens.
- Keep LLM provider keys local to the user's machine.

## Filesystem Safety

The Studio reads and writes local Markdown files. Any code that touches the filesystem must validate paths so writes remain inside the active workspace.

Required behavior:

- reject path traversal
- avoid arbitrary absolute path writes
- do not expose local filesystem contents through broad APIs
- keep local config files out of Git

## Integration Safety

Linear, GitHub, and Vercel integrations should:

- store tokens only in ignored local config or environment variables
- avoid printing tokens in logs
- handle failed API calls without corrupting local workflow files
- preserve a clear audit trail in Markdown history files
