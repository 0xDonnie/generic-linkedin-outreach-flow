# Template variables

These placeholders are replaced by n8n workflow 2 (`Function — render template`) at send time.

## Lead-derived (from `leads` + `contactable_leads` view)

- `{{firstName}}` — first word of `contact_name`
- `{{fullName}}` — full `contact_name`
- `{{title}}` — lead's job title
- `{{company}}` — lead's `company_name`

## Sender-derived (from `.env`)

- `{{senderFirstName}}` — SENDER_FIRST_NAME
- `{{senderFullName}}` — SENDER_FULL_NAME
- `{{senderTitle}}` — SENDER_TITLE
- `{{senderCompany}}` — SENDER_COMPANY
- `{{calendarUrl}}` — SENDER_CALENDAR_URL

## Product-derived (from `.env`, filled at intake)

- `{{productPitch}}` — PRODUCT_PITCH
- `{{connectionNoteHook}}` — CONNECTION_NOTE_HOOK (custom one-liner for the 300-char invite note)
- `{{firstMessageHook}}` — FIRST_MESSAGE_HOOK (custom opener for the first DM after accepting)
- `{{privacyNoticeUrl}}` — PRIVACY_NOTICE_URL

## Length limits (LinkedIn enforced)

| Template | Max characters | Notes |
|---|---|---|
| `connection-note.txt` | **300** | LinkedIn strictly caps invite notes. Go to 250 for safety. |
| `first-message.txt` | ~2000 (soft) | Hard cap 8000 but DMs > 1500 get ignored |
| `follow-up-1.txt` | ~1500 | Shorter than first — already has context |
| `follow-up-2.txt` | ~800 | Final touch; be blunt + polite |

## Plain text only

LinkedIn DMs do NOT support HTML. No bold, no italics, no links styled. Plain URLs render as clickable but keep them short. Use line breaks for structure.

## Legal minimum content

**First message** (not invite note — too short) MUST include:
- Who you are + company
- Legal basis 1-liner (e.g. "Ti ho scritto perché il tuo ruolo è pubblicamente identificabile come [ICP] nella mia lista LIA")
- Privacy notice link (`{{privacyNoticeUrl}}`)
- How to opt out ("Rispondi STOP se preferisci non ricevere altri messaggi")

These four MUST be in the first DM. Not needed in the 300-char invite note (too short; GDPR art. 14 allows later-in-interaction disclosure for legitimate interest contact when info is not collected from data subject directly).
