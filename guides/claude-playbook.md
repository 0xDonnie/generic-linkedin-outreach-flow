# Claude Playbook — execution order

> This is YOUR operational playbook as Claude Code. The user doesn't need to read this. You execute it, step by step, after intake is complete.

## Prerequisites before starting

Verify:
- [ ] `intake/answers.md` exists and is populated
- [ ] User has said "go"
- [ ] User has a payment card ready (for Apollo subscription + domain purchases)
- [ ] User has access to a web browser (for SaaS signups) + their main email inbox (for verification links)

If any missing, pause and ask.

## Execution phases

### Phase 0 — Project scaffolding (5 min, Claude autonomous)

1. Create `.env` from `.env.example`, populate with values from `intake/answers.md`
2. Create `data/`, `logs/` directories (gitignored)
3. `npm install` in root for Node.js dependencies
4. Run `node --version` + `psql --version` + `git --version` to verify tooling present
5. If `psql` missing → prompt user to install Postgres 17 (give Windows installer link)

### Phase 1 — Database (10 min)

**Local mode**:
1. Ask user for Postgres password (the one they set during installation)
2. `createdb ba_sales` (or user-chosen name from answers.md)
3. Run `database/schema.sql`
4. Verify 7 tables exist via `\dt`

**VPS mode**: defer to Phase 6.

### Phase 2 — Outbound domain purchase (user browser, 15 min)

Generate paste-ready prompt for Claude Chrome Extension from `extension-prompts/cloudflare-domain-purchase.md`. Wait for user confirmation "domini comprati".

During wait: start Phase 3 in parallel.

### Phase 3 — SaaS account signups (user browser, 30-60 min in parallel)

User creates:
1. **Apollo.io Basic** ($49/mo) → signup link, generate API key prompt
2. **Brevo Free** → signup, generate SMTP key prompt
3. **Cloudflare account** (if not already)
4. **Dedicated Gmail** for receiving replies (user creates in incognito)
5. **Cal.com** account → reserve slug, create "Intro Call" event
6. **Telegram bot** via @BotFather + create notification group
7. **Otter.ai** → signup, connect Google Calendar, auto-join ON

For each, provide a paste-ready extension prompt from `extension-prompts/`.

User reports back credentials. Claude appends them to `.env`.

### Phase 4 — DNS configuration (20 min)

For each domain purchased in Phase 2:
1. **MX + SPF + DKIM + DMARC** for Brevo — generate DNS record payloads from `extension-prompts/cloudflare-dns-setup.md`
2. **Cloudflare Email Routing** to forward `sales@<domain>` to the dedicated Gmail
3. Verify each domain on Brevo (Brevo dashboard auto-checks DNS)

Use API where possible (Cloudflare has a clean DNS API; Claude can do all record additions in one script).

### Phase 5 — Unsubscribe Worker + Privacy notice (15 min)

1. Deploy `unsubscribe-worker/` to Cloudflare Workers via `wrangler deploy`
2. Map custom domain `unsubscribe.<primary-outbound-domain>` to Worker
3. Deploy `templates/privacy-notice.html` to Cloudflare Pages as `privacy.<primary-outbound-domain>`
4. Test both URLs respond HTTP 200

### Phase 6 — VPS setup (only if VPS mode, 45 min)

User provides SSH access to Hetzner VPS. Claude runs via SSH:

```bash
bash scripts/bash/setup-vps.sh
```

This installs: Node.js 20, Docker, PostgreSQL, Caddy, Git. Then:
1. Copies project files to `/opt/<project-name>/` via rsync/scp
2. Creates Postgres user + database + runs schema
3. Restores data (if migrating from local) via pg_dump/pg_restore
4. Docker Compose up for n8n
5. Caddyfile with `n8n.<primary-outbound-domain>` → localhost:5678
6. Cron for unsubscribe sync every 15 min

### Phase 7 — n8n setup (15 min)

