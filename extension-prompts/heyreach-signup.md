# HeyReach Signup + API Key — Chrome Extension prompt

Paste into Claude Chrome Extension on https://heyreach.io (or https://app.heyreach.io).

Use ONLY for Engine A (established LinkedIn account). If user picked Engine B (LinkedHelper), skip this and use `linkedhelper-setup.md` instead.

---

```
I need to set up HeyReach for LinkedIn outreach automation. I am NOT logged in yet.

CONTEXT:
- Project: {{PROJECT_NAME}}
- LinkedIn account to connect: {{SENDER_LINKEDIN_URL}}
- Plan: Starter ($79/mo) unless user specified otherwise
- Email to register: {{SENDER_GMAIL}}
- Company: {{SENDER_COMPANY}}

PROCEDURE:

STEP 1 — Signup
- Go to https://heyreach.io and click "Sign up" (or https://app.heyreach.io/signup)
- Prefer "Sign up with Google" using {{SENDER_GMAIL}}
- If Google password prompt appears, STOP and tell me "serve login Google manuale" — user handles
- Complete onboarding: name, company ({{SENDER_COMPANY}}), team size (pick "1" if solo), use case = "Outbound sales"

STEP 2 — Plan selection
- Choose Starter $79/mo (14-day trial usually available — start with trial)
- If user wants Pro ($149/mo for multi-account), pick that instead
- Add payment method: STOP and tell me "serve carta di credito" — user pays manually
- Confirm billing cycle monthly (not annual) for first campaign

STEP 3 — Connect LinkedIn account
- Go to "LinkedIn Accounts" or "Senders" in the sidebar
- Click "Connect LinkedIn" or "+ Add Account"
- HeyReach will typically open a secure session-connect flow — follow their wizard
- Use the LinkedIn account at: {{SENDER_LINKEDIN_URL}}
- If HeyReach asks to install a browser extension for session capture: install it
- Complete OAuth / session handoff
- Verify account shows as "Connected" with green status

STEP 4 — Configure account settings (CRITICAL — don't skip)
- Account settings → Daily limits:
  - Connection invites/day: 20 (DO NOT raise to 25+ until week 4)
  - Messages/day: 40
  - Profile views/day: 50 (optional)
- Working hours:
  - Start: 09:00
  - End: 18:00
  - Timezone: {{TIMEZONE}}
  - Days: Mon-Fri only (no weekend activity)
- Humanization / delays: ON (default)
- Smart warmup mode: ON if it's a fresh connection to the account

STEP 5 — Generate API key
- Go to Settings → Integrations → API (or Settings → API Access)
- Click "Generate API key"
- Copy the FULL key (usually starts with hr_ or similar)
- DO NOT paste it in this chat — I will read it from HeyReach UI myself
- Also copy the Account ID visible in URL or Settings page

STEP 6 — Webhook (SKIP for now)
- DO NOT configure webhook yet
- Claude Code will register the n8n webhook URL via HeyReach API once n8n is deployed

REPORT:
- Plan activated: Starter | Pro | Trial
- LinkedIn account connected: yes (green) / no (red) / pending
- API key generated: yes / no
- Account ID: (copy visible value)
- Working hours configured: yes / no
- Daily limits set: connections=20, messages=40 — confirm yes
- Any errors

Procedi con STEP 1.
```

---

## After HeyReach setup, Claude Code does:

1. Ask user to paste the API key + Account ID ONCE (via direct chat, not via extension)
2. Write both to `.env`: `HEYREACH_API_KEY=...` and `HEYREACH_ACCOUNT_ID=...`
3. Test API connection via `curl`:
   ```powershell
   curl.exe -X GET "https://api.heyreach.io/api/public/account/GetAll" `
     -H "X-API-KEY: $env:HEYREACH_API_KEY"
   ```
4. Register webhook via HeyReach API once n8n workflow 3 is deployed:
   - `POST /api/public/webhook` with `url = $N8N_WEBHOOK_URL/linkedin-reply`
5. Update `intake/answers.md`: `LinkedIn engine: heyreach — connected, daily cap 20/40`
