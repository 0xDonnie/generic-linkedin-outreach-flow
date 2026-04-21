# Extension Prompts Library

Paste-ready prompts for the **Claude Chrome Extension**. Each prompt handles a specific browser workflow that can't be done via API (SaaS signups, OAuth flows, DNS UI tweaks, etc.).

## How to use

1. User opens [Claude Chrome Extension](https://claude.ai/chrome) in the target browser tab (e.g., Cloudflare dashboard, Apollo, Brevo, etc.)
2. Claude (this repo's Claude Code) sends a prompt from this folder to the user
3. User pastes the prompt into the Chrome extension
4. Extension executes in-browser, reports back

## Index

| File | Use when |
|---|---|
| `cloudflare-domain-purchase.md` | Buying 3-5 outbound domains on Cloudflare Registrar |
| `cloudflare-dns-setup.md` | Adding SPF/DKIM/DMARC to a domain |
| `cloudflare-email-routing.md` | Configuring `sales@domain` → forward to dedicated Gmail |
| `cloudflare-worker-custom-domain.md` | Mapping `unsubscribe.<domain>` to deployed Worker |
| `cloudflare-pages-deploy.md` | Deploying privacy notice via UI (fallback — wrangler CLI preferred) |
| `brevo-signup.md` | Create Brevo Free account |
| `brevo-domain-auth.md` | Authenticate a domain on Brevo (DKIM verification) |
| `brevo-smtp-key.md` | Generate SMTP key for n8n |
| `apollo-signup.md` | Create Apollo.io account, select Basic plan |
| `apollo-import-companies.md` | Import CSV of company names as Apollo Account List |
| `apollo-people-search.md` | Build People search with 32 job titles + geo + company list, export |
| `n8n-vps-login-and-setup.md` | First login on VPS n8n, create API key, generate owner password |
| `n8n-create-credentials.md` | Create Postgres + SMTP + IMAP credentials in n8n UI |
| `telegram-bot-create.md` | Create Telegram bot via BotFather, add to group, get chat_id |
| `otter-signup.md` | Signup Otter.ai, connect Google Calendar, auto-join ON |
| `tactiq-install.md` | Install Tactiq Chrome extension, login, configure Google Drive save |
| `cal.com-signup.md` | Create Cal.com account, claim slug, create Intro Call event |
| `cal.com-webhook-register.md` | Register n8n webhook URL on Cal.com with 3 triggers |
| `gmail-forward-setup.md` | Configure Gmail filter to forward Otter transcripts to owner email |
| `gmail-app-password.md` | Generate Google App Password for IMAP access |
| `postmaster-tools-register.md` | Register 5 domains on Google Postmaster Tools |

## Placeholder conventions

All prompts use `{{PLACEHOLDER}}` for values that Claude Code must substitute before sending to the user. Examples:
- `{{PROJECT_NAME}}` — e.g., "BA Sales"
- `{{OUTBOUND_DOMAINS}}` — comma-separated list of domains
- `{{SENDER_GMAIL}}` — dedicated Gmail address
- `{{VPS_N8N_URL}}` — e.g., `https://n8n.ba-compliance.com`

Before sending to user, Claude Code runs substitution from `intake/answers.md` values.

## When NOT to use extension prompts

If the task is achievable via API (Cloudflare DNS records, n8n workflow import, etc.) → Claude Code should just do it via `curl` / `wrangler` / `pwsh`. Extension prompts are ONLY for flows that genuinely require a human in a browser.
