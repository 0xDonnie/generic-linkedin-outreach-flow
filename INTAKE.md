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
Volume: N emails/day target
Deployment: local | VPS
Notifications: Telegram | Slack
Transcription: Otter | Tactiq | skip
Sender: [name], [title], [company legal name, registered address]
Privacy email: privacy@[domain]
Calendar URL: [cal.com/[slug] or "to create"]
```

Claude will confirm, ask clarifying questions, and start executing.

## Walk-through intake

If you prefer the conversational version (recommended first time), just say "inizia" / "start" to Claude. The 10-question flow takes ~10 minutes.

## What happens next

Once Claude has your answers:

1. Generates `intake/answers.md` with your configuration
2. Shows an **execution checklist** (~15-25 items, varies by your choices)
3. Asks for "go"
4. Executes autonomously, pausing only when:
   - A browser action is needed (SaaS signup, email verification, payment)
   - A credential is needed (Claude asks once, you paste, never again)
   - Something genuinely fails

Expected time: 2-4 hours (mostly Claude waiting for DNS propagation, npm installs, docker pulls).

## Prerequisites you'll need ready

- Windows 11 PC (or Mac — tell Claude at intake) with admin rights
- A **payment card** (for at minimum: Apollo €49/mo, Cloudflare domains €50/yr)
- A **dedicated Google account** for receiving replies (create in incognito: `your-project.sales@gmail.com`)
- (Optional) A **privacy lawyer** contact for LIA document — Claude gives you a template email to send

Not required at start:
- LIA (can be drafted in parallel)
- Content for email templates (Claude generates decent starting point, you refine)
- Your own domain (Claude recommends buying 5 new outbound subdomains on Cloudflare)

---

See also:
- [`guides/quickstart-it.md`](guides/quickstart-it.md) — overview a 1 pagina
- [`guides/detailed-guide-en.md`](guides/detailed-guide-en.md) — full manual if you want to understand before starting
- [`decision-matrix.md`](decision-matrix.md) — why the defaults are defaults
