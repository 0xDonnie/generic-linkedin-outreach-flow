# Troubleshooting

Common issues Claude Code will hit during setup + user ops, and how to fix them.

## Setup issues

### `psql: command not found`

PostgreSQL installed but not in PATH.

**Fix (local Windows)**:
```powershell
$env:PATH = "C:\Program Files\PostgreSQL\17\bin;" + $env:PATH
```

For persistence, add to `$PROFILE`. See `docs/local-setup.md`.

**Fix (VPS)**:
```bash
sudo apt install -y postgresql-client
```

### `createdb: could not connect: peer authentication failed`

Postgres on Ubuntu requires user mapping.

**Fix**:
```bash
sudo -u postgres createdb <db-name>
sudo -u postgres psql -d <db-name> -f database/schema.sql
```

### `n8n: port 5678 already in use`

Another n8n / conflicting service running.

**Fix**:
```powershell
$p = (Get-NetTCPConnection -LocalPort 5678 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($p) { Stop-Process -Id $p -Force; "Killed PID $p" }
```

Or the `scripts/powershell/start-n8n.ps1` script does this automatically.

### `docker: permission denied on /var/run/docker.sock`

User not in docker group yet.

**Fix**:
```bash
sudo usermod -aG docker $USER
# Log out + back in (group membership takes effect on new session)
exit
```

## DNS issues

### Brevo says "Domain not authenticated" after adding records

DNS propagation delay. Wait 30-60 seconds, retry Brevo verify button.

If still failing after 5 min:
```bash
# Check DNS is actually set
dig TXT ba-compliance.com
dig CNAME brevo1._domainkey.ba-compliance.com
```

If records don't show via `dig`, they weren't saved on Cloudflare — retry via Cloudflare API.

### Cloudflare proxy (orange cloud) breaking email verification

Brevo / Postmaster verification needs direct DNS access. Orange cloud = Cloudflare proxy = breaks this.

**Fix**: Cloudflare DNS → the specific record → click orange cloud icon → turn to gray (DNS only).

### DMARC reports not arriving

Brevo forwards to `rua@dmarc.brevo.com`, then you access them in Brevo dashboard → DMARC. If Brevo doesn't show them:
- Check your DMARC record exactly matches: `v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com`
- Wait 24h — reports arrive once per day from most receivers

## n8n issues

### Workflow activated but webhook returns 404

Known bug when workflow imported via API without `webhookId` field on webhook nodes.

**Fix**: update the webhook node in the workflow JSON to include a stable UUID in `webhookId`:
```json
{
  "type": "n8n-nodes-base.webhook",
  "parameters": {...},
  "webhookId": "some-unique-identifier-here"
}
```

Then PUT the updated workflow via API. Deactivate + activate, container restart if needed.

### Credential creation via API fails with schema errors

n8n public API credential creation has inconsistent schema requirements across types. Postgres often fails.

**Fix**: create the credential via the n8n UI (3 clicks in Credentials → Create), get the credential ID from the URL, then use `scripts/powershell/bind-credentials-to-workflows.ps1` to wire it to workflow nodes via API (which works reliably).

### `Received request for unknown webhook` in n8n logs

Workflow is active in DB but webhook router didn't register it. Usually fixed by:
1. Deactivate + activate via UI (not API)
2. Container restart: `docker compose restart` (VPS) or restart `npx n8n` (local)
3. If still broken: delete workflow + re-import with `webhookId` field present

### Postgres node in workflow fails with "no parameter $1"

n8n Postgres v2 `executeQuery` has inconsistent `queryParams` format across versions.

**Fix**: switch to inline expressions in the query:
```
=INSERT INTO ... VALUES ('{{$json.email}}', '{{$json.starts_at}}'::timestamptz, ...)
```

The `=` prefix makes query an n8n expression, `{{}}` substitution happens before send. Works on all versions.

### IMAP credential fails with "Authentication failed"

