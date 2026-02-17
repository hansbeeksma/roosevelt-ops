#!/bin/bash
set -euo pipefail

# Domain Verification Script for Metabase Deployment
# Usage: ./verify-domain.sh [SERVER_IP]
#
# Verifies DNS, SSL, and connectivity for metabase.rooseveltops.nl
# Run AFTER DNS A record has been created and deploy.sh has completed.

DOMAIN="${DOMAIN:-metabase.rooseveltops.nl}"
SERVER_IP="${1:-}"
ERRORS=0
WARNINGS=0

info()  { echo "[INFO]    $1"; }
ok()    { echo "[OK]      $1"; }
warn()  { echo "[WARN]    $1"; WARNINGS=$((WARNINGS + 1)); }
fail()  { echo "[FAIL]    $1"; ERRORS=$((ERRORS + 1)); }

echo "=== Domain Verification: ${DOMAIN} ==="
echo "Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
echo ""

# --- Step 1: DNS Resolution ---
echo "--- DNS Resolution ---"

DNS_RESULT=$(dig +short "${DOMAIN}" A 2>/dev/null || true)
if [ -z "$DNS_RESULT" ]; then
  fail "DNS A record not found for ${DOMAIN}"
  echo "  Fix: Create an A record pointing ${DOMAIN} to your server IP"
  echo "  Provider: Check where rooseveltops.nl DNS is managed"
else
  ok "DNS A record resolves: ${DOMAIN} -> ${DNS_RESULT}"

  if [ -n "$SERVER_IP" ] && [ "$DNS_RESULT" != "$SERVER_IP" ]; then
    warn "DNS resolves to ${DNS_RESULT}, expected ${SERVER_IP}"
  fi
fi

# Check AAAA record (IPv6)
DNS_AAAA=$(dig +short "${DOMAIN}" AAAA 2>/dev/null || true)
if [ -n "$DNS_AAAA" ]; then
  info "IPv6 AAAA record found: ${DNS_AAAA}"
else
  info "No IPv6 AAAA record (optional)"
fi

# Check CAA record
DNS_CAA=$(dig +short "${DOMAIN}" CAA 2>/dev/null || true)
if [ -n "$DNS_CAA" ]; then
  info "CAA record found: ${DNS_CAA}"
  if echo "$DNS_CAA" | grep -q "letsencrypt"; then
    ok "CAA allows Let's Encrypt"
  else
    warn "CAA record exists but may not allow Let's Encrypt"
    echo "  Fix: Add CAA record: 0 issue \"letsencrypt.org\""
  fi
else
  info "No CAA record (Let's Encrypt will work by default)"
fi

echo ""

# --- Step 2: TCP Connectivity ---
echo "--- TCP Connectivity ---"

TARGET="${DNS_RESULT:-${SERVER_IP:-}}"
if [ -z "$TARGET" ]; then
  fail "Cannot test connectivity: no DNS result and no SERVER_IP provided"
else
  for PORT in 80 443; do
    if timeout 5 bash -c "echo >/dev/tcp/${TARGET}/${PORT}" 2>/dev/null; then
      ok "Port ${PORT} is open on ${TARGET}"
    else
      fail "Port ${PORT} is not reachable on ${TARGET}"
      echo "  Fix: Check firewall rules (ufw allow ${PORT}/tcp)"
    fi
  done
fi

echo ""

# --- Step 3: HTTP Redirect ---
echo "--- HTTP/HTTPS ---"

if command -v curl &>/dev/null && [ -n "${DNS_RESULT:-}" ]; then
  # Test HTTP -> HTTPS redirect
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://${DOMAIN}" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "308" ]; then
    ok "HTTP redirects to HTTPS (${HTTP_CODE})"
  elif [ "$HTTP_CODE" = "000" ]; then
    fail "HTTP connection failed (server unreachable or not running)"
  else
    warn "HTTP returned ${HTTP_CODE} (expected 301/308 redirect)"
  fi

  # Test HTTPS
  HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://${DOMAIN}" 2>/dev/null || echo "000")
  if [ "$HTTPS_CODE" = "200" ]; then
    ok "HTTPS returns 200 OK"
  elif [ "$HTTPS_CODE" = "000" ]; then
    fail "HTTPS connection failed"
    echo "  This may be temporary: Caddy needs a few minutes to provision the certificate"
  else
    warn "HTTPS returned ${HTTPS_CODE} (expected 200)"
  fi
else
  info "Skipping HTTP tests (curl not available or DNS not resolved)"
fi

echo ""

# --- Step 4: SSL Certificate ---
echo "--- SSL Certificate ---"

