# Legitimate Interest Assessment (LIA) — LinkedIn Outreach Template

> **Purpose**: give this to a privacy lawyer to draft an executable LIA for your LinkedIn cold outreach campaign. Starting template — the lawyer adapts to your specific product, jurisdiction, and risk posture.

> **Not legal advice**. The final LIA must be reviewed and signed by a qualified privacy lawyer in your jurisdiction.

> **Key difference vs email LIA**: the channel is LinkedIn direct messaging (in-platform), not email. GDPR legal basis and obligations are essentially identical — ePrivacy Directive art. 13 treats unsolicited electronic communications the same regardless of medium. Data sources differ (Apollo provides LinkedIn URLs; we do NOT scrape LinkedIn directly). Tool/processor list differs (HeyReach or LinkedHelper 2 instead of SMTP provider).

---

## 1. Data Controller

**Company**: {{COMPANY_LEGAL_NAME}}
**Registered address**: {{COMPANY_ADDRESS}}
**Data Protection Officer / Privacy Lead**: {{DPO_EMAIL}}
**Trading name / operating brand**: {{OPERATING_BRAND}}

## 2. Processing activity

**Activity name**: B2B outbound sales communications via LinkedIn
**Channel**: LinkedIn connection requests + direct messages
**Sending account**: {{SENDER_LINKEDIN_URL}}
**Tooling**: {{LINKEDIN_ENGINE}} — either HeyReach (cloud SaaS API-driven outreach) or LinkedHelper 2 (desktop Chrome extension running on controller's device)
**Date range**: {{EFFECTIVE_DATE}} onwards (reviewed annually)
**Volume**: up to {{DAILY_LI_CONNECTION_LIMIT}} connection requests/day and {{DAILY_LI_MESSAGE_LIMIT}} messages/day, targeting ~{{MONTHLY_LEADS_TARGET}} unique recipients per month

## 3. Purpose (Step 1 — Purpose test)

We process personal data of professional contacts to:

- Identify decision-makers in target organisations relevant to our product/service
- Introduce our offering ({{PRODUCT_CATEGORY}}) via LinkedIn connection requests + direct messages
- Qualify whether there is a commercial fit and invite interested parties to a product demonstration

### 3.1 Legitimate commercial interest

Our interest is:
- Establishing commercial relationships with businesses that have a genuine need for our {{PRODUCT_CATEGORY}}
- Operating a scalable, efficient customer acquisition function
- Informing potential buyers of a product that addresses a regulatory, operational, or strategic need within their role ({{ICP_ROLES}})

### 3.2 Benefit to data subject

The data subjects (professional contacts in roles such as {{ICP_ROLES}}) benefit from:
- Awareness of solutions that may reduce costs or solve pain points in their role
- Option to engage further, decline the connection request, or reply "STOP" to opt out
- No behavioural profiling, no unsolicited phone calls, minimal data footprint
- Communication on a platform (LinkedIn) where the data subject has actively published professional availability

## 4. Necessity (Step 2 — Necessity test)

### 4.1 Why is this processing necessary?

Alternatives considered and rejected:

- **Inbound only (content marketing, SEO)**: slower, does not reach professionals who are not actively researching
- **Broadcast advertising on LinkedIn**: available but >10x cost per qualified conversation vs direct messaging
- **Cold email**: viable parallel channel (see sibling `generic-coldmailing-flow`); not mutually exclusive
- **Event-based outreach**: possible but low volume, high cost per contact
- **Sales Navigator InMails only (fully ToS-compliant)**: capped at 50 InMails/month included with subscription; insufficient for mid-market outreach volume

LinkedIn direct outreach is the **minimum necessary** intervention to introduce our product via the channel where the specific professionals are most likely to evaluate it.

### 4.2 Data minimisation

We process only:
- Full name (from LinkedIn public profile)
- Job title and seniority (from LinkedIn)
- Employer / company affiliation (from LinkedIn)
- LinkedIn profile URL
- Public LinkedIn ID (slug)
- Country of professional residence
- Business email address (optional, only if Apollo returns it and we escalate off-platform)

We do **NOT** process:
- Personal email addresses unless lawfully escalated post-initial-contact
- Personal phone numbers
- Personal addresses
- Behavioural tracking or psychographic data
- Special category data (health, religion, etc.)
- LinkedIn profile fields beyond those listed above
- Private / connections-only profile data

### 4.3 Data provenance and LinkedIn Terms of Service

Personal data is NOT obtained by scraping LinkedIn directly. LinkedIn URLs + public slugs are obtained from Apollo.io (a licensed B2B data provider).

The outreach itself runs through (a) HeyReach or (b) LinkedHelper 2. Both are third-party automation tools whose use is not formally endorsed by LinkedIn; we acknowledge this is a separate ToS question from GDPR and have documented our position in a separate document (`legal/linkedin-tos-risk.md`). From a data protection standpoint, these tools are processors acting under our instructions.

## 5. Balancing (Step 3 — Balancing test)

### 5.1 Data subject's reasonable expectations

Professionals in the target roles ({{ICP_ROLES}}) can reasonably expect to receive unsolicited commercial connection requests and direct messages on LinkedIn, where:
- LinkedIn's own product experience (Sales Navigator, InMail, "People You May Know") normalizes this type of interaction as part of the platform's value proposition
- The sender's identity and purpose are clearly disclosed in the first message
- They have an easy opt-out: declining the connection, replying "STOP", blocking, or reporting

This expectation is well-documented in LinkedIn's own user education materials and platform culture.

### 5.2 Potential harms to data subject

Possible negative impacts:
- Time cost of reading a DM they don't want (mitigated: ≤ 4 touches per contact, brief messages, single-word opt-out)
- Feeling of privacy intrusion (mitigated: public professional context only, no private data)
- Nuisance from repeated contact (mitigated: strict 4-touch cap, immediate stop on reply or on connection decline)

### 5.3 Mitigating measures

- First DM after connection acceptance includes: sender full identity, legal entity, purpose, legal basis (legitimate interest), privacy notice URL, opt-out mechanism ("reply STOP")
- Connection declines → immediate permanent suppression
- "STOP" / equivalent replies → permanent suppression detected by reply-handler workflow
- Suppression list honored across all campaigns and any future campaigns
- Clear sender identity (verified LinkedIn profile) — no fake identities claimed
- Privacy notice URL hosted at {{PRIVACY_NOTICE_URL}}, accessible without login
- Right to object, access, rectify, erase, restrict, portability respected within 30 days
- Retention limited to 24 months from last interaction, then deletion
- No cross-contact profiling — we do not build behavioural profiles from aggregate recipient behaviour on LinkedIn
- No personal data sold or shared outside GDPR-compliant processor agreements (HeyReach/LinkedHelper, Cloudflare, Apollo)
- Rate-limited at platform-sustainable levels (≤20-25 connection requests/day per account)

### 5.4 Conclusion

Our legitimate commercial interest in introducing our {{PRODUCT_CATEGORY}} to appropriate professional contacts via LinkedIn **is not overridden** by the interests, rights, and freedoms of the data subjects, provided we maintain the mitigating measures above.

## 6. Data sources

Personal data is collected from:

- **Apollo.io** (B2B data provider, US) — professional contact details including LinkedIn URLs; bound by DPA
- **Public regulatory registers** (where applicable): {{REGISTER_LIST}}
- **Company public websites**: public role directories

We do **NOT** directly scrape LinkedIn or other platforms.

## 7. Processors / recipients

Personal data is shared with the following processors, bound by GDPR Article 28 DPAs:

- **{{LINKEDIN_ENGINE_PROVIDER}}** — LinkedIn outreach orchestration. One of:
  - HeyReach — cloud SaaS driving LinkedIn actions on our sending account
  - LinkedHelper — desktop Chrome extension running on controller device (no personal data leaves our device beyond what LinkedIn receives natively)
- **Cloudflare** (US, with Frankfurt edge) — landing page hosting (privacy notice + opt-out form)
- **Apollo.io** (US) — data enrichment; SCCs for international transfer
- **Internal CRM** — PostgreSQL database on {{CRM_LOCATION}}
- **Cal.com** (US / self-hosted option) — demo booking
- **{{NOTIFICATION_PROVIDER}}** (Telegram / Slack) — internal team notifications only, no recipient DM content beyond anonymized snippets

Note on LinkedIn itself: LinkedIn (Microsoft Corp, US) is the platform operator on which the communication occurs. From a data protection perspective, LinkedIn is a data controller for the underlying profile data and a processor/joint-controller for the specific communication events we initiate. Our use of the platform is bound by LinkedIn's User Agreement, Privacy Policy, and DPA where applicable.

## 8. International transfers

Where data is transferred outside the European Economic Area (e.g., to US-based processors under SCCs), we rely on:
- Standard Contractual Clauses (EC Decision 2021/914)
- Supplementary measures (TLS encryption in transit, encryption at rest, access controls)
- Transfer impact assessment completed for each processor

## 9. Retention

- **Active outreach data**: 24 months from last interaction, then automated deletion from `leads` table
- **Suppression list**: permanent — LinkedIn URL + public_id only, detached from enriched profile, retained indefinitely to ensure ongoing opt-out compliance
- **Campaign metrics**: aggregated, non-identifying form, retained indefinitely for product analytics
- **Reply content**: 24 months, then deletion or pseudonymization

## 10. Data subject rights

Data subjects can, at any time:
- Object to processing (Art. 21) — via reply "STOP" in LinkedIn DM, via opt-out form at {{PRIVACY_NOTICE_URL}}, or via email to DPO
- Access their data (Art. 15) — via email to DPO
- Request rectification (Art. 16) or erasure (Art. 17)
- Lodge a complaint with their supervisory authority

We respond to all requests within 30 days.

## 11. Review cycle

This LIA is reviewed annually, or on any material change to:
- The target audience / ICP
- The data sources used
- Processor changes (e.g., switching LinkedIn engine)
- Legal / regulatory changes in the jurisdictions we operate in
- LinkedIn platform policy changes

**Current version**: v{{LIA_VERSION}}
**Next review due**: {{NEXT_REVIEW_DATE}}
**Reference code**: {{LIA_REF}}

## 12. Approval

Reviewed and approved by:

- **Name**: [lawyer's name]
- **Firm**: [law firm]
- **Role**: [e.g., Senior Associate, Data Protection]
- **Signature**: ________________________
- **Date**: {{SIGNATURE_DATE}}

---

## Email to send to a privacy lawyer

Subject: Legitimate Interest Assessment — {{PRODUCT_CATEGORY}} LinkedIn outbound outreach

Dear [Lawyer],

I'm setting up an automated B2B LinkedIn cold outreach function for {{COMPANY_LEGAL_NAME}} ({{OPERATING_BRAND}}). We're targeting {{ICP_ROLES}} at {{TARGET_COMPANY_TYPE}} across {{GEOGRAPHIES}}.

Channel: LinkedIn connection requests + direct messages (NOT email).

Volume: up to {{DAILY_LI_CONNECTION_LIMIT}} connection requests/day and {{DAILY_LI_MESSAGE_LIMIT}} messages/day, targeting ~{{MONTHLY_LEADS_TARGET}} unique recipients/month.

Data sources: {{DATA_SOURCE_SUMMARY}} — all legal providers, no direct LinkedIn scraping.

Tooling: {{LINKEDIN_ENGINE}} ({{LINKEDIN_ENGINE_PROVIDER}}) orchestrating our sending LinkedIn account.

Infrastructure: privacy notice hosted on Cloudflare Pages, permanent suppression list in PostgreSQL (keyed by LinkedIn URL), 24-month retention, no behavioural tracking, per-contact 4-touch cap.

We'd like a signed Legitimate Interest Assessment (LIA) covering Article 6(1)(f) GDPR for this processing, with a reference code we can cite in our consent_log and privacy notice.

Attached: our draft LIA template, our privacy notice draft, technical measures summary, and our LinkedIn ToS risk assessment (separate issue from GDPR — we want this noted, not necessarily opined on).

Timeline: LinkedIn account warmup starts in 1-2 weeks, first real-prospect outreach ~4 weeks from now.

Cost: please send an estimate. Budget is €500-1500 for the LIA document + one round of revision. Happy to discuss.

Available for a 30-min call this week or next.

Thanks,
{{SENDER_FULL_NAME}}
{{SENDER_TITLE}}, {{COMPANY_LEGAL_NAME}}
{{DPO_EMAIL}}
