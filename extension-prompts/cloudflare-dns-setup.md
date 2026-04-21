# Cloudflare DNS Setup

⚠️ **For Claude Code**: DNS record addition should be done via **Cloudflare API**, not the extension. This file documents the API approach + has a fallback extension prompt for emergencies.

## Preferred: API approach (Claude Code autonomous)

Claude Code has a Cloudflare API token (set during initial setup). For each domain, Claude runs:

```bash
CF_TOKEN="{{CF_API_TOKEN}}"
ZONE_ID=$(curl -s "https://api.cloudflare.com/client/v4/zones?name={{DOMAIN}}" \
  -H "Authorization: Bearer $CF_TOKEN" | node -e "let s='';process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>process.stdout.write(JSON.parse(s).result[0].id))")

# SPF (TXT @)
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"TXT","name":"@","content":"v=spf1 include:spf.brevo.com include:_spf.mx.cloudflare.net ~all","ttl":1,"proxied":false}'

# Brevo code
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"TXT","name":"@","content":"brevo-code:{{BREVO_CODE}}","ttl":1,"proxied":false}'

# DKIM (2 CNAMEs)
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"brevo1._domainkey","content":"b1.{{DOMAIN_WITH_DASHES}}.dkim.brevo.com","ttl":1,"proxied":false}'

curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"CNAME","name":"brevo2._domainkey","content":"b2.{{DOMAIN_WITH_DASHES}}.dkim.brevo.com","ttl":1,"proxied":false}'

# DMARC
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" -H "Content-Type: application/json" \
  -d '{"type":"TXT","name":"_dmarc","content":"v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com; fo=1","ttl":1,"proxied":false}'
```

Repeat for each domain. Then tell user to click "Authenticate" in Brevo for each domain (or do it via Brevo API if available — Brevo public API for domain verification is undocumented, so extension prompt needed for the Brevo click).

## Fallback: extension prompt (only if API fails)

```
I need to add DNS records on Cloudflare for domain authentication. I'm logged in.

CONTEXT:
- Domain: {{DOMAIN}}
- Records to add (all DNS only — NO Cloudflare proxy / orange cloud):

  Record 1:
  - Type: TXT
  - Name: @
  - Content: v=spf1 include:spf.brevo.com include:_spf.mx.cloudflare.net ~all

  Record 2:
  - Type: TXT
  - Name: @
  - Content: brevo-code:{{BREVO_VERIFICATION_CODE}}

  Record 3:
  - Type: CNAME
  - Name: brevo1._domainkey
  - Content: b1.{{DOMAIN_WITH_DASHES}}.dkim.brevo.com

  Record 4:
  - Type: CNAME
  - Name: brevo2._domainkey
  - Content: b2.{{DOMAIN_WITH_DASHES}}.dkim.brevo.com

  Record 5:
  - Type: TXT
  - Name: _dmarc
  - Content: v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com; fo=1

PROCEDURE:
1. Go to https://dash.cloudflare.com → select {{DOMAIN}} → DNS → Records
2. For each record above, click "Add record", fill in the 3 fields (Type, Name, Content), ensure Proxy status is OFF (gray cloud = DNS only), TTL Auto
3. Save each record
4. After all 5 added, report back confirmed list

DO NOT:
- Enable Cloudflare proxy on any of these records (DNS only)
- Delete or modify any existing records not on this list
- Add records to any other domain in the account

Procedi.
```

## After DNS added

Brevo needs a human click on "Authenticate" button per domain. See `brevo-domain-auth.md`.

Optional: Cloudflare Email Routing for `sales@{{DOMAIN}}` → forward to owner Gmail. See `cloudflare-email-routing.md`.
