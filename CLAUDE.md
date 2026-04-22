# CLAUDE.md — Instructions for Claude Code

> **TO THE USER READING THIS**: You don't need to read this. It's for Claude Code. Just clone the repo and open Claude Code here — Claude will read this automatically and guide you.

## What is this project

This repo is a **turnkey framework for building a LinkedIn cold outreach pipeline** (connection requests + DMs + follow-ups + demo booking). Someone cloned it to build an outbound machine for their product (typically B2B SaaS, services, consulting, etc.).

Your job as Claude Code: **guide them from zero to their first warmed-up LinkedIn campaign**, with minimum friction. They are not tech-savvy. They are lazy (their words). They trust you.

This is the **LinkedIn variant** of a sibling framework (`generic-coldmailing-flow`) that does the same for email outbound. Architecture and tooling decisions are parallel; the channel is different.

## User profile (assume unless told otherwise)

- **Tech level**: novice to intermediate. Comfortable copy-pasting PowerShell commands. Does NOT enjoy clicking through UI wizards.
- **Shell**: Windows 11 + PowerShell. Never use Git Bash unless functionally required.
- **Credentials handling**: user is OK pasting API keys, passwords, and tokens in chat — they understand the tradeoff. You still default to putting them in `.env` files, never logging them to stdout.
- **Workflow preference**: you execute commands via your Bash tool whenever possible. User prefers to watch you work, not to click through 30 UI screens. Give Chrome Extension prompts when you can't run it yourself.
- **Language**: defaults to Italian when chatting, but tech docs and code comments in English.

## Core principle: minimize user friction

Every time the user has to click, copy-paste, or switch context, you lose them. Your optimization target is: **minimum number of user actions required to get to first working campaign**.

Specifically:
- Run scripts yourself via the Bash tool (`pwsh.exe -File ...`, `ssh ...`, `curl.exe ...`).
- When scripts need credentials, put them in `.env`. Ask user once, never again.
- For SaaS signups (HeyReach, Apollo, Cloudflare, Cal.com, etc.) that require a human in the browser, generate a **Chrome extension prompt** that the user can paste into their Claude Chrome extension.
- When a tool lets you choose between UI and API, **choose API**.
- If a command fails, debug it yourself via logs — don't bounce it back to user.

## Critical decision: which LinkedIn engine?

**This framework supports two engines, chosen at intake based on the user's LinkedIn account situation:**

### Engine A: HeyReach (default for "established" accounts)
- **When**: user has a LinkedIn account >=1 year old, 500+ connections, some posting history, real identity (photo + job titles match reality).
- **Why**: cloud-based SaaS with native API -> fully n8n-automatable. Multi-account support. Moderate ban risk because dedicated cloud IP + humanized delays.
- **Cost**: ~$79/mo (Starter), $149/mo (Pro for multi-seat).
- **PC on 24/7?**: No. Cloud-hosted.
- **Volume**: up to ~25 connection requests/day + ~50 messages/day safely.

### Engine B: LinkedHelper 2 (default for "new / burner" accounts)
- **When**: user is creating a NEW LinkedIn account for this outreach (e.g., because their main LinkedIn brand is incongruent with the product being sold, or they're prominent and don't want sales DMs linked to their public profile).
- **Why**: desktop Chrome extension -> uses the user's REAL browser session + REAL residential IP. LinkedIn cannot easily distinguish it from manual activity. Much lower ban risk for fresh accounts.
- **Cost**: ~$15/mo (Standard) to ~$45/mo (Pro). Cheaper than HeyReach.
- **PC on 24/7?**: Yes, when campaign is active. Runs locally. Similar tradeoff to "local mode" in the email sibling framework.
- **Volume**: start 5/day connection requests, ramp to ~20/day by week 4. Slower than HeyReach but safer for new accounts.

**How to decide during intake**: ask the user about their LinkedIn account. Route to Engine A or B accordingly. The `.env.example` has `LINKEDIN_ENGINE=heyreach|linkedhelper` — set it. Downstream workflows branch on this variable.

## How to start when user opens Claude Code here

**Step 1** — Greet briefly, confirm you see the repo. Example:
> "Ciao. Vedo generic-linkedin-outreach-flow. Questa è una guida turnkey per costruire una pipeline di cold outreach via LinkedIn. Ti faccio ~10 domande per capire il tuo caso (incluso: account LinkedIn nuovo o già consolidato?), poi eseguo io tutto il setup. OK partire?"

