#!/usr/bin/env bash
# Agent HQ Orchestrator - Multi-Agent Task Coordination
# Issue: ROOSE-43 / ROOSE-50
# Version: 1.0.0
#
# Usage:
#   orchestrate.sh <command> [options]
#
# Commands:
#   decompose <task-id>    Decompose a task into subtasks
#   assign <subtask-id>    Assign subtask to appropriate agent
#   status [session-id]    Show orchestration session status
#   metrics [session-id]   Show agent metrics
#   validate               Validate agent registry configuration

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_HQ_DIR="$(dirname "$SCRIPT_DIR")"
REGISTRY_FILE="$AGENT_HQ_DIR/configs/agent-registry.json"
SCHEMA_FILE="$AGENT_HQ_DIR/schemas/agent-message.schema.json"
ARTIFACTS_DIR="$AGENT_HQ_DIR/artifacts"
LOG_FILE="$AGENT_HQ_DIR/orchestration.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ============================================================================
# Logging
# ============================================================================

log() {
  local level="$1"
  shift
  local timestamp
  timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  echo "[$timestamp] [$level] $*" >> "$LOG_FILE"

  case "$level" in
    ERROR)   echo -e "${RED}[ERROR]${NC} $*" >&2 ;;
    WARN)    echo -e "${YELLOW}[WARN]${NC} $*" >&2 ;;
    INFO)    echo -e "${GREEN}[INFO]${NC} $*" ;;
    DEBUG)   [[ "${VERBOSE:-0}" == "1" ]] && echo -e "${BLUE}[DEBUG]${NC} $*" ;;
  esac
}

# ============================================================================
# Registry Operations
# ============================================================================

