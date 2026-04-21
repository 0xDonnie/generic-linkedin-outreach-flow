# Quickstart — English

One-page guide for the lazy.

## What you're about to build

An automated pipeline that:
1. Finds the right decision-makers at your target companies
2. Sends them personalized emails (for SaaS, services, luxury, compliance — any product)
3. Handles replies automatically (classifies, unsubscribes, Telegram alerts)
4. Books demos via Cal.com
5. Auto-transcribes demos with Otter (optional)

Total operating cost: **~$60-120/month** + **€500-1500 one-time** for a privacy lawyer's LIA document.

## How to start (5 minutes)

1. **Clone this repo** into a new empty folder:
   ```powershell
   cd D:\GitHub
   git clone <this-repo-url> my-outreach-project
   cd my-outreach-project
   ```

2. **Open Claude Code** in that folder:
   ```powershell
   claude
   ```

3. Claude reads `CLAUDE.md` and greets you. Runs a 10-question intake in ~10 minutes.

4. You answer. Claude makes the technical decisions for you; you only decide what matters (your target, your email voice, etc.).

5. Claude executes everything. Only interrupts you when it truly needs:
   - An API key (asks once, stores in `.env`, done)
   - A browser click for SaaS signup (Claude gives you a paste-ready Claude Chrome Extension prompt)
   - An email verification link
   - Your credit card for payments

Total setup time: **3-4 hours** (Claude works ~2h, you ~1h on browser stuff).

## Prerequisites (have ready BEFORE starting)

**Must have**:
- Windows 11 PC with admin rights (or Mac — tell Claude at intake)
- A credit card (for Apollo $49/mo + Cloudflare domains ~$50/year)
- Browser access + email inbox

**Nice to have, but Claude guides you if missing**:
- Google account (you'll create a dedicated one — "yourproject.sales@gmail.com" — in incognito)
- Cloudflare account
- An initial list of target company types (you can brainstorm with Claude)

## After setup

- First **internal tests** land in your dedicated Gmail (warmup week 1)
- While warmup ramps, Claude drafts an email for you to send to 2-3 privacy lawyers for LIA
- **LIA signed in 1-2 weeks** (external lawyer, not blocking)
- **First real-prospect sends**: week 4 of warmup (after LIA in hand)
- **Full production**: week 5 onwards

## What Claude handles automatically

- Installs Postgres / Node / Caddy where needed
- Creates CRM database with full schema
- Configures DNS (SPF/DKIM/DMARC) for all domains
- Deploys unsubscribe endpoint on Cloudflare Workers
- Deploys privacy notice page
- Imports 4 n8n workflows + binds credentials
- Configures Cal.com webhook
- Configures Otter auto-join
- Configures Telegram bot
- Writes email templates with your product baked in
- Tests end-to-end before declaring done

## What YOU must do (no shortcuts)

- Answer the 10 intake questions
- Sign up for SaaS (Claude gives you Chrome ext prompts, but first click is yours)
- Decide your email voice/tone
- Handle real prospect replies (that's your sales job, not Claude's)
- Contact a lawyer for LIA (Claude writes the email for you)

## What Claude will NOT do (for your protection)

- Won't send emails without warmup (would destroy your domain reputation)
- Won't scrape LinkedIn (violates ToS + GDPR)
- Won't bypass unsubscribe (illegal + hurts you)
- Won't make payments without your explicit OK (Cloudflare signup = fine; Apollo $49/mo = asks "proceed with Basic $49/mo?")

## Quick FAQ

**"What if I spend $49 on Apollo and don't convert?"**
Month 1 validates product-message-fit. If after 50 sends you don't get even 1 positive reply → the problem isn't Apollo, it's your message. Claude helps you iterate templates.

**"What if I already have Brevo / Apollo / Cloudflare accounts?"**
Tell Claude at intake, they'll reuse. No forced re-signup.

**"Can I change my mind halfway?"**
Yes. Tell Claude "stop, I'm pivoting ICP" → Claude saves current state, resumes from there.

**"Who reads my replies?"**
They arrive at a dedicated Gmail (e.g., `yourproject.sales@gmail.com`). Only you (or whoever you share credentials with) can see them.

**"What if my firewall / Wi-Fi blocks something?"**
Claude detects errors and waits. Not blocking — you retry later.

---

Ready? → open Claude Code in the folder → it starts on its own.

Want to understand before starting? → read `guides/detailed-guide-en.md` (30 pages — not recommended, but there).
