---
name: kpi-dashboard
description: Use this skill whenever the user asks about campaign performance, funnel metrics, daily rate-limit usage, warmup status, reply breakdown, demos booked, engine health, or any "come sta andando?" / "how is it going?" / "dashboard" / "mostra KPI" / "quanti ne ho mandati oggi" / "report" / "accept rate" question about the LinkedIn outreach pipeline. Also triggers when the user asks to start, stop, or troubleshoot Metabase.
---

# KPI Dashboard — Skill

You are assisting with the analytics layer of a LinkedIn outreach pipeline. The project ships with two parallel dashboards:

- **CLI** — `npm run kpi` (script at `scripts/node/kpi.mjs`)
- **Metabase** — docker compose at `dashboards/metabase/docker-compose.yml`, dashboard at http://localhost:3000

Pick the right one, run it, interpret the result. Do not bounce the user around; synthesize the answer.

## Deciding: CLI vs Metabase vs direct SQL

| User says / needs | Tool |
|---|---|
| "come va?", "quanti invii oggi?", "sta andando?", any fast pulse check | **CLI** (`npm run kpi`) |
| Before ramping warmup cap next week | **CLI** first, then if ambiguous open Metabase |
| "mostra grafico", "trend", "ultimi 30 giorni", "dashboard", "report settimanale" | **Metabase** (start if not running, then open browser) |
| Drilling into a specific template, country, or lead segment | **Metabase** (it has filters) |
| One specific number the CLI doesn't show | **Direct SQL** via psql against `$DATABASE_URL` — write the query yourself, don't force user into Metabase for one datapoint |
| Engine seems dead / webhook not firing | **CLI** (it pings engine health) |

Default to CLI when in doubt. It's one command, 2 seconds, no docker.

## Running the CLI KPI

```bash
npm run kpi
```

Requires `.env` populated with `DATABASE_URL`, optionally `LINKEDIN_ENGINE` + engine credentials for the health-check section, and `DAILY_LI_CONNECTION_LIMIT` / `DAILY_LI_MESSAGE_LIMIT` for the progress bars.

The script has 6 sections; read all of them and **surface what matters** to the user, don't just paste the whole output. Example:

