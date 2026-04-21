# Gmail App Password — user-guided flow

Google doesn't allow automated generation of App Passwords. This is 100% user-driven.

---

## For the user to do manually

### Prerequisite: 2-Step Verification must be ON

1. Go to https://myaccount.google.com/security
2. Look for "2-Step Verification" — must say "On"
3. If OFF: click it, follow setup wizard (requires phone + SMS code)
4. If new accounts (<24h old): App Passwords may be unavailable even with 2FA on. Wait 24-48h.

### Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. If page says "not available for your account":
   - 2FA isn't fully propagated yet → wait 10 min, retry
   - Or account too new → wait 24h
3. When available:
   - App name: `{{PROJECT_NAME}} n8n IMAP`
   - Click "Create"
   - Google shows 16-char password in format `xxxx xxxx xxxx xxxx`
   - **COPY IMMEDIATELY** — disappears once closed
   - Save in password manager as "{{PROJECT_NAME}} — Gmail App Password for IMAP"

### Report to Claude

Send the password to Claude Code. Claude:
1. Creates "BA Inbox" IMAP credential in n8n (via API)
2. Binds it to workflow 3 (Reply Handler) node "IMAP — new replies"
3. Verifies IMAP connection works

---

## Troubleshooting

**"Setting not available"** after 2FA is on:
- Wait longer. Google sometimes takes 24-72h on very new accounts.
- Alternative: skip IMAP for now. Reply Handler auto-classification is nice-to-have. User can read replies manually in Gmail inbox during warmup + early production.

**Bot account without personal phone**:
- Google requires phone for 2FA. Use a number you control.
- Virtual numbers (Google Voice, Twilio) may or may not work depending on Google's policies.
