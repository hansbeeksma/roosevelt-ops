# GitHub Agent HQ Multi-Agent System

**Issue:** ROOSE-50
**Version:** 1.0.0
**Date:** 2026-02-17
**Related:** ROOSE-43 (Adoption), ROOSE-64 (Implementation Plan)

---

## System Overview

The Agent HQ Multi-Agent System implements GitHub's hierarchical orchestration pattern for automated software engineering. This system coordinates multiple specialized AI agents to decompose, execute, and validate complex development tasks.

### State-of-the-Art Performance

GitHub's Agent HQ achieves 56% on the SWE-bench benchmark through:

1. **Task decomposition** -- Breaking complex issues into focused subtasks
2. **Agent specialization** -- Each agent optimized for one task type
3. **Quality gates** -- Automated review between handoffs
4. **Shared context** -- Persistent knowledge graph across agents

---

## System Components

### 1. Orchestrator Agent

The orchestrator is the entry point for all complex tasks.

**Responsibilities:**
- Receive high-level task from CLEO or Plane
- Analyze complexity and select workflow
- Decompose into subtasks with dependencies
- Assign agents and manage lifecycle
- Collect results and report completion

**Implementation:**

```
Input: CLEO task T001 or Plane issue ROOSE-XXX
  |
  v
[Complexity Analysis]
  |
  +--> Low: Direct to specialist
  |
  +--> Medium: Manager-coordinated
  |
  +--> High: Full orchestration
  |
  v
[Workflow Selection]
  |
  v
[Task Decomposition]
  |
  v
[Agent Assignment + Execution]
  |
  v
[Quality Gates]
  |
  v
Output: Completed task with artifacts
```

**Configuration:** `infrastructure/agent-hq/configs/agent-registry.json`

### 2. Manager Agents

Three manager agents coordinate domain-specific workflows:

#### Planning Manager
- Breaks features into technical tasks
- Maps dependencies between subtasks
- Assesses risks and constraints
- Selects architecture patterns

#### Execution Manager
- Coordinates coding -> testing -> review cycle
- Manages parallel execution where safe
- Resolves blocking dependencies
- Handles resource allocation

#### Quality Manager
- Evaluates quality gate results
- Collects and aggregates metrics
- Enforces standards compliance
- Triggers rework when needed

### 3. Specialist Workers

Five specialist agents handle specific task types:

| Agent | Input | Output | Tools Used |
|-------|-------|--------|------------|
| **Research** | Query, context | Report, citations | WebSearch, Perplexity, Context7, Exa |
| **Planning** | Requirements | Implementation plan | Sequential Thinking, Read, Grep |
| **Coding** | Spec, plan | Code changes, tests | Read, Write, Edit, Bash, ESLint |
| **Testing** | Code changes | Test results, coverage | Bash, Playwright, Read |
| **Review** | Code diff | Review comments | Read, Grep, ESLint |

### 4. Quality Gates

Four automated checkpoints prevent defects:

```
Coding Agent
    |
    v
[Code Review Gate] -- Review Agent evaluates
    |                  Max 0 critical, 2 high issues
    | pass             Style compliance required
    v
Testing Agent
    |
    v
[Test Quality Gate] -- Quality Manager evaluates
    |                   Min 80% coverage
    | pass              Zero regressions
    v
[Integration Gate] -- Execution Manager evaluates
    |                  All deps satisfied
    | pass             No conflicts, build passes
    v
[Final Review Gate] -- Quality Manager evaluates
    |                   All gates passed
    | pass              Acceptance criteria met
    v
DONE
```

### 5. Shared State Layer

Three tiers of shared state:

| Layer | Technology | Purpose | Persistence |
|-------|-----------|---------|-------------|
| **Knowledge Graph** | Memory MCP | Inter-agent communication, decisions, discoveries | Session |
| **Task State** | CLEO | Task lifecycle, hierarchy, dependencies | Permanent |
| **Artifacts** | File System | Research reports, review comments, metrics | Session |

---

## Workflow Definitions

Predefined workflows for common task types:

### Feature Implementation Workflow

```
Research -> Planning -> Coding -> [Code Review] -> Testing -> [Test Quality] -> [Final Review]
```

Duration: ~15-30 min for medium complexity

### Bug Fix Workflow

```
Diagnosis -> Fix -> [Code Review] -> Testing
```

Duration: ~5-15 min for typical bugs

### Refactoring Workflow

```
Analysis -> Planning -> Baseline Tests -> Refactor -> [Code Review] -> Regression Tests -> [Test Quality]
```

Duration: ~20-40 min (extra safety with baseline testing)

### Security Audit Workflow

```
Scan -> Analysis -> Remediation -> Verification -> [Final Review]
```

Duration: ~30-60 min (thorough, human review at end)

**Full workflow definitions:** `infrastructure/agent-hq/configs/workflows.json`

---

## Integration Architecture

### CLEO Integration

```bash
# CLEO session starts
cleo session start --scope epic:T001 --auto-focus

# Task identified as complex (>3 subtasks, cross-domain)
cleo orchestrator spawn T001 --strategy agent-hq

# Agent HQ takes over:
# 1. Decomposes T001 into T001.research, T001.plan, T001.code, etc.
# 2. Creates CLEO subtasks for tracking
# 3. Assigns specialists
# 4. Runs quality gates
# 5. Completes subtasks in CLEO
# 6. Reports back to CLEO orchestrator
```

