# Agent HQ Multi-Agent Adoption Guide

**Issue:** ROOSE-43
**Version:** 1.0.0
**Date:** 2026-02-17

---

## What is Agent HQ?

Agent HQ is Roosevelt OPS's multi-agent coordination system, inspired by GitHub's Agent HQ architecture which achieves a 56% SWE-bench pass rate through hierarchical task decomposition and specialized agent collaboration.

### Key Principles

1. **Agent Specialization** -- Each agent excels at one task type (research, coding, testing, review)
2. **Hierarchical Orchestration** -- Orchestrator decomposes tasks, managers coordinate, workers execute
3. **Quality Gates** -- Automated review checkpoints between agent handoffs prevent defects
4. **Shared Context** -- Knowledge graph and shared state ensure agents build on each other's work

---

## Architecture Overview

```
                    Orchestrator (Opus)
                    /       |       \
           Planning     Execution    Quality
           Manager      Manager      Manager
           (Sonnet)     (Sonnet)     (Sonnet)
          /    \        /   |   \        \
     Research  Plan   Code  Test  Review  Metrics
     (Haiku) (Sonnet)(Sonnet)(Haiku)(Sonnet)
```

### Agent Taxonomy

| Tier | Role | Model | Purpose |
|------|------|-------|---------|
| **T1** | Orchestrator | Opus | Task decomposition, delegation, progress tracking |
| **T2** | Planning Manager | Sonnet | Requirements analysis, dependency mapping |
| **T2** | Execution Manager | Sonnet | Workflow coordination, resource allocation |
| **T2** | Quality Manager | Sonnet | Quality gates, metrics, standards |
| **T3** | Research Agent | Haiku | Web research, docs lookup, codebase analysis |
| **T3** | Planning Agent | Sonnet | Implementation plans, architecture design |
| **T3** | Coding Agent | Sonnet | Code implementation, refactoring |
| **T3** | Testing Agent | Haiku | Test execution, coverage analysis |
| **T3** | Review Agent | Sonnet | Code review, security audit |

---

## Getting Started

### Prerequisites

- CLEO CLI installed and configured (`cleo --version`)
- Claude Code with MCP servers configured
- Memory MCP available for shared state
- Project registered in Plane (ROOSE)

### Step 1: Validate Configuration

```bash
# Validate agent registry
cd ~/Development/products/roosevelt-ops
./infrastructure/agent-hq/scripts/orchestrate.sh validate
```

Expected output:
```
[INFO] Registry valid: 9 agents configured
  orchestrator | orchestrator         | model: opus
  manager      | planning-manager     | model: sonnet
  ...
[INFO] Quality gates validated
```

### Step 2: Understand Task Routing

Tasks are routed based on complexity:

| Complexity | Files | Subtasks | Strategy |
|-----------|-------|----------|----------|
| **Low** | 1-3 | 0-1 | Direct to specialist agent |
| **Medium** | 4-10 | 2-3 | Manager-coordinated |
| **High** | 10+ | 3+ | Full orchestration with all tiers |

### Step 3: Run Your First Orchestration

```bash
# Decompose a complex CLEO task
./infrastructure/agent-hq/scripts/orchestrate.sh decompose T001

# Check status
./infrastructure/agent-hq/scripts/orchestrate.sh status

# View metrics
./infrastructure/agent-hq/scripts/orchestrate.sh metrics
```

---

## Integration with Existing Tools

### CLEO Integration

Agent HQ integrates with CLEO's existing orchestrator protocol:

```bash
# Standard CLEO orchestration (unchanged)
cleo orchestrator spawn T001

# Agent HQ enhanced orchestration (for complex tasks)
cleo orchestrator spawn T001 --strategy agent-hq
```

The orchestrator analyzes task complexity and decides whether to use:
- Direct specialist (simple tasks)
- Manager-coordinated (medium tasks)
- Full Agent HQ orchestration (complex tasks)

### Skill Router Integration

The skill router automatically detects when Agent HQ should be invoked:

| Trigger | Threshold | Action |
|---------|-----------|--------|
| High complexity | >10 files affected | Route to Agent HQ orchestrator |
| Cross-domain | Multiple labels/domains | Route to planning manager first |
| Multi-step | >3 sequential tasks | Route to execution manager |

### Memory MCP (Shared State)

Agents communicate via the Memory MCP knowledge graph:

```
Entities:
  - agent:orchestrator     (active session state)
  - task:T001              (decomposed task tree)
  - decision:arch-choice-1 (architectural decisions made)
  - discovery:lib-found-1  (research discoveries)

Relations:
  - agent -> assigned_to -> task
  - task -> depends_on -> task
  - decision -> made_by -> agent
  - discovery -> found_by -> agent
```

### Plane Integration

Agent HQ respects the Plane issue lifecycle:

| Agent Action | Plane Transition |
|-------------|-----------------|
| Orchestrator starts task | Backlog -> In Progress |
| Quality gate fails | Stays In Progress |
| All gates pass | In Progress -> In Review |
| Final review passes | In Review -> Done |

---

## Communication Protocol

All inter-agent messages follow the standardized JSON schema at:
`infrastructure/agent-hq/schemas/agent-message.schema.json`

### Message Types

| Type | Direction | Purpose |
|------|-----------|---------|
| `task_assignment` | Orchestrator -> Worker | Delegate subtask |
| `task_result` | Worker -> Orchestrator | Return completed work |
| `status_update` | Worker -> Orchestrator | Progress heartbeat |
| `escalation` | Worker -> Manager | Cannot complete, needs help |
| `quality_gate` | Reviewer -> Orchestrator | Pass/fail quality check |
| `context_share` | Any -> Any | Share knowledge updates |

### Quality Gates

Four gates ensure quality between handoffs:

1. **Code Review Gate** -- After coding, before testing
   - Max 0 critical issues
   - Style compliance required
   - Evaluator: Review Agent

2. **Test Quality Gate** -- After tests pass
   - Min 80% code coverage
   - Zero regressions
   - Evaluator: Quality Manager

3. **Integration Gate** -- After all subtasks complete
   - All dependencies satisfied
   - No merge conflicts
   - Evaluator: Execution Manager

4. **Final Review Gate** -- Before marking done
   - All previous gates passed
   - Acceptance criteria met
   - Evaluator: Quality Manager

---

## Token Budget Management

| Scope | Budget | Warning | Kill |
|-------|--------|---------|------|
| Per agent | 50,000 | 40,000 | 60,000 |
| Batch total | 150,000 | 120,000 | 175,000 |

Agent model selection optimizes cost:
- **Haiku** (3x cheaper): Research, testing (high-frequency, low-complexity)
- **Sonnet** (balanced): Coding, planning, review (standard development)
- **Opus** (deepest reasoning): Orchestrator only (complex decomposition)

---

## Metrics and Monitoring

### Agent Performance Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Agent active time | >80% | Time spent executing vs idle |
| Handoff latency | <5s | Time between agent completion and next assignment |
| First-pass rate | >70% | Tasks passing quality gate on first attempt |
| Rework rate | <30% | Tasks requiring revision after review |
| Defect escape rate | <5% | Issues found after final gate |

### Viewing Metrics

```bash
# Agent HQ metrics dashboard
./infrastructure/agent-hq/scripts/orchestrate.sh metrics
```

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Agent timeout | Task too complex for budget | Increase `max_token_budget` in registry |
| Quality gate loop | Code keeps failing review | Check gate `max_iterations`, review criteria |
| Escalation storm | Many agents escalating simultaneously | Check dependency resolution, reduce concurrency |
| Context overflow | Large codebase analysis | Use targeted file reads, not full-repo scans |

### Debug Mode

```bash
# Run with verbose logging
./infrastructure/agent-hq/scripts/orchestrate.sh -v status

# Check orchestration log
tail -f infrastructure/agent-hq/orchestration.log
```

---

## NotebookLM Knowledge Sources

For deeper understanding of multi-agent patterns, upload to NotebookLM:

1. **GitHub Agent HQ whitepaper** -- Architecture and SWE-bench results
2. **Multi-Agent LLM patterns** -- AutoGen, CrewAI, LangGraph comparison
3. **SWE-bench benchmark results** -- Performance analysis across approaches

---

## Related Documentation

- [Architecture Document](../../infrastructure/agent-hq/ARCHITECTURE.md)
- [Agent Registry](../../infrastructure/agent-hq/configs/agent-registry.json)
- [Message Schema](../../infrastructure/agent-hq/schemas/agent-message.schema.json)
- [Orchestrate Script](../../infrastructure/agent-hq/scripts/orchestrate.sh)
- [Multi-Agent Issue Claiming Research](../research/multi-agent-issue-claiming-research.md)
- [CLEO Orchestrator Skill](~/.claude/skills/orchestrator/SKILL.md)