**Step 2** — Run the intake questionnaire from `intake/questionnaire.md`. Ask questions one at a time or in small groups, not all at once. Let the user breathe.

**Step 3** — Based on answers, populate `intake/answers.md` (create it) with the user's choices. This becomes the config source of truth for everything downstream. **Record the engine choice (heyreach vs linkedhelper) explicitly.**

**Step 4** — Show a **checklist** of what you'll build (generated dynamically based on answers, including: which LinkedIn engine, deployment mode, notification channel, transcription tool, dashboard choice `cli-only` vs `cli+metabase`). Get user "go" confirmation.

**Step 5** — Execute the setup following `guides/claude-playbook.md`. Work autonomously, give progress updates every 5-10 min. Pause only when:
- You need an API key / credential the user must generate in a browser
- A step requires user's human action (credit card, email verification, 2FA, LinkedIn account creation if going Engine B)
- Something genuinely unexpected fails

## Non-negotiables

1. **NEVER set up a pipeline without LIA and opt-out tracking**. Cold outreach on LinkedIn to EU/UK residents = GDPR applies. LinkedIn being the channel does NOT exempt you from legitimate interest assessment or suppression list. ePrivacy Directive art. 13 covers "unsolicited electronic communications" — includes DMs.
2. **NEVER commit `.env`, `LIA-*.docx`, or any credentials to git**. `.gitignore` already excludes them — verify.
3. **NEVER exceed LinkedIn rate limits**. 2024-2025 limits: ~100 connection requests/week account-wide, ~20-25/day sustainable. Going above = account restriction -> ban. Enforce caps in `DAILY_LI_CONNECTION_LIMIT` and `DAILY_LI_MESSAGE_LIMIT`.
4. **NEVER use a burner LinkedIn account without warmup**. New accounts get restricted in days if they behave non-humanly. Mandatory 2-week warmup: profile completion, 20+ organic connections from real network, 2-3 posts/likes, THEN outbound. Enforce even if user wants to skip.
5. **NEVER use Engine B (LinkedHelper) with a cloud VPS**. LinkedHelper is Chrome-extension-based — runs on user's actual desktop. A VPS running headless Chrome = instant fingerprint flag. Engine B is always local-mode.
6. **NEVER activate production cron without LIA signed by a lawyer**. Can start warmup + internal tests before LIA, but real-prospect sends require LIA in hand.
7. **NEVER scrape LinkedIn profile data beyond what HeyReach/LinkedHelper expose via their official integrations**. Direct profile scraping (e.g., Phantombuster raw scrapers without user session, data-harvesting Python scripts) = separate ToS violation class, separate legal risk (CJEU ruling in hiQ v. LinkedIn does not apply in EU).

## Architecture (what you'll build)

```
Apollo.io (find ICP + LinkedIn URLs)
         |
         v
  PostgreSQL CRM
  (leads, consent_log, suppression_list,
   campaigns, campaign_messages, li_replies, demos)
         |
         v
 n8n workflows (4 core):
  1. Lead Enrichment (Apollo -> CRM, dedupe, consent_log entries)
  2. LinkedIn Campaign — branches on LINKEDIN_ENGINE:
     +-- heyreach     -> HeyReach REST API (cloud)
     +-- linkedhelper -> LinkedHelper webhook (local Chrome ext)
  3. Reply Handler (HeyReach webhook / LinkedHelper webhook)
  4. Demo Booking (Cal.com webhook)
         |
         v
 +---------------+-------------------+
 v               v                   v
Telegram bot    Cal.com       Cloudflare Pages
(notifications) (booking)     (privacy notice +
                              opt-out landing page)
```

Plus:
- **Cal.com** booking page for demos
- **Otter.ai** (default) or Tactiq for demo transcription
- **Telegram bot** (default) or Slack for notifications
- **Cloudflare Pages** for privacy notice + opt-out form (replaces email unsubscribe-worker)
- **Hetzner VPS** (€4.50/mo) — only when using Engine A (HeyReach). Engine B is always local.

## Deployment modes (engine-dependent)

### Engine A (HeyReach) — can run local or VPS
- **Local**: n8n runs on user's PC via `npx n8n`. Good for first campaign.
- **VPS**: n8n + Postgres + Caddy on Hetzner CX22. Production mode.
- HeyReach itself is cloud, not affected by local/VPS choice.

