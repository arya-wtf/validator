# Idea Validator

Internal tool for Elux Space. Validates 3-5 product ideas at a time using OpenAI `gpt-5.4`. Saves runs as `.md` files committed to this repo (same pattern as `arya-wtf/personalblog`).

Two hardcoded users (`arya`, `dewi`) share an app-level password gate. Operator context per user lives as `.md` files in the repo.

## Quick start (local dev)

```bash
bun install
cp .env.example .env.local
# Fill in OPENAI_API_KEY, AUTH_PASSWORD, AUTH_SECRET, GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
# Generate AUTH_SECRET with: openssl rand -hex 32
bun dev
```

Open <http://localhost:3000>. You'll be redirected to `/login`.

---

## First-time deploy (Antigravity → GitHub → Vercel)

### 1. Create the GitHub repo

1. Open GitHub → New repository → name it `idea-validator` (private)
2. Don't initialize with README/license — you'll push from local
3. Note the repo URL

### 2. Push this code

In Antigravity, open this project folder, then in terminal:

```bash
git init
git add .
git commit -m "feat: initial commit"
git branch -M main
git remote add origin https://github.com/arya-wtf/idea-validator.git
git push -u origin main
```

### 3. Create the GitHub Personal Access Token

The app needs a token to commit save-runs back to the repo.

1. Go to <https://github.com/settings/tokens?type=beta> (Fine-grained tokens)
2. Click **Generate new token**
3. Token name: `idea-validator-deploy`
4. Expiration: 1 year (or your preference)
5. Repository access: **Only select repositories** → pick `idea-validator`
6. Repository permissions:
   - **Contents: Read and write**
   - (Leave everything else as default "No access")
7. Click **Generate token**
8. Copy the token immediately (`github_pat_...`) — you'll paste it into Vercel below

### 4. Get the OpenAI API key

1. Go to <https://platform.openai.com/api-keys>
2. Create a new key, name it `idea-validator-prod`
3. Copy the key (`sk-proj-...`)

### 5. Deploy on Vercel

1. Go to <https://vercel.com/new>
2. Import your `idea-validator` GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Build command: leave default (`bun run build` or `next build`)
5. Before clicking Deploy — expand **Environment Variables** and add:

| Name | Value |
|---|---|
| `OPENAI_API_KEY` | `sk-proj-...` from step 4 |
| `AUTH_PASSWORD` | `Rahasia123!` (or your preferred shared password) |
| `AUTH_SECRET` | output of `openssl rand -hex 32` |
| `GITHUB_TOKEN` | `github_pat_...` from step 3 |
| `GITHUB_OWNER` | `arya-wtf` |
| `GITHUB_REPO` | `idea-validator` |
| `GITHUB_BRANCH` | `main` |

6. Click **Deploy**. Wait ~2 min.
7. Open the live URL. You'll see the login page. Sign in as `arya` or `dewi`.

### 6. (Optional but recommended) Add Vercel Deploy Hook

This makes "SAVE TO GITHUB" trigger a Vercel rebuild instantly instead of waiting for git push detection.

1. Vercel project → Settings → Git → **Deploy Hooks**
2. Create a hook named `save-run-trigger`, branch `main`
3. Copy the URL
4. Vercel project → Settings → Environment Variables → add `VERCEL_DEPLOY_HOOK_URL` with the URL
5. Redeploy (Settings → Deployments → ⋯ → Redeploy)

### 7. Vercel Deployment Protection — leave it OFF

The app now has its own login (`/login`, signed-cookie sessions). You do **not** need Vercel's Password Protection on top. If it was enabled previously, turn it off in Vercel project → Settings → Deployment Protection.

---

## How to use the deployed app

### As Arya

1. Open the app URL → log in as `arya`
2. First time: edit `content/operators/arya.md` on GitHub, fill in your operator context (see prompt below)
3. Wait ~30s for Vercel to rebuild
4. Drop 3-5 ideas in the textarea, click ANALYZE
5. Wait ~20-30 seconds for the analysis
6. Review. Click ITERATE to refine. Click SAVE TO GITHUB to persist (saved with `author: arya`).
7. After ~30 seconds, the run appears in `/runs`

### As Dewi

1. Open the app URL → log in as `dewi`
2. Edit `content/operators/dewi.md` on GitHub with **her own** context
3. Run analyses normally. Her saves commit to the same repo, stamped `author: dewi`.

### Manually adding runs

You can also push `.md` files directly:

1. Open `content/runs/` in GitHub
2. Click **Add file** → **Upload files** (or **Create new file**)
3. Use the format from `2026-04-27-sample-4-saas-ideas.md` as a template
4. Commit. Vercel rebuilds. The run appears in `/runs`.

