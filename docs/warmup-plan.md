# Warmup Plan — 21 days

Mandatory gradual ramp from 5 to 50 emails/day per domain. Non-negotiable — skipping warmup permanently ruins domain reputation.

## Pre-warmup checklist

- [ ] All outbound domains have DKIM/SPF/DMARC green on Brevo
- [ ] Privacy notice live at `privacy.<primary-outbound-domain>`
- [ ] Unsubscribe endpoint live at `unsubscribe.<primary-outbound-domain>`
- [ ] LIA signed (reference code in `consent_log.lia_ref`)
- [ ] All 5 domains registered on Google Postmaster Tools
- [ ] Baseline https://www.mail-tester.com score ≥ 9/10 on first test send from each domain
- [ ] Internal "warmup tribe" ready: 3-4 mailboxes willing to reply to internal test emails, mark not-spam, star them. Bob + 2-3 colleagues with different email providers (1 Gmail, 1 Outlook, 1 ProtonMail/Yahoo).

## Daily volume per domain

| Day | Internal tribe | Real prospects | Total per domain | Total system (5 domains) |
|-----|---|---|---|---|
| 1 (Mon) | 2 | 0 | 2 | 10 |
| 2 (Tue) | 3 | 0 | 3 | 15 |
| 3 (Wed) | 2 | 1 | 3 | 15 |
| 4 (Thu) | 2 | 2 | 4 | 20 |
| 5 (Fri) | 2 | 3 | 5 | 25 |
| 6-7 (Sat-Sun) | 0 | 0 | 0 | 0 (pause) |
| 8 (Mon) | 2 | 4 | 6 | 30 |
| 9 (Tue) | 2 | 5 | 7 | 35 |
| 10 (Wed) | 2 | 6 | 8 | 40 |
| 11 (Thu) | 2 | 7 | 9 | 45 |
| 12 (Fri) | 1 | 8 | 9 | 45 |
| 13-14 (Sat-Sun) | 0 | 0 | 0 | 0 |
| 15 (Mon) | 1 | 10 | 11 | 55 |
| 16 (Tue) | 1 | 14 | 15 | 75 |
| 17 (Wed) | 0 | 18 | 18 | 90 |
| 18 (Thu) | 0 | 25 | 25 | 125 |
| 19 (Fri) | 0 | 35 | 35 | 175 |
| 20-21 (Sat-Sun) | 0 | 0 | 0 | 0 |
| 22+ (regime) | 0 | 50 | 50 | 250 |

Total emails over warmup: ~500 internal replies + ~180 cold prospects.

## Send windows

- **Monday-Friday only** (recipient inboxes are quieter weekends, engagement drops)
- **09:00-17:00 recipient local time** (use `leads.country` to derive timezone via LIB)
- **One email every ~12 min** per domain (50/day ÷ 7 hours = ~7/hour)
- n8n cron fires every 12 min during 09:00-17:00 UTC by default (adjust based on top-country skew)

## Daily checks (5-min routine)

Every send day, first thing in the morning:

### 1. Postmaster Tools
Go to https://postmaster.google.com
- Spam rate: MUST be < 0.3% per domain
- Domain reputation: High or Medium is fine, Low is stop-everything
- IP reputation: High always

### 2. Brevo dashboard
- Bounce rate yesterday: MUST be < 5%
- Open rate: 30-50% is healthy for cold B2B
- No "account under review" notices

### 3. DMARC reports
- Go to your Brevo dashboard → DMARC reports (arrive at rua@dmarc.brevo.com — forwarded to your inbox)
- Any forensic failures (real recipients reporting as spam)? Investigate.

### 4. Quick SQL check
```powershell
$env:PGPASSWORD = "..."
psql -U postgres -d <db> -c "
  SELECT
    campaign_id,
    count(*) AS sent_yesterday,
    count(*) FILTER (WHERE status = 'bounced') AS bounces,
    round(100.0 * count(*) FILTER (WHERE status = 'bounced') / count(*), 2) AS bounce_pct
  FROM campaign_emails
  WHERE sent_at::date = CURRENT_DATE - 1
  GROUP BY campaign_id;
"
```

## Weekly checks (Monday morning)

1. **Mail-tester.com score**: one test send from each domain → score must stay ≥ 9/10
2. **DMARC report review**: check rua@dmarc.brevo.com for aggregate reports
3. **Reply rate trend**: should be trending 3-5% week 1, 5-10% week 2, 8-15% week 3+
4. **Suppression list growth**: normal, 1-3% of sends should unsubscribe — higher means message is bad

## Stop conditions (pause all sends immediately)

| Signal | Action |
|---|---|
| Mail-tester < 8/10 | Pause all domains, investigate DNS / content issue |
| Postmaster spam rate > 0.3% on any domain | Pause that domain, reduce volume 50% next day |
| Bounce rate > 5% in 24h | Pause, clean list (validate emails via Hunter), resume after cleanup |
| DMARC forensic failures from real recipients | Immediate pause, investigate spoofing |
| Reply rate < 0.5% for 3 consecutive days | Pause, rewrite template |
| Brevo sends "account under review" email | Pause EVERYTHING, reply to Brevo with LIA + suppression list + GDPR compliance docs |
| DPA (Garante, ICO, CNIL...) contacts you | Pause EVERYTHING, call privacy lawyer, respond within 30 days |

## How to pause the system

### Pause via n8n UI
- Open workflow 2 (Email Campaign) → top-right toggle to Inactive
- Real-time stop, new emails won't be sent

### Full system stop (nuclear)
```powershell
# Local mode
$pid_n8n = (Get-NetTCPConnection -LocalPort 5678 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($pid_n8n) { Stop-Process -Id $pid_n8n -Force }

# VPS mode
ssh giorgio@<VPS> "cd /opt/<project> && docker compose down"
```

## Day 22 — production launch checklist

- [ ] DMARC `p=none` → switch to `p=quarantine; pct=25` (gradual)
- [ ] Set `DAILY_EMAIL_LIMIT=50` per domain
- [ ] Activate cron on workflow 2
- [ ] Activate workflow 3 (reply handler) if not already
- [ ] Verify workflow 4 (Cal.com webhook) receives events
- [ ] Create new campaign row in DB:
  ```sql
  INSERT INTO campaigns (name, start_date, status)
  VALUES ('Q2 2026 ICP', CURRENT_DATE, 'active') RETURNING id;
  ```
- [ ] Set `ACTIVE_CAMPAIGN_ID` env var to the returned UUID

## Common warmup mistakes (don't)

1. ❌ Skip weekends → destroys linearity Gmail learns
2. ❌ Send same template body verbatim 50+ times → providers fingerprint duplicates
3. ❌ Use `noreply@` or `no-reply@` → looks bulk, lowers trust
4. ❌ Skip the friendly tribe → those replies are what TRAINS reputation
5. ❌ Add tracking pixels in warmup → visible to image-blocking clients = "bulk sender" signal
6. ❌ Big volume jump (from 5 to 25 in one day) → stretches trust too fast
7. ❌ Ignore spam rate "just a bit above 0.3%" → by the time you notice, reputation is gone
8. ❌ Hit Monday 9am hard with 50 emails → spread across business hours
