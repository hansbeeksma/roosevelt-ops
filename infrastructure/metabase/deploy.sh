#!/bin/bash
set -euo pipefail

# Metabase Deployment Script for Hetzner VPS
# Usage: ssh root@<SERVER_IP> 'bash -s' < deploy.sh
# Or: scp deploy.sh root@<SERVER_IP>:/tmp/ && ssh root@<SERVER_IP> /tmp/deploy.sh

METABASE_DIR="/opt/metabase"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Metabase Deployment Script ==="
echo "Target: ${METABASE_DIR}"
echo ""

# 1. System setup
echo "[1/7] Updating system..."
apt update && apt upgrade -y
timedatectl set-timezone Europe/Amsterdam

# 2. Install Docker
if ! command -v docker &> /dev/null; then
  echo "[2/7] Installing Docker..."
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt update
  apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  systemctl enable docker
else
  echo "[2/7] Docker already installed, skipping..."
fi

# 3. Create directory structure
echo "[3/7] Creating directory structure..."
mkdir -p "${METABASE_DIR}"/{data,backups}

# 4. Copy configuration files
echo "[4/7] Copying configuration files..."
if [ -f "${SCRIPT_DIR}/docker-compose.yml" ]; then
  cp "${SCRIPT_DIR}/docker-compose.yml" "${METABASE_DIR}/"
  cp "${SCRIPT_DIR}/Caddyfile" "${METABASE_DIR}/"
  cp "${SCRIPT_DIR}/backup.sh" "${METABASE_DIR}/"
  chmod +x "${METABASE_DIR}/backup.sh"
else
  echo "ERROR: Configuration files not found in ${SCRIPT_DIR}"
  echo "Run this script from the infrastructure/metabase/ directory"
  exit 1
fi

# Check .env exists
if [ ! -f "${METABASE_DIR}/.env" ]; then
  echo ""
  echo "WARNING: No .env file found at ${METABASE_DIR}/.env"
  echo "Copy .env.example and fill in your values:"
  echo "  cp ${SCRIPT_DIR}/.env.example ${METABASE_DIR}/.env"
  echo "  nano ${METABASE_DIR}/.env"
  echo ""
  echo "Then re-run this script."
  exit 1
fi

# Secure .env
chmod 600 "${METABASE_DIR}/.env"

# 5. Firewall setup
echo "[5/7] Configuring firewall..."
apt install -y ufw fail2ban
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw --force enable

# Fail2Ban config
cat > /etc/fail2ban/jail.local <<'JAIL'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 3
JAIL

systemctl enable fail2ban
systemctl restart fail2ban

# 6. Deploy containers
echo "[6/7] Deploying containers..."
cd "${METABASE_DIR}"
docker compose pull
docker compose up -d

# 7. Setup backup cron
echo "[7/7] Setting up backup cron..."
CRON_JOB="0 3 * * * ${METABASE_DIR}/backup.sh >> /var/log/metabase-backup.log 2>&1"
(crontab -l 2>/dev/null | grep -v "metabase/backup.sh"; echo "$CRON_JOB") | crontab -

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Next steps:"
echo "  1. Ensure DNS A record points to this server's IP"
echo "  2. Wait ~60s for Metabase to initialize"
echo "  3. Check health: curl http://localhost:3000/api/health"
echo "  4. Access: https://\${DOMAIN}"
echo ""
echo "Logs: docker compose -f ${METABASE_DIR}/docker-compose.yml logs -f"
