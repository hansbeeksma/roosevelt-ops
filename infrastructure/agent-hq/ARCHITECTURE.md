# Agent HQ - Multi-Agent Architecture

**Version:** 1.0.0
**Issue:** ROOSE-43 (GitHub Agent HQ Multi-Agent Adoption)
**Date:** 2026-02-17

---

## Overview

Agent HQ implements a hierarchical multi-agent coordination system inspired by GitHub's Agent HQ architecture (56% SWE-bench pass rate pattern). The system decomposes complex tasks into specialized subtasks, delegates to purpose-built agents, and maintains quality through automated review gates.

---

## Agent Taxonomy

### Tier 1: Orchestrator

| Agent | Role | Responsibilities |
|-------|------|-----------------|
| **Orchestrator** | Strategic coordinator | Task decomposition, delegation, progress tracking, escalation |

The orchestrator receives high-level objectives and breaks them into actionable subtasks. It selects the appropriate specialist agent for each subtask and monitors execution.

### Tier 2: Manager Agents

| Agent | Domain | Scope |
|-------|--------|-------|
| **Planning Manager** | Architecture & design | Breaks features into technical tasks, dependency analysis |
| **Execution Manager** | Development workflow | Coordinates coding, testing, review cycle |
| **Quality Manager** | Quality assurance | Oversees review gates, metrics collection |

### Tier 3: Specialist Workers

| Agent | Specialization | Input | Output |
|-------|---------------|-------|--------|
| **Research Agent** | Information gathering | Query, context | Research report, citations |
| **Planning Agent** | Implementation planning | Requirements | Implementation plan, task breakdown |
| **Coding Agent** | Code implementation | Spec, plan | Code changes, tests |
| **Testing Agent** | Test execution & validation | Code changes | Test results, coverage report |
| **Review Agent** | Code quality review | Code diff | Review comments, approval/rejection |

---

## Communication Protocol

### Message Schema

All inter-agent communication follows a standardized JSON schema:

```json
{
  "$schema": "agent-hq-message-v1",
  "message_id": "uuid-v4",
  "timestamp": "ISO-8601",
  "from": {
    "agent_id": "orchestrator",
    "agent_type": "orchestrator"
  },
  "to": {
    "agent_id": "coding-agent-1",
    "agent_type": "specialist"
  },
  "type": "task_assignment|task_result|status_update|escalation|quality_gate",
  "payload": {},
  "context": {
    "session_id": "string",
    "parent_task_id": "string",
    "trace_id": "string"
  },
  "metadata": {
    "priority": "critical|high|medium|low",
    "timeout_ms": 300000,
    "retry_count": 0,
    "max_retries": 3
  }
}
```

### Event Types

| Event | Direction | Purpose |
|-------|-----------|---------|
| `task_assignment` | Orchestrator -> Worker | Delegate subtask |
| `task_result` | Worker -> Orchestrator | Return completed work |
| `status_update` | Worker -> Orchestrator | Progress heartbeat |
| `escalation` | Worker -> Manager/Orchestrator | Cannot complete, needs help |
| `quality_gate` | Review Agent -> Orchestrator | Pass/fail quality check |
| `context_share` | Any -> Any | Share knowledge graph updates |

### Quality Gates

Quality gates are automated checkpoints between agent handoffs:

```
Coding Agent --> [Code Review Gate] --> Testing Agent --> [Test Quality Gate] --> Orchestrator
```

| Gate | Trigger | Pass Criteria | Fail Action |
|------|---------|--------------|-------------|
| **Code Review** | After coding completes | No critical issues, style compliance | Return to coding agent with feedback |
| **Test Quality** | After tests pass | 80%+ coverage, no regressions | Return to coding agent |
| **Integration** | After all subtasks complete | All dependencies satisfied, no conflicts | Escalate to manager |
| **Final Review** | Before task completion | All gates passed, acceptance criteria met | Human review |

---

## Shared State Architecture

### Layer 1: Memory MCP (Knowledge Graph)

Used for inter-agent communication and shared understanding:

```
Entities: agents, tasks, decisions, discoveries
Relations: assigned_to, depends_on, discovered_by, blocked_by
```

### Layer 2: CLEO Task State

Task lifecycle management with hierarchical tracking:

```
Epic (CLEO) <-> Plane Issue
  Task <-> Sub-issue
    Subtask <-> Agent assignment
```

### Layer 3: File System (Artifacts)

Persistent artifacts from agent work:

```
infrastructure/agent-hq/
  artifacts/
    {session-id}/
      research/      # Research agent outputs
      plans/         # Planning agent outputs
      reviews/       # Review agent outputs
      metrics/       # Quality metrics
```

---

## Integration Points

### CLEO Orchestrator Skill

The agent-hq orchestrator integrates with the existing CLEO orchestrator skill:

```bash
# CLEO spawns agent-hq orchestrator for complex tasks
cleo orchestrator spawn T001 --strategy agent-hq

# Agent-hq decomposes and manages subtasks
# Reports back to CLEO on completion
```

### Skill Router Integration

New routing rules for agent-hq:

```yaml
# Routing criteria
complexity: high          # Only for complex tasks
subtask_count: ">3"       # Tasks that decompose into 3+ subtasks
cross_domain: true        # Tasks spanning multiple domains
```

### Plane Issue Lifecycle

```
Plane: Backlog -> In Progress -> In Review -> Done
Agent-HQ:  Decompose -> Assign -> Execute -> Review -> Complete
CLEO:      focus set -> work -> verify -> complete
```

---

## Metrics

### Agent Utilization

| Metric | Description | Target |
|--------|-------------|--------|
| `agent_active_time` | Time agent spends on tasks | >80% |
| `agent_idle_time` | Time between task assignments | <20% |
| `agent_throughput` | Tasks completed per hour | Varies by type |

### Handoff Latency

| Metric | Description | Target |
|--------|-------------|--------|
| `handoff_delay` | Time between agent completion and next assignment | <5s |
| `gate_evaluation_time` | Time for quality gate check | <30s |
| `escalation_response_time` | Time to handle escalation | <60s |

### Quality Scores

| Metric | Description | Target |
|--------|-------------|--------|
| `first_pass_rate` | Tasks passing quality gate on first attempt | >70% |
| `rework_rate` | Tasks requiring rework after review | <30% |
| `defect_escape_rate` | Issues found after final gate | <5% |

---

## Deployment Phases

### Phase 1: Architecture Design (Current - Week 1)
- [x] Define agent taxonomy (orchestrator, specialists, reviewers)
- [x] Design communication protocol (JSON schemas, events)
- [x] Define shared state architecture (Memory MCP, CLEO, filesystem)
- [x] Document quality gates and metrics

### Phase 2: Agent Development (Weeks 2-4)
- [ ] Implement orchestrator agent (task decomposition, delegation)
- [ ] Implement 5 specialist agents (research, planning, coding, testing, review)
- [ ] Implement quality gates (code review agent between coding and testing)
- [ ] Integration tests for agent communication

### Phase 3: Integration (Week 5)
- [ ] Integrate with CLEO orchestrator skill
- [ ] Add to skill-router routing rules
- [ ] Metrics tracking (agent utilization, handoff latency, quality scores)
- [ ] Production rollout and monitoring

---

## Related Documents

- [Communication Protocol Schema](schemas/agent-message.schema.json)
- [Agent Configuration](configs/agent-registry.json)
- [Orchestrator Script](scripts/orchestrate.sh)
- [CLEO Orchestrator Skill](~/.claude/skills/orchestrator/SKILL.md)
- [Multi-Agent Issue Claiming Research](../docs/research/multi-agent-issue-claiming-research.md)
