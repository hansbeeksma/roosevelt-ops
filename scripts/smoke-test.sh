#!/usr/bin/env bash
#
# Smoke Test Script for Roosevelt OPS
# Validates a deployment is healthy before production promotion.
#
# Usage: bash scripts/smoke-test.sh <deployment-url>
#
# Exit codes:
#   0 - All checks passed
#   1 - One or more checks failed

set -uo pipefail

DEPLOY_URL="${1:?Usage: smoke-test.sh <deployment-url>}"

# Strip trailing slash
DEPLOY_URL="${DEPLOY_URL%/}"

PASSED=0
FAILED=0
TOTAL=0

pass() {
  PASSED=$((PASSED + 1))
  TOTAL=$((TOTAL + 1))
  echo "  [PASS] $1"
}

fail() {
  FAILED=$((FAILED + 1))
  TOTAL=$((TOTAL + 1))
  echo "  [FAIL] $1"
}

check_status() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  local status
  status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [ "$status" = "$expected_status" ]; then
    pass "$name (HTTP $status)"
  else
    fail "$name (expected $expected_status, got $status)"
  fi
}

check_contains() {
  local name="$1"
  local url="$2"
  local expected="$3"

  local body
  body=$(curl -s --max-time 10 "$url" 2>/dev/null || echo "")

  if echo "$body" | grep -q "$expected"; then
    pass "$name"
  else
    fail "$name (response missing: $expected)"
  fi
}

check_header() {
  local name="$1"
  local url="$2"
  local header="$3"

  local headers
  headers=$(curl -sI --max-time 10 "$url" 2>/dev/null || echo "")

  if echo "$headers" | grep -qi "$header"; then
    pass "$name"
  else
    fail "$name (missing header: $header)"
  fi
}

echo "================================================"
echo "  Smoke Tests - Roosevelt OPS"
echo "  Target: $DEPLOY_URL"
echo "  Time:   $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "================================================"
echo ""

# --- 1. Homepage / App Shell ---
echo "1. App Shell"
check_status "Homepage loads" "$DEPLOY_URL" 200
check_contains "HTML response" "$DEPLOY_URL" "<html"
echo ""

# --- 2. Security Headers ---
echo "2. Security Headers"
check_header "X-Content-Type-Options" "$DEPLOY_URL" "x-content-type-options"
check_header "X-Frame-Options" "$DEPLOY_URL" "x-frame-options"
check_header "Strict-Transport-Security" "$DEPLOY_URL" "strict-transport-security"
echo ""

# --- 3. API Health ---
echo "3. API Routes"
check_status "API example route (auth required)" "$DEPLOY_URL/api/example?id=test" 401

# CORS preflight needs Origin header and OPTIONS method
cors_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
  -X OPTIONS \
  -H "Origin: https://roosevelt-ops.vercel.app" \
  -H "Access-Control-Request-Method: GET" \
  "$DEPLOY_URL/api/example" 2>/dev/null || echo "000")
if [ "$cors_status" = "204" ]; then
  pass "API CORS preflight (HTTP 204)"
else
  fail "API CORS preflight (expected 204, got $cors_status)"
fi
echo ""

# --- 4. Error Handling ---
echo "4. Error Handling"
check_status "404 for unknown routes" "$DEPLOY_URL/this-page-does-not-exist-xyz" 404
echo ""

# --- Results ---
echo "================================================"
echo "  Results: $PASSED/$TOTAL passed, $FAILED failed"
echo "================================================"

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "SMOKE TESTS FAILED - Blocking production deploy"
  exit 1
fi

echo ""
echo "All smoke tests passed - Safe to promote to production"
exit 0
