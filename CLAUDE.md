<!-- CLEO:START -->
@.cleo/templates/AGENT-INJECTION.md
<!-- CLEO:END -->

# Roosevelt OPS - Project Configuration

**See:** `~/.claude/CLAUDE.md` for global configuration
**Plane Project:** ROOSE (identifier), UUID: c7d0b955-a97f-40b6-be03-7c05c2d0b1c3

---

## Quick Reference

Dit project gebruikt de globale configuratie van `~/.claude/CLAUDE.md`.

### Plane Integration

| Setting | Value |
|---------|-------|
| Project Identifier | ROOSE |
| Project UUID | c7d0b955-a97f-40b6-be03-7c05c2d0b1c3 |
| Sync Library | `~/.cleo/lib/plane-sync.sh` |

### Daily Workflow

```bash
# Pull issues from Plane
source ~/.cleo/lib/plane-sync.sh
plane-sync pull --project ROOSE

# Start CLEO session
cleo session start --scope epic:T001 --auto-focus

# Complete task
cleo complete T###

# Push to Plane (via MCP)
# State updates happen automatically via plane-mcp-workflow.md
```

---

**Voor volledige configuratie, zie:**
- Global config: `~/.claude/CLAUDE.md`
- Plane workflow: `~/.claude/rules/plane-mcp-workflow.md`
- MCP reference: `~/.claude/docs/MCP-REFERENCE.md`