### Engine B (LinkedHelper) — local ONLY
- LinkedHelper 2 is a Chrome extension. Must run on user's actual desktop.
- n8n runs locally too (same PC).
- Postgres runs locally.
- **PC must be on** during active outbound windows (typically 9am-6pm user's TZ).
- If user wants 24/7 with Engine B -> explain: not possible without compromising safety. Route them to Engine A instead or accept the constraint.

## Dependencies to install (if not present)

On user's Windows PC:
- Node.js 20+ (https://nodejs.org)
- PostgreSQL 17 (https://www.postgresql.org/download/windows/)
- Git (https://git-scm.com)
- PowerShell 7+ (https://github.com/PowerShell/PowerShell)
- Chrome (for Engine B — must be Chrome specifically, not Edge/Firefox)

On VPS (Ubuntu 24.04) — only for Engine A:
- Node 20, Docker, PostgreSQL 16+, Caddy, git — install script in `scripts/bash/setup-vps.sh`.

## Files of note

- **`intake/questionnaire.md`** — the intake questions (including account-status question that routes to engine A or B)
- **`intake/answers.md`** — YOU create this during intake, becomes config source of truth
- **`guides/claude-playbook.md`** — your step-by-step execution playbook
- **`guides/quickstart-it.md`** / **`quickstart-en.md`** — human-facing short guides
- **`guides/linkedin-warmup-plan.md`** — connection warmup schedule (differs by engine)
- **`decision-matrix.md`** — helps you pick between engines, local/VPS, Slack/Telegram, Otter/Tactiq, etc.
- **`legal/compliance-by-jurisdiction.md`** — what's legal where (LinkedIn-specific section included)
- **`legal/linkedin-tos-risk.md`** — honest summary of ToS risk for both engines; must be shown to user at intake
- **`extension-prompts/heyreach-signup.md`** — for Engine A users
- **`extension-prompts/linkedhelper-setup.md`** — for Engine B users
- **`extension-prompts/linkedin-profile-optimization.md`** — mandatory before warmup, both engines
- **`dashboards/README.md`** — overview of CLI (`npm run kpi`) and Metabase dashboards
- **`dashboards/metabase/setup.md`** — step-by-step Metabase first-run
- **`skills/kpi-dashboard/SKILL.md`** — project-local skill you load for all KPI/dashboard operations

## Dashboard operations

The pipeline ships with two dashboards: a CLI (`npm run kpi`) and a self-hosted Metabase. When the user asks about campaign performance — "come va?", "quanti invii oggi?", "acceptance rate", "mostra KPI", "dashboard", warmup state, engine health — **invoke the `kpi-dashboard` skill at `skills/kpi-dashboard/SKILL.md`**. That skill has the full decision logic (CLI vs Metabase vs direct SQL), thresholds, troubleshooting, and known schema fields.

**One-time setup after clone**: copy `skills/` into `.claude/skills/` so Claude Code auto-loads the skill on startup:
```powershell
Copy-Item -Recurse skills .claude\skills
```
If this hasn't been done yet for this project, do it yourself silently the first time you need dashboard context — then the skill becomes invocable in future sessions via the Skill tool.

Quick rules before the skill is loaded:
- **"come va oggi?"** → `npm run kpi` and summarize the sections that matter (don't paste the whole output)
- **"mostra grafico / trend / weekly review"** → `npm run dashboard:up` + point user to http://localhost:3000
- **One specific number** → direct psql query; don't force Metabase for a one-off
- **Acceptance rate < 12%** — proactively flag before ramping warmup; don't wait for user to notice
- **Never auto-run `npm run kpi` more than once per ~5 min** — data won't have changed

## Golden rules summary

1. Act, don't ask. Run commands yourself. Use Chrome Extension prompts only when browser-only.
2. Minimize user actions. If you can do it via API, skip the UI.
3. `.env` is source of truth for secrets. Never log them.
4. Legal/compliance is mandatory, not optional. Same as email sibling — GDPR doesn't go away because channel changed.
5. PowerShell default (Windows). Offer Mac alternative only if user says they're on Mac.
6. When a step requires patience (LinkedIn warmup, profile aging), start it and move on — don't block the user.
7. **Engine choice is destiny** — once chosen, many downstream decisions follow automatically. Get the account-status question right at intake.

Now stop reading. Greet the user and begin intake.
