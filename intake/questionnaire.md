# Intake Questionnaire

> **For Claude**: Ask these questions conversationally, in groups of 2-3 — not all 10 at once. After the user answers all, compile `intake/answers.md` with their responses and show a generated checklist of what you'll build. Get "go" before executing.

> **Tone**: friendly, decisive, Italian unless they're writing in English. Don't lecture. If a question's answer is obvious from context, skip it and state what you're assuming.

---

## The 10 questions

### 1. Product / service

> "Cosa vendi? Descrivimi in 2-3 frasi cosa offri, a chi, e qual è il pain point principale che risolvi."

Capture:
- Product name / brand
- Category (SaaS / services / luxury goods / compliance tool / etc.)
- Main pain it solves
- Average deal size (if user mentions) — helps size warmup pace later

### 2. B2B or B2C

> "Vendi ad aziende (B2B) o direttamente a consumatori privati (B2C)?"

Critical for legal branch:
- **B2B** → legitimate interest GDPR (Art. 6(1)(f)) works, standard flow
- **B2C** → cold email to consumer emails in EU is BLOCKED by ePrivacy. Must use:
  - (a) opt-in database purchase (legal in IT/FR/ES if provider attests opt-in)
  - (b) skip EU consumers, target only US / UAE / non-ePrivacy countries
  - (c) pivot to paid ads instead of cold email

If B2C, **explain this tradeoff to the user** before they answer Q3.

### 3. Target ICP — job titles

> "Chi è la persona giusta da contattare dentro le aziende target?"

Examples to give depending on product:
- SaaS compliance → MLRO, Head of Compliance, CCO, DPO
- Legal services → General Counsel, Head of Legal, CEO (small firms)
- Marketing services → CMO, Head of Growth, Founder (startups)
- Luxury goods B2B (retailers) → Buyer, Head of Procurement, CEO
- Luxury goods B2C → ⚠️ return to Q2, this is B2C

Let user list 3-8 titles. If >8 it's too broad — ask to narrow.

### 4. Target ICP — companies / industries

> "Che tipo di aziende? Dimmi: settore, dimensione (dipendenti), geografia."

Capture:
- Industry / vertical
- Employee range (e.g., 11-200, 50-1000)
- Countries / regions
- Any exclusions (e.g., "no competitors", "no public companies")

If regulated industry (fintech crypto, pharma, gambling, aerospace):
- Flag it — there are probably public registers we can scrape
- Ask user: "Sai se c'è un registro pubblico del settore? Es. ESMA per crypto EU, FCA per fintech UK, CAA per aerospace, ecc."

### 5. Geography / jurisdictions

> "In quali paesi / aree geografiche sono i tuoi target?"

Capture top 5 countries. This determines:
- Which data sources to use (EU registers vs UK vs US)
- Which legal frameworks apply (GDPR, CCPA, PECR, PDPA)
- Time zones for send windows
- Languages for template localization (if user wants multi-lang)

### 6. Volume goal

> "Quante email vuoi mandare al giorno a regime? E quante demo / meeting vorresti prenotare al mese?"

Capture:
- Target emails/day (guide: 50-500)
- Target demos/month (guide: 20-100)

Use this to:
- Choose SMTP provider tier (Brevo free 300/day vs paid)
- Number of outbound domains (1-10)
- Warmup duration (shorter for lower volume targets)

### 7. Deployment mode

> "Local (gira sul tuo PC, semplice ma serve PC acceso 24/7 quando sei in campagna) o VPS (€4.50/mese Hetzner, gira sempre, accessibile da team)?"

Default: **Local** for user's first campaign. Migration path to VPS is documented and takes 2-3 hours later.

If user has team of 2+ → suggest VPS directly.

### 8. Notification channel

> "Come vuoi ricevere notifiche di reply positive / demo prenotate? Telegram o Slack?"

Default: **Telegram** (zero-setup, free forever, phone-friendly).
Slack only if user already uses it as a team.

### 9. Demo transcription

> "Vuoi che le tue demo call siano auto-trascritte così hai summary + action items dopo ogni call? (Gratis)"

Options:
- **Otter.ai** (default) — 300 min/mese free, auto-join via Google Calendar, email transcripts
- **Tactiq** — unlimited free ma Chrome extension only (Google Meet), user clicks "Start" a ogni call
- **Skip** — non interessato

### 10. Sender identity

> "Chi firma le email? Voglio: nome completo, titolo/ruolo, email di default (se ne hai già una)."

Capture:
- Sender first name (es. "Bob")
- Sender full name (es. "Bob Natividad")
- Sender title (es. "Head of Sales")
- Company legal name (es. "Aletheia Tech LTD")
- Registered address (es. "London, UK")
- DPO / privacy contact email (es. "privacy@company.io")
- Calendar URL (Cal.com / Calendly if exists, else "da creare")

---

## After all 10 answered

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

## Volume
- Target emails/day: N
- Target demos/month: N

## Infrastructure choices
- Deployment: local | VPS
- Notifications: Telegram | Slack
- Transcription: Otter | Tactiq | skip
- Domain count: N (1-10)

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

Then generate the execution checklist — see `guides/claude-playbook.md` for the full order of operations.
