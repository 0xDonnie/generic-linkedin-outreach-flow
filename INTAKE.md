# Start here

> **Not Claude?** → just clone this repo into a new directory, run `claude` (or open Claude Code) in that directory. Claude will greet you and guide you from here. You don't need to read this file.

> **Claude reading this for the first time**: see `CLAUDE.md` in the root. Then run the intake from `intake/questionnaire.md`.

## Express intake (30 sec)

If you already know your answers and just want to kick off, paste this to Claude:

```
Product: [brand name + 2-line pitch]
Audience: B2B | B2C
ICP titles: [comma-separated list]
ICP companies/industry: [...]
Geography: [top 3 countries]
LinkedIn account: established | new
Volume: N connection requests/day target, N demos/month
Deployment: local | VPS   (VPS valid only for established-account + HeyReach)
Notifications: Telegram | Slack
Transcription: Otter | Tactiq | skip
Dashboard: cli-only | cli+metabase
Sender: [name], [title], [company legal name, registered address]
Sender LinkedIn URL: https://linkedin.com/in/... (existing | to-create)
Privacy email: privacy@[domain]
Calendar URL: [cal.com/[slug] or "to create"]
```

Claude will confirm, pick the engine (HeyReach or LinkedHelper 2), ask clarifying questions, and start executing.

## Walk-through intake

If you prefer the conversational version (recommended first time), just say "inizia" / "start" to Claude. The 11-question flow takes ~10-15 minutes.

## What happens next

Once Claude has your answers:

1. Generates `intake/answers.md` with your configuration
2. Picks the **LinkedIn engine** (HeyReach for established accounts, LinkedHelper 2 for new ones)
3. Shows an **execution checklist** (~15-25 items, varies by your choices)
4. Asks for "go"
5. Executes autonomously, pausing only when:
   - A browser action is needed (HeyReach signup, LinkedIn account creation, Cal.com setup, payment)
   - A credential is needed (Claude asks once, you paste, never again)
   - Something genuinely fails

Expected time: 2-4 hours for infra setup. **Plus** 2-3 weeks of organic warmup before first real outbound (if new account) — that runs in parallel with LIA drafting.

## Prerequisites you'll need ready

- Windows 11 PC (or Mac — tell Claude at intake) with admin rights
- **Chrome browser installed** (required for Engine B / LinkedHelper)
- A **payment card** (for at minimum: Apollo €49/mo, engine subscription $15-79/mo)
- A **LinkedIn account** — either:
  - Established account (>=1 year, 500+ connections) → Engine A (HeyReach)
  - Willingness to create a new account → Engine B (LinkedHelper)
- (Optional) A **privacy lawyer** contact for LIA document — Claude gives you a template email

Not required at start:
- LIA (can be drafted in parallel with warmup)
- Domain (Cloudflare Pages can use a `*.pages.dev` subdomain for free; custom domain optional)
- Polished message templates (Claude generates starting templates, you refine)

---

See also:
- [`guides/quickstart-it.md`](guides/quickstart-it.md) — overview a 1 pagina
- [`guides/quickstart-en.md`](guides/quickstart-en.md) — 1-page overview
- [`decision-matrix.md`](decision-matrix.md) — why the defaults are defaults
- [`legal/linkedin-tos-risk.md`](legal/linkedin-tos-risk.md) — honest ToS risk breakdown — read before starting
