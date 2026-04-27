# See CLAUDE.md

This repo follows the conventions of `arya-wtf/personalblog`. AI agents (Claude, Cursor, Antigravity, etc.) working on this codebase should read `CLAUDE.md` for project context, stack, storage model, and constraints.

Quick rules:
- No database. `.md` files in `content/runs/` and `content/operators/` are storage.
- No client-side API keys. All model calls go through `/api/analyze` (OpenAI `gpt-5.4`).
- Prompts live in `src/lib/prompts.ts`. JSON schema for OpenAI structured outputs lives in `src/lib/openai-schema.ts`.
- Operator context is server-side per-user, read from `content/operators/{username}.md`. Edited on GitHub, not in-app.
- Auth: middleware-protected, signed-cookie sessions. Two hardcoded usernames (arya, dewi) sharing `AUTH_PASSWORD`.
