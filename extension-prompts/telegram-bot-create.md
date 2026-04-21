# Telegram Bot Setup — Chrome Extension prompt

Telegram bot creation happens primarily in the Telegram app (web.telegram.org or desktop), not in a typical Chrome extension context. Below is a **user-guided flow** — paste as-is to the user (not to Chrome Extension).

---

## For the user to do manually (5 minutes)

Telegram doesn't expose a useful API for creating bots via browser automation, so this is 5 steps of manual clicking. Faster than explaining to Chrome extension.

### Step 1 — Create the bot

1. Open Telegram (app or https://web.telegram.org)
2. Search `@BotFather` (verified user, blue checkmark)
3. Click "Start" or send `/start`
4. Send: `/newbot`
5. When asked for name: `{{PROJECT_NAME}} Notifications` (e.g., "BA Sales Notifications")
6. When asked for username: must end in `bot`. Try:
   - `{{PROJECT_SLUG}}_notifications_bot`
   - `{{PROJECT_SLUG}}_alerts_bot`
   - `{{PROJECT_SLUG}}_sales_bot`
   - If all taken, try variants with underscores or numbers
7. BotFather replies with a **Bot Token** (format: `123456789:ABCdef...` ~45 chars)
8. **COPY THE TOKEN** into a password manager as "{{PROJECT_NAME}} Telegram Bot Token"

### Step 2 — Create the notification group

1. Telegram → New Group
2. Name: `{{PROJECT_NAME}} Notifications` (e.g., "BA Sales Notifications")
3. Add yourself only (you can add teammates later)
4. Create

### Step 3 — Add bot to the group

1. Open the newly created group
2. Tap group name (top) → Members → Add Member
3. Search your bot username (e.g., `{{PROJECT_SLUG}}_notifications_bot`)
4. Add it

### Step 4 — Make bot admin (important — otherwise it can't see messages)

1. Group members list → tap on your bot
2. **Promote to admin**
3. Permissions: leave all default (or uncheck all — admin status alone is enough)
4. Save

### Step 5 — Send one message in the group

Send any message in the group (e.g., "test"). This gives the bot a "last message" visible so we can fetch the chat_id.

### Step 6 — Tell Claude the bot token

Once you have the token (from Step 1), paste it back to Claude Code. Claude will then:
- Call Telegram API `/getUpdates` to extract the chat_id of your group
- Configure `.env` with `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`
- Create "BA Telegram" credential in n8n via API
- Wire it to workflow 3 and workflow 4 notification nodes

Claude will send a test message to the group to verify — you should see something like "Test notification from {{PROJECT_NAME}} setup" in the group chat.

---

## For Claude Code after user confirms

```powershell
# 1. Fetch chat_id
curl.exe -s "https://api.telegram.org/bot{{TOKEN}}/getUpdates" | node -e "..."

# 2. Add to .env
#    TELEGRAM_BOT_TOKEN={{TOKEN}}
#    TELEGRAM_CHAT_ID={{CHAT_ID}}

# 3. Create n8n credential via API (telegramApi type)
# 4. Send test message to verify
curl.exe -s -X POST "https://api.telegram.org/bot{{TOKEN}}/sendMessage" -d "chat_id={{CHAT_ID}}" -d "text=Test from {{PROJECT_NAME}} setup"
```

If chat_id doesn't appear in getUpdates output → bot privacy mode is ON. Tell user to send `/start@botname` in the group, or disable privacy in @BotFather: `/setprivacy` → select bot → Disable.
