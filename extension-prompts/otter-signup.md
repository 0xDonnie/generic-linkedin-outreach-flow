# Otter.ai Signup — Chrome Extension prompt

Paste into Claude Chrome Extension on https://otter.ai.

---

```
Sign up for Otter.ai (Free plan) to auto-transcribe demo calls. I am NOT logged in yet.

CONTEXT:
- Project: {{PROJECT_NAME}}
- Google account to use: {{SENDER_GMAIL}}
- Plan target: Basic (Free) — 300 min/month quota, no credit card
- Use case: auto-join all demo calls, email transcript to me after

PROCEDURE:

STEP 1 — Signup
- Go to https://otter.ai/signup
- Click "Sign up with Google"
- Use account: {{SENDER_GMAIL}}
- If Google password prompt: FERMATI — user will enter password themselves
- Authorize: Google account info + Google Calendar

STEP 2 — Onboarding
- Department: Sales
- Role: Senior Leader (or closest match for solo founder)
- Plan: Basic (Free) — confirmed
- Skip all "Get Started" tutorial tooltips aggressively
- Skip Zoom/Teams connection prompts (we only use Google Meet)

STEP 3 — Calendar Integration
- Settings → Account → Calendar Integration
- Verify Google Calendar connected (usually auto via OAuth signup)
- If not connected: click Connect, use same Google account

STEP 4 — OtterPilot auto-join
- Settings → OtterPilot for Meetings
- Toggle "OtterPilot auto-joins my meetings": ON
- Filter: "Meetings where I am the host" (so bot doesn't auto-join random external calls where user is invitee)

STEP 5 — Email recipients
- Settings → Notifications or Privacy/Sharing
- Verify: email transcripts go to {{SENDER_GMAIL}}
- If option to add secondary recipient exists (may require paid plan): skip on free — we'll use Gmail filter instead
- If "What to include" dropdown: pick most comprehensive option ("Overview" on free, "Full transcript + action items" on paid — select what's available)

STEP 6 — Privacy default
- Default audience for shared notes: "Don't share — keep meeting notes private"
- This prevents Otter from auto-sharing transcripts with external meeting guests

STEP 7 — Skip test event
- We'll verify at the first real Cal.com booking

REPORT:
- Account created on Free tier (not accidentally trial): y/n
- Google Calendar connected: y/n
- OtterPilot auto-join ON: y/n + filter used
- Email recipients configured: y/n
- Quota displayed: X/300 min (should be 0/300)
- Any popups or issues encountered

Proceed with STEP 1.
```

---

## After Otter setup, Claude Code handles Gmail filter setup

User will also need a Gmail filter that auto-forwards Otter emails from `{{SENDER_GMAIL}}` to `{{OWNER_EMAIL}}` (e.g., from sales gmail to founder personal email). See `extension-prompts/gmail-forward-setup.md`.
