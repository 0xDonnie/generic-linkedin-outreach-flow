# Email template variables

Complete reference for variables used across all email templates. Claude Code substitutes these at intake-time or per-lead-render-time.

## Intake-time variables (set once, in `.env`)

| Variable | Source | Example |
|---|---|---|
| `{{sender.first_name}}` | Intake Q10 | "Bob" |
| `{{sender.full_name}}` | Intake Q10 | "Bob Natividad" |
| `{{sender.title}}` | Intake Q10 | "Head of Sales" |
| `{{sender.company}}` | Intake Q1 (brand) | "BlockchainAnalysis.io" |
| `{{sender.calendar_url}}` | Cal.com signup | "https://cal.com/bademo/intro" |
| `{{compliance.company_legal_name}}` | Intake Q10 | "Aletheia Tech LTD" |
| `{{compliance.company_address}}` | Intake Q10 | "London, United Kingdom" |
| `{{compliance.dpo_email}}` | Intake Q10 | "privacy@blockchainanalysis.io" |
| `{{compliance.privacy_url}}` | Deploy Cloudflare Pages | "https://privacy.ba-compliance.com" |
| `{{compliance.unsubscribe_url}}` | Deploy Worker | "https://unsubscribe.ba-compliance.com/unsubscribe" (per-lead token appended) |
| `{{PRODUCT_CATEGORY}}` | Intake Q1 | "compliance product" / "marketing service" / "luxury goods" |
| `{{PRODUCT_PITCH_2_LINES}}` | Intake Q1 | "We help compliance teams avoid $X/year on legacy vendors." |
| `{{BENEFIT_1/2/3}}` | Intake Q1 | "Travel Rule IVMS101 coverage" |
| `{{CLOSING_DIFFERENTIATOR}}` | Intake Q1 | "Our pricing comes in around a third of incumbents." |
| `{{LEGITIMATE_INTEREST_JUSTIFICATION}}` | Intake Q2/Q4 | "is publicly registered as a MiCA CASP" (regulated) / "operates in the [industry] sector in [geo]" (non-regulated) |

## Per-lead variables (rendered per send)

| Variable | Source | Example |
|---|---|---|
| `{{contact_name}}` | `leads.contact_name` (first name only) | "Martina" |
| `{{company_name}}` | `leads.company_name` | "RELAI EU SASU" |
| `{{country}}` | `leads.country` | "France" |
| `{{compliance_framework}}` | Derived from country | "MiCA" (EU) / "FCA" (UK) / "VARA" (UAE) / "MAS" (SG) / null (non-regulated) |
| `{{HOOK_SUBJECT}}` | Template variant | `"MiCA compliance for {{company_name}} — 15 min?"` |
| `{{OPENING_LINE_PERSONALIZED}}` | Template | `"I saw {{company_name}} is registered as a CASP under {{compliance_framework}} in {{country}}."` |

## Template variants

Claude Code stores 2-3 variants of `cold-outreach` for A/B testing:
- `cold-outreach-v1.md` — direct, compliance-angle
- `cold-outreach-v2.md` — consultative, cost-saving angle
- `cold-outreach-v3.md` — question-based, curiosity hook

User picks which to use or A/B test. Track in `campaign_emails.template_used`.

## Fill-in flow

At intake:
1. Claude asks Q1 (product). User describes.
2. Claude extracts: PRODUCT_CATEGORY (1 word), PITCH_2_LINES, BENEFIT_1/2/3, CLOSING_DIFFERENTIATOR.
3. Proposes filled template back to user for approval. Iterates if user says "too generic" / "change tone".
4. Saves final into `templates/email-templates/cold-outreach-v1.md` (overwrites the placeholder template).

For the `LEGITIMATE_INTEREST_JUSTIFICATION`:
- **Regulated industry + public register**: "is publicly registered as a [FRAMEWORK] [CATEGORY]" (e.g., "MiCA CASP")
- **Non-regulated**: "operates in [INDUSTRY] in [GEO]" (e.g., "luxury retail in Italy")
- **B2C with opt-in purchase**: "subscribed to [SOURCE] opt-in marketing database"