### Skill Router Integration

The skill router detects when Agent HQ should be invoked based on:

1. **Task complexity** -- Estimated from description length, file count, label analysis
2. **Cross-domain work** -- Multiple labels from different domains (frontend + backend)
3. **Multi-step requirements** -- Tasks with ordered dependencies

Routing rules in agent registry:
```json
{
  "routing_rules": {
    "min_complexity": "high",
    "min_subtask_count": 3,
    "requires_cross_domain": false
  }
}
```

### Plane Issue Lifecycle

Agent HQ automatically updates Plane issue state:

| Event | Plane Transition | CLEO Action |
|-------|-----------------|-------------|
| Orchestrator starts | -> In Progress | focus set |
| Subtask assigned | (no change) | add subtask |
| Quality gate fails | (no change) | update --notes |
| Quality gate passes | (no change) | verify --gate |
| All gates pass | -> In Review | (waiting) |
| Final review passes | -> Done | complete |

### Memory MCP Knowledge Graph

Entity types and relations for shared context:

```
Entities:
  agent:<id>           - Agent instance state (busy/idle/error)
  task:<id>            - Task decomposition and status
  decision:<id>        - Architecture/design decisions made
  discovery:<id>       - Research findings and insights
  risk:<id>            - Identified risks and mitigations
  artifact:<path>      - File artifacts produced

Relations:
  agent    --assigned_to-->    task
  task     --depends_on-->     task
  task     --blocked_by-->     task
  decision --made_by-->        agent
  decision --affects-->        task
  discovery --found_by-->      agent
  discovery --relevant_to-->   task
  risk     --identified_by-->  agent
  risk     --mitigated_by-->   task
  artifact --produced_by-->    agent
  artifact --belongs_to-->     task
```

---

## Metrics and Monitoring

### Tracked Metrics

| Category | Metric | Target | Alert |
|----------|--------|--------|-------|
| **Performance** | Agent utilization | >80% | <40% |
| **Performance** | Handoff latency | <5s | >30s |
| **Performance** | Task completion time | Varies | p95 threshold |
| **Quality** | First-pass rate | >70% | <30% |
| **Quality** | Rework rate | <30% | >70% |
| **Quality** | Defect escape rate | <5% | >20% |
| **Reliability** | Escalation rate | <10% | >40% |
| **Cost** | Token usage per agent | <50K | >50K (kill) |
| **Cost** | Batch token total | <150K | >150K (kill) |

**Full metrics configuration:** `infrastructure/agent-hq/configs/metrics.json`

### Alerting Rules

| Trigger | Severity | Action |
|---------|----------|--------|
| Token > 40K per agent | Warning | Log + CLEO note |
| Token > 50K per agent | Critical | Kill agent |
| Escalation rate > 40% | Critical | Pause orchestration |
| Defect escape > 20% | Critical | Tighten quality gates |

---

## Security Considerations

### Agent Isolation

- Each agent operates within defined tool boundaries
- Agents cannot modify files outside their assigned scope
- Token budgets prevent runaway execution
- Escalation tiers prevent unauthorized actions

### Quality Gate Security

- Review agent checks for security vulnerabilities
- Testing agent runs security-focused tests
- Security audit workflow available for sensitive changes
- Human review required for final gate on security-labeled tasks

### Shared State Security

- Memory MCP entities scoped to session
- No persistent credentials in knowledge graph
- File artifacts follow project .gitignore rules
- Plane API tokens not shared with worker agents

---

## Deployment Plan

### Phase 1: Foundation (Complete)
- [x] Architecture document (ROOSE-43)
- [x] Agent registry configuration
- [x] Communication protocol schema
- [x] Workflow definitions
- [x] Metrics configuration
- [x] Orchestrator script (v1.0 CLI)
- [x] Adoption guide

### Phase 2: Agent Implementation (Next)
- [ ] Orchestrator agent (Claude Task tool integration)
- [ ] Research agent (Perplexity + Context7 + Exa)
- [ ] Planning agent (Sequential Thinking integration)
- [ ] Coding agent (Read/Write/Edit + ESLint)
- [ ] Testing agent (Bash + Playwright)
- [ ] Review agent (Read + Grep + ESLint)

### Phase 3: Integration
- [ ] CLEO orchestrator skill integration
- [ ] Skill router routing rules
- [ ] Plane lifecycle hooks
- [ ] Memory MCP entity management
- [ ] End-to-end workflow tests

### Phase 4: Production
- [ ] Metrics dashboard (Metabase integration)
- [ ] Alerting rules activation
- [ ] Performance tuning
- [ ] Documentation finalization

---

## Related Documents

| Document | Location |
|----------|----------|
| Architecture | `infrastructure/agent-hq/ARCHITECTURE.md` |
| Adoption Guide | `docs/agent-hq/ADOPTION-GUIDE.md` |
| Agent Registry | `infrastructure/agent-hq/configs/agent-registry.json` |
| Workflows | `infrastructure/agent-hq/configs/workflows.json` |
| Metrics Config | `infrastructure/agent-hq/configs/metrics.json` |
| Message Schema | `infrastructure/agent-hq/schemas/agent-message.schema.json` |
| Orchestrate Script | `infrastructure/agent-hq/scripts/orchestrate.sh` |
| Issue Claiming Research | `docs/research/multi-agent-issue-claiming-research.md` |
