#!/usr/bin/env bash
# VPS bootstrap script — Ubuntu 22.04+ / 24.04 (Hetzner CX22 recommended)
# Run as non-root user with sudo privileges. Reboots once mid-script.
#
# Usage:
#   ssh giorgio@your.vps.ip
#   bash setup-vps.sh

set -e

echo "=== BA Cold-mailing VPS Setup ==="
echo ""

# ── Update system ────────────────────────────────────────────────────────────
echo "[1/8] Updating system..."
sudo apt update
sudo apt upgrade -y
sudo apt autoremove -y

# ── Install Node.js 20 ───────────────────────────────────────────────────────
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# ── Install Docker ───────────────────────────────────────────────────────────
echo "[3/8] Installing Docker..."
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

# ── Install PostgreSQL 16 (default Ubuntu; works fine for our schema) ───────
echo "[4/8] Installing PostgreSQL 16..."
sudo apt install -y postgresql postgresql-contrib

# ── Install Caddy (reverse proxy + auto TLS) ─────────────────────────────────
echo "[5/8] Installing Caddy..."
sudo apt install -y caddy

# ── Utilities ────────────────────────────────────────────────────────────────
echo "[6/8] Installing utilities..."
sudo apt install -y git htop ufw fail2ban unzip curl

# ── Firewall ─────────────────────────────────────────────────────────────────
echo "[7/8] Configuring firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# ── Sanity check ─────────────────────────────────────────────────────────────
echo "[8/8] Verifying installs..."
echo ""
echo "Node: $(node --version)"
echo "Docker: $(docker --version)"
echo "Postgres: $(psql --version)"
echo "Caddy: $(caddy version 2>/dev/null | head -1)"
echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps (done by Claude Code via SSH):"
echo "  1. Copy project files via rsync/scp"
echo "  2. Create postgres user + database"
echo "  3. Docker Compose up for n8n"
echo "  4. Configure Caddy reverse proxy"
echo "  5. Set up cron for unsubscribe sync"
echo ""
echo "IMPORTANT: log out and log back in to apply docker group membership."
echo "  exit"
echo "  ssh \$USER@\$(hostname -I | awk '{print \$1}')"
