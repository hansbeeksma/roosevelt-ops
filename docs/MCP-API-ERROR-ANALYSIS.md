# MCP API Error Blocking Analysis

> **Versie:** 1.0.0
> **Datum:** 2026-02-08
> **Project:** Roosevelt OPS (ROOSE)
> **Status:** Actief onderzoeksrapport

---

## Probleemanalyse

Claude Code sessies lopen regelmatig vast door API 400 errors wanneer MCP tool namen character limieten overschrijden. Met 30+ MCP servers geconfigureerd ontstaan drie categorieën blocking errors.

### Error Categorieën

| Error Type | Limiet | Trigger | Impact |
|------------|--------|---------|--------|
| `tools.*.custom.name` | 64 chars (verhoogd naar 128 in juni 2025) | MCP tool registratie bij sessie start | Sessie start geblokkeerd |
| `messages.*.tool_use.name` | 200 chars | Context compaction na ~75+ berichten | Sessie permanent corrupt |
| `prompt is too long` | 200k tokens | Te veel MCP servers simultaan geladen | Sessie onbruikbaar |

### Gerelateerde GitHub Issues

- [#7370](https://github.com/anthropics/claude-code/issues/7370) - Tool name 200 char limit
- [#2485](https://github.com/anthropics/claude-code/issues/2485) - Tool name 64 char limit
- [#15695](https://github.com/anthropics/claude-code/issues/15695) - MCP tool_use.name 200 chars
- [#21136](https://github.com/anthropics/claude-code/issues/21136) - MCP tool names 64 chars (recent)
- [#12241](https://github.com/anthropics/claude-code/issues/12241) - MCP context usage bloat
- [#23517](https://github.com/anthropics/claude-code/issues/23517) - Compaction + tool names

---

## Root Cause Analyse

### 1. Tool Naming Pattern

MCP tools worden geregistreerd met het patroon `mcp__<server>__<tool>`. Dit geeft een prefix overhead van `5 + len(server) + 2` characters per tool.

**Voorbeelden:**

| Server Name | Prefix Length | Beschikbaar voor Tool Name |
|-------------|---------------|---------------------------|
| `v` (verkort) | 8 chars | 120 chars (bij 128 limiet) |
| `vercel` | 13 chars | 115 chars |
| `figma-official` | 21 chars | 107 chars |
| `sequential-thinking` | 26 chars | 102 chars |

### 2. Context Bloat

Elke MCP server voegt tool definitions toe aan de context:

```
30 MCP servers × ~3-5k tokens per server = 90-150k tokens upfront
```

Dit laat slechts 50-110k tokens over voor daadwerkelijke conversatie (bij 200k limiet).

**Mitigatie:** `tengu_mcp_tool_search: true` (deferred loading) is geconfigureerd. Tools worden pas geladen wanneer nodig via de `ToolSearch` tool. Dit vermindert de upfront context cost significant, maar elimineert het probleem niet volledig.

### 3. Compaction Bug

Bij context compaction (automatisch na ~75+ berichten) worden tool references in de gecompacteerde history soms corrupt. Als een tool naam langer is dan 200 characters in de message history, faalt de gehele sessie onherstelbaar.

---

## Risico-Inventarisatie Huidige Setup

### Alle 30+ MCP Servers Geanalyseerd

#### Hoog Risico (lange server namen + veel tools)

| Server | Server Name Length | Aantal Tools | Langste Tool | Risico |
|--------|-------------------|--------------|--------------|--------|
| **vercel** | 6 | 200+ | `mcp__vercel__head_v1_installations_integrationconfigurationid_resources_resou` (~85 chars) | **KRITIEK** - Overschrijdt limieten, ~125k tokens context |
| **figma-official** | 14 | 15 | `mcp__figma-official__get_code_connect_suggestions` (~50 chars) | HOOG - Lange prefix |
| **sequential-thinking** | 20 | 1 | `mcp__sequential-thinking__sequentialthinking` (~46 chars) | MEDIUM - Lange prefix |
| **brave-search** | 12 | 6 | `mcp__brave-search__brave_local_search` (~38 chars) | MEDIUM |

#### Medium Risico

| Server | Server Name Length | Aantal Tools | Risico |
|--------|-------------------|--------------|--------|
| **hetzner** | 7 | 25 | MEDIUM - Veel tools, zelden nodig |
| **playwright** | 10 | 20 | MEDIUM - Veel tools |
| **blender** | 7 | 20 | MEDIUM - Zelden nodig |
| **gemini** | 6 | 30+ | MEDIUM - Veel tools |

#### Laag Risico

| Server | Server Name Length | Aantal Tools | Risico |
|--------|-------------------|--------------|--------|
| **github** | 6 | 20 | LAAG - Essentieel, korte naam |
| **memory** | 6 | 10 | LAAG - Essentieel |
| **plane** | 5 | 40 | LAAG - Korte naam |
| **slack** | 5 | 4 | LAAG - Weinig tools |
| **supabase** | 8 | 25 | LAAG - Korte naam |
| **docker** | 6 | 4 | LAAG - Weinig tools |
| **eslint** | 6 | 1 | LAAG - 1 tool |
| **exa** | 3 | 3 | LAAG - Kort |

### Vercel MCP: Grootste Risicofactor

Vercel MCP is verantwoordelijk voor het merendeel van de problemen:

- **200+ tools** met REST-path-gebaseerde namen
- Langste namen bevatten volledige API paths: `mcp__vercel__*_v1_installations_integrationconfigurationid_resources_*`
- Geschatte context overhead bij volledige loading: **~125k tokens**
- Veel tools overschrijden de 64-char limiet zelfs met deferred loading

---

## Oplossingen (Prioriteit volgorde)

### 1. DIRECT - MCP Server Namen Verkorten (5 min) ✅ DONE (2026-02-08)

Server namen hernoemd in `~/.claude.json`:

| Oud | Nieuw | Besparing per Tool | Status |
|-----|-------|-------------------|--------|
| `vercel` | `vc` | 4 chars | ✅ |
| `figma-official` | `fig` | 11 chars | ✅ |
| `brave-search` | `bs` | 10 chars | ✅ |
| `sequential-thinking` | `seq` | 17 chars | ✅ |
| `html-to-design` | `htd` | 12 chars | ✅ |
| `vibe-kanban` | `vk` | 9 chars | ✅ |

CLAUDE.md bijgewerkt met nieuwe server namen (met originele naam als referentie).

### 2. DIRECT - Deferred Loading Valideren (10 min)

Verifieer dat `tengu_mcp_tool_search: true` correct werkt:

```bash
# Check configuratie
grep -c "tengu_mcp_tool_search" ~/.claude.json

# Gebruik /context in Claude Code om token usage te checken
# Verwacht: <50k tokens bij sessie start (zonder volledige tool loading)
```

### 3. MEDIUM - Per-Project MCP Server Configuratie (30 min)

Configureer per-project welke MCP servers geladen worden via `.claude/settings.json` in project root:

**Profiel: Core (altijd aan)**
- github, memory, context7, plane, eslint, filesystem

**Profiel: Development (per project)**
- docker, playwright, supabase, sentry

**Profiel: Optional (on-demand)**
- vercel, hetzner, blender, gemini, openai, figma-*, brave-search, exa, perplexity

**Implementatie per project:**

```jsonc
// ~/Development/products/vino12/.claude/settings.json
{
  "mcpServers": {
    // Disable servers not needed for this project
    "vercel": { "disabled": true },
    "hetzner": { "disabled": true },
    "blender": { "disabled": true }
  }
}
```

### 4. MEDIUM - Recovery Procedures Documenteren (15 min)

Sessie recovery stappen:

| Methode | Wanneer | Hoe |
|---------|---------|-----|
| **Rewind** | Laatste paar berichten corrupt | `Esc-Esc` → Rewind menu |
| **Clear** | Hele conversatie corrupt | `/clear` in Claude Code |
| **Compact** | Context vol maar sessie werkt nog | `/compact` |
| **Nieuwe sessie** | Onherstelbare corruption | Sluit terminal, start nieuw |
| **Downgrade MCP** | Herhaalde crashes | Disable problematische server |

### 5. STRUCTUREEL - MCP Server Groepering (1 uur)

Organiseer servers in tiers:

**Tier 1: Always On** (essentieel voor elke sessie)
- github, memory, context7, plane, eslint, filesystem

**Tier 2: Development** (per project enablen)
- docker, playwright, supabase, sentry, slack

**Tier 3: Specialized** (alleen wanneer specifiek nodig)
- vercel, hetzner, blender, gemini, openai
- figma, figma-official, html-to-design
- brave-search, exa, perplexity
- maestro, asana, notebooklm

---

## Preventie Maatregelen

### 1. PreToolUse Hook voor Tool Name Length

```bash
# ~/.claude/hooks/check-tool-name-length.sh
# Controleer of MCP tool naam binnen limieten valt
TOOL_NAME="$1"
if [ ${#TOOL_NAME} -gt 128 ]; then
  echo "WARNING: Tool name exceeds 128 chars: $TOOL_NAME" >&2
  exit 1
fi
```

### 2. Context Usage Monitoring

```bash
# Periodiek checken via /context commando
# Alert bij >70% context usage
# Proactief /compact uitvoeren bij >80%
```

### 3. Periodieke Audit

- Maandelijks MCP server configuratie reviewen
- Ongebruikte servers disablen
- Tool name lengths valideren na MCP server updates

---

## ROODT → ROOSE Migratie

### Context

Het Plane project "Roosevelt OPS" had oorspronkelijk identifier `ROODT` (UUID: `2cd361ed-037d-4f0a-b28a-a7df2303c4cb`). Dit is hernoemd naar `ROOSE` (UUID: `c7d0b955-a97f-40b6-be03-7c05c2d0b1c3`).

### Impact

120+ voorkomens van het oude `ROODT` identifier gevonden in:
- `~/.claude/` - 120 voorkomens (docs, rules, plans, tasks)
- `~/.cleo/` - 27 voorkomens (sync, scripts, backups)
- Twee bestanden moeten hernoemd worden:
  - `ROODT-PROJECT-GUARD-RAILS.md` → `ROOSE-PROJECT-GUARD-RAILS.md`
  - `PLANE-ROODT-VIEWS.md` → `PLANE-ROOSE-VIEWS.md`

### Cleanup Status

| Categorie | Bestanden | Status |
|-----------|-----------|--------|
| Kritieke docs (hernoemingen) | 2 | ✅ Done |
| CLAUDE.md referenties | 5 | ✅ Done |
| Workflow docs | 15+ | ✅ Done |
| Planning docs | 10+ | ✅ Done |
| Scripts/libraries | 5 | ✅ Done |
| Backups (read-only) | 2 | Niet gewijzigd (historisch) |

---

## Bronnen

- [Anthropic API Errors](https://docs.anthropic.com/en/api/errors) - Officiële error documentatie
- [Tool Search Tool](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/tool-search-tool) - Deferred loading
- [Anthropic Advanced Tool Use](https://www.anthropic.com/engineering/advanced-tool-use) - Architectuur
- Perplexity Deep Research (2026-02-08) - Comprehensive analysis
- Interne inventarisatie Claude Code configuratie

---

*Geschreven als onderdeel van ROOSE project, Roosevelt OPS.*
