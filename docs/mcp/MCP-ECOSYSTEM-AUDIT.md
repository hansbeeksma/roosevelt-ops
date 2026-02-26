# MCP Ecosystem Audit

**Issue:** ROOSE-53 (MCP Ecosystem Expansion)
**Version:** 1.0.0
**Date:** 2026-02-17

---

## Current MCP Server Inventory

### Active Servers (30 configured)

| Category | Server | Tools | Status | Usage |
|----------|--------|-------|--------|-------|
| **Core** | seq (sequential-thinking) | 1 | Active | High - Complex reasoning |
| **Core** | memory | 8 | Active | High - Knowledge graph |
| **Core** | context7 | 2 | Active | Medium - Library docs |
| **Development** | github | 20+ | Active | High - PR/issues |
| **Development** | eslint | 1 | Active | High - Code linting |
| **Development** | playwright | 15+ | Active | Medium - E2E testing |
| **Development** | maestro | 10+ | Active | Low - Mobile testing |
| **Infrastructure** | docker | 4 | Active | Low - Containers |
| **Infrastructure** | hetzner | 20+ | Active | Low - Cloud servers |
| **Infrastructure** | supabase | 15+ | Active | Medium - Database |
| **Design** | figma (community) | 2 | Active | Medium - Design data |
| **Design** | fig (official) | 10+ | Active | Medium - Design context |
| **Design** | htd (html-to-design) | 2 | Active | Low - HTML import |
| **Integrations** | slack | 4 | Active | Medium - Communication |
| **Integrations** | sentry | 10+ | Active | Medium - Error tracking |
| **Integrations** | filesystem | 10+ | Active | High - File operations |
| **Integrations** | asana | 8+ | Deprecated | Low - Legacy PM |
| **Integrations** | plane | 76 | Active | High - Project management |
| **Knowledge** | notebooklm | 10+ | Active | Low - Research |
| **Search** | bs (brave-search) | 5 | Active | Medium - Web search |
| **Search** | exa | 3 | Active | Medium - AI search |
| **Search** | perplexity | 4 | Active | High - Research |
| **Creative** | blender | 15+ | Active | Low - 3D modeling |
| **AI Models** | gemini | 30+ | Active | Medium - Google AI |
| **AI Models** | openai | 1 | Active | Low - GPT models |
| **Hosting** | vc (vercel) | 100+ | Active | Medium - Deployments |
| **Domains** | namecom | 15+ | Active | Low - DNS management |

**Total active:** 30 servers, ~400+ tools

---

## Gap Analysis

### High Priority Gaps (Business Critical)

| Integration | Need | Business Value | Effort |
|-------------|------|---------------|--------|
| **Linear** | Issue tracking for client projects | High - Many teams use Linear | Medium - Community server exists |
| **Notion** | Knowledge base, client wikis | High - Documentation hub | Medium - Official MCP available |
| **1Password** | Secret management in CI/CD | High - Security automation | Low - CLI bridge available |
| **Cloudflare** | DNS, Workers, CDN management | High - Production infrastructure | Medium - API available |
| **Stripe** | Payment integration management | Medium - E-commerce projects | Medium - API available |

### Medium Priority Gaps (Productivity)

| Integration | Need | Business Value | Effort |
|-------------|------|---------------|--------|
| **Google Workspace** | Gmail, Calendar, Drive | Medium - Already configured separately | Low - Existing server |
| **Resend** | Email sending/templates | Medium - Transactional emails | Low - Simple API |
| **Upstash** | Redis/QStash management | Medium - Caching/queues | Low - REST API |
| **Turborepo** | Monorepo build orchestration | Medium - Build optimization | Medium - Custom MCP |
| **Lighthouse** | Performance auditing | Medium - Quality metrics | Low - CLI wrapper |

### Low Priority Gaps (Nice to Have)

| Integration | Need | Business Value | Effort |
|-------------|------|---------------|--------|
| **Jira** | Client project integration | Low - Most clients use Plane/Linear | High - Complex API |
| **Confluence** | Client documentation | Low - Notion preferred | Medium |
| **Datadog** | APM and monitoring | Low - Sentry covers most needs | Medium |
| **Twilio** | SMS/Voice automation | Low - Niche use cases | Medium |
| **Pinecone/Weaviate** | Vector database management | Low - Supabase pgvector suffices | Medium |

---

## Recommended Expansion Plan

### Phase 1: Quick Wins (Week 1)

Install well-maintained community MCP servers:

| Server | NPM Package | Priority |
|--------|-------------|----------|
| **Linear** | `@anthropic/linear-mcp` or community | High |
| **Notion** | `@notionhq/notion-mcp-server` | High |
| **1Password** | Custom (CLI bridge) | High |

### Phase 2: Infrastructure Integration (Weeks 2-3)

| Server | Approach | Priority |
|--------|----------|----------|
| **Cloudflare** | Community MCP or custom | High |
| **Stripe** | Custom MCP wrapper | Medium |
| **Resend** | Custom MCP (simple API) | Medium |
| **Upstash** | Custom MCP (REST API) | Medium |

### Phase 3: Custom Development (Weeks 4-5)

Build custom MCP servers for internal tools:

| Server | Purpose | Approach |
|--------|---------|----------|
| **roosevelt-internal** | Internal tooling bridge | Custom MCP |
| **deployment-pipeline** | CI/CD orchestration | Custom MCP wrapping gh CLI + Vercel |
| **metrics-collector** | DORA/SPACE metrics | Custom MCP wrapping Metabase API |

---

## Server Installation Patterns

### Community Server Installation

```json
// ~/.claude.json - Add to mcpServers
{
  "linear": {
    "command": "npx",
    "args": ["-y", "@anthropic/linear-mcp"],
    "env": {
      "LINEAR_API_KEY": "<key>"
    }
  }
}
```

### Custom Server Template

See the [MCP Server Development Guide](MCP-SERVER-DEVELOPMENT-GUIDE.md) for building custom servers.

---

## Configuration Best Practices

### Server Naming

| Convention | Example | Why |
|-----------|---------|-----|
| Short names | `vc` not `vercel` | Tool name length limit (128 chars) |
| Descriptive | `bs` for brave-search | Distinguishable in tool names |
| Lowercase | Always lowercase | Consistency in `mcp__server__tool` pattern |

### Authentication

| Method | Use When | Example |
|--------|----------|---------|
| Environment variable | Simple API keys | `LINEAR_API_KEY` |
| Config file reference | Complex auth | `--config ~/.config/server.json` |
| OAuth flow | User-scoped access | Figma Official |

### Performance

| Optimization | Implementation |
|-------------|----------------|
| Deferred loading | Add to ToolSearch deferred list |
| Response filtering | Use pagination and filters |
| Caching | Server-side response caching |
| Connection pooling | Reuse HTTP connections |

---

## Cost Analysis

### Current MCP Infrastructure

| Server | Cost | Notes |
|--------|------|-------|
| Most MCP servers | Free | Open source, self-hosted |
| Plane (cloud) | Free tier | SaaS subscription |
| Brave Search | Free tier | Rate limited |
| Perplexity | API costs | Pay per query |
| Exa | API costs | Pay per query |
| Gemini | API costs | Pay per query |
| OpenAI | API costs | Pay per query |
| Hetzner | Server costs | Per-VM pricing |

### Projected Expansion Costs

| New Server | Monthly Cost | Justification |
|-----------|-------------|---------------|
| Linear | $0 (API free) | Better client project tracking |
| Notion | $0 (API free) | Knowledge base integration |
| 1Password | $0 (CLI free) | Security automation |
| Cloudflare | $0 (API free) | Infrastructure management |
| Stripe | $0 (API free) | Payment integration |
| Custom servers | $0 (self-hosted) | Internal tooling |

**Total projected increase:** $0/month (all API-based, no additional infrastructure needed)

---

## Deprecation Candidates

| Server | Reason | Action |
|--------|--------|--------|
| **asana** | Replaced by Plane | Remove after migration complete |
| **htd** | Low usage, niche | Keep but monitor usage |
| **blender** | Low usage, specialized | Keep but monitor usage |
| **maestro** | Low usage, mobile-only | Keep for mobile projects |

---

## Metrics for Expansion Success

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| MCP servers active | 30 | 35+ | Count in ~/.claude.json |
| Integration coverage | ~60% | 85% | % of used tools with MCP |
| Custom MCP servers | 0 | 3+ | Internal tool coverage |
| Context efficiency | N/A | <70% per session | Token usage tracking |
| Tool utilization | N/A | >50% active servers | Monthly audit |

---

## Related Documents

- [MCP Server Development Guide](MCP-SERVER-DEVELOPMENT-GUIDE.md)
- [MCP Integration Patterns](MCP-INTEGRATION-PATTERNS.md)
- [MCP Reference](~/.claude/docs/MCP-REFERENCE.md)
- [MCP Best Practices](~/.claude/docs/MCP-BEST-PRACTICES.md)
- [MCP Context Monitoring](../procedures/mcp-context-monitoring.md)
