# LinkedIn Terms of Service — Risk Assessment

> **For Claude**: show this document to the user BEFORE they commit to the engine choice. User must acknowledge the risk explicitly. Do NOT proceed with setup until they say they understand.

> **For the user**: this is an honest summary of the risk you're taking by using any LinkedIn automation tool. Read it before paying for HeyReach or LinkedHelper.

## TL;DR

1. **Any LinkedIn automation tool — HeyReach, LinkedHelper, Expandi, Dripify, Phantombuster, Waalaxy, Meet Alfred, La Growth Machine — technically violates LinkedIn's User Agreement**. Some more than others.
2. **LinkedIn does ban accounts that automate**. Not all of them, not quickly, but the risk is non-zero. You are playing a game where LinkedIn is the house and can raise the ante.
3. **Enforcement is inconsistent**. Some accounts run automation for years without issue. Others get restricted within a week. Variables that matter: account age, connection count, profile completeness, IP reputation, volume of actions, pattern of actions (human-like delays vs machine-like bursts), whether you trigger spam reports from recipients.
4. **The only 100% ToS-safe option is LinkedIn's native Sales Navigator + manual InMail sending**, capped at 50 InMails/month. This is insufficient volume for most outreach campaigns but is the reference point.
5. **If banned, you lose**: the account, all connections built on it, the history of any conversation, any reputation signals, and potentially (if it's your primary LinkedIn) your professional identity. You do NOT get it back.

## What LinkedIn's User Agreement says

Quoting relevant clauses (as of 2025):

> **Section 8.2 Don'ts — you agree that you will not:**
>
> 8.2.m: Use bots or other automated methods to access the Services, add or download contacts, send or redirect messages;
> 8.2.n: Scrape or copy profiles and information of others through any means (including crawlers, browser plugins and add-ons, and any other technology or manual work);
> 8.2.o: Develop, support or use software, devices, scripts, robots or any other means or processes to scrape the Services or otherwise copy profiles and other data from the Services.

Both HeyReach and LinkedHelper fit cleanly within 8.2.m. LinkedHelper also arguably triggers 8.2.o as a browser plugin.

## Risk comparison by engine

### Engine A: HeyReach (cloud SaaS)

**Mechanism**: HeyReach runs on their cloud infrastructure. You give them access to your LinkedIn session; their servers perform the actions from their IP ranges with humanized delays.

**Detection surface**:
- LinkedIn sees logins from cloud IPs (AWS/GCP ranges) — flaggable, but HeyReach uses dedicated residential-proxied IPs for most customers
- LinkedIn sees action patterns (time-of-day, action types, volume) — HeyReach randomizes these
- LinkedIn sees browser fingerprint — HeyReach emulates real browser, but isn't identical to your actual device

**Typical ban rate**: HeyReach doesn't publish numbers. Anecdotal community reports suggest 2-8% of accounts experience restrictions within 6 months. Lower if you stay well under rate limits and have a credible account.

**Recovery**: LinkedIn rarely reverses bans. If you get a temporary restriction (typically 24-72h), HeyReach support can help diagnose. Permanent ban = over.

**Best for**: established LinkedIn accounts where the cost of a ban is manageable (you can rebuild the account or use a secondary). Worst case = lose the account you've been using for sales.

### Engine B: LinkedHelper 2 (desktop Chrome extension)

**Mechanism**: LinkedHelper runs as a Chrome extension in your actual browser, on your actual PC, on your actual residential IP, using your actual LinkedIn session cookie. From LinkedIn's perspective, the HTTP requests and browser fingerprint are indistinguishable from you manually clicking.

**Detection surface**:
- LinkedIn sees no change in IP, browser, or device fingerprint
- LinkedIn sees action patterns — mitigated by LinkedHelper's humanized delays (configurable)
- LinkedIn sees the volume — if you stay under caps, detection is hard

**Typical ban rate**: anecdotal reports suggest <2% when used conservatively (≤15 actions/day, jitter enabled, only during realistic hours). Higher when users push limits.

**Recovery**: same as HeyReach — LinkedIn rarely reverses bans. If your Chrome session has some signal they pick up, it can also compromise your non-LinkedHelper LinkedIn usage.

**Best for**: new accounts where detection-risk reduction is paramount. Also for users who want the safest option and accept the cost (PC must be on).

## Factors that significantly increase ban risk

Regardless of engine:

1. **New account (< 3 months, < 100 connections)** — LinkedIn's trust algorithm heavily penalizes new accounts doing aggressive outbound. MUST warm up organically for 2-4 weeks first.
2. **Skipping profile completeness** — no photo, no headline, empty about = ban-bait. Complete profile before any automation.
3. **Multiple restrictions triggered in short period** — each restriction reduces LinkedIn's trust in the account. Cluster-fail and you're likely done.
4. **Rate-limit violations** — exceeding 100 connection requests/week triggers their detection algorithms fast.
5. **Low connection acceptance rate** (< 15%) — signals to LinkedIn that you're spamming unwelcome requests. LinkedIn cares about recipient experience more than sender freedom.
6. **Spam reports from recipients** — a handful is survivable; systemic is not.
7. **Running multiple accounts from same IP/device** — obvious tell. LinkedHelper is especially sensitive to this; HeyReach slightly less so with proper isolation.

## Factors that reduce ban risk

1. Account age > 1 year with organic activity history
2. 500+ connections acquired organically over time
3. Complete profile (photo, headline, 3+ positions, skills, 5+ recommendations)
4. Posting organic content 1-2×/week (signals "real user")
5. Respecting rate caps with buffer (e.g., 18/day instead of 25/day max)
6. Humanized timing (no actions between 10pm-7am target TZ, no weekend bursts)
7. Good acceptance rate (>20%) — means your targeting is good
8. No escalation on non-reply (4-touch cap, then stop forever)
9. Engine B on residential IP + real browser — structurally lower detection surface
10. Immediate honoring of "STOP" replies + connection declines

## What if you get banned

Phase 1 — temporary restriction (24h-7 days):
- Usually happens first. LinkedIn warns you.
- STOP all automation immediately. Let the account rest. Engage organically.
- If/when restriction lifts, either pause 2-3 weeks before resuming or migrate off automation.

Phase 2 — restricted account:
- LinkedIn limits certain actions (can't send invites, can't message, can't search).
- Often needs manual appeal with ID verification + declaration that no automation is used.
- Do NOT confess to automation in appeal.
- You'll need to stop for weeks/months even if appeal succeeds.

Phase 3 — permanent ban:
- Account gone, connections gone, conversation history gone.
- Same person can't sign up again from same IP/device for ~6 months typically.
- For burner accounts (Engine B use case), write it off and move on.
- For primary account → serious professional loss.

## Your options (from safest to riskiest)

1. **Manual outreach only** (no automation) → 0% ToS risk, 0% ban risk, ~10x slower, feasible for <20 contacts/day
2. **Sales Navigator + manual InMails** (50/mo included, buy more at $1/each) → 0% ToS risk, 0% ban risk, capped volume
3. **LinkedHelper 2 + conservative limits** (new or established accounts, 10-15 actions/day) → low risk (~2%), lower volume, PC must be on
4. **HeyReach + conservative limits** (established accounts, 15-20 actions/day) → moderate risk (~5%), automation-comfortable volume
5. **HeyReach at max limits, multiple accounts** → higher risk, high volume, best for teams/agencies with account rotation
6. **Any tool + aggressive limits + shallow warmup** → ban-in-weeks territory. Not recommended.

This framework defaults to options 3-4 and blocks options 5-6 by enforcing rate caps in `.env`.

## What this framework does to reduce risk

- `.env` has `DAILY_LI_CONNECTION_LIMIT=20` and `DAILY_LI_MESSAGE_LIMIT=40` by default — DO NOT raise these
- `rate_limit_log` table prevents accidental over-sending
- `Function — send-hour gate` in workflow 2 prevents non-business-hour sends
- Action jitter (`ACTION_JITTER_MIN_MS=45000`, `ACTION_JITTER_MAX_MS=180000`) enforces humanized delays
- 4-touch cap (connection + first message + follow-up-1 + follow-up-2) — no further contact
- Immediate opt-out processing on "STOP" replies or connection declines
- Warmup plan (see `guides/linkedin-warmup-plan.md`) enforces organic warmup BEFORE any outbound, especially for new accounts

## Your acknowledgement

Before we proceed, you should be able to say (silently, to yourself):

- I understand that LinkedIn can ban my account for using this tool, and the framework cannot prevent this 100%
- I have chosen which account I'm willing to lose — if it's my primary LinkedIn, I accept that risk explicitly
- I will not push rate limits above framework defaults
- I will honor opt-outs and never resurrect suppressed leads
- If I get a temporary restriction, I will stop and not restart aggressively
- The framework author is not liable for account loss

If all of the above is fine with you, tell Claude "ok, ho letto linkedin-tos-risk.md, andiamo" and Claude will proceed.
