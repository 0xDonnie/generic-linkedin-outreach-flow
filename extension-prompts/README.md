# Extension Prompts Library

Paste-ready prompts for the **Claude Chrome Extension**. Each prompt handles a specific browser workflow that can't be done via API (SaaS signups, OAuth flows, LinkedIn profile edits, etc.).

## How to use

1. User opens [Claude Chrome Extension](https://claude.ai/chrome) in the target browser tab (e.g., Cloudflare dashboard, Apollo, HeyReach, LinkedIn, etc.)
2. Claude Code (this repo's Claude) sends a prompt from this folder to the user
3. User pastes the prompt into the Chrome extension
4. Extension executes in-browser, reports back

## Index

### Engine-specific (pick ONE)
| File | Use when |
|---|---|
| `heyreach-signup.md` | **Engine A** — user has established LinkedIn account, wants cloud API automation |
| `linkedhelper-setup.md` | **Engine B** — user has new/burner account, needs desktop Chrome ext |

### Mandatory for both engines
| File | Use when |
|---|---|
| `linkedin-profile-optimization.md` | Before any outreach. Profile quality drives accept rate. |
| `apollo-people-search.md` | Build People search with LinkedIn URL filter, export CSV |

### Infrastructure
| File | Use when |
|---|---|
| `cloudflare-domain-purchase.md` | Buy 1 domain for privacy notice + opt-out landing page |
| `cal.com-signup.md` | Create Cal.com account, claim slug, create Intro Call event |
| `telegram-bot-create.md` | Create Telegram bot via BotFather, add to group, get chat_id |
| `otter-signup.md` | Signup Otter.ai, connect Google Calendar, auto-join ON |

## Placeholder conventions

All prompts use `{{PLACEHOLDER}}` for values that Claude Code must substitute before sending. Examples:
- `{{PROJECT_NAME}}` — e.g., "BA Sales LI"
- `{{SENDER_LINKEDIN_URL}}` — the LinkedIn account driving outreach
- `{{ACCOUNT_STATUS}}` — "new" or "established"
- `{{TIMEZONE}}` — e.g., "Europe/Rome"
- `{{ICP_ROLES}}` — comma-separated list of target job titles
- `{{CALENDAR_URL}}` — e.g., `https://cal.com/{{CLAIMED_SLUG}}/intro`

Before sending to user, Claude Code runs substitution from `intake/answers.md` values.

## When NOT to use extension prompts

If the task is achievable via API (Cloudflare DNS records, n8n workflow import, HeyReach webhook registration, etc.) → Claude Code should just do it via `curl` / `wrangler` / `pwsh`. Extension prompts are ONLY for flows that genuinely require a human in a browser.

## What's missing vs the email sibling

Removed because LinkedIn flow doesn't need:
- `brevo-signup.md` / `brevo-domain-auth.md` / `brevo-smtp-key.md` (no SMTP)
- `cloudflare-dns-setup.md` for DKIM/SPF/DMARC (no email auth)
- `cloudflare-email-routing.md` (no inbound email → IMAP)
- `cloudflare-worker-custom-domain.md` for unsubscribe-worker (no worker)
- `gmail-app-password.md` (no IMAP reply handler — we use webhooks)
- `postmaster-tools-register.md` (no email domain reputation to monitor)

Added instead:
- `heyreach-signup.md` (Engine A)
- `linkedhelper-setup.md` (Engine B)
- `linkedin-profile-optimization.md` (mandatory pre-outreach)
