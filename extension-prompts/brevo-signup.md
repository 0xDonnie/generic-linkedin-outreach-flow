# Brevo Signup + SMTP Setup — Chrome Extension prompt

Paste into Claude Chrome Extension on https://brevo.com.

---

## Phase 1 — Signup (prompt #1)

```
Sign up for Brevo (free tier) for transactional email. I am NOT logged in.

CONTEXT:
- Project: {{PROJECT_NAME}}
- Email to register with: {{SENDER_GMAIL}}
- Plan target: Free (300 emails/day, zero cost)
- Will authenticate {{DOMAIN_COUNT}} outbound domains for DKIM

PROCEDURE:

STEP 1 — Signup
- Go to https://www.brevo.com/
- Click "Sign up free"
- Email: {{SENDER_GMAIL}}
- Password: FERMATI and ask me to enter password manually
- Confirm email link when it arrives

STEP 2 — Onboarding form
- Company name: {{COMPANY_LEGAL_NAME}}
- Website: {{COMPANY_WEBSITE}} (or primary outbound domain)
- Activity: Technology / Software / Marketing (pick whatever matches closest)
- Team size: 1-5 (solo founder) — or actual team size
- How do you use Brevo: select "Marketing campaigns" + "Transactional emails"
- Skip all interactive tutorials aggressively

STEP 3 — Plan selection
- If Brevo pushes a trial or paid plan: scroll to bottom, find "Free" / "Free forever" option
- Select Free plan
- Verify 300 emails/day quota visible
- NO credit card required for Free

REPORT:
- Account created successfully: y/n
- Free plan activated (not accidentally on trial/paid): y/n
- Logged in dashboard: y/n

Proceed with STEP 1.
```

## Phase 2 — Authenticate domains (one prompt per domain, OR one loop)

```
Authenticate domain(s) on Brevo for sending.

CONTEXT:
- Domains to authenticate: {{OUTBOUND_DOMAINS_LIST}}
- Each domain's DNS is on Cloudflare — I will handle DNS record additions separately via Cloudflare API

PROCEDURE (repeat for each domain):

STEP 1 — Add domain
- Dashboard → click profile (top right) → "Senders, Domains & Dedicated IPs"
- Tab "Domains" → click "Add a domain"
- Enter domain name (e.g., ba-compliance.com)
- Click continue

STEP 2 — Get DNS records
- Brevo shows 3-4 DNS records:
  * TXT brevo-code verification
  * CNAME brevo1._domainkey
  * CNAME brevo2._domainkey
  * TXT _dmarc (or says "add this DMARC if not present")
- Copy/read each record's:
  - Record type
  - Name
  - Value
- Send them all to me in this format:
  
  Domain: ba-compliance.com
  TXT @: brevo-code:XXXXXXXXXX
  CNAME brevo1._domainkey: b1.ba-compliance-com.dkim.brevo.com
  CNAME brevo2._domainkey: b2.ba-compliance-com.dkim.brevo.com
  TXT _dmarc: v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com

STEP 3 — Wait for verification
- I (Claude Code) will add these DNS records on Cloudflare via API
- After ~30 seconds, you click "Authenticate" button on Brevo
- Brevo fetches DNS and verifies
- Status should turn green "Authenticated"

REPORT:
- DNS records extracted: y/n per domain
- Authentication status after DNS add: authenticated / pending / failed

IMPORTANT:
- Do NOT paste actual DNS values into chat — just format them as structured output I can parse
- Do NOT try to add DNS records yourself (I handle that via Cloudflare API for reliability)
```

## Phase 3 — SMTP key generation (prompt #3)

```
Generate an SMTP key on Brevo for n8n to use.

PROCEDURE:

STEP 1 — Navigate
- Click gear icon (Settings) — top right
- Left menu → "SMTP & API"
- Tab: "SMTP"

STEP 2 — Generate key
- Scroll to "Generate a new SMTP key" button (bottom of page)
- Click
- Name: "{{PROJECT_NAME}} outbound"
- Click Generate
- Brevo shows a modal with:
  * SMTP server: smtp-relay.brevo.com
  * Port: 587
  * Login: {{SENDER_GMAIL}} (or account email)
  * Master password: long string starting with "xsmtpsib-..."
- IMPORTANT: The master password is visible ONLY ONCE

STEP 3 — Report back
- Give me:
  - SMTP Login (the email address)
  - Master password (the xsmtpsib-... string)

I will put these in the project's .env file immediately. Close the Brevo modal after I confirm.

SECURITY NOTE:
If you'd rather not paste the password in chat, you can:
- Close the Brevo modal after YOU copy the password into a password manager
- Then manually paste it into `.env` in the project folder yourself
- Tell me "SMTP key configurata" and I continue without needing the value
```
