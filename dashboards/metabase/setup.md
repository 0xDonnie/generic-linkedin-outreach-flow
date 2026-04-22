# Metabase setup (step-by-step)

**Prerequisite**: Docker Desktop installed. If not:
- Windows: https://www.docker.com/products/docker-desktop/
- Mac: same link
- VPS Ubuntu: already installed by `scripts/bash/setup-vps.sh`

## 1. Start Metabase

From project root:

```powershell
npm run dashboard:up
```

Check it's alive:
```powershell
npm run dashboard:logs   # ctrl+c when you see "Metabase Initialization COMPLETE"
```

Open http://localhost:3000

## 2. First-run onboarding (one-time, ~3 min)

Metabase asks you to:
1. Pick language
2. Create admin account (email + password — store in password manager)
3. **Skip** "add a database" step — we'll do it manually in step 3 with the correct host

Tip: check "I'll connect later" or similar — easier than fighting the wizard.

## 3. Add the Postgres data source

Settings (gear icon top-right) → Admin → Databases → Add database.

| Field | Value |
|---|---|
| Database type | **PostgreSQL** |
| Display name | `Outreach CRM` |
| Host | **`host.docker.internal`** (Windows/Mac desktop Docker) OR your VPS Postgres IP |
| Port | `5432` (default) |
| Database name | From your `DATABASE_URL` (e.g. `my_li_campaign`) |
| Username | From `DATABASE_URL` |
| Password | From `DATABASE_URL` |
| Use a secure connection (SSL) | **off** for local, **on** for VPS |
| Advanced options | (leave defaults) |

Click **Save**. Metabase scans the schema — should show 8+ tables (leads, campaigns, campaign_messages, li_replies, etc.).

If the connection fails:
- Windows: try `host.docker.internal` first; if that fails, your actual LAN IP (`ipconfig`).
- VPS: make sure Postgres `listen_addresses = '*'` in `postgresql.conf` and `pg_hba.conf` allows the docker bridge network. If not, easier fix: run Metabase + Postgres in the same docker-compose network (advanced — see bottom of this doc).

## 4. Create the dashboard

Top-right → **+ New → Dashboard** → name it `LinkedIn Outreach KPIs`.

## 5. Add preset questions

For each file in `dashboards/metabase/queries/`:

1. Top-right → **+ New → SQL query**
2. Database: `Outreach CRM`
3. Paste the SQL from the file
4. Click **Save** → give it the name shown in the file's first comment (e.g. "Lead funnel")
5. Save to collection "Our analytics" (default is fine)
6. Open the dashboard → **+ → Add questions** → pick the one you just saved → arrange on grid

Do this 7 times, one per query file. Total: ~10 min.

Order suggestion:
1. `01-funnel.sql` — top-left (big, it's the main chart)
2. `05-rate-limit-usage.sql` — top-right (today's caps)
3. `02-daily-activity.sql` — second row (trend)
4. `03-acceptance-rate.sql` — second row
5. `04-reply-breakdown.sql` — third row
6. `06-template-performance.sql` — third row
7. `07-demo-outcomes.sql` — bottom

Save dashboard. Auto-refresh: click the clock icon → pick "10 minutes" (good default).

## 6. VPS access (if running on VPS)

Add to your Caddyfile:

```
dashboard.yourdomain.com {
    reverse_proxy localhost:3000
}
```

Then:
- Set env var `METABASE_SITE_URL=https://dashboard.yourdomain.com` in `dashboards/metabase/.env`
- `npm run dashboard:down && npm run dashboard:up`

Optionally protect with basic auth via Caddy:
```
dashboard.yourdomain.com {
    basicauth {
        admin $2a$14$... # generate with: caddy hash-password
    }
    reverse_proxy localhost:3000
}
```

Metabase already has user auth (admin login from step 2) — Caddy basic auth is belt-and-suspenders.

## 7. Embed or share

- **Private dashboard link**: top-right menu → Sharing → Get shareable link (requires the user to log into Metabase)
- **Public link** (no login): top-right → Sharing → Public link → enable — careful, this exposes data. Usually not needed.
- **Email subscription**: top-right → Subscribe → weekly or daily — Metabase emails the dashboard as PNG/PDF

## Troubleshooting

### "Connection refused" when adding Postgres
- Docker can't reach host's Postgres. Use `host.docker.internal` (Windows/Mac) not `localhost`.
- On Linux: add `extra_hosts: - "host.docker.internal:host-gateway"` to docker-compose (already there).
- Confirm Postgres is listening on all interfaces (`listen_addresses = '*'`) or on the docker bridge network.

### Metabase UI won't load
- Check `npm run dashboard:logs` — is it still initializing? First boot takes 1-2 min.
- Port 3000 already in use: change `ports: - "3001:3000"` in docker-compose.yml.

### Container keeps restarting
- Probably OOM on tiny VPS. Metabase needs ~1 GB RAM. Upgrade to CX22 (4 GB) minimum.

### Dashboard data doesn't refresh
- Native SQL questions cache results for 10 min by default.
- Per question → Settings → Caching → turn off, or lower TTL.

## Advanced: co-located Postgres via docker network

If you're running both Postgres and Metabase in Docker on the same VPS, use the same `network`:

```yaml
# In your Postgres docker-compose, add:
networks:
  outreach-net:
    driver: bridge

# And this docker-compose.yml:
services:
  metabase:
    networks:
      - outreach-net
networks:
  outreach-net:
    external: true
```

Then in Metabase, use `host: postgres` (the service name) instead of `host.docker.internal`.

## Security

- Metabase admin password = production credential. Use a strong one + 2FA (Settings → Authentication).
- For VPS: put it behind HTTPS (Caddy does automatic Let's Encrypt).
- Gitignored: `metabase-data/` folder. Never commit it (contains admin users + encrypted datasource credentials).
