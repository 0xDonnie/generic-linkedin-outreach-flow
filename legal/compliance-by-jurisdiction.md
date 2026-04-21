# Compliance by Jurisdiction

Quick reference for what's legal where. **Not legal advice** — confirm with a privacy lawyer in your jurisdiction before sending.

## B2B cold email — jurisdiction matrix

| Jurisdiction | Legal basis | LIA required | Unsubscribe required | Other |
|---|---|---|---|---|
| 🇮🇹 Italy | Legitimate interest (GDPR 6(1)(f)) | ✅ Yes | ✅ Yes | |
| 🇩🇪 Germany | Legitimate interest — stricter than IT | ✅ Yes | ✅ Yes | UWG §7 requires prior consent for many B2B contexts; narrower than IT |
| 🇫🇷 France | Legitimate interest | ✅ Yes | ✅ Yes | |
| 🇪🇸 Spain | Legitimate interest | ✅ Yes | ✅ Yes | LOPDGDD additional rules |
| 🇳🇱 Netherlands | Legitimate interest | ✅ Yes | ✅ Yes | |
| 🇬🇧 UK (post-Brexit) | Legitimate interest under UK GDPR | ✅ Yes | ✅ Yes | PECR (Privacy and Electronic Communications Regulations) additional rules |
| 🇨🇭 Switzerland | Revised FADP — legitimate interest | ✅ Yes | ✅ Yes | |
| 🇦🇪 UAE | No restriction on B2B cold email | ⚠️ Recommended | ✅ Best practice | Federal PDPL (2021) applies to data processing; cold email itself not restricted |
| 🇸🇬 Singapore | PDPA — legitimate interest analog | ⚠️ Recommended | ✅ Required | |
| 🇺🇸 US | CAN-SPAM Act | ❌ Not required | ✅ Required | Unsubscribe must honor within 10 business days |
| 🇨🇦 Canada | CASL — **very strict**, requires express consent | ❌ Explicit consent needed | ✅ Required | CASL effectively bans cold B2B to Canadian addresses without prior relationship |
| 🇦🇺 Australia | SPAM Act 2003 | ❌ "Inferred consent" for B2B | ✅ Required | Business roles at "businesses in the same industry" considered inferred consent |

## B2C cold email — jurisdiction matrix

| Jurisdiction | Legal basis | Cold to consumers OK? |
|---|---|---|
| 🇮🇹 Italy | ePrivacy + GDPR | ❌ Requires opt-in consent |
| 🇪🇺 EU (other) | ePrivacy Directive | ❌ Requires opt-in consent |
| 🇬🇧 UK | PECR | ❌ Requires prior consent OR "soft opt-in" from existing customer |
| 🇦🇪 UAE | PDPL + Telecom regulations | ⚠️ Gray area — consumer spam laws under TRA |
| 🇺🇸 US | CAN-SPAM | ✅ Allowed with unsubscribe |
| 🇨🇦 Canada | CASL | ❌ Cold B2C effectively banned |
| 🇦🇺 Australia | SPAM Act | ❌ Requires consent |

### B2C cold strategies that ARE legal

1. **Opt-in database purchase**: buy contact lists from providers that can demonstrate each subscriber opted in (e.g., newsletter sign-ups, "tell me about deals" checkboxes). Providers must attest opt-in with proof.
2. **Existing customer base**: the "soft opt-in" rule (UK) permits marketing to existing customers about similar products, provided opt-out was offered at purchase.
3. **Double opt-in lead magnets**: offer a free resource (guide, tool), capture email with explicit opt-in to marketing, then follow up.
4. **Paid ads** (Google, Meta, TikTok) with email capture — then follow up to opt-ins.

**This framework defaults to not automating B2C cold sends unless the user explicitly provides an opt-in data source and checkable proof.**

## Multi-jurisdiction scenarios

Common patterns:

### EU target with US sender
- **GDPR Article 3(2) applies**: sender outside EU still bound by GDPR if processing EU subjects' data
- You need LIA even if you're US-based
- Jurisdictional reach: EU DPA can fine you

### UAE target with EU sender
- **GDPR applies to your own processing in EU**: LIA required
- UAE doesn't restrict cold email, but UAE subjects have GDPR protections if sender is EU-established
- Effectively: follow GDPR anyway

### Mixed geography campaigns
- Apply the **strictest applicable jurisdiction** to all contacts in that campaign
- OR: segment contacts by jurisdiction and use different legal basis + message per segment

## When in doubt

1. Get a signed LIA from a privacy lawyer in your jurisdiction. Reference it in all consent_log rows.
2. Implement one-click unsubscribe (this framework does it).
3. Keep the suppression list forever and honor it.
4. Limit frequency (≤ 4 emails per contact across any campaign).
5. Never pretend consent you don't have. Document your legal basis visibly in the email footer.

## What this framework enforces

- ✅ Every lead must have a `consent_log` row before sending (enforced by `contactable_leads` view)
- ✅ Every email has a one-click unsubscribe link (List-Unsubscribe header + visible link)
- ✅ Unsubscribes are permanent (suppression_list table, cross-campaign)
- ✅ Every email footer shows legal entity + address + privacy notice URL
- ✅ No personal email collection (business emails only)
- ✅ No behavioural tracking (just aggregate campaign metrics)

What this framework **does NOT do** (you must handle):
- ❌ Generate the signed LIA document (that's a lawyer's job)
- ❌ Verify opt-in databases for B2C (you must get proof from the data provider)
- ❌ Translate privacy notices (you must translate to recipients' language if you want to be defensible in that jurisdiction)
- ❌ Provide jurisdiction-specific legal counsel
