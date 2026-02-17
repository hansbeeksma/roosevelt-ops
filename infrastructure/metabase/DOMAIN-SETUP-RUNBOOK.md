# Domain Setup Runbook: metabase.rooseveltops.nl

> **Status**: Ready for execution
> **Prerequisites**: Hetzner VPS provisioned, DNS provider access
> **Estimated Time**: 20-30 minutes
> **Related Issues**: ROOSE-61, ROOSE-181

---

## Pre-flight Checklist

- [ ] Hetzner VPS is running (CX22, Ubuntu 24.04)
- [ ] Server IP address is known
- [ ] SSH access to server is confirmed
- [ ] DNS provider for `rooseveltops.nl` is identified
- [ ] `.env` file is prepared from `.env.example`

---

## Step 1: Identify DNS Provider

`rooseveltops.nl` is NOT managed via Name.com. Determine the DNS provider:

```bash
# Check nameservers
dig NS rooseveltops.nl +short

# Common results:
# ns1.your-provider.com -> indicates which DNS provider to use
# ns1.cloudflare.com    -> Cloudflare
# ns1.transip.nl        -> TransIP
# ns1.name.com          -> Name.com (unlikely per project notes)
```

**Known constraint**: DNS automation via Name.com MCP is not possible for this domain. Manual DNS configuration is required.

---

## Step 2: Create DNS A Record

Login to the DNS provider identified in Step 1 and create:

| Field | Value |
|-------|-------|
| **Type** | A |
| **Name** | metabase |
| **Value** | `<SERVER_IP>` |
| **TTL** | 300 (5 min) or Auto |
| **Proxy** | OFF (if Cloudflare - must be DNS-only for Caddy HTTPS) |

**Important**: If using Cloudflare, set the proxy status to "DNS only" (grey cloud). Caddy needs direct access to provision Let's Encrypt certificates.

### Optional: CAA Record

Allow Let's Encrypt to issue certificates:

| Field | Value |
|-------|-------|
| **Type** | CAA |
| **Name** | metabase |
| **Value** | `0 issue "letsencrypt.org"` |
| **TTL** | Auto |

---

## Step 3: Verify DNS Propagation

Wait 2-5 minutes, then verify:

```bash
# From local machine
dig metabase.rooseveltops.nl +short
# Expected: <SERVER_IP>

# Check propagation globally
# Visit: https://www.whatsmydns.net/#A/metabase.rooseveltops.nl
```

---

## Step 4: Deploy Metabase

If not yet deployed, use the automated deploy script:

```bash
# 1. Copy files to server
scp -r infrastructure/metabase/* root@<SERVER_IP>:/tmp/metabase-deploy/

# 2. Prepare .env on server
scp infrastructure/metabase/.env.example root@<SERVER_IP>:/opt/metabase/.env
ssh root@<SERVER_IP> "nano /opt/metabase/.env"  # Fill in actual values

# 3. Run deploy script
ssh root@<SERVER_IP> /tmp/metabase-deploy/deploy.sh

# 4. Monitor startup
ssh root@<SERVER_IP> "docker compose -f /opt/metabase/docker-compose.yml logs -f"
```

If already deployed, just restart Caddy to pick up the new domain:

```bash
ssh root@<SERVER_IP> "docker compose -f /opt/metabase/docker-compose.yml restart caddy"
```

---

## Step 5: Verify Domain Setup

Run the verification script from your local machine:

```bash
./infrastructure/metabase/scripts/verify-domain.sh <SERVER_IP>
```

This checks:
- DNS resolution
- TCP connectivity (ports 80, 443)
- HTTP -> HTTPS redirect
- SSL certificate validity (Let's Encrypt)
- Metabase health endpoint
- Security headers

---

## Step 6: SSL Certificate Verification

Caddy automatically provisions Let's Encrypt certificates. Verify:

```bash
# Check certificate details
echo | openssl s_client -servername metabase.rooseveltops.nl \
  -connect metabase.rooseveltops.nl:443 2>/dev/null \
  | openssl x509 -noout -dates -issuer -subject

# Expected output:
# notBefore=...
# notAfter=... (90 days from now)
# issuer=... Let's Encrypt ...
# subject=CN = metabase.rooseveltops.nl
```

**Troubleshooting**: If certificate provisioning fails:
1. Ensure port 80 is open (Let's Encrypt HTTP-01 challenge)
2. Ensure DNS is propagated (`dig metabase.rooseveltops.nl`)
3. Check Caddy logs: `docker compose logs caddy | grep -i error`
4. Wait 5 minutes and retry: `docker compose restart caddy`

---

## Step 7: Post-Setup Configuration

### Metabase Initial Setup

1. Open `https://metabase.rooseveltops.nl`
2. Complete the setup wizard:
   - Create admin account (strong password, min 16 chars)
   - Choose language: Nederlands
   - Skip usage data collection
3. Connect data sources (Supabase databases)
4. Create initial dashboards

### Verify Backup Cron

```bash
ssh root@<SERVER_IP> "crontab -l | grep metabase"
# Expected: 0 3 * * * /opt/metabase/backup.sh >> /var/log/metabase-backup.log 2>&1
```

### Verify Health Check

```bash
ssh root@<SERVER_IP> "/opt/metabase/healthcheck.sh"
```

---

## Architecture Reference

```
[Client Browser]
       |
       | HTTPS (port 443)
       v
[Caddy Reverse Proxy]  <-- automatic Let's Encrypt cert
  |           |
  | port 80   | internal network
  | redirect  |
  v           v
[HTTP->HTTPS] [Metabase :3000]
                   |
                   | PostgreSQL (SSL)
                   v
              [Supabase DB]
```

### Network Isolation

- **caddy-external**: Caddy container, exposed to internet (ports 80, 443)
- **metabase-internal**: Metabase container, internal only (not exposed)
- Metabase port 3000 bound to `127.0.0.1` only (localhost)

### Security Stack

| Layer | Protection |
|-------|-----------|
| DNS | CAA record (optional) |
| TLS | Let's Encrypt auto-renewal via Caddy |
| HTTP | HSTS, X-Content-Type-Options, X-Frame-Options, CSP |
| Firewall | UFW: only ports 22, 80, 443 |
| SSH | Fail2Ban, key-only authentication |
| App | Strong password policy, rate limiting |

---

## Rollback Procedure

If the domain setup causes issues:

```bash
# 1. Stop Caddy (Metabase still runs locally)
ssh root@<SERVER_IP> "docker compose -f /opt/metabase/docker-compose.yml stop caddy"

# 2. Access Metabase directly (if on server)
ssh root@<SERVER_IP> "curl http://localhost:3000/api/health"

# 3. Fix issues and restart
ssh root@<SERVER_IP> "docker compose -f /opt/metabase/docker-compose.yml up -d caddy"
```

---

## Changelog

| Date | Change |
|------|--------|
| 2026-02-17 | Initial runbook created (ROOSE-61) |