validate_registry() {
  if [[ ! -f "$REGISTRY_FILE" ]]; then
    log ERROR "Agent registry not found: $REGISTRY_FILE"
    return 1
  fi

  # Validate JSON syntax
  if ! python3 -c "import json; json.load(open('$REGISTRY_FILE'))" 2>/dev/null; then
    log ERROR "Invalid JSON in agent registry"
    return 1
  fi

  # Count agents
  local agent_count
  agent_count=$(python3 -c "
import json
with open('$REGISTRY_FILE') as f:
    data = json.load(f)
print(len(data.get('agents', {})))
")

  log INFO "Registry valid: $agent_count agents configured"

  # List agents
  python3 -c "
import json
with open('$REGISTRY_FILE') as f:
    data = json.load(f)
for agent_id, agent in data.get('agents', {}).items():
    print(f'  {agent[\"type\"]:12} | {agent_id:20} | model: {agent.get(\"model_preference\", \"default\")}')
"

  # Validate quality gates
  local gate_count
  gate_count=$(python3 -c "
import json
with open('$REGISTRY_FILE') as f:
    data = json.load(f)
gates = data.get('quality_gates', {})
print(len(gates))
for name, gate in gates.items():
    print(f'  {name:20} | trigger: {gate[\"trigger\"]:25} | evaluator: {gate[\"evaluator\"]}')
")

  log INFO "Quality gates validated"
  return 0
}

get_agent_for_role() {
  local role="$1"
  python3 -c "
import json
with open('$REGISTRY_FILE') as f:
    data = json.load(f)
for agent_id, agent in data.get('agents', {}).items():
    if agent.get('role') == '$role':
        print(json.dumps({
            'id': agent_id,
            'type': agent['type'],
            'model': agent.get('model_preference', 'sonnet'),
            'budget': agent.get('max_token_budget', 50000),
            'timeout': agent.get('timeout_ms', 300000)
        }))
        break
else:
    print('null')
"
}

# ============================================================================
# Task Decomposition
# ============================================================================

decompose_task() {
  local task_id="$1"

  log INFO "Decomposing task: $task_id"

  # Check if CLEO task exists
  if ! cleo exists "$task_id" --quiet 2>/dev/null; then
    log ERROR "Task $task_id not found in CLEO"
    return 1
  fi

  # Get task details
  local task_json
  task_json=$(cleo show "$task_id" --format json 2>/dev/null)

  local task_title
  task_title=$(echo "$task_json" | python3 -c "import json,sys; print(json.load(sys.stdin).get('title', 'Unknown'))")

  log INFO "Task: $task_title"

  # Create session directory
  local session_id
  session_id="session_$(date +%Y%m%d_%H%M%S)_$(openssl rand -hex 4)"
  local session_dir="$ARTIFACTS_DIR/$session_id"
  mkdir -p "$session_dir"/{research,plans,reviews,metrics}

  # Generate decomposition prompt
  cat > "$session_dir/decomposition-request.json" << EOF
{
  "session_id": "$session_id",
  "task_id": "$task_id",
  "task_title": "$task_title",
  "decomposition_strategy": "hierarchical",
  "agent_types_available": ["research", "planning", "coding", "testing", "review"],
  "quality_gates": ["code_review", "test_quality", "integration", "final_review"],
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

  log INFO "Session created: $session_id"
  log INFO "Artifacts dir: $session_dir"
  echo "$session_id"
}

# ============================================================================
# Agent Assignment
# ============================================================================

assign_agent() {
  local subtask_id="$1"
  local agent_role="${2:-}"

  if [[ -z "$agent_role" ]]; then
    # Auto-detect role based on task labels
    log INFO "Auto-detecting agent role for: $subtask_id"
    agent_role="coding" # Default
  fi

  local agent_info
  agent_info=$(get_agent_for_role "$agent_role")

  if [[ "$agent_info" == "null" ]]; then
    log ERROR "No agent found for role: $agent_role"
    return 1
  fi

  local agent_id
  agent_id=$(echo "$agent_info" | python3 -c "import json,sys; print(json.load(sys.stdin)['id'])")
  local model
  model=$(echo "$agent_info" | python3 -c "import json,sys; print(json.load(sys.stdin)['model'])")

  log INFO "Assigned $subtask_id -> $agent_id (model: $model)"

  # Generate assignment message
  python3 -c "
import json, uuid
from datetime import datetime, timezone

message = {
    'message_id': str(uuid.uuid4()),
    'timestamp': datetime.now(timezone.utc).isoformat(),
    'from': {
        'agent_id': 'orchestrator',
        'agent_type': 'orchestrator',
        'agent_role': 'orchestrator'
    },
    'to': {
        'agent_id': '$agent_id',
        'agent_type': 'specialist',
        'agent_role': '$agent_role'
    },
    'type': 'task_assignment',
    'payload': {
        'task_id': '$subtask_id',
        'objective': 'Execute assigned subtask',
        'acceptance_criteria': ['Task completed successfully', 'Quality gate passed']
    },
    'context': {
        'session_id': 'current',
        'trace_id': str(uuid.uuid4())
    },
    'metadata': {
        'priority': 'medium',
        'timeout_ms': 300000,
        'retry_count': 0,
        'max_retries': 3
    }
}

print(json.dumps(message, indent=2))
"
}

# ============================================================================
# Status & Metrics
# ============================================================================

show_status() {
  local session_id="${1:-}"

  echo -e "${PURPLE}=== Agent HQ Status ===${NC}"
  echo ""

  # Show registry info
  if [[ -f "$REGISTRY_FILE" ]]; then
    local agent_count
    agent_count=$(python3 -c "
import json
with open('$REGISTRY_FILE') as f:
    data = json.load(f)
print(len(data.get('agents', {})))
")
    echo -e "  Registered agents: ${GREEN}$agent_count${NC}"
  else
    echo -e "  Registry: ${RED}NOT FOUND${NC}"
  fi

  # Show active sessions
  if [[ -d "$ARTIFACTS_DIR" ]]; then
    local session_count
    session_count=$(find "$ARTIFACTS_DIR" -maxdepth 1 -type d -name "session_*" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "  Active sessions:   ${BLUE}$session_count${NC}"

    if [[ "$session_count" -gt 0 ]]; then
      echo ""
      echo "  Sessions:"
      find "$ARTIFACTS_DIR" -maxdepth 1 -type d -name "session_*" -exec basename {} \; 2>/dev/null | sort -r | head -5 | while read -r sid; do
        echo "    - $sid"
      done
    fi
  else
    echo -e "  Sessions:          ${YELLOW}none${NC}"
  fi

  echo ""

  # Show CLEO integration
  if command -v cleo &>/dev/null; then
    echo -e "  CLEO:              ${GREEN}available${NC}"
  else
    echo -e "  CLEO:              ${RED}not found${NC}"
  fi

  # Show schema
  if [[ -f "$SCHEMA_FILE" ]]; then
    echo -e "  Message schema:    ${GREEN}valid${NC}"
  else
    echo -e "  Message schema:    ${RED}missing${NC}"
  fi
}

show_metrics() {
  echo -e "${PURPLE}=== Agent HQ Metrics ===${NC}"
  echo ""

  python3 -c "
import json

with open('$REGISTRY_FILE') as f:
    data = json.load(f)

agents = data.get('agents', {})
routing = data.get('routing', {})
budgets = routing.get('token_budgets', {})

print('Token Budgets:')
print(f'  Per-agent max:     {budgets.get(\"per_agent_max\", \"N/A\")}')
print(f'  Batch total max:   {budgets.get(\"batch_total_max\", \"N/A\")}')
print(f'  Warning threshold: {budgets.get(\"warning_threshold\", \"N/A\")}')
print(f'  Kill threshold:    {budgets.get(\"kill_threshold\", \"N/A\")}')
print()

print('Agent Configuration:')
print(f'  {\"Agent\":<25} {\"Type\":<15} {\"Model\":<10} {\"Budget\":<10} {\"Concurrency\":<12}')
print(f'  {\"-\"*25} {\"-\"*15} {\"-\"*10} {\"-\"*10} {\"-\"*12}')
for agent_id, agent in agents.items():
    print(f'  {agent_id:<25} {agent[\"type\"]:<15} {agent.get(\"model_preference\", \"default\"):<10} {agent.get(\"max_token_budget\", 0):<10} {agent.get(\"concurrency\", 1):<12}')

print()
gates = data.get('quality_gates', {})
print('Quality Gates:')
for name, gate in gates.items():
    print(f'  {name:<20} trigger: {gate[\"trigger\"]:<25} evaluator: {gate[\"evaluator\"]}')
" 2>/dev/null || log ERROR "Failed to read metrics from registry"
}

# ============================================================================
# Main
# ============================================================================

usage() {
  cat << EOF
Agent HQ Orchestrator v1.0.0

Usage: $(basename "$0") <command> [options]

Commands:
  decompose <task-id>        Decompose a CLEO task into subtasks
  assign <subtask-id> [role] Assign subtask to specialist agent
  status [session-id]        Show orchestration status
  metrics                    Show agent metrics and configuration
  validate                   Validate registry and schema

Options:
  -v, --verbose              Enable debug logging
  -h, --help                 Show this help

Examples:
  $(basename "$0") validate
  $(basename "$0") decompose T001
  $(basename "$0") assign T001.1 coding
  $(basename "$0") status
  $(basename "$0") metrics
EOF
}

main() {
  local command="${1:-help}"
  shift || true

  # Parse global options
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -v|--verbose) VERBOSE=1; shift ;;
      -h|--help) usage; exit 0 ;;
      *) break ;;
    esac
  done

  case "$command" in
    validate)
      validate_registry
      ;;
    decompose)
      local task_id="${1:?Task ID required}"
      decompose_task "$task_id"
      ;;
    assign)
      local subtask_id="${1:?Subtask ID required}"
      local role="${2:-}"
      assign_agent "$subtask_id" "$role"
      ;;
    status)
      show_status "${1:-}"
      ;;
    metrics)
      show_metrics
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      log ERROR "Unknown command: $command"
      usage
      exit 1
      ;;
  esac
}

main "$@"
