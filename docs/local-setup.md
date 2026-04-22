# Local Setup (Windows)

For when Claude is guiding a user through local deployment. **Mandatory for Engine B (LinkedHelper)**, optional-but-common for Engine A (HeyReach) when starting the first campaign.

## Prerequisites

Must be installed on user's Windows 11:

1. **Node.js 20+**
   - https://nodejs.org → Download LTS installer → run it → default options
   - Verify: `node --version` in PowerShell

2. **PostgreSQL 17**
   - https://www.postgresql.org/download/windows/ → EnterpriseDB installer
   - During install: remember the postgres superuser password
   - Leave port default (5432)
   - Skip Stack Builder
   - Verify: `& "C:\Program Files\PostgreSQL\17\bin\psql.exe" --version`

3. **Git for Windows**
   - https://git-scm.com/download/win
   - Default options
   - Verify: `git --version`

4. **PowerShell 7+** (user likely has it already)
   - If not: `winget install Microsoft.PowerShell`

## Add Postgres to PATH (one-time)

PowerShell profile (persists across sessions):

```powershell
# Edit or create your profile
if (-not (Test-Path $PROFILE)) { New-Item -Path $PROFILE -Type File -Force }
notepad $PROFILE
```

Add this line (adjust version if needed):
```powershell
$env:PATH = "C:\Program Files\PostgreSQL\17\bin;" + $env:PATH
```

Save, close, restart PowerShell. Now `psql`, `createdb`, `pg_dump` work without full path.

## Setup database

```powershell
cd D:\GitHub\<project>
$env:PGPASSWORD = "YOUR-POSTGRES-INSTALLATION-PASSWORD"
createdb -U postgres <project_db_name>
psql -U postgres -d <project_db_name> -f database/schema.sql
psql -U postgres -d <project_db_name> -c "\dt"
```

Should show 7 tables: leads, suppression_list, consent_log, campaigns, campaign_emails, email_replies, demo_bookings.

## Install project dependencies

```powershell
cd D:\GitHub\<project>
npm install
```

## Run n8n

```powershell
.\scripts\powershell\start-n8n.ps1
```

This:
1. Kills any existing n8n on port 5678
2. Loads all env vars from `.env`
3. Launches n8n via npx on port 5678

Wait ~30 sec, then browser → http://localhost:5678. First time: create owner account.

## Cons of local mode

- PC must be on when campaigns run (cron fires hourly during business hours)
- If you close PowerShell window, n8n dies (use "npx n8n start" as Windows service via NSSM if you want it to persist — advanced)
- No team access from other machines
- No HTTPS (localhost only)
- Webhooks from Cal.com / external services can't reach you without tunneling (ngrok) — use VPS mode for that

## When to migrate to VPS

Migrate to VPS when ONE of these:

- You've validated your messaging (>5% reply rate in first warmup)
- You're about to hit production volume (>50 emails/day sustained)
- You bring in a team member who needs access
- Your Cal.com / Otter webhooks need to work automatically

Migration time: 2-3 hours with Claude Code. See `docs/vps-setup.md`.

## Windows quirks to know

- **`curl` vs `curl.exe`**: in PowerShell, `curl` is an alias for `Invoke-WebRequest` (slow, confirms every request). For real curl behavior use `curl.exe`.
- **Paths**: use `D:\...\...` style, not `/d/...`. Forward slashes in `package.json` scripts are OK (Node handles).
- **Line endings**: git default autoCRLF converts. Usually fine, occasional issues with shell scripts — stick to PowerShell.
- **Port 5678 conflicts**: if Docker Desktop or another tool is using it, n8n won't start. Kill the other process first.

## Common local-mode operations

### See how many emails sent today
```powershell
$env:PGPASSWORD = "YOUR-PASSWORD"
psql -U postgres -d <db> -c "SELECT count(*) FROM campaign_emails WHERE sent_at::date = CURRENT_DATE;"
```

### Send one test email
```powershell
node scripts/node/test-send-one.mjs --to <your-gmail>@gmail.com
```

### Manually sync unsubscribes (normally cron'd)
```powershell
node scripts/node/sync-unsubscribes.mjs
```

### Restart n8n (after env change)
```powershell
.\scripts\powershell\start-n8n.ps1
```

## Uninstall / cleanup

```powershell
# Stop n8n
$pid_n8n = (Get-NetTCPConnection -LocalPort 5678 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($pid_n8n) { Stop-Process -Id $pid_n8n -Force }

# Drop database
$env:PGPASSWORD = "YOUR-PASSWORD"
dropdb -U postgres <project_db_name>

# Remove project folder
Remove-Item -Recurse -Force D:\GitHub\<project>
```
