# MCP Context Usage Monitoring Procedure

**Owner:** DevOps | **Frequency:** Continuous (automated) + Monthly (manual audit) | **Last Updated:** 2026-02-09

---

## Automated Monitoring

### PreToolUse Hook

**Locatie:** `~/.claude/hooks/mcp-context-monitor.sh`

**Wat het doet:**
- Valideert tool name length (<128 chars) voor alle MCP tools
- Checkt CLEO context usage en waarschuwt bij >70%
- Detecteert bulk operations met hoge context overhead
- Warnings alleen — blokkeert niet tenzij tool name te lang is

**Thresholds:**
| Level | Usage | Actie |
|-------|-------|-------|
| OK | <70% | Geen warning |
| ⚠️ Warning | 70-84% | "Consider /compact soon" |
| 🔴 Critical | 85%+ | "Run /compact or /clear NOW" |

**Exit codes:**
- `0` = OK, ga door
- `1` = Error, blokkeer (alleen bij tool name >128 chars)
- `100` = Warning, ga door met melding

---

## Real-Time Context Monitoring

### Via CLEO

```bash
# Check context usage
cleo context

# Output format:
# 🟢 Usage: 45% (90,000 / 200,000 tokens)
# 🟡 Warning: 75% (150,000 / 200,000 tokens)
# 🔴 Critical: 92% (184,000 / 200,000 tokens)

# Silent check (for scripting)
cleo context check
# Exit codes: 0=OK, 50=Warning, 51=Caution, 52=Critical, 53=Emergency
```

### Via Claude Code

```
/context
```

Toont current/max tokens en percentage.

---

## Proactive Actions

| Context Level | Recommended Action | When |
|---------------|-------------------|------|
| <70% | Continue normally | — |
| 70-79% | Plan `/compact` soon | After current task |
| 80-89% | Run `/compact` | Before next MCP bulk operation |
| 90-94% | Run `/compact` or `/clear` | Immediately |
| 95%+ | Start new session | Context overflow imminent |

### Safe Compact Timing

✅ **Safe to compact:**
- After completing a task
- Before starting a new feature
- After git commit (no uncommitted work)
- Before large file reads or MCP operations

❌ **Risky to compact:**
- Mid-task with uncommitted changes
- During debugging (lose read code)
- After reading critical files not yet saved

---

## Monthly Audit Checklist

**Schedule:** First Monday of month | **Duration:** 15-20 min

### 1. MCP Server Configuration Review

```bash
# List all active MCP servers
jq '.mcpServers | keys' ~/.claude.json

# Count tools per server (deferred loading)
# Use ToolSearch in Claude Code session
```

**Check:**
- [ ] Are all servers still needed?
- [ ] Any servers with 0 usage last month?
- [ ] Any new servers added without review?

**Actions:**
- Disable unused servers
- Document why each server is needed

---

### 2. Tool Name Length Validation

```bash
# Check longest tool names
# Run in Claude Code session:
# "List all deferred MCP tools and their name lengths, sorted by length descending"
```

**Check:**
- [ ] All tool names <128 chars
- [ ] Server names short enough for tool prefix
- [ ] No new long-named servers added

**Actions:**
- Shorten server names if tool names approach 100 chars
- Document server name aliases in CLAUDE.md

---

### 3. Context Overhead Analysis

Review logs/metrics (if available):

**Questions:**
- How often did context usage hit 80%+?
- Which operations triggered warnings?
- Were compactions effective (30%+ reduction)?

**Actions:**
- Identify high-cost MCP operations
- Add filters/pagination where possible
- Consider caching for repeated queries

---

### 4. Hook Health Check

```bash
# Test hook with fake long tool name
TOOL_NAME=$(printf 'mcp__test__%0130d' 1)
~/.claude/hooks/mcp-context-monitor.sh "$TOOL_NAME" "{}"
# Should exit 1 with error message

# Test warning threshold (manual context check)
cleo context
# Verify thresholds match hook config
```

**Check:**
- [ ] Hook executable (`-rwxr-xr-x`)
- [ ] No syntax errors
- [ ] Exit codes correct
- [ ] Warnings display properly

---

## High-Risk Operations

### MCP Tools with Large Responses

| Tool Pattern | Risk | Mitigation |
|--------------|------|------------|
| `list_project_issues` (Plane) | High (50-200 KB) | Use state filters, limit results |
| `list_deployments` (Vercel) | High (20-100 KB) | Use date filters |
| `search_code` (GitHub) | Medium (10-50 KB) | Limit results, narrow search scope |
| `get_project` (any) | Low (1-5 KB) | Safe |

**Best Practices:**
1. Always filter bulk operations
2. Use pagination when available
3. Request only needed fields
4. Avoid repeated `list_*` calls in loops

---

## Incident Response

### Scenario 1: Tool Name Error

**Symptom:** Hook blocks MCP tool call, "Tool name exceeds 128 chars"

**Resolution:**
1. Identify problematic server in tool name
2. Shorten server name in `~/.claude.json`
3. Restart Claude Code session (reload config)
4. Update `~/.claude/CLAUDE.md` with server name mapping

**Example:**
```json
// Before
"vercel": { ... }

// After
"vc": { ... }  // Tools: mcp__vc__* (was mcp__vercel__*)
```

---

### Scenario 2: Context Overflow

**Symptom:** "Prompt is too long" error

**Resolution:**
1. Run `/compact` immediately
2. If compact fails: `/clear`
3. If session unrecoverable: New terminal
4. Resume CLEO session: `cleo session resume <id>`
5. Document what caused overflow for future prevention

**Follow-up:**
- Review which MCP operations preceded overflow
- Add filters to those operations
- Consider disabling high-cost servers if unused

---

### Scenario 3: Repeated Warnings

**Symptom:** Hook shows warnings on every MCP call

**Resolution:**
1. Check CLEO context: `cleo context`
2. If 70%+: Run `/compact`
3. If compact doesn't help: Identify memory leak
4. Review recent tool calls for large responses
5. Escalate if context grows despite compact

---

## Configuration

### Hook Settings

Edit `~/.claude/hooks/mcp-context-monitor.sh`:

```bash
MAX_TOOL_NAME_LENGTH=128          # Anthropic API limit
CONTEXT_WARNING_THRESHOLD=70      # First warning at 70%
CONTEXT_CRITICAL_THRESHOLD=85     # Urgent action at 85%
```

### High-Risk Server List

Add servers with 50+ tools:

```bash
HIGH_RISK_SERVERS=(
  "vercel"
  "vc"
  "gemini"
  "supabase"
)
```

---

## Metrics to Track (Optional)

If implementing monitoring dashboard:

1. **Context usage over time** (hourly samples)
2. **Compaction frequency** (times per session)
3. **Hook trigger rate** (warnings per hour)
4. **Tool name length distribution**
5. **Most expensive MCP operations** (by response size)

**Tools:** CLEO context logs, Claude Code analytics (if available)

---

## Related Documentation

- Session Recovery Runbook: `~/Development/products/roosevelt-ops/docs/runbooks/claude-code-session-recovery.md`
- MCP API Error Analysis: `~/Development/products/roosevelt-ops/docs/MCP-API-ERROR-ANALYSIS.md`
- MCP Reference: `~/.claude/docs/MCP-REFERENCE.md`

---

*Linked to: ROOSE-155 (MCP Context Usage Monitoring & Alerting)*
