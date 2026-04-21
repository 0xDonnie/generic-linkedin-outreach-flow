# VPS Setup

For when Claude is guiding a user through VPS deployment.

## Recommended provider: Hetzner

**Why**: €4.50/month, Germany/Finland datacenters (GDPR-clean), API for automation, no surprise billing.

**Alternatives**:
- OVH (FR): similar pricing, France EU; minimum 1 month commit
- DigitalOcean (US/global): $12/mo, nicer UI
- AWS Lightsail: $7/mo, more complex

**Default we'll use**: Hetzner CX22 (2 vCPU, 4GB RAM, 40GB SSD). Overkill for our workload but buffer room.

## Purchase flow (user browser, 10 min)

1. Go to https://www.hetzner.com/cloud
2. Create account (needs email + credit card)
3. Create a new Cloud Server:
   - Location: Nuremberg (Germany) or Falkenstein (Germany) — both EU
   - Image: Ubuntu 24.04
   - Type: CX22 (Intel/AMD — doesn't matter)
   - SSH Key: create one or paste public key
   - Name: `coldmailing-[project-name]`
4. Click "Create & Buy now"
5. VPS spins up in ~30 seconds. Note the public IPv4 address (e.g., 51.77.192.245)

## First SSH login

```powershell
ssh root@<IP>
```

Create a non-root user (Hetzner usually gives you root by default):

```bash
adduser giorgio         # or your name
usermod -aG sudo giorgio
# copy SSH key to the new user
mkdir -p /home/giorgio/.ssh
cp ~/.ssh/authorized_keys /home/giorgio/.ssh/
chown -R giorgio:giorgio /home/giorgio/.ssh
chmod 700 /home/giorgio/.ssh
chmod 600 /home/giorgio/.ssh/authorized_keys

# log out, log back in as giorgio
exit
```

```powershell
ssh giorgio@<IP>
```

## Run bootstrap script

Upload and run `scripts/bash/setup-vps.sh`:

```bash
# From local PowerShell (Windows user's side)
scp scripts/bash/setup-vps.sh giorgio@<IP>:~/

# Then on VPS
ssh giorgio@<IP>
bash ~/setup-vps.sh
```

This installs: Node 20, Docker, PostgreSQL 16, Caddy, git, firewall rules.

Takes ~10 min. Log out + log back in to apply docker group.

## Deploy project to VPS

From local PowerShell:

```powershell
# Tarball project (exclude sensitive + node_modules)
cd D:\GitHub
tar --exclude='my-outreach/node_modules' `
    --exclude='my-outreach/.env' `
    --exclude='my-outreach/data/*' `
    --exclude='my-outreach/logs' `
    --exclude='my-outreach/.git' `
    -czf my-outreach.tar.gz my-outreach

# Postgres dump (if migrating from local)
$env:PGPASSWORD = "your-postgres-password"
& "C:\Program Files\PostgreSQL\17\bin\pg_dump.exe" -U postgres -d your_db -F c -f db_dump.bak

# Upload tarball + dump + .env
scp my-outreach.tar.gz db_dump.bak .env giorgio@<IP>:~/
```

Claude Code can then SSH to the VPS and run the remaining setup:

```bash
# Extract
sudo mkdir -p /opt/my-outreach
sudo chown -R $USER:$USER /opt/my-outreach
tar xzf ~/my-outreach.tar.gz -C /opt/my-outreach --strip-components=1

# Install deps
cd /opt/my-outreach
npm install

# Postgres setup
sudo -u postgres createuser -P your_db_user
sudo -u postgres createdb -O your_db_user your_db
# Restore from dump
sudo -u postgres pg_restore -d your_db -F c ~/db_dump.bak --no-owner --no-acl

# Env file
mv ~/.env .env
# Edit .env to update DATABASE_URL to VPS local Postgres:
# DATABASE_URL=postgresql://your_db_user:PASSWORD@localhost:5432/your_db
# TEMPLATE_DIR=/opt/my-outreach/templates/email-templates
```

## n8n on Docker

Create `/opt/my-outreach/docker-compose.yml`:

```yaml
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:1.121.0
    restart: always
    ports:
      - "127.0.0.1:5678:5678"
    env_file:
      - .env
    environment:
      - N8N_HOST=n8n.your-outbound-domain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.your-outbound-domain.com/
      - GENERIC_TIMEZONE=Europe/London
    volumes:
      - n8n_data:/home/node/.n8n
    network_mode: host

volumes:
  n8n_data:
```

Start:
```bash
docker compose up -d
docker ps   # should show running
```

## Caddy reverse proxy

Edit `/etc/caddy/Caddyfile`:

```
n8n.your-outbound-domain.com {
    reverse_proxy 127.0.0.1:5678
    encode gzip
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

Caddy auto-provisions Let's Encrypt TLS on first request. DNS A record for `n8n.your-outbound-domain.com` must point to the VPS IP — set on Cloudflare (DNS only, no proxy).

## Cron for unsubscribe sync

```bash
crontab -e
```

Add:
```
*/15 * * * * cd /opt/my-outreach && /usr/bin/node scripts/node/sync-unsubscribes.mjs >> /home/$USER/sync.log 2>&1
```

## Smoke test from VPS

```bash
cd /opt/my-outreach
node scripts/node/test-send-one.mjs --to your-dedicated-gmail@gmail.com
```

Check email arrives, click unsubscribe link, run sync script, verify `suppression_list` grows.

## Post-setup monitoring

```bash
# Container status
docker ps
docker logs ba-sales-automation-n8n-1 --tail 50

# Postgres
sudo -u postgres psql -d your_db -c "SELECT count(*) FROM leads;"

# Caddy
sudo systemctl status caddy --no-pager

# Disk / memory
df -h
free -h
```

## Cost tracking

- Hetzner CX22: €4.50/month (cancellable anytime)
- Backup: enable "Backups" on Hetzner (+20% = +€0.90/mo) — strongly recommended
- DNS: Cloudflare free
- TLS certs: Let's Encrypt free (Caddy auto)

Monthly VPS total: **~€5.50/month**.
