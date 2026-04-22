# LinkedHelper 2 Setup — Chrome Extension prompt

Paste into Claude Chrome Extension on https://www.linkedhelper.com.

Use ONLY for Engine B (new / burner / fresh LinkedIn account). If user picked Engine A (HeyReach), skip this.

Critical: LinkedHelper is a **desktop app + Chrome extension**, NOT purely cloud. User must install on their actual PC.

---

```
I need to set up LinkedHelper 2 for LinkedIn outreach on a fresh/burner account.

CONTEXT:
- Project: {{PROJECT_NAME}}
- LinkedIn account: {{SENDER_LINKEDIN_URL}} (new account - age: {{ACCOUNT_AGE_WEEKS}} weeks)
- Plan: Standard ($15/mo) for first campaign; upgrade to Pro ($45/mo) only if multi-seat needed later
- Email to register: {{SENDER_GMAIL}}
- PC must be on during send windows (9-18 local time)

PROCEDURE:

STEP 1 — Signup + plan
- Go to https://www.linkedhelper.com and click "Get Started" or "Sign up"
- Register with email: {{SENDER_GMAIL}}
- After signup, log into the LinkedHelper dashboard
- Choose plan: Standard $15/mo (1 LinkedIn profile, ~200 actions/day)
- Add payment method: STOP and tell me "serve carta di credito" — user handles
- 14-day free trial is available — use that first

STEP 2 — Download the desktop app
- LinkedHelper is a hybrid Chrome extension + desktop helper. Download:
  - Desktop app for Windows: https://www.linkedhelper.com/download/ (.exe installer)
  - Chrome Web Store: search "LinkedHelper 2" and "Add to Chrome"
- Run the installer: CANNOT do this via extension — tell me "installa LinkedHelper desktop app e Chrome extension" — user will install on their own PC

STEP 3 — Login into LinkedHelper desktop
- After user installs: desktop app opens. Log in with LinkedHelper credentials from Step 1.
- The app launches a controlled Chrome profile (separate from user's main Chrome) where LinkedIn runs
- Log in to LinkedIn in that controlled Chrome using: {{SENDER_LINKEDIN_URL}} account credentials
- Verify: LinkedIn shows your profile, feed loads normally

STEP 4 — Configure safety settings (CRITICAL for fresh accounts)
- In LinkedHelper app → Settings → Account limits:
  - Invitations per day: START AT 5 (week 1), ramp to 10 (week 2), 15 (week 3), 20 (week 4+). Never above 20.
  - Messages per day: 15 (week 1), 25 (week 2), 40 (week 3+)
  - Page views / profile visits per day: 30 max
- Settings → Schedule:
  - Active hours: 09:00 - 18:00
  - Timezone: {{TIMEZONE}}
  - Active days: Mon-Fri only
  - Random pauses between actions: ON, min 30 sec, max 300 sec
- Settings → Delays:
  - Enable all "human-like behavior" toggles
  - Random delays between actions: ENABLE

STEP 5 — Enable HTTP API (local integration for n8n)
- Settings → Tools → HTTP API (or sometimes labeled "Webhook API" / "Developer")
- Enable "Local HTTP API"
- Port: 7337 (default — leave as is)
- Generate API key → copy FULL key
- DO NOT paste key in extension chat — I will read from LinkedHelper UI
- Test URL in browser: http://127.0.0.1:7337/ping should return OK

STEP 6 — (OPTIONAL) Configure Webhook for inbound events
- Settings → Tools → Webhook (outbound)
- Add URL: (Claude Code provides after n8n is up) — e.g. http://localhost:5678/webhook/linkedin-reply
- Select events: "new message", "invitation accepted", "invitation declined"
- Save

REPORT:
- Plan: Standard / Pro / Trial
- Desktop app installed: yes / no
- Chrome extension installed: yes / no
- LinkedIn logged in inside LinkedHelper's controlled browser: yes / no
- Daily invitation limit set: (value) — must be <=5 for fresh account in week 1
- Working hours configured: yes / no
- Local HTTP API enabled: yes / no, port 7337 reachable: yes / no
- Any errors

Procedi con STEP 1.
```

---

## After LinkedHelper setup, Claude Code does:

1. Ask user to paste the LinkedHelper API key ONCE
2. Write to `.env`: `LINKEDHELPER_API_KEY=...`, `LINKEDHELPER_LOCAL_URL=http://127.0.0.1:7337`
3. Test local API from PowerShell:
   ```powershell
   curl.exe http://127.0.0.1:7337/api/ping -H "X-API-KEY: $env:LINKEDHELPER_API_KEY"
   ```
4. Register n8n webhook URL in LinkedHelper once workflow 3 is deployed
5. Explicitly set `.env` rate-limit caps to match week-1 warmup values:
   - `DAILY_LI_CONNECTION_LIMIT=5` (week 1)
   - `DAILY_LI_MESSAGE_LIMIT=15` (week 1)
6. Update `intake/answers.md`: `LinkedIn engine: linkedhelper — local install complete, week-1 caps active`

## Important reminders for Claude Code

- **NEVER** tell the user to run LinkedHelper on a VPS. It runs on their PC with their Chrome, on their residential IP. That's the whole point.
- Remind user: PC must stay ON during 9-18 TZ windows. Closing Chrome or sleeping PC = no sends.
- Enforce the warmup ramp — don't let user push limits above week-N targets even if they ask.
