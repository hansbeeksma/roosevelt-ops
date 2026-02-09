#!/bin/bash
set -euo pipefail

# Metabase Health Check Script
# Usage: ./healthcheck.sh [--verbose]

VERBOSE="${1:-}"
DOMAIN="${DOMAIN:-metabase.rooseveltops.nl}"
ERRORS=0

check() {
  local name="$1"
  local cmd="$2"
  if eval "$cmd" > /dev/null 2>&1; then
    echo "[OK]    $name"
  else
    echo "[FAIL]  $name"
    ERRORS=$((ERRORS + 1))
  fi
}

echo "=== Metabase Health Check ==="
echo ""

# Container status
check "Metabase container running" "docker compose -f /opt/metabase/docker-compose.yml ps metabase | grep -q 'Up'"
check "Caddy container running" "docker compose -f /opt/metabase/docker-compose.yml ps caddy | grep -q 'Up'"

# API health
check "Metabase API health" "curl -sf http://localhost:3000/api/health | grep -q ok"

# HTTPS
check "HTTPS accessible" "curl -sf https://${DOMAIN}/api/health | grep -q ok"

# Disk space (warn if >80% used)
check "Disk space available" "[ $(df / --output=pcent | tail -1 | tr -d ' %') -lt 80 ]"

# Memory (warn if >90% used)
check "Memory available" "[ $(free | awk '/Mem:/{printf \"%.0f\", $3/$2*100}') -lt 90 ]"

# Backup freshness (warn if last backup >25h ago)
check "Recent backup exists" "find /opt/metabase/backups -name '*.tar.gz' -mmin -1500 | grep -q ."

echo ""
if [ "$ERRORS" -gt 0 ]; then
  echo "Result: ${ERRORS} check(s) failed"
  exit 1
else
  echo "Result: All checks passed"
  exit 0
fi

if [ "$VERBOSE" = "--verbose" ]; then
  echo ""
  echo "--- Container Stats ---"
  docker stats --no-stream metabase caddy 2>/dev/null || true
  echo ""
  echo "--- Disk Usage ---"
  df -h /
  echo ""
  echo "--- Last 5 Backups ---"
  ls -lht /opt/metabase/backups/ 2>/dev/null | head -6
fi
