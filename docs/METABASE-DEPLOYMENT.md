# Metabase Deployment Guide

> **Status**: ✅ Production Ready
> **Last Updated**: 2026-02-09
> **Estimated Setup Time**: 45 minutes
> **Related Issues**: ROOSE-137, ROOSE-181
> **IaC Files**: [`infrastructure/metabase/`](../infrastructure/metabase/)

## Overview

Complete deployment guide voor Metabase op Hetzner VPS met Docker, PostgreSQL (Supabase), en Caddy reverse proxy voor automatic HTTPS.

**Architecture Stack**:
- **Hosting**: Hetzner VPS (CX23: 4GB RAM, 2 vCPU, €5/month)
- **Container**: Docker + Docker Compose
- **Database**: Supabase PostgreSQL (application metadata)
- **Reverse Proxy**: Caddy (automatic HTTPS via Let's Encrypt)
- **Security**: UFW firewall, Docker secrets, network isolation

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Hetzner VPS Setup](#2-hetzner-vps-setup)
3. [Docker Installation](#3-docker-installation)
4. [Supabase Connection Configuration](#4-supabase-connection-configuration)
5. [Docker Compose Configuration](#5-docker-compose-configuration)
6. [Caddy Reverse Proxy](#6-caddy-reverse-proxy)
7. [Security Hardening](#7-security-hardening)
8. [Deployment & Health Checks](#8-deployment--health-checks)
9. [Backup Strategy](#9-backup-strategy)
10. [Troubleshooting](#10-troubleshooting)
11. [Maintenance & Updates](#11-maintenance--updates)
12. [Cost Analysis](#12-cost-analysis)

---

## 1. Prerequisites

### Required Accounts & Access
- [ ] Hetzner Cloud account (https://console.hetzner.cloud)
- [ ] Supabase project met PostgreSQL toegang
- [ ] Domain name (voor HTTPS via Let's Encrypt)
- [ ] SSH key pair voor server toegang

### Local Requirements
```bash
# SSH key genereren (als nog niet aanwezig)
ssh-keygen -t ed25519 -C "metabase@rooseveltops.nl"

# SSH public key ophalen
cat ~/.ssh/id_ed25519.pub
```

---

## 2. Hetzner VPS Setup

### Server Specificaties

| Tier | RAM | vCPU | Disk | Price/Month | Recommendation |
|------|-----|------|------|-------------|----------------|
| CX22 | 4GB | 2 | 40GB | €4.90 | ✅ Minimum voor Metabase |
| CX33 | 8GB | 2 | 80GB | €9.90 | Recommended voor medium usage |
| CX44 | 16GB | 4 | 160GB | €24.90 | High usage (>50 concurrent users) |

**Voor Roosevelt OPS**: Start met CX22, upgrade later indien nodig.

### Server Creation

1. **Via Hetzner Console**:
   ```
   Location: Falkenstein (EU Central)
   Image: Ubuntu 24.04 LTS
   Type: CX22 (4GB RAM, 2 vCPU)
   Networking: IPv4 + IPv6
   SSH Keys: Add your public key
   Firewalls: Create "metabase-firewall" (ports 22, 80, 443)
   ```

2. **Via CLI** (alternatief):
   ```bash
   # Install hcloud CLI
   brew install hcloud

   # Login
   hcloud context create metabase

   # Create server
   hcloud server create \
     --name metabase-prod \
     --type cx22 \
     --image ubuntu-24.04 \
     --ssh-key metabase-key \
     --location fsn1
   ```

3. **First Login**:
   ```bash
   # SSH naar server (replace with actual IP)
   ssh root@<SERVER_IP>

   # Update system
   apt update && apt upgrade -y

   # Set timezone
   timedatectl set-timezone Europe/Amsterdam

   # Set hostname
   hostnamectl set-hostname metabase-prod
   ```

---

## 3. Docker Installation

### Install Docker Engine

```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

### Docker Post-Installation

```bash
# Enable Docker to start on boot
systemctl enable docker

# Create docker user (optional, for non-root usage)
adduser metabase
usermod -aG docker metabase
```

---

## 4. Supabase Connection Configuration

### Connection String Format

**Supabase PostgreSQL Connection Modes**:

| Mode | Port | Use Case | Connection String |
|------|------|----------|-------------------|
| **Direct** | 5432 | Production (recommended) | `postgresql://user:pass@db.project.supabase.co:5432/postgres?sslmode=verify-full` |
| **Pooler (Transaction)** | 6543 | High concurrency | `postgresql://user:pass@db.project.supabase.co:6543/postgres` |
| **Pooler (Session)** | 5432 | Legacy apps | Not recommended for Metabase |

**Voor Metabase**: Gebruik **Direct Connection (port 5432)** met SSL.

### Supabase Credentials Ophalen

1. Open Supabase Dashboard → Project Settings → Database
2. Kopieer connection string:
   ```
   Host: db.xxxxxxxxxxx.supabase.co
   Port: 5432
   Database: postgres
   User: postgres
   Password: [your-password]
   ```

### SSL Certificate Download (Optioneel maar recommended)

```bash
# Download Supabase CA certificate
curl -o /opt/supabase-ca.crt https://supabase.com/docs/guides/platform/ssl-enforcement

# Verify certificate
openssl x509 -in /opt/supabase-ca.crt -text -noout
```

---

## 5. Docker Compose Configuration

### Directory Structure

```bash
# Create directory structure
mkdir -p /opt/metabase/{data,secrets}
cd /opt/metabase

# Set permissions
chown -R root:docker /opt/metabase
chmod 750 /opt/metabase/secrets
```

### Create Environment File

```bash
# Create .env file
cat > /opt/metabase/.env <<'EOF'
# Metabase Configuration
MB_DB_TYPE=postgres
MB_DB_DBNAME=postgres
MB_DB_PORT=5432
MB_DB_USER=postgres
MB_DB_HOST=db.xxxxxxxxxxx.supabase.co
MB_DB_CONNECTION_URI=postgresql://postgres:YOUR_PASSWORD@db.xxxxxxxxxxx.supabase.co:5432/postgres?sslmode=verify-full

# Security
MB_PASSWORD_COMPLEXITY=strong
MB_PASSWORD_LENGTH=10
MB_JETTY_SSL=true

# Performance
JAVA_OPTS=-Xmx2g -Xms1g
MB_APPLICATION_DB_MAX_CONNECTION_POOL_SIZE=15

# Domain (replace with your domain)
DOMAIN=metabase.rooseveltops.nl
EOF

# Secure .env file
chmod 600 /opt/metabase/.env
```

### Docker Compose File

```bash
# Create docker-compose.yml
cat > /opt/metabase/docker-compose.yml <<'EOF'
version: '3.9'

services:
  metabase:
    image: metabase/metabase:latest
    container_name: metabase
    restart: unless-stopped

    environment:
      - MB_DB_TYPE=${MB_DB_TYPE}
      - MB_DB_DBNAME=${MB_DB_DBNAME}
      - MB_DB_PORT=${MB_DB_PORT}
      - MB_DB_USER=${MB_DB_USER}
      - MB_DB_HOST=${MB_DB_HOST}
      - MB_DB_CONNECTION_URI=${MB_DB_CONNECTION_URI}
      - MB_PASSWORD_COMPLEXITY=${MB_PASSWORD_COMPLEXITY}
      - MB_PASSWORD_LENGTH=${MB_PASSWORD_LENGTH}
      - JAVA_OPTS=${JAVA_OPTS}
      - MB_APPLICATION_DB_MAX_CONNECTION_POOL_SIZE=${MB_APPLICATION_DB_MAX_CONNECTION_POOL_SIZE}

    ports:
      - "127.0.0.1:3000:3000"  # Only expose to localhost (Caddy will proxy)

    volumes:
      - metabase-data:/metabase-data
      - ./secrets:/secrets:ro

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

    deploy:
      resources:
        limits:
          memory: 2.5G
          cpus: '1.5'
        reservations:
          memory: 1G
          cpus: '0.5'

    networks:
      - metabase-internal
      - caddy-external

  caddy:
    image: caddy:2-alpine
    container_name: caddy
    restart: unless-stopped

    ports:
      - "80:80"
      - "443:443"

    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy-data:/data
      - caddy-config:/config

    environment:
      - DOMAIN=${DOMAIN}

    depends_on:
      - metabase

    networks:
      - caddy-external

networks:
  metabase-internal:
    driver: bridge
    internal: true  # No external access
  caddy-external:
    driver: bridge

volumes:
  metabase-data:
    driver: local
  caddy-data:
    driver: local
  caddy-config:
    driver: local
EOF
```

---

## 6. Caddy Reverse Proxy

### Caddyfile Configuration

```bash
# Create Caddyfile
cat > /opt/metabase/Caddyfile <<'EOF'
{
    # Global options
    email admin@rooseveltops.nl
    admin off
}

{$DOMAIN} {
    # Automatic HTTPS via Let's Encrypt

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "SAMEORIGIN"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }

    # Rate limiting
    rate_limit {
        zone metabase {
            key {remote_host}
            events 100
            window 1m
        }
    }

    # Logging
    log {
        output file /var/log/caddy/metabase-access.log {
            roll_size 100mb
            roll_keep 5
            roll_keep_for 720h
        }
        format json
    }

    # Reverse proxy to Metabase
    reverse_proxy metabase:3000 {
        # Health check
        health_uri /api/health
        health_interval 30s
        health_timeout 10s

        # Headers
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
EOF
```

### DNS Configuration

**Voordat je Caddy start**: Zorg dat DNS record bestaat.

1. Open DNS provider (Cloudflare, Namecheap, etc.)
2. Voeg A record toe:
   ```
   Type: A
   Name: metabase
   Value: <SERVER_IP>
   TTL: Auto
   ```

3. Verifieer DNS propagatie:
   ```bash
   dig metabase.rooseveltops.nl +short
   # Should return: <SERVER_IP>
   ```

---

## 7. Security Hardening

### UFW Firewall Configuration

```bash
# Install UFW
apt install -y ufw

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (CRITICAL: Do this first!)
ufw allow 22/tcp comment 'SSH'

# Allow HTTP/HTTPS (for Caddy)
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Enable firewall
ufw --force enable

# Verify rules
ufw status verbose
```

### Fail2Ban Setup (SSH Protection)

```bash
# Install Fail2Ban
apt install -y fail2ban

# Create custom config
cat > /etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
destemail = admin@rooseveltops.nl
sender = fail2ban@rooseveltops.nl
action = %(action_mwl)s

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log
maxretry = 3
EOF

# Start Fail2Ban
systemctl enable fail2ban
systemctl start fail2ban

# Check status
fail2ban-client status sshd
```

### Docker Secrets (Secure Password Storage)

```bash
# Create Supabase password secret
echo "YOUR_SUPABASE_PASSWORD" | docker secret create supabase_password -

# Update docker-compose.yml to use secrets
# (Replace MB_DB_CONNECTION_URI with secret reference)
```

### Security Checklist

- [ ] UFW firewall enabled (only ports 22, 80, 443)
- [ ] Fail2Ban active voor SSH protection
- [ ] SSH key-based authentication (disable password login)
- [ ] Docker secrets voor sensitive data
- [ ] Metabase admin strong password (min 16 characters)
- [ ] Supabase PostgreSQL SSL enforced (`sslmode=verify-full`)
- [ ] Caddy automatic HTTPS (Let's Encrypt)
- [ ] Security headers in Caddyfile
- [ ] Rate limiting enabled (100 req/min per IP)
- [ ] Regular OS updates via unattended-upgrades

---

## 8. Deployment & Health Checks

### Initial Deployment

```bash
cd /opt/metabase

# Pull images
docker compose pull

# Start services
docker compose up -d

# Check logs
docker compose logs -f metabase
docker compose logs -f caddy

# Wait for Metabase to be ready (~60 seconds)
# Look for: "Metabase Initialization COMPLETE"
```

### Health Check Commands

```bash
# Check container status
docker compose ps

# Check Metabase health endpoint
curl http://localhost:3000/api/health
# Expected: {"status":"ok"}

# Check Caddy HTTPS
curl -I https://metabase.rooseveltops.nl
# Expected: HTTP/2 200

# Check Metabase logs for errors
docker compose logs metabase | grep -i error

# Check database connection
docker compose exec metabase curl -s http://localhost:3000/api/health | jq .
```

### Post-Deployment Setup

1. **Access Metabase UI**:
   ```
   https://metabase.rooseveltops.nl
   ```

2. **Initial Setup Wizard**:
   - Create admin account (use strong password!)
   - Choose language (Nederlands)
   - Skip usage data collection (optional)

3. **Connect Data Sources**:
   - Add Supabase PostgreSQL database(s)
   - Test connection
   - Start creating dashboards

---

## 9. Backup Strategy

### Automated Backups Script

```bash
# Create backup script
cat > /opt/metabase/backup.sh <<'EOF'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/opt/metabase/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup Metabase application database (H2 embedded or PostgreSQL metadata)
echo "Starting Metabase backup at $(date)"

# Stop Metabase (optional, for consistent backup)
docker compose -f /opt/metabase/docker-compose.yml stop metabase

# Backup data volume
docker run --rm \
  -v metabase-data:/data \
  -v "$BACKUP_DIR":/backup \
  alpine \
  tar czf "/backup/metabase-data-${DATE}.tar.gz" /data

# Restart Metabase
docker compose -f /opt/metabase/docker-compose.yml start metabase

# Backup configuration files
tar czf "${BACKUP_DIR}/metabase-config-${DATE}.tar.gz" \
  /opt/metabase/docker-compose.yml \
  /opt/metabase/.env \
  /opt/metabase/Caddyfile

# Cleanup old backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "Backup completed: ${BACKUP_DIR}/metabase-data-${DATE}.tar.gz"
EOF

chmod +x /opt/metabase/backup.sh
```

### Cron Job Setup

```bash
# Add to crontab
crontab -e

# Add line (daily at 3 AM)
0 3 * * * /opt/metabase/backup.sh >> /var/log/metabase-backup.log 2>&1
```

### Backup Verification

```bash
# Test backup script
/opt/metabase/backup.sh

# List backups
ls -lh /opt/metabase/backups/

# Test restore (dry-run)
docker run --rm \
  -v metabase-data:/data \
  -v /opt/metabase/backups:/backup \
  alpine \
  tar tzf /backup/metabase-data-20260209_030000.tar.gz
```

---

## 10. Troubleshooting

### Common Issues

#### 1. Metabase Won't Start

**Symptom**: Container exits immediately or restarts loop

```bash
# Check logs
docker compose logs metabase | tail -50

# Common causes:
# - Invalid Supabase connection string → Check .env file
# - Memory limit exceeded → Increase Docker memory limit
# - Port 3000 already in use → Check with: netstat -tlnp | grep 3000
```

**Fix**:
```bash
# Validate connection string
docker compose exec metabase env | grep MB_DB

# Test Supabase connection manually
psql "postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres?sslmode=verify-full"
```

#### 2. SSL Certificate Fails (Caddy)

**Symptom**: HTTPS not working, Caddy logs show ACME errors

```bash
# Check Caddy logs
docker compose logs caddy | grep -i error

# Common causes:
# - DNS not propagated → Wait 5-10 minutes, check: dig metabase.rooseveltops.nl
# - Port 80 not accessible → Check UFW: ufw status
# - Rate limit reached (Let's Encrypt) → Wait 1 hour
```

**Fix**:
```bash
# Force certificate renewal
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```

#### 3. Connection Refused (Database)

**Symptom**: Metabase can't connect to Supabase PostgreSQL

```bash
# Check if Supabase allows connections from Hetzner IP
# Supabase Dashboard → Settings → Database → Connection Pooling

# Test connection from server
telnet db.xxx.supabase.co 5432

# Verify SSL mode
openssl s_client -connect db.xxx.supabase.co:5432 -starttls postgres
```

**Fix**:
- Check Supabase firewall rules (allow all IPs or whitelist Hetzner IP)
- Verify SSL certificate path if using `sslmode=verify-full`

#### 4. High Memory Usage

**Symptom**: Container uses >2GB RAM, server slow

```bash
# Check memory usage
docker stats metabase

# Analyze Java heap
docker compose exec metabase jmap -heap 1
```

**Fix**:
```bash
# Reduce Java heap in .env
JAVA_OPTS=-Xmx1500m -Xms500m

# Restart
docker compose restart metabase
```

### Debug Commands

```bash
# Container shell access
docker compose exec metabase bash

# Check Metabase version
docker compose exec metabase cat /app/metabase.jar | grep -o "Metabase v[0-9.]*"

# Database connection test
docker compose exec metabase curl -X POST http://localhost:3000/api/database \
  -H "Content-Type: application/json" \
  -d '{"engine":"postgres","name":"test","details":{"host":"db.xxx.supabase.co","port":5432,"dbname":"postgres","user":"postgres","password":"xxx","ssl":true}}'

# Network connectivity test
docker compose exec metabase ping -c 3 db.xxx.supabase.co

# SSL certificate verification
docker compose exec metabase openssl s_client -connect db.xxx.supabase.co:5432 -starttls postgres < /dev/null
```

---

## 11. Maintenance & Updates

### Metabase Updates

```bash
# Check for new version
docker compose pull metabase

# Backup before update
/opt/metabase/backup.sh

# Update
docker compose up -d metabase

# Verify
docker compose logs -f metabase
curl http://localhost:3000/api/health
```

### System Updates

```bash
# Schedule monthly (first Sunday)
crontab -e

# Add line
0 4 1-7 * 0 apt update && apt upgrade -y && docker system prune -f
```

### Monitoring Checklist (Weekly)

- [ ] Check disk usage: `df -h`
- [ ] Check memory: `free -h`
- [ ] Check Docker logs: `docker compose logs --tail 100`
- [ ] Check backup success: `ls -lh /opt/metabase/backups/`
- [ ] Check SSL certificate expiry: `echo | openssl s_client -connect metabase.rooseveltops.nl:443 2>/dev/null | openssl x509 -noout -dates`
- [ ] Check Fail2Ban bans: `fail2ban-client status sshd`

---

## 12. Cost Analysis

### Infrastructure Costs

| Component | Provider | Tier | Monthly Cost |
|-----------|----------|------|--------------|
| **VPS** | Hetzner | CX22 (4GB RAM) | €4.90 |
| **Database** | Supabase | Free tier | €0 |
| **Domain** | Varies | .nl domain | €5-10 |
| **SSL** | Let's Encrypt | Free | €0 |
| **Backup Storage** | Hetzner Volume (optional) | 10GB | €0.50 |
| **Total** | | | **€10-15/month** |

### Scaling Costs

| Traffic Level | VPS Tier | Monthly Cost |
|---------------|----------|--------------|
| 1-20 users | CX22 (4GB) | €4.90 |
| 20-50 users | CX33 (8GB) | €9.90 |
| 50-100 users | CX44 (16GB) | €24.90 |
| 100+ users | CX55 (32GB) | €49.90 |

### ROI vs Hosted Alternatives

| Solution | Monthly Cost | Notes |
|----------|--------------|-------|
| **Self-Hosted (Hetzner)** | €10-15 | Full control, unlimited users |
| Metabase Cloud Starter | $85 (~€80) | 5 users, managed |
| Metabase Cloud Pro | $500 (~€470) | 10 users, advanced features |
| Google Looker Studio | Free/variable | Limited customization |

**Savings**: €70-460/month door self-hosting!

---

## Quick Start Commands

All configuration files are in [`infrastructure/metabase/`](../infrastructure/metabase/):

```bash
# 1. Provision Hetzner VPS (CX22, Ubuntu 24.04)
# 2. Copy .env.example → .env on server, fill in Supabase credentials
scp infrastructure/metabase/.env.example root@<SERVER_IP>:/opt/metabase/.env
ssh root@<SERVER_IP> nano /opt/metabase/.env

# 3. Run automated deploy script
scp -r infrastructure/metabase/* root@<SERVER_IP>:/tmp/metabase-deploy/
ssh root@<SERVER_IP> /tmp/metabase-deploy/deploy.sh

# 4. Monitor logs
ssh root@<SERVER_IP> docker compose -f /opt/metabase/docker-compose.yml logs -f

# 5. Health check
ssh root@<SERVER_IP> /opt/metabase/healthcheck.sh
```

---

## Support & Resources

- **Metabase Documentation**: https://www.metabase.com/docs/latest/
- **Hetzner Docs**: https://docs.hetzner.com/
- **Caddy Documentation**: https://caddyserver.com/docs/
- **Supabase PostgreSQL**: https://supabase.com/docs/guides/database
- **Docker Compose Reference**: https://docs.docker.com/compose/

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-09 | Initial deployment guide created |

---

**Ready to deploy?** Start met [Section 2: Hetzner VPS Setup](#2-hetzner-vps-setup) 🚀
