# Generic LinkedIn Outreach Flow

A **turnkey framework** to build a LinkedIn cold outbound pipeline (connection requests + DMs + follow-ups + demo booking) from scratch, in 3-4 hours, for B2B SaaS / services / consulting / any offering that sells on LinkedIn.

Sibling of [`generic-coldmailing-flow`](https://github.com/0xDonnie/generic-coldmailing-flow) (same architecture, email channel).

## What this is

You cloned this repo because you want to do cold outreach on LinkedIn — connection requests, DMs, follow-ups, book demos. Instead of manually running browser extensions and guessing rate limits, you get a working pipeline with a real CRM, rate-limited queues, reply detection, and demo booking integration.

**What you get at the end**:
- A PostgreSQL CRM with your ICP leads enriched (Apollo → LinkedIn URLs)
- An automated LinkedIn campaign that sends connection requests + DMs + follow-ups
- Reply detection that routes positive replies to Telegram
- Inbound booking flow via Cal.com that auto-logs demos
- Optional: Otter.ai auto-transcribes demo calls
- Rate-limiting that respects LinkedIn caps (no ban risk beyond the inherent ToS risk)
- Two engines you can pick at intake: **HeyReach** (cloud, for established accounts) or **LinkedHelper 2** (desktop Chrome, for new/burner accounts)

## Engines: which do I pick?

| | **Engine A: HeyReach** | **Engine B: LinkedHelper 2** |
|---|---|---|
| Best for | Established account (>=1y, 500+ connections) | New / burner account |
| How it works | Cloud SaaS with API | Chrome extension on your PC |
| Cost | ~$79/mo | ~$15-45/mo |
| Ban risk | Medium | Lower (but not zero) |
| Requires PC on | No (cloud) | Yes (local execution) |
| n8n integration | Native API | Webhook |
| Max throughput | ~25 conn/day + ~50 msg/day | ~20 conn/day + ~40 msg/day |
| Multi-account | Yes | No (one Chrome profile per account) |

**Quick decision**: if you have a credible LinkedIn account with history, go HeyReach. If you're building a new account (because your real identity doesn't fit the pitch, or you don't want sales DMs on your main profile), go LinkedHelper.

The framework asks you this at intake and routes downstream config accordingly.

## What it costs (monthly, after setup)

- **Engine A (HeyReach)**: $79-149/mo
- **Engine B (LinkedHelper 2)**: $15-45/mo
- Apollo.io Basic: $49/mo (lead discovery + LinkedIn URLs)
- Hetzner VPS (optional, Engine A only): €4.50/mo
- Cloudflare (domain + Pages for privacy notice): ~$1/mo amortized
- **Total: $65-200/mo** depending on engine + VPS choice

One-time:
- LIA (Legitimate Interest Assessment) from a privacy lawyer: €500-1500 (if targeting EU/UK residents)

## How to use it — new project

```powershell
# 1. Clone into an empty directory (one per product/campaign)
cd D:\GitHub
git clone https://github.com/0xDonnie/generic-linkedin-outreach-flow.git my-li-campaign
cd my-li-campaign

# 2. Open Claude Code in that directory
claude
#    Claude reads CLAUDE.md automatically and starts the intake
```

That's it. Claude asks ~10 questions about your product / ICP / LinkedIn account status / preferences, then executes the setup. You intervene only for things that require a browser (HeyReach signup, LinkedIn account creation for Engine B, Cal.com setup, LIA drafting). For those, Claude generates paste-ready prompts for the Claude Chrome Extension.

## How to update the framework (for maintainers)

```powershell
cd D:\GitHub\generic-linkedin-outreach-flow
# make your changes
git add .
git commit -m "short description of the change"
git push
```

## How to pull framework updates into an existing project

Same pattern as the email sibling: projects already cloned have their own diverged history (customized templates, tuned `.env`). To pull safely:

```powershell
cd D:\GitHub\my-li-campaign

# Add upstream remote (one-time)
git remote add upstream https://github.com/0xDonnie/generic-linkedin-outreach-flow.git

git fetch upstream

# Safer: cherry-pick specific commits
git log upstream/master --oneline
git cherry-pick <commit-hash>
```

## How to reuse for a different product

Clone into its own directory per product/vertical. Zero cross-contamination between campaigns (each has its own `.env`, intake answers, database, CRM).

## Structure

```
generic-linkedin-outreach-flow/
├── CLAUDE.md                           # Instructions for Claude Code (auto-read)
├── INTAKE.md                           # First-touch notes
├── decision-matrix.md                  # Engine + deployment decision rules
├── intake/
│   └── questionnaire.md                # The intake questions (incl. account-status gate)
├── guides/
│   ├── quickstart-it.md                # Human-facing guide (Italian)
│   ├── quickstart-en.md                # Human-facing guide (English)
│   ├── linkedin-warmup-plan.md         # Connection warmup schedule (per-engine)
│   └── claude-playbook.md              # Claude's execution playbook
├── templates/
│   ├── linkedin-templates/             # DM + connection-note templates
│   └── privacy-notice.html             # GDPR privacy notice (reused)
├── database/
│   └── schema.sql                      # CRM schema (campaign_messages, li_replies)
├── scripts/
│   ├── powershell/                     # Windows/PowerShell scripts
│   └── bash/                           # VPS/bash scripts
├── n8n-workflows/                      # 4 core workflow JSONs
├── extension-prompts/                  # Paste-ready Claude Chrome Extension prompts
│   ├── heyreach-signup.md              # Engine A
│   ├── linkedhelper-setup.md           # Engine B
│   ├── linkedin-profile-optimization.md
│   ├── apollo-people-search.md         # ICP discovery
│   └── ... (cal.com, telegram, otter, cloudflare-domain)
├── legal/
│   ├── lia-template-linkedin.md        # LIA template (LinkedIn-specific wording)
│   ├── linkedin-tos-risk.md            # Honest ToS risk summary — show user at intake
│   └── compliance-by-jurisdiction.md
└── docs/
    ├── vps-setup.md                    # Engine A + VPS
    ├── local-setup.md                  # Either engine, local mode
    ├── apollo-icp-brainstorm.md
    └── troubleshooting.md
```

## Design choices

**Why two engines (not one)?** LinkedIn account credibility varies enormously. A 10-year account with 2000 connections can run cloud automation (HeyReach) safely. A brand-new account cannot — it gets flagged in days. Forcing one engine on both = one will suffer. So we branch.

**Why HeyReach for established accounts?** Best API + webhook support for n8n integration. Multi-account if you scale. Moderate ban risk because cloud IP is not residential (mitigated by their humanized delays + warmup logic).

**Why LinkedHelper for new accounts?** Runs in user's actual Chrome, uses user's real residential IP, uses the real LinkedIn session cookie. From LinkedIn's perspective, activity is indistinguishable from manual. Slower, cheaper, and much lower ban risk on fresh accounts. Tradeoff: PC must be on.

**Why not Phantombuster / Expandi / Dripify / Waalaxy / Meet Alfred?** All viable, but: Phantombuster's raw scrapers are riskier than session-based tools; Expandi is pricier than HeyReach with similar feature set; Dripify has weaker API; Waalaxy and Meet Alfred are fine for manual use but worse for n8n orchestration. HeyReach + LinkedHelper cover the two genuine use cases at good cost.

**Why Apollo.io (not Lusha/Cognism)?** Provides LinkedIn URLs alongside emails/phones in one search. Best value-per-credit for EU mid-market.

**Why Cal.com (not Calendly)?** Open-source, self-hostable, generous free tier, cleaner webhooks.

**Why Telegram (not Slack)?** Free forever, zero workspace setup, phone-native. Slack only for teams of 3+.

**Why Otter.ai (not Fireflies)?** Fireflies free tier = 3 meetings/month (useless). Otter free = 300 min/month.

**Why n8n (not Zapier/Make)?** Self-hostable, flexible, free community edition. Data stays on your infra.

**Why PostgreSQL?** Overkill for 500 leads, right-sized for 50,000+. Cheap to scale. Well-supported by n8n.

## Legal posture

**LinkedIn cold messaging is NOT a GDPR escape.** ePrivacy Directive art. 13 treats DMs as "electronic communications" — same rules as email for B2C. Channel change doesn't change the law.

For **B2B**, legitimate interest (GDPR Art. 6(1)(f)) generally covers LinkedIn outreach identically to email. You still need:

1. A **signed LIA** (Legitimate Interest Assessment) — template: `legal/lia-template-linkedin.md`
2. A **public privacy notice** — template: `templates/privacy-notice.html`, host on Cloudflare Pages
3. A **suppression list** honored forever — schema: `database/schema.sql`
4. An **opt-out mechanism** — "reply STOP" in DMs + public opt-out page

| Jurisdiction | B2B LinkedIn | B2C LinkedIn |
|---|---|---|
| Italy | ✅ legitimate interest | ⚠️ opt-in required (ePrivacy) |
| UK | ✅ legitimate interest | ⚠️ soft-opt-in needed (PECR) |
| EU (other) | ✅ legitimate interest | ⚠️ opt-in (ePrivacy) |
| US | ✅ (no federal cold-DM restriction) | ✅ |
| Canada | ⚠️ CASL applies to electronic comms | ❌ CASL needs prior consent |
| UAE | ✅ allowed | ✅ allowed |

**ToS risk is a separate axis**. See `legal/linkedin-tos-risk.md`. Both engines technically violate LinkedIn ToS to some degree. LinkedHelper's risk is structurally lower (real session, real IP). Accept the risk or use Sales Navigator + manual InMails (50/month included, no automation).

Claude Code will enforce all four points above during setup. Don't try to skip them.

## First campaign time estimate

From clone to first outbound:
- Intake + setup (Claude does most): **2-4 hours**
- LIA with lawyer (external, parallel): **1-2 weeks** (not blocking warmup)
- Profile optimization + organic warmup: **1-2 weeks** (mandatory, stronger for new accounts)
- Outbound ramp: **2-3 weeks** (5 → 20-25 connection requests/day)
- Full production: **~4-6 weeks from clone** (longer than email sibling due to LinkedIn caps)

Rough math: ~500 connection requests / month at cruise, ~20-25% accept rate = ~100-125 new connections/month = ~15-25 replies/month = ~5-10 demos/month from a single account. Scale by adding accounts (HeyReach multi-seat) or accepting slower growth.

## Credits

Forked from [`generic-coldmailing-flow`](https://github.com/0xDonnie/generic-coldmailing-flow) (April 2026). Architecture ported; channel swapped email → LinkedIn; rate limits and warmup strategy adapted.
