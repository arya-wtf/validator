# Idea Validator — Internal Tool

## What this is

A private internal tool for Elux Space (Arya + Dewi). Validates 3-5 product ideas at a time using OpenAI `gpt-5.4`, ranks them, and saves runs as committed `.md` files in this repo.

## Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** (refined-minimal aesthetic, IBM Plex fonts)
- **Bun** (package manager)
- **OpenAI SDK** (`openai`, model `gpt-5.4`, structured outputs via `response_format.json_schema` strict mode)
- **Anthropic SDK** (`@anthropic-ai/sdk`) — kept in deps as a fallback, not currently imported
- **Octokit** (`@octokit/rest`) for committing run files to GitHub
- **gray-matter** for parsing markdown frontmatter

## Auth

- Two hardcoded usernames: `arya`, `dewi`. Both share the same password from `AUTH_PASSWORD` env var.
- Sessions are signed cookies (HMAC-SHA256 via Web Crypto, `AUTH_SECRET` env var). 30-day sliding expiry.
- Middleware (`src/middleware.ts`) protects every route except `/login`, `/api/login`, `/api/logout`, and static assets.
- Login form is plain HTML (no JS) at `/login` → POSTs to `/api/login` → sets cookie → redirects.
- Logout button in the header POSTs to `/api/logout`.

## Storage model (matches arya-wtf/personalblog pattern)

Saved runs live at `content/runs/*.md`. Operator contexts live at `content/operators/{arya,dewi}.md`.

Each run `.md` has:
- YAML frontmatter (`slug`, `timestamp`, `created_at_iso`, `title`, `author`)
- Human-readable sections (ideas input, operator context, summary, per-idea, ranking, next steps)
- A `## Analysis JSON` block at the bottom — this is the canonical source of truth that `src/lib/runs.ts` parses to render `ResultsView`

Each operator `.md` is just markdown with section headers (Identity, Current ground truth, etc.). Optional frontmatter is stripped by `gray-matter`. The body is read server-side and injected into the model's user message before each analysis.

When the user clicks "SAVE TO GITHUB" in the UI:
1. App POSTs to `/api/save-run` (server reads logged-in username from cookie, stamps `author`)
2. Server formats run as `.md`
3. Server commits via Octokit to `content/runs/`
4. Vercel detects the commit, rebuilds (~30s)
5. New run appears in `/runs` after rebuild

When the user uploads a `.md` file manually to `content/runs/` via GitHub web UI:
- Same flow — Vercel rebuilds, file appears

To update operator context: edit `content/operators/arya.md` (or `dewi.md`) directly on GitHub. Wait for rebuild. Next analysis uses the new context.

## API routes

- `POST /api/analyze` — proxy to OpenAI. Reads username from cookie, loads operator context server-side. Two modes: new analysis (`ideas_input`) or iteration (`previous_analysis` + `iteration_feedback`). Uses `response_format: { type: "json_schema", strict: true }` so output is guaranteed-valid JSON matching the `Analysis` type.
- `POST /api/save-run` — commits a finished analysis as `.md` to GitHub, stamping `author` from the cookie.
- `POST /api/login` — verifies credentials, sets signed cookie.
- `POST /api/logout` — clears cookie.

## Required env vars

- `OPENAI_API_KEY` — server-only
- `AUTH_PASSWORD` — shared password for arya/dewi
- `AUTH_SECRET` — HMAC key for session cookies; generate via `openssl rand -hex 32`
- `GITHUB_TOKEN` — fine-grained PAT, "Contents: Read and write" on this repo only
- `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`
- `VERCEL_DEPLOY_HOOK_URL` — optional, speeds up rebuild after commit

See `.env.example` for the full list.

## When working on this codebase

- **Don't add a database.** Storage is intentionally git-based. Runs and operator contexts live as `.md` so they're version-controlled, editable in any text editor, and survive any platform migration.
- **Don't expose `OPENAI_API_KEY` to the client.** All model calls go through `/api/analyze`.
- **Don't hardcode passwords in source.** Read from `AUTH_PASSWORD` env var.
- **Keep the prompts in `src/lib/prompts.ts`.** They are the IP of this tool.
- **Operator context is server-side per-user `.md`** — read from `content/operators/{username}.md` at request time. Edited via GitHub web UI, not in-app.
- **The `.md` file format is the wire format.** If you change `generateRunMarkdown` in `src/lib/markdown.ts`, you must also change the parser in `src/lib/runs.ts`. The JSON code block at the end is the parse target — the human-readable sections above it are for git diff readability only.
- **JSON schema strictness:** `verdict` is locked to the four enum values via OpenAI strict mode. Don't loosen the type in `src/types/analysis.ts` without also relaxing `src/lib/openai-schema.ts`.

## Future v2 ideas (not now)

- Supabase Auth for proper session storage (current approach is fine for 2 users)
- Supabase storage to replace .md (only if friction shows up)
- Public marketplace fork — productize for paying users
- Run comparison view (diff two runs side by side)
- Per-user filtering on `/runs` index
