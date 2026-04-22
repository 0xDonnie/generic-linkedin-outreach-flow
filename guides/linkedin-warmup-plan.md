# LinkedIn Warmup Plan

LinkedIn warmup is fundamentally different from email warmup. The goal is NOT to build sender reputation with ISPs — it's to convince LinkedIn's anti-abuse system that this is a real human, AND to build enough genuine engagement signal that outbound activity doesn't look anomalous.

## Why warmup matters (even more than for email)

- LinkedIn's anti-abuse system actively looks for new/dormant accounts starting aggressive outbound
- Triggers: sudden spike in connection requests, connection invites with low acceptance, repeated DM sends to non-connections, logins from new IPs or browsers, profile gaps
- Consequence of a trigger: temporary restriction (24h-7 days) → soft ban (account still works but invites capped) → hard ban (permanent)
- Warmup reduces trigger risk by establishing a behavioural baseline BEFORE automation begins

## Engine A (HeyReach) — established account

Assumption: account is 1+ year old, 500+ connections, some profile history, real identity.

### Week 0 (before any outreach) — 3-7 days
**Goal**: signal to LinkedIn that you're actively using the account as a real person.

Daily actions (manual, by user):
- Log into LinkedIn via normal browser (establish session history from usual IP)
- Scroll feed 5-10 min, like 3-5 posts, leave 1 thoughtful comment
- Review and optimize profile per `extension-prompts/linkedin-profile-optimization.md` if not already done
- Optional: publish 1-2 organic posts about your product space (800-1500 chars, opinion-based)

No HeyReach activity yet.

### Week 1 — start at 5/day
- Monday: HeyReach connected, caps set to 5 invites/day, 10 messages/day
- Target: 15 connection requests sent over 3 days (Mon/Wed/Fri, 5 each)
- Acceptance rate to monitor: expect 20-30% on first batch
- If acceptance <15%: STOP and reassess ICP / headline / invite note. Do NOT crank volume.

### Week 2 — ramp to 10/day
- Mon-Fri, 10/day → 50/week (well under LinkedIn's 100/week soft cap)
- Messages: start sending first-DMs to accepters from week 1
- Send follow-up-1 to accepted-but-no-reply from 4+ days ago
- Monitor reply rate: expect 5-15%

### Week 3 — ramp to 15/day
- Mon-Fri, 15/day → 75/week (approaching cap but safe)
- Full 4-touch sequence active (connection + first msg + 2 follow-ups)
- Daily check: DB query `SELECT status, count(*) FROM campaign_messages GROUP BY status;`

### Week 4+ — cruise at 20/day
- Mon-Fri, 20/day → 100/week (at LinkedIn's soft weekly cap)
- Never above this without adding a second account (HeyReach multi-seat)
- Tuesday-Thursday are peak acceptance days; Monday and Friday slightly lower — this is normal, don't over-optimize

`.env` ramp:
```
Week 1: DAILY_LI_CONNECTION_LIMIT=5,  DAILY_LI_MESSAGE_LIMIT=10
Week 2: DAILY_LI_CONNECTION_LIMIT=10, DAILY_LI_MESSAGE_LIMIT=20
Week 3: DAILY_LI_CONNECTION_LIMIT=15, DAILY_LI_MESSAGE_LIMIT=30
Week 4: DAILY_LI_CONNECTION_LIMIT=20, DAILY_LI_MESSAGE_LIMIT=40
```

Claude should bump these weekly after confirming no restrictions appeared.

## Engine B (LinkedHelper) — new / burner account

Assumption: account is <3 months old or created for this campaign. HIGHER risk, SLOWER ramp.

### Weeks 0-1 — account creation + basics (if account doesn't exist)
- User creates LinkedIn account using real personal email, real phone for SMS verification
- Profile: photo (user provides headshot), banner (Canva template), headline matching our pitch
- Fill out: 1 position (current), 1-2 education entries, 3-5 skills, 1-2 languages
- Add 10-20 connection requests to REAL people user knows personally (not cold prospects)
- Accept/request verifications from those people
- Wait 5-7 days. LinkedIn "trust score" is built on time + friction.

### Week 2 — organic content
- Publish 2-3 posts on topics relevant to the ICP (800-1500 chars, no external links)
- Like 5-10 posts/day, comment on 2-3
- Connect to 5-10 more real people (friends, university, industry events)
- STILL no LinkedHelper activity.

### Week 3 — LinkedHelper setup + first tentative sends
- Install LinkedHelper desktop + Chrome ext (user action, see `extension-prompts/linkedhelper-setup.md`)
- Configure caps: 5 invites/day, 10 messages/day, active hours 10-17 (narrower than HeyReach)
- Friday test: send 2 connection requests manually via LinkedHelper to test account functionality
- Monitor for 48h — any restriction warning?

### Week 4 — start campaign at 5/day
- Mon-Fri, 5 connection requests/day (+/- 2 jitter)
- First-message workflow: send to accepters only, 1-2 day delay after accept
- Acceptance rate to monitor: expect 15-25% (lower than established accounts because less profile authority)

### Week 5 — ramp to 10/day
- Mon-Fri, 10/day
- Full 4-touch sequence live
- Continue organic posts 1-2/week

### Week 6+ — cruise at 15/day
- Never push above 15/day for new accounts until they hit 6-month mark
- Even then, 20/day is the absolute cap for LinkedHelper
- If user wants more volume → need Engine A on a second (established) account

`.env` ramp:
```
Weeks 3: DAILY_LI_CONNECTION_LIMIT=2,  DAILY_LI_MESSAGE_LIMIT=5  (test only, Friday)
Week 4:  DAILY_LI_CONNECTION_LIMIT=5,  DAILY_LI_MESSAGE_LIMIT=10
Week 5:  DAILY_LI_CONNECTION_LIMIT=10, DAILY_LI_MESSAGE_LIMIT=20
Week 6:  DAILY_LI_CONNECTION_LIMIT=15, DAILY_LI_MESSAGE_LIMIT=30
```

## Signals that warmup is going well

- Acceptance rate > 18%
- No restriction warnings in LinkedIn UI
- Profile views trend up (even slightly)
- At least 1-2 "who viewed your profile" each day
- Occasional inbound connection request to your profile (signal: people are finding you)

## Signals to STOP immediately

- LinkedIn shows a red banner: "Your account is restricted" or "We've temporarily limited your account"
- Acceptance rate drops below 10% for 3 days in a row → targeting is wrong; fix before more sends
- Captcha prompts when trying to send invites (= detection is active)
- 2+ "spam" reports received (visible in notifications)

If ANY stop signal → pause all automation, wait 7 days, restart at Week 1 caps. Don't try to "push through" — it makes things worse.

## After 60 days of stable production

- Consider adding a second account (Engine A + multi-seat, or a second LinkedHelper-driven account on a different PC/IP)
- Never on same IP / same device for two accounts
- Never share cookies between accounts
- Track separately in CRM (campaigns table has `sender_profile` column — one campaign per sending account)

## Notes specific to Italian / EU target

- Italians on LinkedIn respond better to DMs in Italian (even if their profile is English)
- Acceptance rates in Italy / Spain / France tend to be higher than UK / US (~25% vs 15-20%)
- Conversion rates are lower — Italians take longer to commit to a demo, more back-and-forth before booking
- Don't send on Fridays afternoon or Monday mornings — dead zones

## Notes specific to UK / US / UAE target

- Shorter DMs win. 200 words max on first message, 100 on follow-ups.
- Americans book faster but cancel more — have a firm pre-demo qualification step
- UAE prefers video calls over chat follow-up