Usually: Gmail App Password wrong or revoked.

**Fix**:
1. Go to https://myaccount.google.com/apppasswords
2. Revoke old key, generate new one
3. Update n8n credential with new 16-char password (spaces optional)

If App Password page says "not available": 2FA not fully active, OR account <24h old. Wait, retry.

## Email deliverability issues

### Mail arrives in "Promotions" tab, not Inbox

Normal for first sends from new domain. User trains Gmail by:
1. Drag email to Primary tab
2. "Do this for future messages from sender?" → Yes

After 3-5 training interactions, Gmail learns.

To improve placement broadly:
- Remove `List-Unsubscribe` header **during warmup** (adds trust signal that reads as bulk)
- Add it back **at production**
- Avoid tracking pixels
- Keep subject < 60 chars, no caps / emojis / $$
- 4-7 line body max

### Mail arrives in Spam

Big red flag. Debug:
1. Click "Show original" → check SPF/DKIM/DMARC all PASS
2. Run https://www.mail-tester.com test → score ≥ 9/10 required
3. Check domain reputation on Google Postmaster
4. If one domain bad, remove from rotation, investigate separately

### Bounce rate > 5%

Data quality issue. Apollo email reveal isn't 100% accurate.

**Fix**:
1. Run Hunter.io email verifier on your list
2. Remove bounces from `leads` table (mark as suppressed)
3. Going forward: enable Apollo + Hunter cross-check before inserting into leads

## User flow issues

### "I don't know my ICP"

Open `docs/apollo-icp-brainstorm.md` with user, walk through the 5 lenses. Propose 2-3 concrete ICPs. Let user pick.

### "Can I skip LIA?"

No. Cold email without LIA = illegal in EU. If the user pushes back:
- Explain GDPR Art. 6(1)(f) requirement
- Point to `legal/compliance-by-jurisdiction.md`
- If they still insist → refuse. Risk to their business is not worth it.

### "Can I use my main company domain as outbound?"

Don't. Main brand domain reputation is expensive to build. Cold outreach risks getting it flagged.
Use dedicated outbound subdomains (e.g., `ba-compliance.com` for sending, `blockchainanalysis.io` stays clean for transactional / marketing).

### "Can I scrape LinkedIn for more leads?"

Absolutely not. Violates ToS + GDPR + credibility risk (especially if user sells compliance). Use Apollo / Hunter / licensed databases only. See CLAUDE.md non-negotiable #3.

### "Can I send 500 emails/day on day 1?"

No, warmup is 21 days minimum. Skipping = permanent domain blacklist. Not negotiable. See `docs/warmup-plan.md`.

## Infrastructure issues

### VPS ran out of disk

```bash
ssh giorgio@<VPS>
df -h
# If /opt is full, clean Docker
docker system prune -a
# Or logs
sudo journalctl --vacuum-time=7d
```

### Postgres connection lost / queries slow

```bash
ssh giorgio@<VPS>
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

### Cloudflare Worker not receiving unsubscribe clicks

1. Verify custom domain mapped: Workers & Pages → worker → Settings → Triggers → Custom Domains
2. Verify DNS: `dig unsubscribe.<domain>` should return Worker IP
3. Test direct: `curl -i https://unsubscribe.<domain>/unsubscribe/test-token`

### Cal.com webhook not firing

1. Cal.com → Settings → Developer → Webhooks → edit your webhook → click "Ping test" → should 200
2. If 404: your n8n production webhook URL isn't registered yet
3. Deactivate + reactivate workflow 4 in n8n UI, test again

## Support contacts

- Brevo: support@brevo.com (slow, 24-48h)
- Apollo: help@apollo.io (usually good, 4-12h)
- Cloudflare: Community Discord or https://community.cloudflare.com (fast)
- Hetzner: support@hetzner.com (slow, 24-72h — prefer reboot-first)
- n8n: community forum https://community.n8n.io (very active, 1-6h)
