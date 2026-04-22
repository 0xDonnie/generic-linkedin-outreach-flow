# Cloudflare Domain Purchase — Chrome Extension prompt

Paste into Claude Chrome Extension on https://dash.cloudflare.com.

For LinkedIn outreach we only need ONE domain — the privacy notice + opt-out landing page. Unlike the email sibling (which needs 3-5 outbound domains with DKIM/SPF/DMARC), LinkedIn routing uses LinkedIn's own infrastructure. So this prompt buys 1 domain only.

Skip entirely if user already has a usable domain (`{{EXISTING_DOMAIN}}`).

---

```
I need to purchase 1 domain on Cloudflare Registrar for a landing page (privacy notice + opt-out form). I'm logged in.

CONTEXT:
- Purpose: host GDPR privacy notice + opt-out form at {{PRIVACY_SUBDOMAIN}}.(domain)
- Target pricing: ~$10/year for .com
- Acceptable TLDs: .com (best), .net, .org, .eu
- AVOID: .xyz, .info, .biz, .top, .click, .link (bad trust signal on landing page)

SUGGESTED DOMAINS (pick the first available):
{{DOMAIN_SUGGESTIONS_LIST}}

Example for a compliance SaaS product:
- {{COMPANY_SLUG}}-privacy.com
- {{COMPANY_SLUG}}-info.com
- {{COMPANY_SLUG}}-contact.com

PROCEDURE:

STEP 1 — Navigate to Registrar
- Sidebar → Domain Registration → Register Domains
- Or: https://dash.cloudflare.com/?to=/:account/domains/register

STEP 2 — Search and select one
- Try each domain from the suggestions above in order
- Pick the FIRST one that is:
  (a) available
  (b) NOT "Premium" (those are $200+/year, skip)
  (c) price is ~$10-15/year

STEP 3 — Add to cart + checkout
- Add just 1 domain
- Cart should show 1 domain at ~$10-15/year
- FERMATI at payment step — confirm with user before committing

STEP 4 — After user confirms payment
- Complete purchase
- Verify domain appears in Registered Domains
- Report back: actual domain name purchased, total paid

IMPORTANT:
- No add-ons (no "Premium DNS", no "privacy protection" — CF has those free/included)
- No marketplace features

Procedi con STEP 1.
```

---

## After domain purchased

Claude Code captures the actual registered domain name into `intake/answers.md` → `privacy_landing_domain`, and uses it for:
- `PRIVACY_NOTICE_URL=https://{{PRIVACY_SUBDOMAIN}}.(domain)/privacy`
- `OPTOUT_FORM_URL=https://{{PRIVACY_SUBDOMAIN}}.(domain)/opt-out`
- Cloudflare Pages deployment of the privacy notice HTML + opt-out form