1. Open n8n at `http://localhost:5678` (local) or `https://n8n.<domain>` (VPS)
2. User creates owner account (browser UI — unavoidable one-time step)
3. User generates API key → Claude imports 4 workflows via API (`scripts/powershell/import-workflows.ps1`)
4. User creates 4 credentials in UI (guided with exact values from `.env`):
   - BA Postgres
   - BA SMTP (Brevo)
   - BA Inbox (Gmail IMAP — requires Gmail App Password)
   - BA Telegram (or Slack per user's choice)
5. Claude runs `scripts/powershell/bind-credentials.ps1` to link credentials to nodes

**Note**: if user wants Slack instead of Telegram, `scripts/powershell/replace-telegram-with-slack.ps1` (or vice versa).

### Phase 8 — Apollo ICP search (45 min, user + extension)

For regulated industries: run registry scrapers first (`scripts/node/scrape-*.mjs` — see `docs/apollo-icp-brainstorm.md`).

For all: provide `extension-prompts/apollo-icp-search.md` — generates an Apollo search using user's 10 intake answers. Extension builds Apollo Saved Search, exports CSV to Downloads.

User drops CSV in `data/raw/apollo-export.csv`. Claude runs `npm run crm:load` → leads populated.

### Phase 9 — Email templates (15 min, collaborative)

Using intake answers, Claude fills `templates/email-templates/*.md` with:
- Product name + pitch
- ICP pain point (user described in Q1)
- Sender identity
- Compliance footer (auto-filled from `.env`)

Show renders to user, get "ok" or refinements.

### Phase 10 — Smoke test (10 min)

Claude runs `scripts/node/test-send-one.mjs --to <user's-dedicated-gmail>`. Email arrives, user clicks unsubscribe link, Claude runs sync, verifies suppression_list grows by 1.

Everything green → system is production-ready.

### Phase 11 — LIA (parallel, external, 1-2 weeks)

Claude generates an email from `legal/lia-request-email.md` template for user to send to 2-3 privacy lawyers. LIA signed → user gives Claude the reference code → Claude updates `consent_log.lia_ref` + privacy notice HTML + redeploys.

**Warmup can start before LIA is back**, as long as sends are only to user's internal tribe mailboxes (not real prospects).

### Phase 12 — Warmup (21 days)

Day 1: Claude activates workflow 2 cron with `DAILY_EMAIL_LIMIT=5`, internal tribe only.
Day 4-7: ramp +5/day to 25.
Day 8-14: ramp to 40/day, add first real prospects (5/day).
Day 15-21: full ramp to 50/day real prospects.
Day 22+: full production.

Daily: Claude checks Postmaster Tools spam rate, bounce rate, reply rate. Warns if trending bad.

### Phase 13 — Production (ongoing)

- Daily cron sends 50/day/domain
- Telegram fires on positive replies + demos booked
- User processes replies in Gmail + Cal.com
- Weekly: Claude generates KPI report (sent, reply rate, conversions, cost-per-demo)

## Progress tracking

Use TaskCreate/TaskUpdate to track each phase as tasks. Mark in_progress at start of phase, completed when done. Helps you and user see progress without you asking "done?" every 5 min.

## Common blockers + how to handle

| Blocker | How you handle |
|---|---|
| User doesn't have Postgres installed | Link to installer, wait, verify via `psql --version` |
| Apollo free tier too small | Tell user to upgrade Basic $49 — explain math (leads / credits / demos) |
| Cloudflare domain search returns "premium price" | Try variant or skip that name; don't push premium domains |
| n8n API credential creation fails schema validation | Fallback to UI creation (guide user through 3 clicks) |
| Webhook 404 after activation | Likely missing `webhookId` on node — patch via PUT + add random UUID |
| SMTP send fails auth | Re-check `.env` SMTP_PASS has no extra spaces, test with `curl` SMTP |
| Gmail App Password unavailable | Account <24h old — user waits and retries |
| DNS propagation slow | Wait 2-5 min, retry. Don't over-debug. |

## When to pause and ask user

Only pause when:
- Credential needed (API key, password) — ask once, store in `.env`
- Browser action needed that Chrome extension can't do (OAuth, 2FA, payment)
- Real user choice affecting outcome (template voice, ICP refinement)
- Unrecoverable error (disk full, network down)

Otherwise: **keep going**. Update user with one-line progress every 5-10 min.

## When to stop

- All 13 phases complete
- Smoke test passed
- User has confirmed they got the test email + unsubscribe worked
- Warmup started with internal tribe (if user ready) OR user explicitly says "fermiamoci qui, riprendiamo domani"

## Final handoff

At end of setup, generate:
1. **Credential summary** (password manager ready to copy)
2. **`.env` file** (complete, in `D:\GitHub\<project>\.env`)
3. **Sales handoff guide** for whoever operates daily (template: `templates/sales-onboarding-template.md` — customize with user's sender name, product, etc.)
4. **Roadmap for next 4 weeks** (warmup days, production launch date)

Tell the user clearly what they have, what they still need to do (email lawyer for LIA, maybe upgrade SaaS tiers), and when to expect first real prospects.

Done.
