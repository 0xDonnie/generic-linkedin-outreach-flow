# Dashboards

Two parallel ways to see what the pipeline is doing. Pick one or use both.

## Option A — CLI (`npm run kpi`)

Quick terminal snapshot. Zero extra infra.

```powershell
npm run kpi
```

Shows:
- **Funnel**: total leads → contactable → connection sent → accepted → first-msg → engaged replies → demos
- **Today's rate-limit usage** (with progress bars — green / yellow / red)
- **Warmup state** (`WARMUP_DAY` + which week you're in + current caps)
- **Engine health** (pings HeyReach API or LinkedHelper local server)
- **Last 7 days activity** (daily counts from `rate_limit_log`)
- **Recent replies** (last 5 with sentiment color-coded)

Use when:
- "Come sta andando?" / "quanti invii oggi?"
- Before promoting warmup to next week (verify acceptance rate, no restrictions)
- Sanity check that the cron is actually running (is `rate_limit_log` being updated?)
- Right before / after fixing something — quick feedback loop

Script lives at `scripts/node/kpi.mjs`. Add fields there if you want more terminal KPIs.

## Option B — Metabase (visual dashboard)

Self-hosted, free, Docker container.

```powershell
npm run dashboard:up      # starts container on port 3000
npm run dashboard:down    # stops
npm run dashboard:logs    # tails logs
```

Open http://localhost:3000 → first-run setup (admin account + Postgres datasource) is a one-time ~5 min thing. See `dashboards/metabase/setup.md` for the exact clicks.

Ships with **7 preset SQL queries** in `dashboards/metabase/queries/`:
1. `01-funnel.sql` — the main funnel chart
2. `02-daily-activity.sql` — sends per day, last 30 days
3. `03-acceptance-rate.sql` — weekly accept % trend (the single biggest KPI)
4. `04-reply-breakdown.sql` — what kinds of replies you get
5. `05-rate-limit-usage.sql` — today's caps
6. `06-template-performance.sql` — which templates perform best
7. `07-demo-outcomes.sql` — demo pipeline health

Paste each into Metabase as a "Native query" question, save, arrange on a dashboard. 10 min of UI work, one-time.

Use when:
- Weekly / monthly review
- Drilling into a specific period or template variant
- Sharing KPIs with a partner / investor (via Metabase email subscription)
- Mobile check (Metabase has a responsive UI)

## Why both?

- **CLI** = fast, no dependencies, works over SSH, fits in a tmux pane. Cost: zero.
- **Metabase** = trends, grouping, drill-down, shareable. Cost: ~1 GB RAM on whatever host.

Start with CLI. Add Metabase once you have 2+ weeks of real data to look at (otherwise empty charts).

## For Claude Code

Claude has a skill (`.claude/skills/kpi-dashboard/SKILL.md`) that triggers on analytics / performance / "come va" questions. It decides CLI vs Metabase based on intent, runs the right command, summarizes the output for you.

You can also just say "mostra KPI" or "come va la campagna?" and it'll route correctly.
