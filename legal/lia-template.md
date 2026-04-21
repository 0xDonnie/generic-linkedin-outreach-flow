# Legitimate Interest Assessment (LIA) — Template

> **Purpose**: give this to a privacy lawyer to draft an executable LIA for your cold outreach campaign. This is a starting template — the lawyer adapts to your specific product, jurisdiction, and risk posture.

> **Not legal advice**. The final LIA must be reviewed and signed by a qualified privacy lawyer in your jurisdiction.

---

## 1. Data Controller

**Company**: {{COMPANY_LEGAL_NAME}}
**Registered address**: {{COMPANY_ADDRESS}}
**Data Protection Officer / Privacy Lead**: {{DPO_EMAIL}}
**Trading name / operating brand**: {{OPERATING_BRAND}}

## 2. Processing activity

**Activity name**: B2B outbound sales communications
**Date range**: {{EFFECTIVE_DATE}} onwards (reviewed annually)
**Volume**: approximately {{DAILY_EMAILS}} emails/day targeting {{MONTHLY_LEADS_TARGET}} unique recipients per month

## 3. Purpose (Step 1 — Purpose test)

We process personal data of professional contacts to:

- Identify decision-makers in target organisations relevant to our product/service
- Introduce our offering ({{PRODUCT_CATEGORY}}) via written communication
- Qualify whether there is a commercial fit and invite interested parties to a product demonstration

### 3.1 Legitimate commercial interest

Our interest is:
- Establishing commercial relationships with businesses that have a genuine need for our {{PRODUCT_CATEGORY}}
- Operating a scalable, efficient customer acquisition function
- Informing potential buyers of a product that addresses a regulatory, operational, or strategic need within their role ({{ICP_ROLES}})

### 3.2 Benefit to data subject

The data subjects (professional contacts in roles such as {{ICP_ROLES}}) benefit from:
- Awareness of solutions that may reduce costs or solve pain points they experience in their role
- Option to engage further, decline, or opt out with a single click
- No behavioural profiling, no unsolicited phone calls, minimal data footprint

## 4. Necessity (Step 2 — Necessity test)

### 4.1 Why is this processing necessary?

Alternatives considered and rejected:

- **Inbound only (content marketing, SEO)**: slower, does not reach professionals who are not actively researching
- **Broadcast advertising**: irrelevant to niche decision-maker audiences, low relevance signal
- **Paid advertising to decision-makers**: feasible but expensive per-qualified-lead, does not address the specific pain conversation we need
- **Event-based outreach**: possible but low volume, high cost per contact

B2B outbound email is the **minimum necessary** intervention to introduce our product to the specific professionals who can evaluate and benefit from it.

### 4.2 Data minimisation

We process only:
- Full name
- Job title and seniority
- Employer / company affiliation
- Business email address
- (Optional) Public LinkedIn profile URL
- Country of professional residence

We do **NOT** process:
- Personal email addresses
- Personal phone numbers
- Personal addresses
- Behavioural tracking or psychographic data
- Special category data (health, religion, etc.)

## 5. Balancing (Step 3 — Balancing test)

### 5.1 Data subject's reasonable expectations

Professionals in the target roles ({{ICP_ROLES}}) can reasonably expect to receive unsolicited commercial communications relevant to their professional responsibilities, particularly where:

- The communication reaches their business (not personal) email
- The sender's identity and purpose are clearly disclosed
- They have an easy opt-out mechanism

We limit processing to the business context where this expectation is well-established.

### 5.2 Potential harms to data subject

Possible negative impacts:
- Time cost of reading an email they don't want (mitigated: ≤ 4 emails per contact, under 100 words each, single-click unsubscribe)
- Feeling of privacy intrusion (mitigated: business address only, no personal data)
- Nuisance from repeated contact (mitigated: strict 4-email cap, immediate stop on reply or unsubscribe)

### 5.3 Mitigating measures

- One-click unsubscribe (RFC 8058 compliant) in every email
- Permanent suppression list — no re-targeting after opt-out
- Suppression list honored across all campaigns and all outbound domains
- Clear sender identity, legal entity, registered address in footer
- Privacy notice URL in every email, accessible without login
- Right to object, access, rectify, erase, restrict, portability respected within 30 days
- Retention limited to 24 months from last interaction, then deletion
- No cross-contact profiling — we do not build behavioural profiles from aggregate recipient behaviour
- No personal data sold or shared outside of GDPR-compliant processor agreements (Brevo, Cloudflare, Apollo)

