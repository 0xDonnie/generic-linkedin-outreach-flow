# Quickstart — English (LinkedIn variant)

One-page guide for the lazy. For the cold-email version, use the sibling repo `generic-coldmailing-flow`.

## What you're about to build

An automated pipeline that:
1. Finds the right decision-makers at your target companies (Apollo — also returns LinkedIn URLs)
2. Sends personalized connection requests + DMs on LinkedIn (via HeyReach or LinkedHelper)
3. Handles replies automatically (classifies, opt-outs, Telegram alerts)
4. Books demos via Cal.com
5. Auto-transcribes demos with Otter (optional)

Total operating cost: **~$65-200/month** (depending on engine choice) + **€500-1500 one-time** for privacy lawyer's LIA.

## Key decision: which engine?

Before anything else, you need to pick **which LinkedIn account** you'll use:

- **Established account** (>=1 year, 500+ connections, your real profile) → **HeyReach** (~$79/mo, cloud, PC can be off, API-driven)
- **New / burner account** (created for this campaign, or very recent) → **LinkedHelper 2** (~$15-45/mo, desktop Chrome extension, PC must be on during send hours)

Claude asks this at intake. If unsure, Claude helps you decide.

## How to start (5 minutes)

1. **Clone this repo** into an empty folder:
   ```powershell
   cd D:\GitHub
   git clone https://github.com/0xDonnie/generic-linkedin-outreach-flow.git my-li-project
   cd my-li-project
   ```

2. **Open Claude Code** in that folder:
   ```powershell
   claude
   ```

3. Claude reads `CLAUDE.md` and greets you. Runs an ~11-question intake in 10-15 min.

4. You answer. Claude makes technical decisions for you; you only decide what matters (target, tone, LinkedIn account, etc.).

5. Claude executes. Only interrupts you when truly needed:
   - A credential (HeyReach API key, etc.) — asks once, stores in `.env`
   - A browser click for SaaS signup (Claude gives you Chrome Extension prompts)
   - LinkedIn account creation (if Engine B and you don't have one) — you do it manually
   - Credit card for payments

Total infra setup time: **3-4 hours** (Claude works ~2h, you ~1h on browser stuff).

**Then**: **2-4 weeks of warmup** (different for Engine A vs B, Claude-guided).

## Prerequisites

**Must have**:
- Windows 11 PC with admin rights (or Mac — tell Claude)
- **Chrome installed** (mandatory for Engine B — LinkedHelper 2)
- Credit card (Apollo $49/mo + engine $15-79/mo + landing-page domain ~$10/yr)
- Browser + email inbox

**For the LinkedIn account**:
- Engine A: your established LinkedIn account + password + 2FA ready
- Engine B: either a new LinkedIn account you've already created, or willingness to create one (phone number needed for SMS verification)

## Timeline

- **Hours 0-4**: infra setup (Claude does most)
- **Week 1-2**: profile optimization + organic warmup (Engine A: light; Engine B: mandatory + substantial)
- **Week 2-3**: first low-volume sends (5-10/day)
- **Week 4**: ramp to 15-20 connection requests/day (cruise)
- **LIA**: 1-2 weeks in parallel with lawyer — does NOT block warmup
- **Full production**: week 5-6

## What Claude handles automatically

- Installs Postgres / Node where needed
- Creates CRM database (LinkedIn-first schema)
- Imports 4 n8n workflows + wires credentials
- Configures HeyReach or LinkedHelper → n8n → CRM → Telegram webhook chain
- Deploys privacy notice + opt-out form on Cloudflare Pages
- Sets up Cal.com webhook, Otter auto-join, Telegram bot
- Writes DM templates with your product baked in
- Enforces LinkedIn rate limits (DAILY_LI_CONNECTION_LIMIT=20 etc.) — you can't accidentally exceed
- Ramps caps week-by-week per warmup plan
- Sets up the **dashboard** (CLI + optional Metabase) so you can see what's happening

## Dashboard — how you watch the pipeline

Two complementary views (see `dashboards/README.md`):

**CLI — quick pulse**
```powershell
npm run kpi
```
Prints in terminal: funnel (cold → connected → replied → demo), today's rate-limit usage, current warmup day, engine health (HeyReach/LinkedHelper reachable), last 5 replies. Zero infra, 2 seconds.

**Metabase — visual web dashboard (optional, requires Docker)**
```powershell
npm run dashboard:up   # starts container on http://localhost:3000
```
First boot: create admin + connect Postgres (~5 min of clicks, guide in `dashboards/metabase/setup.md`). Paste the 7 preset queries (`dashboards/metabase/queries/`) and you get weekly trends, reply breakdown, per-template performance, etc.

Claude has a dedicated skill (`skills/kpi-dashboard/SKILL.md`) that kicks in when you say "how is it going?", "show KPIs", "dashboard", "how many today?", etc. — picks CLI or Metabase for you.

## What YOU must do (no shortcuts)

- Answer the intake questions
- If new LinkedIn account: create it yourself (LinkedIn forbids programmatic creation, for security)
- If Engine B: install LinkedHelper desktop app on your PC
- Optimize your LinkedIn profile (Claude gives you a Chrome ext prompt with exact steps)
- Sign up for SaaS services (first click is yours)
- Decide DM tone
- Handle real prospect replies when they come (that's sales, not automation)
- Contact a privacy lawyer for LIA (Claude drafts the email)

## What Claude will NOT do (for your protection)

- Won't send outbound without warmup (would get your LinkedIn account banned)
- Won't directly scrape LinkedIn (ToS + GDPR — data comes from Apollo only)
- Won't exceed LinkedIn rate limits (2024-2025 caps: ~100/week, 25/day max)
- Won't pay without your explicit OK
- Won't run LinkedHelper on a cloud VPS (defeats the safety premise — must stay on your PC)

## Ban risk — read BEFORE starting

Claude will make you read `legal/linkedin-tos-risk.md` before proceeding. Actually read it — 5 minutes. Summary: every LinkedIn automation tool (HeyReach, LinkedHelper, all of them) technically violates ToS. Ban risk is not zero. The framework minimizes risk but doesn't eliminate it. If you lose the account, you lose it (LinkedIn almost never reverses bans). Acknowledge the risk, then go.

## Quick FAQ

**"How much first month?"**
~$65-130 (Apollo $49 + engine $15-79 + domain $10). Steady state: same monthly, drops if you take annual plans.

**"Will I get banned?"**
Estimated rates: 2-8% at 6 months on HeyReach, <2% on LinkedHelper with conservative caps. Not zero. Lost account = permanent in ~99% of cases.

**"What if I already have Apollo / Cloudflare / Cal.com?"**
Tell Claude at intake, they'll reuse. No re-signup.

**"Can I change engine later?"**
Technically yes but painful — changes data processor (→ LIA needs update), changes credentials, changes workflow 2. Better to pick well upfront.

**"PC must be on 24/7?"**
- Engine A (HeyReach): no, runs in cloud
- Engine B (LinkedHelper): yes, during your 9-18 TZ. PC off = no sends happen. Claude reminds you.

**"Who reads the replies?"**
Telegram alerts for positive replies + bookings. Full conversation lives in LinkedIn (you read it there or via HeyReach/LinkedHelper UI).

**"Can I also do email in parallel?"**
Yes — clone `generic-coldmailing-flow` separately. Same foundational tools (Postgres, n8n, Cal.com, Telegram, Otter), different channel.

---

Ready? → open Claude Code in the cloned folder → it starts on its own.

Deep dives before starting? → `guides/claude-playbook.md` (technical, complete) or `legal/linkedin-tos-risk.md` (5 min, mandatory).
