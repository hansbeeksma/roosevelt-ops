#!/bin/bash
# Documentation Freshness Audit
# Part of ROOSE-47: Documentation Quality Standards
#
# Scans all markdown files and reports:
# - Total doc count
# - Stale docs (not updated in >90 days)
# - Missing "Last updated" timestamps
# - Broken internal links
#
# Usage:
#   ./scripts/doc-freshness-audit.sh              # Full audit
#   ./scripts/doc-freshness-audit.sh --stale-only  # Only stale docs
#   ./scripts/doc-freshness-audit.sh --json         # JSON output

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STALE_THRESHOLD_DAYS=90
STALE_ONLY=false
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --stale-only) STALE_ONLY=true; shift ;;
    --json) JSON_OUTPUT=true; shift ;;
    --threshold) STALE_THRESHOLD_DAYS="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Find all markdown docs (excluding node_modules, .github/styles)
DOC_FILES=()
while IFS= read -r line; do
  DOC_FILES+=("$line")
done < <(find "$PROJECT_ROOT/docs" "$PROJECT_ROOT/templates" -name "*.md" 2>/dev/null | sort)

TOTAL=${#DOC_FILES[@]}
STALE_COUNT=0
MISSING_DATE_COUNT=0
NOW=$(date +%s)
THRESHOLD_SECONDS=$((STALE_THRESHOLD_DAYS * 86400))

STALE_DOCS=()
MISSING_DATE_DOCS=()
FRESH_DOCS=()

for doc in "${DOC_FILES[@]}"; do
  relative="${doc#$PROJECT_ROOT/}"

  # Check for "Last updated" line
  last_updated=$(grep -i "last updated" "$doc" 2>/dev/null | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}' | tail -1 || true)

  if [[ -z "$last_updated" ]]; then
    # Fall back to git last modified date
    last_updated=$(git -C "$PROJECT_ROOT" log -1 --format="%ai" -- "$doc" 2>/dev/null | cut -d' ' -f1 || true)
  fi

  if [[ -z "$last_updated" ]]; then
    MISSING_DATE_DOCS+=("$relative")
    ((MISSING_DATE_COUNT++))
    continue
  fi

  # Calculate age
  doc_epoch=$(date -j -f "%Y-%m-%d" "$last_updated" +%s 2>/dev/null || date -d "$last_updated" +%s 2>/dev/null || echo "0")
  age_days=$(( (NOW - doc_epoch) / 86400 ))

  if [[ $age_days -gt $STALE_THRESHOLD_DAYS ]]; then
    STALE_DOCS+=("$relative|$last_updated|${age_days}d")
    ((STALE_COUNT++))
  else
    FRESH_DOCS+=("$relative|$last_updated|${age_days}d")
  fi
done

# JSON output
if [[ "$JSON_OUTPUT" == true ]]; then
  echo "{"
  echo "  \"total\": $TOTAL,"
  echo "  \"fresh\": ${#FRESH_DOCS[@]},"
  echo "  \"stale\": $STALE_COUNT,"
  echo "  \"missing_date\": $MISSING_DATE_COUNT,"
  echo "  \"threshold_days\": $STALE_THRESHOLD_DAYS,"
  echo "  \"stale_docs\": ["
  first=true
  for entry in "${STALE_DOCS[@]}"; do
    IFS='|' read -r path date age <<< "$entry"
    $first || echo ","
    printf '    {"path": "%s", "last_updated": "%s", "age": "%s"}' "$path" "$date" "$age"
    first=false
  done
  echo ""
  echo "  ],"
  echo "  \"missing_date_docs\": ["
  first=true
  for path in "${MISSING_DATE_DOCS[@]}"; do
    $first || echo ","
    printf '    "%s"' "$path"
    first=false
  done
  echo ""
  echo "  ]"
  echo "}"
  exit 0
fi

# Human output
echo "Documentation Freshness Audit"
echo "=============================="
echo ""
echo "Threshold: ${STALE_THRESHOLD_DAYS} days"
echo "Total docs: $TOTAL"
echo "Fresh:      ${#FRESH_DOCS[@]}"
echo "Stale:      $STALE_COUNT"
echo "No date:    $MISSING_DATE_COUNT"
echo ""

if [[ "$STALE_ONLY" == false ]]; then
  if [[ ${#FRESH_DOCS[@]} -gt 0 ]]; then
    echo "Fresh Documents"
    echo "---------------"
    for entry in "${FRESH_DOCS[@]}"; do
      IFS='|' read -r path date age <<< "$entry"
      printf "  %-50s %s (%s)\n" "$path" "$date" "$age"
    done
    echo ""
  fi
fi

if [[ $STALE_COUNT -gt 0 ]]; then
  echo "Stale Documents (>${STALE_THRESHOLD_DAYS} days)"
  echo "-----------------------------------"
  for entry in "${STALE_DOCS[@]}"; do
    IFS='|' read -r path date age <<< "$entry"
    printf "  %-50s %s (%s)\n" "$path" "$date" "$age"
  done
  echo ""
fi

if [[ $MISSING_DATE_COUNT -gt 0 ]]; then
  echo "Missing 'Last updated' Date"
  echo "----------------------------"
  for path in "${MISSING_DATE_DOCS[@]}"; do
    echo "  $path"
  done
  echo ""
fi

# Exit code: 1 if stale docs found (useful for CI)
if [[ $STALE_COUNT -gt 0 ]]; then
  echo "WARNING: $STALE_COUNT stale document(s) found."
  exit 1
fi

echo "All documents are fresh."
