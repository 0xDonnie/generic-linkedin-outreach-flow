# Intake Questionnaire

> **For Claude**: Ask these questions conversationally, in groups of 2-3 — not all at once. After the user answers all, compile `intake/answers.md` with their responses and show a generated checklist. Get "go" before executing.

> **Tone**: friendly, decisive, Italian unless they're writing in English. Don't lecture. If an answer is obvious from context, skip the question and state what you're assuming.

---

## The 11 questions

### 1. Product / service

> "Cosa vendi? Descrivimi in 2-3 frasi cosa offri, a chi, e qual è il pain point principale che risolvi."

Capture:
- Product name / brand
- Category (SaaS / services / consulting / compliance tool / etc.)
- Main pain it solves
- Average deal size (if user mentions) — helps size volume expectations later

### 2. B2B or B2C

> "Vendi ad aziende (B2B) o direttamente a consumatori privati (B2C)?"

Critical for legal branch. Note: **LinkedIn is primarily a B2B channel**. If user says B2C:
- LinkedIn is a bad channel for most B2C (consumers don't expect sales DMs on LinkedIn)
- Legally, LinkedIn DMs to B2C in EU/UK are as restricted as emails under ePrivacy — channel change doesn't bypass consent requirements
- Suggest user reconsider: paid ads, newsletter opt-in, platform-native channels (Instagram DMs for some products)

Only proceed with B2C LinkedIn if user is selling something that has legitimate B2C-on-LinkedIn market (rare — coaching, career services, financial advisory to executives, luxury services to HNWIs) AND target is OUTSIDE EU/UK (US, UAE, etc.).

### 3. LinkedIn account status — ENGINE ROUTING

> "Che LinkedIn account userai per questa campagna? (a) Un mio account consolidato, >=1 anno, >500 connessioni, con storico di post e attività; (b) Un account nuovo che creerò apposta, o recente (<3 mesi), o da zero."

This determines which **engine** the framework configures:

- **(a) Established account** → `LINKEDIN_ENGINE=heyreach`. Cloud SaaS, API-driven, PC off is fine. ~$79/mo.
- **(b) New / burner account** → `LINKEDIN_ENGINE=linkedhelper`. Chrome extension running on user's PC, uses real session + real residential IP. Safer for fresh accounts but PC must be on during send windows. ~$15-45/mo.

If user says "ho un account vecchio ma preferisco fare campagna con uno nuovo perché il mio brand attuale non matcha" → route to (b) and note the persona/brand mismatch as campaign context.

If user is unsure → ask: "Il tuo profilo LinkedIn attuale sarebbe credibile come venditore di [prodotto]? Se il tuo titolo e la tua bio non sono coerenti con quello che vuoi vendere, crea un account nuovo."

**Explain tradeoff briefly** before user commits, unless they already show strong preference.

### 4. Target ICP — job titles

> "Chi è la persona giusta da contattare? (ruolo / titolo)"

Examples to give depending on product:
- SaaS compliance → MLRO, Head of Compliance, CCO, DPO
- Dev tools → CTO, VP Engineering, Head of Platform
- Marketing services → CMO, Head of Growth, Founder
- B2B SaaS to finance → CFO, VP Finance, FP&A lead

Let user list 3-8 titles. If >8 it's too broad — ask to narrow.

### 5. Target ICP — companies / industries

> "Che tipo di aziende? Settore, dimensione (dipendenti), geografia."

Capture:
- Industry / vertical
- Employee range (e.g., 11-200, 50-1000)
- Countries / regions
- Any exclusions (e.g., "no competitors", "no public companies")

If regulated industry (crypto, pharma, gambling, aerospace):
- Ask: "C'è un registro pubblico? Es. ESMA per crypto EU, FCA per fintech UK, CAA per aerospace"
- If yes, we can scrape it + match on LinkedIn via Apollo for contact enrichment.

### 6. Geography / jurisdictions

> "In quali paesi / aree geografiche sono i tuoi target?"

Capture top 5 countries. Determines:
- Legal framework (GDPR+ePrivacy vs CASL vs CAN-SPAM vs UAE)
- Time zones for send windows
- Languages for template localization (if user wants)

**LinkedIn-specific note**: LinkedIn presence is uneven by country. Strong in US/UK/DE/FR/NL/IT/SG/UAE/AU; weaker in JP/CN/RU (where local platforms dominate).

### 7. Volume goal

> "Quante connection request + DM vuoi mandare al giorno a regime? E quante demo / meeting vorresti prenotare al mese?"

Capture:
- Target connection requests/day (guide: 15-25 per account, cap at 100/week)
- Target demos/month (guide: 5-20 per single account)

Use this to:
- Confirm engine choice (if user wants >50 conn/day, they need multi-account → HeyReach + multi-seat plan)
- Size warmup ramp
- Set `DAILY_LI_CONNECTION_LIMIT` and `DAILY_LI_MESSAGE_LIMIT`

**Reality check**: single LinkedIn account realistically produces ~5-10 demos/month at cruise. If user targets >20/month, they need 2-3 accounts. Set expectations.

### 8. Deployment mode

Skip this question if Engine B (LinkedHelper) — forced to Local.

For Engine A (HeyReach):
> "Local (n8n gira sul tuo PC, semplice ma serve PC acceso quando vuoi che n8n orchestri) o VPS (€4.50/mese Hetzner, gira sempre, accessibile da team)? Nota: HeyReach stessa è sempre cloud, la scelta qui è solo per n8n."

Default: **Local** for first campaign. Migration path to VPS is documented.

### 9. Notification channel

> "Come vuoi ricevere notifiche di reply positive / demo prenotate? Telegram o Slack?"

Default: **Telegram**. Slack only if user already uses it as a team.

### 10. Demo transcription

> "Vuoi auto-trascrivere le demo call? (Gratis)"

Options:
- **Otter.ai** (default) — 300 min/mese free, auto-join via Google Calendar
- **Tactiq** — unlimited free ma Chrome ext only (Google Meet)
- **Skip** — non interessato

### 11. Sender identity

> "Chi firma i messaggi? Voglio: nome, titolo/ruolo, URL profilo LinkedIn che userai, email privacy/DPO, URL calendario (Cal.com se esiste già)."

Capture:
- Sender first name
- Sender full name
- Sender title
- Company legal name
- Registered address
- DPO / privacy contact email
- **LinkedIn profile URL (critical — engine drives this account)**
- Calendar URL (Cal.com / Calendly if exists, else "da creare")

If user chose Engine B and account doesn't exist yet → note this as a blocker. Setup order will be: create LinkedIn account → profile optimization → organic warmup (2-3 weeks) → THEN outbound infra.

---

## After all answered

Compile `intake/answers.md` (Claude creates this) in this format:

```markdown
# Intake answers — [PROJECT_NAME] — [DATE]

## Product
- Brand: ...
- Category: ...
- Pain solved: ...
- Average deal size: ...

## Audience model
- Type: B2B | B2C
- ICP job titles: [...]
- ICP companies: ...
- Employee range: ...
- Geography: [...]
- Regulated industry: yes/no — registers available: [...]

## LinkedIn account
- Status: established | new
- Engine: heyreach | linkedhelper
- Sender profile URL: ... (existing | to-be-created)
- Persona/brand note: [if applicable, why new account]

## Volume
- Target connection requests/day: N (cap 25)
- Target demos/month: N

## Infrastructure choices
- Deployment: local | VPS   (VPS only valid for engine=heyreach)
- Notifications: Telegram | Slack
- Transcription: Otter | Tactiq | skip

## Sender
- First name: ...
- Full name: ...
- Title: ...
- Company legal name: ...
- Registered address: ...
- Privacy email: ...
- Calendar URL: ... (to be created | existing)

## Legal
- Primary jurisdiction: ...
- Other affected: [...]
- LIA status: not started | in progress | signed
- LIA reference code: ...
```

Then generate the execution checklist — see `guides/claude-playbook.md` for the full order of operations. Engine choice flips several steps (HeyReach signup vs LinkedHelper install).
