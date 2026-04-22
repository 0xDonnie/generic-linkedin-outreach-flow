# Claude Playbook — execution order (LinkedIn variant)

> This is YOUR operational playbook as Claude Code. The user doesn't need to read this. You execute it, step by step, after intake is complete.

## Prerequisites before starting

Verify:
- [ ] `intake/answers.md` exists and is populated
- [ ] User has said "go"
- [ ] User has acknowledged `legal/linkedin-tos-risk.md`
- [ ] User has a payment card ready (Apollo + engine subscription)
- [ ] User has Chrome installed (mandatory for Engine B, recommended for Engine A)
- [ ] User has a LinkedIn account (existing for Engine A, to-be-created for Engine B)

If any missing, pause and ask.

## Execution phases

Phase numbering is engine-aware — some phases differ between Engine A (HeyReach) and Engine B (LinkedHelper).

### Phase 0 — Project scaffolding (5 min, Claude autonomous)

1. Create `.env` from `.env.example`, populate with values from `intake/answers.md`
2. Set `LINKEDIN_ENGINE=heyreach` or `linkedhelper` based on intake answer
3. Create `data/`, `logs/` directories (gitignored)
4. `npm install` in root for Node.js dependencies
5. Run `node --version` + `psql --version` + `git --version` to verify tooling present
6. If `psql` missing → prompt user to install Postgres 17 (Windows installer link)

### Phase 1 — Database (10 min)

1. Ask user for Postgres password (set during installation) — capture once
2. `createdb <project_name>`
3. Run `database/schema.sql`
4. Verify tables exist via `\dt` — expect: leads, suppression_list, consent_log, campaigns, campaign_messages, li_replies, demo_bookings, rate_limit_log
5. Insert the active campaign row and capture UUID into `.env` as `ACTIVE_CAMPAIGN_ID`

### Phase 2 — LinkedIn account readiness (varies by engine)

**Engine A (HeyReach) — established account (5 min)**
- Verify sender profile URL is accessible
- Run `extension-prompts/linkedin-profile-optimization.md` — optimize headline, about, featured
- If profile has <500 connections: recommend user grow organically first, but don't block

**Engine B (LinkedHelper) — new account (1-2 weeks, parallel with other phases)**
- If account doesn't exist: user creates it (manual, can't do via ext for account creation — security)
- Run `extension-prompts/linkedin-profile-optimization.md`
- Organic warmup: 10-20 real connections, 2-3 posts, 2 weeks minimum — this blocks outbound start
- Tell user: "attivo il resto dell'infra in parallelo, tu intanto scaldi l'account"

### Phase 3 — Engine signup + credential capture (10-20 min, browser + user)

**Engine A**: `extension-prompts/heyreach-signup.md` → capture `HEYREACH_API_KEY` + `HEYREACH_ACCOUNT_ID`
**Engine B**: `extension-prompts/linkedhelper-setup.md` → user installs desktop app + Chrome ext on their PC → capture `LINKEDHELPER_API_KEY`, verify `http://127.0.0.1:7337` reachable

Test API connectivity via `node scripts/node/test-linkedin-send.mjs --dry-run --profile <test-url> --type connection --body "test"`.

### Phase 4 — Other SaaS signups (parallel, 30-45 min)

1. **Apollo.io Basic** ($49/mo) → use `extension-prompts/apollo-people-search.md` prep
2. **Cloudflare account** (if not already)
3. **Cal.com** account → reserve slug, create "Intro Call" event (`extension-prompts/cal.com-signup.md`)
4. **Telegram bot** via @BotFather + notification group (`extension-prompts/telegram-bot-create.md`)
5. **Otter.ai** → signup, connect Google Calendar, auto-join ON (`extension-prompts/otter-signup.md`)

Claude appends captured credentials to `.env` as user reports them.

### Phase 5 — Domain + privacy page (15 min)

Only needed if user doesn't have an existing domain:
1. `extension-prompts/cloudflare-domain-purchase.md` — buy ONE domain for privacy page
2. Claude creates DNS records via Cloudflare API
3. Deploy `templates/privacy-notice.html` to Cloudflare Pages (custom subdomain `privacy.<domain>`)
4. Create opt-out form landing page (same domain, route `/opt-out` → POST to n8n webhook → suppression_list)
5. Set `.env`: `PRIVACY_NOTICE_URL=...`, `OPTOUT_FORM_URL=...`

### Phase 6 — VPS setup (Engine A only, optional, 30 min)

If user chose VPS mode AND engine=heyreach:
```bash
ssh user@vps.ip
bash scripts/bash/setup-vps.sh
```
Installs Node 20, Docker, Postgres, Caddy. Copies project, runs schema, imports n8n workflows.

Engine B users skip this — LinkedHelper runs locally.

### Phase 7 — n8n setup (20 min)

1. Start n8n: `.\scripts\powershell\start-n8n.ps1` (local) OR on VPS
2. Open n8n at http://localhost:5678 (or https://n8n.<domain>)
3. User creates owner account (browser UI — unavoidable one-time)
4. User generates API key → Claude imports 4 workflows via API:
   - `1-lead-enrichment.json`
   - `2-linkedin-campaign.json`
   - `3-reply-handler.json`
   - `4-demo-booking.json`
5. User creates credentials in UI:
   - Outreach Postgres (connect string from `.env`)
6. Activate workflow 3 (reply handler) first — get its webhook URL
7. Register webhook URL with the engine:
   - Engine A: Claude POSTs to `https://api.heyreach.io/api/public/webhook` to register `{{N8N_URL}}/webhook/linkedin-reply`
   - Engine B: user configures in LinkedHelper desktop → Tools → Webhook
