# Decision Matrix

> **For Claude**: during intake, use this matrix to pick defaults without asking the user. Only ask when the choice has real impact on their outcome.

## Engine: HeyReach vs LinkedHelper 2

**This is THE critical decision. Everything downstream branches on it. Ask at intake.**

| Account characteristic | Engine |
|---|---|
| LinkedIn account ≥1 year old | **HeyReach** |
| 500+ connections | **HeyReach** |
| Has posting / activity history | **HeyReach** |
| Real-name profile matches reality | **HeyReach** |
| User wants 24/7 operation, PC off | **HeyReach** |
| User has team or multi-account needs | **HeyReach** |
| User has budget for $79+/mo | **HeyReach** |
| LinkedIn account <3 months old | **LinkedHelper 2** |
| New account created for this campaign | **LinkedHelper 2** |
| User is prominent/has incongruent brand | **LinkedHelper 2** |
| Burner account for pseudo-identity outreach | **LinkedHelper 2** |
| Budget-constrained ($15-45/mo only) | **LinkedHelper 2** |
| User OK with PC on during send windows | **LinkedHelper 2** |

**Default if ambiguous**: ask the user directly. This is one of the 6 questions where user input is mandatory.

**Tiebreakers**:
- If user has both an old and new account and isn't sure which to use for this campaign: guide them to use the **old** account with HeyReach if the product fits their existing persona. Use the new account + LinkedHelper only when persona mismatch is real.
- If user says "zero ban risk tolerance": neither engine is zero-risk. Suggest Sales Navigator + manual InMails (50/month included, no automation, no ban risk but low volume).

## Deployment: Local vs VPS (Engine A only)

| Condition | Choice | Why |
|---|---|---|
| Engine B (LinkedHelper) | **Local** (forced) | Chrome ext cannot run on headless VPS |
| Engine A, solo founder, first campaign | **Local** | Validate before committing €54/year + complexity |
| Engine A, team of 2+ | **VPS** | Team can't access user's PC |
| Engine A, "set and forget" | **VPS** | Local needs PC on 24/7 for n8n |
| Engine A, budget $0 extra | **Local** | Save the €54/year |
| Engine A, target >15 demos/month | **VPS** | Stability matters at scale |

**Default for Engine A, ambiguous**: Local. Migrate at month 2 after product-message-fit validated.
**Default for Engine B**: Local is the only option.

## Notifications: Telegram vs Slack

| Condition | Choice | Why |
|---|---|---|
| Solo founder | **Telegram** | Free forever, phone-native, zero setup |
| Team ≥ 3 | **Slack** (if they use it) or Telegram | Team alignment |
| User says "nessuno dei due" | Skip, log to DB only | Respect user's preference |

**Default**: Telegram.

## Transcription: Otter vs Tactiq vs skip

| Condition | Choice | Why |
|---|---|---|
| Target <20 demos/mo | **Otter free** | 300 min = 20×15min demos; automatic |
| Target 20-60 demos/mo | **Otter free + Tactiq backup** | Stack free tiers |
| Target >60 demos/mo | **Otter Pro $17/mo** | Otter free runs out |
| User dislikes bots in calls | **Tactiq** | Chrome extension only, no bot |
| Privacy-hardline user | **skip** | No 3rd-party transcripts |

**Default**: Otter.ai free.

## Lead data source: Apollo only vs Apollo + register scraping

| Condition | Strategy | Example |
|---|---|---|
| Regulated industry with public register | **Scrape registers + Apollo enrichment** | Crypto (ESMA/FCA/VARA/MAS), banking (BaFin) |
| Non-regulated B2B | **Apollo only** — filter by LinkedIn URL presence | SaaS buyers, agency owners, CMOs |
| B2C consumer | **Opt-in database purchase** or paid ads pivot (NOT LinkedIn) | Newsletter list, affinity audience |

**Default for non-regulated B2B**: Apollo-only discovery. Filter Apollo export to rows with `person_linkedin_url` populated.

## Warmup duration (LinkedIn — differs from email!)

| Factor | Duration |
|---|---|
| New LinkedIn account (<3 months), any engine | **3-4 weeks** pre-outbound: profile + organic connections + content |
| Established account, first use for outbound (Engine A) | **2 weeks**: profile polish + connection to 20 warm contacts + 2-3 posts |
| Established account returning to outbound after pause >30 days | **1 week** re-ramp |
| Established account, continuous outbound | **Ongoing at cruise rate** (no re-ramp needed) |

Warmup schedule details: `guides/linkedin-warmup-plan.md`.

**Default**: 2-week warmup for Engine A established accounts; 3-4 weeks mandatory for Engine B new accounts.

## Domain / infrastructure

| Need | Choice | Why |
|---|---|---|
| Privacy notice hosting | **Cloudflare Pages** | Free, instant, HTTPS, custom domain |
| Opt-out form | **Cloudflare Pages** (form POST → n8n webhook → suppression_list) | No worker needed |
| Domain registrar | **Cloudflare Registrar** | At-cost pricing |
| User already has domain | Keep, add CNAME to Pages | No forced migration |

No outbound email domains needed. No DKIM/SPF/DMARC needed. Single landing-page domain is enough (e.g., `outreach.yourcompany.com` or a dedicated `yourcompany-privacy.com`).

## Template localization

| Condition | Choice |
|---|---|
| Target audience all speaks English | English templates only |
| Single non-English market | Single-language templates in target language |
| Multi-lang market | Parallel templates per language, lead.country drives selection |

**Default**: English templates. LinkedIn users internationally default to English messaging.

## When to ask vs auto-pick

**Ask the user** (meaningful choice):
- **Engine (HeyReach vs LinkedHelper)** — ROUTING DECISION
- B2B vs B2C (legal tree diverges + B2C on LinkedIn rarely works)
- Geography (several downstream choices)
- Target volume / demos / month (sizing)
- Deployment mode for Engine A (Local vs VPS)
- Notification channel (personal preference)
- Sender identity (branding)

**Auto-pick** (use defaults, mention briefly):
- Lead source (Apollo)
- Registrar (Cloudflare)
- Transcription (Otter)
- Database (Postgres)
- Orchestration (n8n)
- Landing-page hosting (Cloudflare Pages)

Rationale: choice for choice's sake loses the user. Curate defaults aggressively; user can override if they ask.

## Red flags — STOP and escalate to user

During intake, if any of these come up, pause and get explicit user acknowledgment:

- **B2C LinkedIn outreach in EU/UK**: not meaningfully different from B2C email under ePrivacy. Suggest pivot.
- **User wants to bypass warmup**: refuse. Explain restriction curve.
- **User wants LinkedHelper on a VPS**: technically possible with remote desktop but defeats the safety premise. Strongly discourage.
- **User wants multiple LinkedIn accounts from one PC / IP**: LinkedIn detects this fast. Explain, suggest separate physical devices or accept risk.
- **User wants to scrape arbitrary LinkedIn profiles**: out of scope. Not supported. Refer to ToS.