### 5.4 Conclusion

Our legitimate commercial interest in introducing our {{PRODUCT_CATEGORY}} to appropriate professional contacts **is not overridden** by the interests, rights, and freedoms of the data subjects, provided we maintain the mitigating measures above.

## 6. Data sources

Personal data is collected from:

- **Public regulatory registers**: {{REGISTER_LIST}} (where applicable to the vertical)
- **Company public websites**: role-based email addresses published openly (`info@`, `compliance@`, `legal@`, etc.)
- **Licensed B2B data providers**: Apollo.io, Hunter.io (bound by their respective DPAs)
- **Opt-in databases** (B2C only): {{OPTIN_DB_PROVIDER}} with documented opt-in proof per record

We do **NOT** scrape LinkedIn or other platforms whose Terms of Service prohibit such collection.

## 7. Processors / recipients

Personal data is shared with the following processors, all bound by GDPR Article 28 DPAs:

- **Brevo** (SE, France) — email delivery
- **Cloudflare** (US, with Frankfurt edge) — DNS, email routing, unsubscribe endpoint, web hosting
- **Apollo.io** (US) — data enrichment; SCCs for international transfer
- **Hunter.io** (FR/EU) — email verification
- **Internal CRM** — PostgreSQL database on {{CRM_LOCATION}}
- **{{NOTIFICATION_PROVIDER}}** — internal team notifications only, no recipient data

## 8. International transfers

Where data is transferred outside the European Economic Area (e.g., to US-based processors under SCCs), we rely on:
- Standard Contractual Clauses (EC Decision 2021/914)
- Supplementary measures (TLS encryption in transit, encryption at rest, access controls)
- Transfer impact assessment completed for each processor

## 9. Retention

- **Active outreach data**: 24 months from last interaction, then automated deletion from `leads` table
- **Suppression list**: permanent — email address only, detached from enriched profile, retained indefinitely to ensure ongoing opt-out compliance
- **Campaign metrics**: aggregated, non-identifying form, retained indefinitely for product analytics

## 10. Data subject rights

Data subjects can, at any time:
- Object to processing (right to object — Art. 21) — via one-click unsubscribe or email to DPO
- Access their data (right of access — Art. 15) — via email to DPO
- Request rectification (Art. 16) or erasure (Art. 17)
- Lodge a complaint with their supervisory authority

We respond to all requests within 30 days.

## 11. Review cycle

This LIA is reviewed annually, or on any material change to:
- The target audience / ICP
- The data sources used
- Processor changes
- Legal / regulatory changes in the jurisdictions we operate in

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

Subject: Legitimate Interest Assessment — {{PRODUCT_CATEGORY}} outbound sales

Dear [Lawyer],

I'm setting up an automated B2B / B2C cold email outbound function for {{COMPANY_LEGAL_NAME}} ({{OPERATING_BRAND}}). We're targeting {{ICP_ROLES}} at {{TARGET_COMPANY_TYPE}} across {{GEOGRAPHIES}}.

Volume: ~{{DAILY_EMAILS}} emails/day to ~{{MONTHLY_LEADS_TARGET}} unique recipients/month.

Data sources: {{DATA_SOURCE_SUMMARY}} — all legal sources, no LinkedIn scraping.

Infrastructure: {{INFRASTRUCTURE_SUMMARY}}. One-click unsubscribe (RFC 8058), permanent suppression list, 24-month retention, clear privacy notice, no behavioural tracking.

We'd like a signed Legitimate Interest Assessment (LIA) document covering Article 6(1)(f) GDPR for this processing, with a reference code we can cite in our consent_log and privacy notice.

Attached: our draft LIA template, our privacy notice draft, and a summary of our technical measures.

Timeline: we aim to start warmup within 2 weeks, first real-prospect emails in ~4 weeks.

Cost: please send an estimate. Budget is €500-1500 for the LIA document + one round of revision. Happy to discuss.

Available for a 30-min call this week or next.

Thanks,
{{SENDER_FULL_NAME}}
{{SENDER_TITLE}}, {{COMPANY_LEGAL_NAME}}
{{DPO_EMAIL}}
