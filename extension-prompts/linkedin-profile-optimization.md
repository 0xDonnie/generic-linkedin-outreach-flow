# LinkedIn Profile Optimization — Chrome Extension prompt

Paste into Claude Chrome Extension on https://www.linkedin.com/in/me/ (user's own profile).

MANDATORY for both Engine A and Engine B — before any outbound. Profile quality drives connection-acceptance rate (which is the single biggest lever on campaign ROI AND account ban risk).

---

```
I need to optimize a LinkedIn profile before using it for outbound outreach.

CONTEXT:
- Profile URL: {{SENDER_LINKEDIN_URL}}
- Account status: {{ACCOUNT_STATUS}} (new | established)
- Target ICP we are selling to: {{ICP_ROLES}} in {{ICP_INDUSTRY}}
- Product: {{PRODUCT_PITCH}}
- Sender identity:
  - Full name: {{SENDER_FULL_NAME}}
  - Title: {{SENDER_TITLE}} at {{SENDER_COMPANY}}
  - City/Country: {{SENDER_CITY}}
- Goal: someone from {{ICP_ROLES}} should look at this profile and think "credible person, relevant to my world, worth connecting to"

PROCEDURE:

STEP 1 — Profile photo
- Audit current photo: is it the user's face, sharp, eyes visible, business-appropriate?
- If missing/low quality: tell me "serve foto profilo migliore" and PAUSE
- Ideal: headshot, neutral or branded background, smile, 400x400+

STEP 2 — Background/banner image
- Audit: is there a custom banner? (not default blue)
- If no custom banner: tell me "serve banner — Canva template LinkedIn gratuito" — user can generate one

STEP 3 — Headline (critical — most-read field)
- Current: read the existing headline
- Rewrite as: "{{SENDER_TITLE}} @ {{SENDER_COMPANY}} | [1-line benefit statement for {{ICP_ROLES}}]"
- Example: "Head of Sales @ Aletheia Tech | Helping compliance leaders ship faster with AI-native KYC tooling"
- Max 220 chars. Include 1 keyword that {{ICP_ROLES}} search for.
- Edit → Save
- Confirm new headline visible on profile

STEP 4 — About section
- If empty: write 4 paragraphs (~800 chars total):
  P1: one line what we do + who we serve
  P2: why it matters (the pain)
  P3: 2-3 result-oriented bullets (use "we" form, not "I")
  P4: "Happy to chat - ping me or {{CALENDAR_URL}}"
- If existing but generic: rewrite matching the above structure
- Keep URLs clean (no bit.ly)

STEP 5 — Current position
- Verify current role is: {{SENDER_TITLE}} at {{SENDER_COMPANY}}, with start date
- If missing: Add Experience → Job title = {{SENDER_TITLE}}, Company = {{SENDER_COMPANY}}
- Description: 2-3 bullets describing what we do (not what user does personally)

STEP 6 — Featured section
- Add 1-3 "Featured" items:
  - Company website or landing page
  - One recent post or case study
  - Cal.com booking link: {{CALENDAR_URL}} (label: "Book a 15-min intro")
- If no featured items exist: create them by sharing a post first (see step 8)

STEP 7 — Skills + Endorsements
- Add top 5 skills relevant to our product category
- Don't add irrelevant skills — they clutter the profile

STEP 8 — Post ONE piece of content (if account is new)
- For new accounts only: write a single genuine post about the product space
  - 800-1500 chars, no links (LI de-prioritizes posts with external links)
  - Share an opinion or a frame, not a sales pitch
  - Example: "3 things we're seeing in {{ICP_INDUSTRY}} as [topic]..."
- Post it
- This signals to LinkedIn's algorithm "real user with real opinions"

STEP 9 — Connection housekeeping (new accounts)
- For accounts with <100 connections: send 10-20 connection requests to REAL contacts user knows personally (NOT cold targets yet)
- These serve as organic warmup + trust signal
- Skip if established account

STEP 10 — Visibility settings
- Settings → Visibility:
  - "Profile viewing options": "Your name and headline" (not anonymous)
  - "Visibility of your profile to non-LinkedIn users": Public
  - "Who can see your connections": Only you (optional, prevents competitors from reverse-engineering)

REPORT:
- Photo quality: good / needs-upgrade / missing
- Banner: custom / default
- Headline: (new text)
- About: (first 100 chars of new text)
- Current position: verified / fixed
- Featured items added: (count)
- Skills added: (count)
- Post published (new accounts): yes / no / not-applicable
- Initial warmup connections sent (new accounts): (count)
- Visibility: confirmed public-viewable
- Any errors or things user should fix manually

Procedi con STEP 1.
```

---

## After profile optimization, Claude Code does:

1. Update `intake/answers.md`: record profile optimization completed, note anything user still needs to fix
2. **DO NOT start outbound yet**. Next step is organic warmup (2-4 weeks, see `guides/linkedin-warmup-plan.md`).
3. Schedule a reminder to check profile again after 2 weeks — the algorithm rewards profiles that get engagement on posts
