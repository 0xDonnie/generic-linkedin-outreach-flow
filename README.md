# Generic Cold-Mailing Flow

A **turnkey framework** to build a GDPR-compliant B2B / B2C cold email outbound pipeline from scratch, in 3-4 hours, for any product or service.

## What this is

You cloned this repo because you want to send cold outreach emails — to sell SaaS, legal services, luxury goods, marketing services, compliance tooling, or whatever. Instead of stitching together 15 tools over 2 weeks, you get a working pipeline in one afternoon.

**What you get at the end**:
- A PostgreSQL CRM with your ICP leads enriched and ready
- An automated email campaign that sends, tracks replies, handles unsubscribes
- Inbound booking flow via Cal.com that auto-logs demos
- Real-time Telegram notifications for positive replies
- Optional: Otter.ai auto-transcribes demo calls, saves to CRM
- Optional: deployed on a €4.50/mo VPS for 24/7 operation

**What it costs** (monthly, after setup):
- Apollo.io Basic: $49 (lead discovery + emails)
- Hunter.io Starter: $49 (email verification, optional)
- Brevo Free: $0 (300 emails/day — upgrade $9 for unlimited)
- 5 domains on Cloudflare: ~$5 (annual amortized)
- Hetzner VPS (optional): €4.50
- **Total: $60-120/month** depending on choices

One-time:
- LIA (Legitimate Interest Assessment) from a privacy lawyer: €500-1500

## How to use it

```bash
# 1. Clone into an empty directory
cd D:\GitHub
git clone <repo-url> my-outreach-campaign
cd my-outreach-campaign

# 2. Open Claude Code in that directory
#    Claude reads CLAUDE.md automatically and starts the intake
```

That's it. Claude will ask you 10 questions about your product / ICP / preferences, then execute the full setup autonomously. You intervene only when a browser action is needed (SaaS signup, DNS verification, etc.) — for those, Claude generates paste-ready prompts for the Claude Chrome Extension.

## Structure

```
generic-coldmailing-flow/
├── CLAUDE.md                    # Instructions for Claude Code (auto-read)
├── INTAKE.md                    # First-touch questionnaire
├── decision-matrix.md           # Helps Claude pick options based on your context
├── intake/
│   └── questionnaire.md         # The 10 intake questions
├── guides/
│   ├── quickstart-it.md         # Human-facing quick guide (Italian)
│   ├── quickstart-en.md         # Human-facing quick guide (English)
│   ├── detailed-guide-en.md     # Full walkthrough
│   └── claude-playbook.md       # Claude's execution playbook
├── templates/
│   ├── email-templates/         # Parameterized email templates
│   └── privacy-notice.html      # GDPR privacy notice template
├── database/
│   └── schema.sql               # Generic CRM schema
├── scripts/
│   ├── powershell/              # Windows/PowerShell scripts
│   └── bash/                    # VPS/bash scripts
├── n8n-workflows/               # 4 core workflow JSONs
├── unsubscribe-worker/          # Cloudflare Worker for one-click unsubscribe
├── extension-prompts/           # Ready-to-paste Claude Chrome Extension prompts
├── legal/
│   ├── lia-template.md          # Legitimate Interest Assessment template
│   └── compliance-by-jurisdiction.md
└── docs/
    ├── vps-setup.md
    ├── local-setup.md
    ├── warmup-plan.md
    ├── apollo-icp-brainstorm.md
    └── troubleshooting.md
```

## Design choices

**Why PowerShell (not Bash)?** Most users are on Windows. If you're on Mac, tell Claude at intake; it'll translate commands.

**Why Brevo (not SendGrid/Mailgun)?** Generous free tier (300/day) with proper DKIM, cold email friendly ToS, cheap upgrade path (€9/mo unlimited).

**Why Cloudflare (not Namecheap)?** At-cost domain registration + free edge services (Workers, Pages, Email Routing) + API-first. Other registrars work but add friction.

**Why Telegram (not Slack)?** Free forever, zero workspace setup, works on phone without app setup. Slack is better for teams of 5+; Telegram wins for single founders.

**Why Otter.ai (not Fireflies)?** Fireflies free tier is 3 meetings/month (useless). Otter free is 300 min/month (~20 demos). Better default.

**Why Apollo.io (not Lusha/Cognism)?** Best value-per-credit for EU mid-market + decent API. Lusha and Cognism have stricter anti-scraping ToS that break more workflows.

**Why n8n (not Zapier/Make)?** Self-hostable (data stays on your infra), flexible workflow editor, free community edition, good for the 4 workflows we need.

## Legal posture

**Cold email is legal in most jurisdictions for B2B**, marginal for B2C. Specifically:

| Jurisdiction | B2B cold | B2C cold |
|---|---|---|
| Italy | ✅ legitimate interest | ⚠️ requires opt-in (ePrivacy) |
| UAE | ✅ allowed | ✅ allowed |
| UK | ✅ legitimate interest | ⚠️ soft-opt-in needed (PECR) |
| EU (other) | ✅ legitimate interest | ⚠️ opt-in (ePrivacy) |
| US | ✅ CAN-SPAM | ✅ CAN-SPAM |
| Canada | ⚠️ CASL strict | ❌ needs prior consent |

You **must** have:
1. A **signed LIA** (Legitimate Interest Assessment) from a privacy lawyer (template: `legal/lia-template.md`)
2. A **public privacy notice** (template: `templates/privacy-notice.html`)
3. **One-click unsubscribe** in every email (implemented: `unsubscribe-worker/`)
4. A **suppression list** that's honored forever (schema: `database/schema.sql`)

Claude Code will enforce these during setup. Don't try to skip them — not negotiable.

## First campaign time estimate

From clone to first warmup email:
- Intake + setup (Claude does most): **2-4 hours**
- LIA with lawyer (external): **1-2 weeks** (parallel, not blocking warmup)
- Warmup ramp: **3 weeks** (5 → 50 emails/day gradually)
- Full production: **~4 weeks from clone**

You can send internal test emails (to your own tribe of mailboxes) from day 1 while LIA is drafted. Only real-prospect sends wait for LIA.

## Credits

Built atop the BlockchainAnalysis.io outbound pipeline (v1.0 — April 2026). Battle-tested on 533+ real leads across UK/UAE/EU/Singapore. Generalized for arbitrary B2B/B2C use cases.
