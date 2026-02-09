#!/bin/bash
# GitHub Notification Cleanup & Metrics
# Part of ROOSE-131: Optimize notification settings
#
# Usage:
#   ./scripts/gh-notify-cleanup.sh          # Show metrics + cleanup
#   ./scripts/gh-notify-cleanup.sh --dry-run # Show metrics only
#   ./scripts/gh-notify-cleanup.sh --cron    # Silent cleanup (for crontab)

set -euo pipefail

DRY_RUN=false
CRON_MODE=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --cron) CRON_MODE=true; shift ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Verify gh CLI
if ! command -v gh &> /dev/null; then
  echo "Error: GitHub CLI (gh) not installed" >&2
  exit 1
fi

# Get notifications
NOTIFICATIONS=$(gh api /notifications 2>/dev/null || echo "[]")
TOTAL=$(echo "$NOTIFICATIONS" | jq 'length')

if [[ "$CRON_MODE" == true ]]; then
  if [[ "$TOTAL" -gt 0 ]]; then
    gh api /notifications --method PUT \
      --field read=true \
      --field last_read_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" &>/dev/null
  fi
  exit 0
fi

echo "GitHub Notification Report"
echo "=========================="
echo ""
echo "Unread notifications: $TOTAL"
echo ""

if [[ "$TOTAL" -eq 0 ]]; then
  echo "Inbox zero - no action needed."
  exit 0
fi

# Breakdown by repo
echo "By repository:"
echo "$NOTIFICATIONS" | jq -r '[.[] | .repository.full_name] | group_by(.) | map("  \(.[0]): \(length)") | .[]'
echo ""

# Breakdown by reason
echo "By reason:"
echo "$NOTIFICATIONS" | jq -r '[.[] | .reason] | group_by(.) | map("  \(.[0]): \(length)") | .[]'
echo ""

# Breakdown by type
echo "By type:"
echo "$NOTIFICATIONS" | jq -r '[.[] | .subject.type] | group_by(.) | map("  \(.[0]): \(length)") | .[]'
echo ""

if [[ "$DRY_RUN" == true ]]; then
  echo "[dry-run] Would mark $TOTAL notifications as read."
  exit 0
fi

echo "Marking $TOTAL notifications as read..."
gh api /notifications --method PUT \
  --field read=true \
  --field last_read_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)" &>/dev/null

# Verify
sleep 1
REMAINING=$(gh api /notifications 2>/dev/null | jq 'length')
echo "Done. Remaining unread: $REMAINING"