if command -v openssl &>/dev/null && [ -n "${DNS_RESULT:-}" ]; then
  CERT_INFO=$(echo | openssl s_client -servername "${DOMAIN}" -connect "${DOMAIN}:443" 2>/dev/null | openssl x509 -noout -dates -issuer -subject 2>/dev/null || true)

  if [ -n "$CERT_INFO" ]; then
    ok "SSL certificate is present"

    # Check issuer
    ISSUER=$(echo "$CERT_INFO" | grep "issuer=" | head -1)
    if echo "$ISSUER" | grep -qi "Let's Encrypt\|R3\|R10\|R11\|E5\|E6"; then
      ok "Certificate issued by Let's Encrypt"
    else
      info "Certificate issuer: ${ISSUER}"
    fi

    # Check expiry
    NOT_AFTER=$(echo "$CERT_INFO" | grep "notAfter=" | cut -d= -f2)
    if [ -n "$NOT_AFTER" ]; then
      EXPIRY_EPOCH=$(date -d "$NOT_AFTER" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$NOT_AFTER" +%s 2>/dev/null || echo "0")
      NOW_EPOCH=$(date +%s)
      DAYS_LEFT=$(( (EXPIRY_EPOCH - NOW_EPOCH) / 86400 ))

      if [ "$DAYS_LEFT" -gt 30 ]; then
        ok "Certificate expires in ${DAYS_LEFT} days (${NOT_AFTER})"
      elif [ "$DAYS_LEFT" -gt 7 ]; then
        warn "Certificate expires in ${DAYS_LEFT} days - renewal due soon"
      else
        fail "Certificate expires in ${DAYS_LEFT} days - renewal needed"
      fi
    fi

    # Check subject matches domain
    SUBJECT=$(echo "$CERT_INFO" | grep "subject=" | head -1)
    if echo "$SUBJECT" | grep -q "${DOMAIN}"; then
      ok "Certificate subject matches ${DOMAIN}"
    else
      warn "Certificate subject does not match: ${SUBJECT}"
    fi
  else
    warn "Could not retrieve SSL certificate (server may not be running yet)"
  fi
else
  info "Skipping SSL tests (openssl not available or DNS not resolved)"
fi

echo ""

# --- Step 5: Metabase Health ---
echo "--- Metabase Health ---"

if [ -n "${DNS_RESULT:-}" ]; then
  HEALTH=$(curl -sf --max-time 10 "https://${DOMAIN}/api/health" 2>/dev/null || echo "")
  if echo "$HEALTH" | grep -q "ok"; then
    ok "Metabase health endpoint: OK"
  elif [ -z "$HEALTH" ]; then
    warn "Metabase health endpoint not reachable (may still be starting)"
    echo "  Metabase typically needs 60-90 seconds to initialize"
  else
    fail "Metabase health endpoint returned unexpected response: ${HEALTH}"
  fi
fi

echo ""

# --- Step 6: Security Headers ---
echo "--- Security Headers ---"

if [ -n "${DNS_RESULT:-}" ]; then
  HEADERS=$(curl -sI --max-time 10 "https://${DOMAIN}" 2>/dev/null || echo "")

  if [ -n "$HEADERS" ]; then
    for HEADER in "Strict-Transport-Security" "X-Content-Type-Options" "X-Frame-Options"; do
      if echo "$HEADERS" | grep -qi "$HEADER"; then
        ok "Header present: ${HEADER}"
      else
        warn "Missing security header: ${HEADER}"
      fi
    done

    # Check Server header is removed
    if echo "$HEADERS" | grep -qi "^Server:"; then
      warn "Server header is exposed (should be removed by Caddy)"
    else
      ok "Server header is hidden"
    fi
  fi
fi

echo ""

# --- Summary ---
echo "=== Verification Summary ==="
echo ""
if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
  echo "Result: ALL CHECKS PASSED"
  exit 0
elif [ "$ERRORS" -eq 0 ]; then
  echo "Result: PASSED with ${WARNINGS} warning(s)"
  exit 0
else
  echo "Result: ${ERRORS} error(s), ${WARNINGS} warning(s)"
  echo ""
  echo "Common fixes:"
  echo "  1. Create DNS A record: ${DOMAIN} -> <SERVER_IP>"
  echo "  2. Ensure ports 80/443 are open: ufw allow 80/tcp && ufw allow 443/tcp"
  echo "  3. Wait 60-90s for Metabase to start: docker compose logs -f metabase"
  echo "  4. Wait 2-5min for Caddy to provision SSL certificate"
  exit 1
fi
