#!/bin/bash
set -euo pipefail

# SPACE Metrics: GitHub Data Collection
# Collects Performance, Activity, and Communication metrics from GitHub API
#
# Usage: ./collect-github-metrics.sh [--days 7] [--repos "owner/repo1,owner/repo2"]
#
# Environment variables:
#   GITHUB_TOKEN          - GitHub personal access token (required)
#   SUPABASE_URL          - Supabase project URL (required)
#   SUPABASE_SERVICE_KEY  - Supabase service role key (required)
#
# Outputs: JSON metrics pushed to Supabase space_* tables

DAYS="${DAYS:-7}"
REPOS="${REPOS:-hansbeeksma/roosevelt-ops,hansbeeksma/vino12,hansbeeksma/h2ww-platform,hansbeeksma/vetteshirts}"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --days) DAYS="$2"; shift 2 ;;
    --repos) REPOS="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

# Validate environment
for VAR in GITHUB_TOKEN SUPABASE_URL SUPABASE_SERVICE_KEY; do
  if [ -z "${!VAR:-}" ]; then
    echo "ERROR: ${VAR} is not set"
    exit 1
  fi
done

SINCE=$(date -u -v-${DAYS}d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "${DAYS} days ago" +"%Y-%m-%dT%H:%M:%SZ")
NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
WEEK_START=$(date -u -v-monday +"%Y-%m-%d" 2>/dev/null || date -u -d "last monday" +"%Y-%m-%d")

echo "=== SPACE Metrics Collection ==="
echo "Period: last ${DAYS} days (since ${SINCE})"
echo "Repos: ${REPOS}"
echo ""

GH_API="https://api.github.com"
GH_HEADERS=(-H "Authorization: token ${GITHUB_TOKEN}" -H "Accept: application/vnd.github.v3+json")

# --- Helper Functions ---

gh_get() {
  local url="$1"
  curl -sf "${GH_HEADERS[@]}" "$url" 2>/dev/null || echo "[]"
}

push_to_supabase() {
  local table="$1"
  local payload="$2"

  curl -sf -X POST "${SUPABASE_URL}/rest/v1/${table}" \
    -H "apikey: ${SUPABASE_SERVICE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=minimal" \
    -d "$payload" 2>/dev/null

  if [ $? -eq 0 ]; then
    echo "  [OK] Pushed to ${table}"
  else
    echo "  [FAIL] Failed to push to ${table}"
  fi
}

# --- Collect Metrics Per Repo ---

IFS=',' read -ra REPO_LIST <<< "$REPOS"
TOTAL_COMMITS=0
TOTAL_PRS_CREATED=0
TOTAL_PRS_MERGED=0
TOTAL_PRS_REVIEWED=0
TOTAL_ADDITIONS=0
TOTAL_DELETIONS=0
TOTAL_REVIEW_TIME_HOURS=0
REVIEW_COUNT=0

