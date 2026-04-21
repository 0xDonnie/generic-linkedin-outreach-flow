# Cal.com Setup — Chrome Extension prompt

Paste into Claude Chrome Extension on https://cal.com.

---

```
I need to set up a Cal.com booking page. I am NOT logged in yet.

CONTEXT:
- Project: {{PROJECT_NAME}}
- Desired slug: {{PREFERRED_SLUG}} (fallback: {{FALLBACK_SLUG_1}}, {{FALLBACK_SLUG_2}})
  Example: preferred "{{PROJECT_SLUG}}", fallbacks "{{PROJECT_SLUG}}demo", "{{PROJECT_SLUG}}hq"
- Event type: Intro Call (15 min)
- Target URL: https://cal.com/{{CLAIMED_SLUG}}/intro
- Google Calendar to connect: {{SENDER_GMAIL}}
- Timezone: {{TIMEZONE}} (e.g., Europe/London, Europe/Rome, Asia/Dubai)

PROCEDURE:

STEP 1 — Signup
- Go to https://cal.com/signup
- Click "Sign up with Google"
- Use account: {{SENDER_GMAIL}}
- If Google password prompt: FERMATI and tell me "scegli password Cal.com" — user will handle
- Authorize Google Calendar + Google Meet permissions

STEP 2 — Onboarding
- Username: try {{PREFERRED_SLUG}} first
- If taken, try {{FALLBACK_SLUG_1}}, then {{FALLBACK_SLUG_2}}
- Report which one was claimed
- Timezone: {{TIMEZONE}}
- Working hours: default (user can refine later)
- "Connect Calendar": Skip now or Confirm if it auto-connected via OAuth

STEP 3 — Delete default events
- Dashboard → Event Types
- Delete default events: "15 Min Meeting", "30 Min Meeting", "Secret Meeting", etc.
- Keep the page empty

STEP 4 — Create "Intro Call" event
- Click "+ New" → "Individual"
- Title: Intro Call
- URL slug: intro  (so URL becomes cal.com/{{CLAIMED_SLUG}}/intro)
- Duration: 15 minutes
- Description: "Quick intro to {{PROJECT_NAME}} — product overview, Q&A, next steps if fit"
- Location: "Cal Video" (default, or Google Meet if it auto-configured from OAuth)
- Save

STEP 5 — Test URL
- Open in new tab: https://cal.com/{{CLAIMED_SLUG}}/intro
- Verify booking page loads with "Intro Call - 15 min"
- Do NOT book anything, just verify

STEP 6 — SKIP webhook (we'll do it via API)
- DO NOT configure webhook now
- Claude Code will register the webhook via Cal.com API after VPS/local setup

REPORT:
- Claimed username/slug (may differ from preferred)
- URL of Intro Call event — confirm it loads
- Calendar connected: yes/no
- Any errors

Procedi con STEP 1.
```

---

## After Cal.com setup, Claude Code does:

1. Update `intake/answers.md` with actual claimed slug
2. Update `.env`: `SENDER_CALENDAR_URL=https://cal.com/{{CLAIMED_SLUG}}/intro`
3. Update email templates (substitute the placeholder with real URL)
4. Register webhook via Cal.com API (see `cal.com-webhook-register.md`)