This is the same flow you use for your blog.

---

## Operator context extraction prompt

Open a ChatGPT or Claude conversation, paste this, answer the interview, then commit the resulting markdown to `content/operators/<your-username>.md` on GitHub:

```
I'm filling in operator context for our internal idea validator tool.

Interview me through 8 short sections. One question at a time. Keep your
questions specific and concrete — don't ask "what are your strengths,"
ask "name 3 things you've personally closed or shipped in the last 90 days."

If my answer is vague, ask ONE follow-up to make it concrete. Then move on.

Sections, in order:
1. Who I am and what I do at Elux Space
2. What I actually see in front of me right now (current pipeline / clients / projects)
3. Who I talk to most in the buyer / client world (named people, named companies)
4. What I'm hearing repeatedly from those people
5. What I can personally execute without help
6. What I CAN'T or WON'T do (skills gaps, things I've quit, markets I won't touch)
7. What I'd want a new product idea to do for me / for the team
8. Anything else the validator should know

After all 8, output a clean markdown block with these exact headers, ready to paste:
## Identity
## Current ground truth
## Buyer/client access
## Pattern signals
## Personal execution capability
## Hard limits
## What I want from a new product
## Other context

Start with section 1. Ready?
```

Both you and Dewi run this separately. Each commits their own block to `content/operators/arya.md` or `content/operators/dewi.md` on GitHub.

---

## Troubleshooting

**Stuck on `/login` after entering correct credentials** — `AUTH_SECRET` may differ between requests (e.g., Vercel preview vs prod). Re-check env vars and redeploy.

**"AUTH_SECRET not configured"** — generate one with `openssl rand -hex 32` and add it to Vercel env vars.

**"GITHUB_TOKEN is not set"** — env var didn't propagate. Check Vercel dashboard → Settings → Environment Variables. After adding, redeploy.

**"Empty response from model" or `Model refused`** — OpenAI hiccup, rare. Click ANALYZE again.

**Operator context not picked up after editing on GitHub** — Vercel still rebuilding. Wait 30-60s. The app reads the file at request time but from the *built* filesystem, so a new build is required.

**Run saved but not appearing in /runs** — Vercel still rebuilding. Wait 30-60s, refresh. If `VERCEL_DEPLOY_HOOK_URL` isn't set, this delay is normal.

**API key in browser DevTools** — should never happen. If you see `OPENAI_API_KEY` exposed in the bundle, the build is broken. The key only lives in `process.env` server-side.

**TypeScript errors on Vercel build** — run `bun run build` locally first to catch them. The Vercel build uses the same script.

---

## File structure

```
idea-validator/
├── content/
│   ├── runs/                          # Saved runs as .md (git-tracked)
│   │   └── 2026-04-27-sample-4-saas-ideas.md
│   └── operators/                     # Per-user operator context as .md
│       ├── arya.md
│       └── dewi.md
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analyze/route.ts       # POST → OpenAI (auth-gated)
│   │   │   ├── save-run/route.ts      # POST → commit .md to GitHub (auth-gated)
│   │   │   ├── login/route.ts         # POST → set signed cookie
│   │   │   └── logout/route.ts        # POST → clear cookie
│   │   ├── login/
│   │   │   └── page.tsx               # /login form
│   │   ├── runs/
│   │   │   ├── page.tsx               # /runs index
│   │   │   └── [slug]/page.tsx        # /runs/:slug detail
│   │   ├── globals.css
│   │   ├── layout.tsx                 # Server component, reads session for Header
│   │   └── page.tsx                   # Home (server wrapper) + HomeClient
│   ├── components/
│   │   ├── Header.tsx                 # Shows username + LOGOUT
│   │   ├── HomeClient.tsx             # Client island for the analyzer UI
│   │   └── ResultsView.tsx            # Shared between home and run detail
│   ├── lib/
│   │   ├── auth.ts                    # Web Crypto HMAC sign/verify session cookies
│   │   ├── github.ts                  # Octokit committer
│   │   ├── markdown.ts                # Run → .md formatter
│   │   ├── openai-schema.ts           # JSON schema for OpenAI structured outputs
│   │   ├── operators.ts               # /content/operators/*.md reader
│   │   ├── prompts.ts                 # System prompts
│   │   └── runs.ts                    # /content/runs/*.md reader
│   ├── types/
│   │   └── analysis.ts                # Shared TS types
│   └── middleware.ts                  # Protects all routes except /login + assets
├── .env.example
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```
