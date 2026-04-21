# Cloudflare Domain Purchase — Chrome Extension prompt

Paste into Claude Chrome Extension on https://dash.cloudflare.com.

---

```
I need to purchase {{DOMAIN_COUNT}} new outbound domains on Cloudflare Registrar for cold email. I'm logged in.

CONTEXT:
- Purpose: outbound email domains (separate from main brand, to protect brand reputation)
- Target pricing: ~$10/year per .com domain
- Do NOT buy .xyz, .info, .biz, .top, .click, .link — bad spam reputation
- Acceptable TLDs: .com (best), .net, .org, .eu

SUGGESTED DOMAINS (in priority order — first {{DOMAIN_COUNT}} that are available):
{{DOMAIN_SUGGESTIONS_LIST}}

Example for a compliance SaaS product:
- ba-compliance.com
- ba-onchain.com
- ba-checks.com
- ba-monitor.com
- ba-tools.com

PROCEDURE:

STEP 1 — Navigate to Registrar
- Sidebar → Domain Registration → Register Domains
- Or direct URL: https://dash.cloudflare.com/?to=/:account/domains/register

STEP 2 — Search domains
- For each domain in the list above, search
- Check it's:
  (a) available
  (b) NOT marked as "Premium" (which means $200+/year, skip)
  (c) price is ~$10-15/year

STEP 3 — Add to cart
- For available non-premium domains, click "Register" or "Add to cart"
- Skip any domain that's premium or over $15/year

STEP 4 — Checkout
- Cart should show {{DOMAIN_COUNT}} domains totaling ~${{EXPECTED_TOTAL}}
- Proceed to checkout
- FERMATI at payment step — I need to confirm with user before committing payment

STEP 5 — After user confirms payment
- Complete purchase
- Verify all {{DOMAIN_COUNT}} domains appear in Registered Domains list
- Report back:
  - Domains purchased with actual registered names
  - Actual total paid
  - Any domain that was skipped (unavailable or premium)

IMPORTANT:
- Don't buy any domain add-on ("premium DNS", "SSL", "privacy protection" — all unnecessary, CF has them free/included)
- Don't enable "Marketplace" features
- Just the domain registrations, nothing else

If user says "lo sto pagando tu prendi gli screenshots" proceed. Otherwise pause at checkout.

Procedi con STEP 1.
```

---

## After domains purchased

Claude Code captures the ACTUAL registered domain names (may differ from suggestions if some were unavailable) into `intake/answers.md` → `outbound_domains[]`. All subsequent prompts reference that list.