8. Activate workflow 4 (Cal.com demo booking) — register its webhook at Cal.com via API

### Phase 8 — Apollo ICP search (45 min, user + extension)

1. Use `extension-prompts/apollo-people-search.md` — generate Apollo search with user's ICP filters
2. IMPORTANT: export must include `person_linkedin_url` column + filter rows without LinkedIn URL
3. User drops CSV in `data/raw/apollo-export.csv`
4. Claude runs `npm run crm:load`
5. Verify: `SELECT count(*) FROM leads; SELECT count(*) FROM contactable_leads;`

### Phase 9 — Templates fill (15 min, collaborative)

Using intake answers, Claude fills `.env` placeholder variables used by templates:
- `CONNECTION_NOTE_HOOK` — one-liner for the 300-char invite note (user gives or Claude proposes)
- `FIRST_MESSAGE_HOOK` — opener for post-accept first DM
- `PRODUCT_PITCH` — 1-2 sentence pitch
- Sender identity fields

Show rendered template samples to user (pass each template through the render function with real lead data), get "ok" or refinements.

### Phase 10 — Smoke test (10 min)

1. Create a test lead in the DB with YOUR user's own LinkedIn URL (or a test profile they own): `INSERT INTO leads (linkedin_url, linkedin_public_id, company_name, contact_name, title) VALUES (...);`
2. Add consent_log row
3. Run `node scripts/node/test-linkedin-send.mjs --profile <test-profile> --type connection --body "[rendered connection note]"` (Engine A) or via LinkedHelper UI (Engine B manual trigger)
4. Verify in LinkedIn that the action fired
5. In LinkedHelper / HeyReach dashboard, verify the send is logged

If everything works → system is technically ready. Do NOT activate workflow 2 cron yet.

### Phase 11 — LIA (parallel, external, 1-2 weeks)

1. Generate LIA request email from `legal/lia-template-linkedin.md` (ends with the paragraph "Email to send to a privacy lawyer")
2. User sends to 2-3 privacy lawyers, gets estimates
3. User chooses, pays (~€500-1500)
4. Lawyer returns signed LIA → user gives Claude the reference code → Claude updates `.env: LIA_REF=...` + privacy notice HTML + redeploys

**Warmup organic phase can run before LIA is back** — no outbound touches yet, just account aging.

### Phase 12 — LinkedIn warmup (2-4 weeks)

See `guides/linkedin-warmup-plan.md` for the day-by-day schedule. Summary:

**Engine A (established account)** — 2 weeks:
- Week 1: profile polish + 2-3 organic posts + 10-20 network connects (no outreach yet)
- Week 2: start outreach at 5 connection requests/day, ramp to 10
- Week 3: 15/day
- Week 4+: cruise at 20/day

**Engine B (new account)** — 4 weeks:
- Week 1-2: profile build + organic posts + connect to 20-40 real contacts (no automation yet)
- Week 3: start outreach at 5/day via LinkedHelper
- Week 4: ramp to 10/day
- Week 5+: cruise at 15-20/day

Claude updates `.env` rate caps weekly to enforce the ramp.

### Phase 13 — Production cron active

ONCE Phase 11 (LIA) and Phase 12 warmup criteria are met:
1. Activate n8n workflow 2 (LinkedIn Campaign) — enables the every-30-min cron
2. Monitor daily via DB queries:
   - connection acceptance rate (should be >15% or investigate targeting)
   - reply rate (should be 5-15%)
   - opt-out rate (should be <2%)
3. Telegram notifications fire on positive replies + demos booked
4. Weekly: generate KPI report

## Progress tracking

Use TaskCreate/TaskUpdate for each phase. Mark in_progress at start, completed when done.

## Common blockers + how to handle

| Blocker | How you handle |
|---|---|
| User has no LinkedIn account for Engine B | User creates it manually (security - can't do via ext). Wait + proceed with other phases in parallel. |
| Profile <500 connections + Engine A chosen | Recommend switching to Engine B OR doing 2 weeks organic warmup first |
| HeyReach API key rejected | Check `HEYREACH_ACCOUNT_ID` is set correctly — most common cause |
| LinkedHelper local HTTP API unreachable | User's LinkedHelper isn't running, or port 7337 blocked by Windows Firewall |
| Apollo export has 0 LinkedIn URLs | Filter too narrow or Apollo plan doesn't include LinkedIn URLs — upgrade or adjust |
| n8n webhook 404 | Workflow not activated, or `webhookId` missing on Webhook node |
| Cal.com webhook doesn't fire | Cal.com webhook secret not set, or triggers not enabled |
| Telegram bot doesn't post | Bot not added to the group, or TELEGRAM_CHAT_ID is user-id (need group-id: negative number) |
| LinkedIn shows "restricted" mid-warmup | STOP all automation. Explain to user. Let account rest 7 days. Restart at week-1 limits. |

## When to pause and ask user

Only pause when:
- Credential needed (API key, password) — ask once, store in `.env`
- Browser action needed that Chrome extension can't do (OAuth, 2FA, payment, LinkedIn account creation, Chrome desktop app install)
- Real user choice affecting outcome (template voice, ICP refinement)
- Unrecoverable error or LinkedIn restriction detected

Otherwise: **keep going**. Update user with one-line progress every 5-10 min.

## Final handoff

At end of setup:
1. **Credential summary** for password manager
2. **`.env` file** complete at `D:\GitHub\<project>\.env`
3. **Roadmap for next 4-6 weeks** (warmup schedule, LIA ETA, production launch date)
4. **KPI targets** for first 30 days based on user's volume goal

Tell user:
- What they have
- What's still blocking (LIA if not signed)
- Expected first real-prospect outreach day
- Telegram will start chirping when replies come in
