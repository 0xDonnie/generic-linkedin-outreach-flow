# Decision Matrix

> **For Claude**: during intake, use this matrix to pick defaults without asking the user. Only ask the user when the choice has real impact on their outcome.

## Deployment: Local vs VPS

| Condition | Choice | Why |
|---|---|---|
| User is solo founder, first campaign | **Local** | Validate before committing €54/year + complexity |
| User has team of 2+ | **VPS** | Team can't access user's PC |
| User wants "set and forget" from day 1 | **VPS** | Local needs PC on 24/7 |
| User is budget-constrained ($0 extra) | **Local** | Save the €54/year |
| User is non-technical and PC often off | **VPS** | Explain the PC-on-24/7 tradeoff |
| Target >300 emails/day | **VPS** | Local + laptop hibernation = bad |

**Default if ambiguous**: Local. Migrate at month 2 after product-message-fit validated.

## Notifications: Telegram vs Slack

| Condition | Choice | Why |
|---|---|---|
| Solo founder | **Telegram** | Free forever, phone-native, zero setup |
| Team ≥ 3 people | **Slack** (if they already use it) or Telegram | Team alignment |
| User says "nessuno dei due" | Skip, log to DB only | Respect user's preference |

**Default**: Telegram. Overwhelmingly less friction than Slack.

## Transcription: Otter vs Tactiq vs skip

| Condition | Choice | Why |
|---|---|---|
| Target <20 demos/mo | **Otter free** | 300 min = 20×15min demos; automatic |
| Target 20-60 demos/mo | **Otter free + Tactiq backup** | Stack free tiers |
| Target >60 demos/mo | **Otter Pro $17/mo** (or skip transcription) | Otter free runs out |
| User dislikes bots in calls | **Tactiq** | No bot in call, Chrome extension only |
| User is privacy-hardline | **skip** | No 3rd-party transcripts |

**Default**: Otter.ai free. 6x more generous than Fireflies free.

## SMTP provider: Brevo vs SendGrid vs Mailgun

| Condition | Choice | Why |
|---|---|---|
| Default | **Brevo** | 300/day free, cold-email friendly ToS, €9/mo unlimited |
| Already uses another provider | Keep theirs | Less friction |
| High volume >1000/day production | **SendGrid Essentials $15/mo** | Better scaling |
| Strict transactional reputation needed | **Postmark** (but they ban cold) | Not for our case |

**Default**: Brevo free.

## Domain registrar: Cloudflare vs Namecheap vs others

| Condition | Choice | Why |
|---|---|---|
| Default | **Cloudflare Registrar** | At-cost pricing, API + Workers + Pages + Email Routing all free |
| User already has domains elsewhere | Keep, just add DNS records | No forced migration |
| User wants "one provider for everything" | **Cloudflare** | Domains + DNS + TLS + serverless + email routing in one bill |

**Default**: Cloudflare. Always.

## Domain count for outbound

| Target emails/day | Domain count |
|---|---|
| 0-50/day | 1 dominio |
| 50-150/day | 2-3 domini |
| 150-500/day | 4-6 domini |
| 500-1500/day | 7-10 domini |
| >1500/day | 10+ + dedicated IPs |

Rationale: each domain can sustain ~50-100 mail/day sustainably without reputation damage. Spread volume across domains.

**Default for first campaign**: **3 domini**. Room to grow to 150/day without buying more; small enough to manage.

## Lead data source: public registers vs Apollo only

| Condition | Strategy | Example |
|---|---|---|
| Regulated industry with public register | **Scrape registers + Apollo enrichment** | Crypto (ESMA/FCA/VARA/MAS), banking (BaFin, ACPR), pharma (EMA) |
| Regulated industry NO public register | **Apollo only** + company name list from domain knowledge | Insurance brokers UK, chartered accountants IT |
| Non-regulated B2B | **Apollo only** — search by industry + employee size + geography | SaaS buyers, agency owners, marketing managers |
| B2C consumer | **Opt-in database purchase** or paid ads pivot | Newsletter subscriber list, affinity audience |

**Default for non-regulated B2B**: Apollo-only discovery. Minimum friction, battle-tested.

## Enrichment provider: Apollo vs Hunter vs both

| Condition | Choice |
|---|---|
| Single-source, cheap | **Apollo only** (contains both people search + email reveal) |
| Higher accuracy wanted | **Apollo (people discovery) + Hunter (email verification)** |
| High volume | Both, pipeline |

**Default**: Apollo-only until volume justifies Hunter. Simpler.

## Warmup duration

| Factor | Adjustment |
|---|---|
| New outbound domain(s) | **3 weeks minimum** — non-negotiable |
| Established domain being reused for outbound | **2 weeks** (short ramp) |
| Returning to domain after pause >30 days | **1 week** warm-up re-ramp |
| Very high volume target (>500/day) | **4 weeks** — gentler ramp |

**Default**: 3-week standard warmup (see `docs/warmup-plan.md`).

## Template localization

| Condition | Choice |
|---|---|
| Target audience all speaks English | English templates only |
| Single non-English market | Single-language templates in target language |
| Multi-lang market (rare) | Parallel templates per language, lead.country drives template selection |

**Default**: English templates even for EU/UAE targets. Compliance officers, CEOs, buyers are universally comfortable in English. Localize only if user explicitly requests.

## When to ask vs auto-pick

**Ask the user** (meaningful choice):
- B2B vs B2C (legal tree diverges)
- Geography (several downstream choices)
- Target volume (sizing)
- Deployment mode (cost + UX tradeoff)
- Notification channel (personal preference)
- Sender identity (branding)

**Auto-pick** (use defaults, mention briefly):
- SMTP provider (Brevo)
- Registrar (Cloudflare)
- Transcription (Otter)
- Database (Postgres)
- Orchestration (n8n)
- Worker hosting (Cloudflare)

Rationale: choice for choice's sake loses the user. Curate defaults aggressively; give them power to override if they ask.