for REPO in "${REPO_LIST[@]}"; do
  REPO=$(echo "$REPO" | xargs)  # trim whitespace
  echo "--- ${REPO} ---"

  # Performance: PRs merged (throughput)
  PRS_MERGED=$(gh_get "${GH_API}/repos/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=100" \
    | jq "[.[] | select(.merged_at != null and .merged_at >= \"${SINCE}\")] | length" 2>/dev/null || echo 0)
  echo "  PRs merged: ${PRS_MERGED}"
  TOTAL_PRS_MERGED=$((TOTAL_PRS_MERGED + PRS_MERGED))

  # Activity: Commits
  COMMITS=$(gh_get "${GH_API}/repos/${REPO}/commits?since=${SINCE}&per_page=100" \
    | jq 'length' 2>/dev/null || echo 0)
  echo "  Commits: ${COMMITS}"
  TOTAL_COMMITS=$((TOTAL_COMMITS + COMMITS))

  # Activity: PRs created
  PRS_CREATED=$(gh_get "${GH_API}/repos/${REPO}/pulls?state=all&sort=created&direction=desc&per_page=100" \
    | jq "[.[] | select(.created_at >= \"${SINCE}\")] | length" 2>/dev/null || echo 0)
  echo "  PRs created: ${PRS_CREATED}"
  TOTAL_PRS_CREATED=$((TOTAL_PRS_CREATED + PRS_CREATED))

  # Activity: Code churn (additions + deletions from merged PRs)
  CHURN_DATA=$(gh_get "${GH_API}/repos/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=50" \
    | jq "[.[] | select(.merged_at != null and .merged_at >= \"${SINCE}\")] | {additions: [.[].additions] | add, deletions: [.[].deletions] | add}" 2>/dev/null || echo '{"additions":0,"deletions":0}')
  ADDITIONS=$(echo "$CHURN_DATA" | jq '.additions // 0')
  DELETIONS=$(echo "$CHURN_DATA" | jq '.deletions // 0')
  echo "  Code churn: +${ADDITIONS} / -${DELETIONS}"
  TOTAL_ADDITIONS=$((TOTAL_ADDITIONS + ADDITIONS))
  TOTAL_DELETIONS=$((TOTAL_DELETIONS + DELETIONS))

  # Communication: PR review turnaround time
  MERGED_PRS_DATA=$(gh_get "${GH_API}/repos/${REPO}/pulls?state=closed&sort=updated&direction=desc&per_page=20" \
    | jq "[.[] | select(.merged_at != null and .merged_at >= \"${SINCE}\")] | .[:10]" 2>/dev/null || echo "[]")

  PR_NUMBERS=$(echo "$MERGED_PRS_DATA" | jq -r '.[].number' 2>/dev/null || true)
  for PR_NUM in $PR_NUMBERS; do
    [ -z "$PR_NUM" ] && continue

    REVIEWS=$(gh_get "${GH_API}/repos/${REPO}/pulls/${PR_NUM}/reviews")
    FIRST_REVIEW_TIME=$(echo "$REVIEWS" | jq -r '.[0].submitted_at // empty' 2>/dev/null || true)
    PR_CREATED=$(echo "$MERGED_PRS_DATA" | jq -r ".[] | select(.number == ${PR_NUM}) | .created_at" 2>/dev/null || true)

    if [ -n "$FIRST_REVIEW_TIME" ] && [ -n "$PR_CREATED" ]; then
      # Calculate review turnaround in hours
      REVIEW_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$FIRST_REVIEW_TIME" +%s 2>/dev/null || date -d "$FIRST_REVIEW_TIME" +%s 2>/dev/null || echo 0)
      CREATED_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$PR_CREATED" +%s 2>/dev/null || date -d "$PR_CREATED" +%s 2>/dev/null || echo 0)

      if [ "$REVIEW_EPOCH" -gt 0 ] && [ "$CREATED_EPOCH" -gt 0 ]; then
        REVIEW_HOURS=$(( (REVIEW_EPOCH - CREATED_EPOCH) / 3600 ))
        TOTAL_REVIEW_TIME_HOURS=$((TOTAL_REVIEW_TIME_HOURS + REVIEW_HOURS))
        REVIEW_COUNT=$((REVIEW_COUNT + 1))
      fi
    fi

    TOTAL_PRS_REVIEWED=$((TOTAL_PRS_REVIEWED + $(echo "$REVIEWS" | jq 'length' 2>/dev/null || echo 0)))
  done

  echo ""
done

# --- Calculate Aggregates ---

echo "=== Aggregate Metrics ==="

# Average review turnaround
if [ "$REVIEW_COUNT" -gt 0 ]; then
  AVG_REVIEW_HOURS=$((TOTAL_REVIEW_TIME_HOURS / REVIEW_COUNT))
else
  AVG_REVIEW_HOURS=0
fi

echo "Performance:"
echo "  PRs merged (throughput): ${TOTAL_PRS_MERGED}"
echo ""
echo "Activity (counter-metric):"
echo "  Commits: ${TOTAL_COMMITS}"
echo "  PRs created: ${TOTAL_PRS_CREATED}"
echo "  Code churn: +${TOTAL_ADDITIONS} / -${TOTAL_DELETIONS}"
echo ""
echo "Communication:"
echo "  PRs with reviews: ${REVIEW_COUNT}"
echo "  Avg review turnaround: ${AVG_REVIEW_HOURS}h"
echo "  Total reviews given: ${TOTAL_PRS_REVIEWED}"
echo ""

# --- Push to Supabase ---

echo "=== Pushing to Supabase ==="

# Performance metrics
PERF_PAYLOAD=$(cat <<EOF
{
  "date": "${NOW}",
  "pr_review_depth": ${TOTAL_PRS_REVIEWED},
  "period_days": ${DAYS},
  "prs_merged": ${TOTAL_PRS_MERGED}
}
EOF
)
push_to_supabase "space_performance" "$PERF_PAYLOAD"

# Activity metrics
ACTIVITY_PAYLOAD=$(cat <<EOF
{
  "user_id": "aggregate",
  "date": "${NOW}",
  "commits_count": ${TOTAL_COMMITS},
  "prs_created": ${TOTAL_PRS_CREATED},
  "prs_reviewed": ${TOTAL_PRS_REVIEWED},
  "code_additions": ${TOTAL_ADDITIONS},
  "code_deletions": ${TOTAL_DELETIONS},
  "period_days": ${DAYS}
}
EOF
)
push_to_supabase "space_activity" "$ACTIVITY_PAYLOAD"

# Collaboration metrics
COLLAB_PAYLOAD=$(cat <<EOF
{
  "user_id": "aggregate",
  "week_start": "${WEEK_START}",
  "pr_comments": ${TOTAL_PRS_REVIEWED},
  "code_reviews_given": ${REVIEW_COUNT},
  "avg_review_turnaround_hours": ${AVG_REVIEW_HOURS}
}
EOF
)
push_to_supabase "space_collaboration" "$COLLAB_PAYLOAD"

echo ""
echo "=== Collection Complete ==="
echo "Period: ${DAYS} days | Repos: ${#REPO_LIST[@]} | Metrics pushed: 3 tables"