- If user asked "come va oggi?": report today's connections sent / cap, messages sent / cap, and if the engine health is green. Mention recent replies only if there are interesting ones (positive/negative).
- If user asked "quanti lead ho nel CRM?": report just the funnel top line.
- If acceptance rate looks bad (<12% in the last week's data), proactively flag it even if the user didn't ask — they will want to know before ramping caps.

### Thresholds to internalize

| Metric | Good | Warning | Stop signal |
|---|---|---|---|
| Connection accept rate (overall) | >= 18% | 12–18% | < 12% — targeting / headline is wrong |
| Reply rate on first-message | >= 8% | 3–8% | < 3% — message is bad |
| Opt-out rate | < 1% | 1–2% | >= 2% — message is annoying |
| Rate-limit usage today | < 80% of cap | 80–100% | Over cap = bug in workflow 2's gate |
| Engine health | OK | — | unreachable — STOP campaign until fixed |
| Recent replies age (latest reply) | Hours–days | Week | Two weeks+ with no reply while sending = something is broken |

### Output interpretation examples

**User**: "oggi come va?"
**You** (after running `npm run kpi`): "Oggi: 14/20 connection richieste inviate, 22/40 messaggi. Engine OK. 2 reply positive nelle ultime 24h (Marco Rossi @ Acme, Luigi Bianchi @ Beta). Va bene — niente di urgente."

**User**: "tutto bene?"
**You** (acceptance rate 9% on week 2): "Technically funziona, ma **acceptance rate settimanale è al 9%, sotto il 12% di soglia**. Prima di salire a 15/day la prossima settimana, rivediamo headline o ICP. Vuoi che apra Metabase per vedere il trend, o scegliamo subito un'ipotesi?"

## Running Metabase

### Start

```bash
npm run dashboard:up
```

First boot takes 60-90 seconds. Tell the user to wait, then open http://localhost:3000. Optionally tail logs: `npm run dashboard:logs` and watch for "Metabase Initialization COMPLETE".

### First run (per project)

User needs to do (one time):
1. Create admin account
2. Add Postgres datasource — host `host.docker.internal`, port 5432, db / user / pass from `$DATABASE_URL`
3. Paste the 7 queries from `dashboards/metabase/queries/` into Metabase as Native Queries
4. Arrange on a dashboard named "LinkedIn Outreach KPIs"

Full step-by-step in `dashboards/metabase/setup.md`. **Give the user that file, don't try to walk them through it in chat**. It's 3-5 min of clicking. Claude cannot click through Metabase UI from outside the browser.

### Stop / restart

```bash
npm run dashboard:down
npm run dashboard:up
```

### Adding new queries

1. Write the SQL in `dashboards/metabase/queries/NN-name.sql`
2. First line should be `-- Name: <display name>` + `-- Chart type: <suggestion>` comments — these guide the user setting it up
3. Test it directly via psql before committing
4. Tell the user to paste into Metabase as a new Native Query (it doesn't auto-pick up from the file — Metabase isn't file-based)

## Direct SQL (when neither tool fits)

For one-off numbers, query directly via psql. Don't always reach for Metabase for a single count.

```bash
psql "$DATABASE_URL" -c "SELECT count(*) FROM leads WHERE country = 'IT';"
```

Schema reminders:
- `leads` has `linkedin_url` (unique), `linkedin_public_id`, `country`, `title`, `source`
- `campaign_messages.touch_type` ∈ `connection_request | first_message | follow_up_1 | follow_up_2`
- `campaign_messages.status` ∈ `queued | sent | delivered | connection_pending | connection_accepted | connection_declined | failed | skipped`
- `li_replies.reply_type` ∈ `interested | objection | not_interested | opt_out | auto_reply | connection_accept | other`
- `li_replies.sentiment` ∈ `positive | neutral | negative`
- `rate_limit_log` is keyed `(campaign_id, day)` — one row per day per campaign
- `contactable_leads` VIEW excludes suppressed + requires `consent_log` row
- `demo_bookings.status` ∈ `scheduled | completed | no_show | cancelled`

## Troubleshooting

### `npm run kpi` fails

| Error | Fix |
|---|---|
| `DATABASE_URL missing` | `.env` not populated or not at project root. Check `.env` exists + `DATABASE_URL=postgresql://...` line. |
| `connection refused` | Postgres not running. `pg_ctl status` on Windows, `systemctl status postgresql` on VPS. |
| `relation "contactable_leads" does not exist` | Schema not applied. `psql $DATABASE_URL -f database/schema.sql`. |
| `HeyReach API: HTTP 401` | API key wrong or expired. Check HEYREACH_API_KEY in `.env`. |
| `LinkedHelper local: unreachable` | LinkedHelper desktop app not running, OR Chrome closed, OR port 7337 blocked. Tell user to open LinkedHelper. |

### Metabase won't start

| Error | Fix |
|---|---|
| `docker: command not found` | Docker Desktop not installed. Link: https://www.docker.com/products/docker-desktop/ |
| Port 3000 in use | Another service (Grafana, Node dev server) uses :3000. Change `ports: - "3001:3000"` in docker-compose.yml. |
| Container restarting loop | Probably OOM on low-RAM host. Metabase needs ~1 GB. Upgrade VPS to CX22 (4 GB) or close other services. |
| First login wizard stuck | Give it 2 min — Metabase is slow on cold boot. Check `npm run dashboard:logs`. |

### Metabase can't connect to Postgres

Most common issue. In Metabase UI → Add database:
- On **Docker Desktop (Windows/Mac)**: host = `host.docker.internal`
- On **Linux VPS**: host = `host.docker.internal` works thanks to the `extra_hosts` entry in docker-compose.yml
- If still failing: check `pg_hba.conf` allows the Metabase container's IP. Easier: run Postgres and Metabase in the same docker network (see `dashboards/metabase/setup.md` → "Advanced" section).

### Metabase dashboard shows stale data

Native SQL questions cache 10 min by default. For live feel:
- Per question → Settings gear → Caching → turn off.
- OR: click the refresh icon on the dashboard.

## When to proactively suggest the dashboard

Trigger `npm run kpi` (without waiting for the user to ask) when:
- User just activated workflow 2 — confirm sends are happening
- User completed intake and you're closing the session — baseline snapshot
- User asks about a specific lead / reply — run psql + suggest dashboard for wider view
- You're about to ramp warmup caps — verify acceptance rate is safe first
- Something seems off ("perché non arrivano reply?") — data before hypothesis

Don't run it when:
- User just said "ok, grazie, basta per oggi" — respect the end of session
- User is clearly in a different context (debugging n8n, drafting a message)
- Less than ~30 min since last run — data won't have changed enough

## Context about the underlying system

This helps you interpret numbers correctly:

- **Cron runs every 30 min during send hours (9-18 local TZ)** — the `rate_limit_log` increments ~within 30 min of an action
- **Workflow 2 picks random 5 leads per run** — so intra-day, sends cluster in 5s
- **Connection-accept detection depends on the engine webhook firing** — if HeyReach/LinkedHelper webhook isn't registered, `status` stays `connection_pending` forever. If you see many `connection_pending` that never flip, this is the bug.
- **Reply detection also webhook-driven** — `li_replies` population depends on webhook reaching the n8n workflow 3. Check workflow 3 execution logs in n8n UI if replies aren't showing.

## Do NOT

- Invent metrics the schema doesn't support (there's no "email open rate" — this is LinkedIn).
- Auto-run `npm run kpi` more than once every 5 min in the same session — cached data won't change.
- Export Metabase admin credentials to `.env.example` or commit `metabase-data/` — they contain secrets.
- Recommend Grafana, Superset, or a custom Next.js dashboard as "better" — the user chose Metabase + CLI; don't second-guess.
