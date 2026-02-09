# Claude Code Session Recovery Runbook

**Severity:** Medium | **Owner:** DevOps | **Last Updated:** 2026-02-08

---

## Symptomen

| Symptoom | Waarschijnlijke Oorzaak | Ga naar |
|----------|------------------------|---------|
| "Prompt is too long" error | Context window vol | [Recovery: Compact](#1-compact) |
| MCP tool herhaaldelijk faalt | MCP server crash/timeout | [Recovery: MCP Downgrade](#5-mcp-downgrade) |
| Antwoorden worden korter/vager | Context window bijna vol | [Preventie: Context Monitoring](#context-monitoring) |
| "Tool name too long" error | MCP server naam overflow | [Recovery: MCP Downgrade](#5-mcp-downgrade) |
| HTTP 400 van MCP server | Server configuratie fout | [Diagnostiek: MCP Health](#mcp-server-health) |
| Sessie reageert niet meer | Deadlock of infinite loop | [Recovery: Nieuwe Sessie](#4-nieuwe-sessie) |
| Hallucinaties over bestanden | Stale context na compaction | [Recovery: Clear](#2-clear) |

---

## Recovery Methoden

### 1. Compact

**Wanneer:** Context window raakt vol maar sessie is nog bruikbaar.

```
/compact
```

**Wat het doet:**
- Comprimeert eerdere berichten in de conversatie
- Behoudt key context (bestanden, beslissingen)
- Maakt ruimte vrij voor verdere interactie

**Verwacht resultaat:** 30-50% context reductie. Sessie gaat door.

**Let op:**
- Gebruik VOORDAT de context vol is (preventief)
- Na compact kan specifieke eerder gelezen code verloren gaan
- Herlees kritieke bestanden na compact als ze nodig zijn

---

### 2. Clear

**Wanneer:** Hele conversatie is corrupt of onbruikbaar.

```
/clear
```

**Wat het doet:**
- Wist de volledige conversatiegeschiedenis
- Start met een schone context
- CLAUDE.md en rules worden opnieuw geladen

**Verwacht resultaat:** Verse sessie, alle vorige context weg.

**Wanneer kiezen boven compact:**
- Herhaalde hallucinaties die niet stoppen
- Context bevat veel irrelevante/foutieve informatie
- Agent zit vast in een loop

---

### 3. Rewind

**Wanneer:** Laatste 1-3 berichten zijn problematisch.

```
Esc → Esc (twee keer snel achter elkaar)
```

**Wat het doet:**
- Opent het rewind menu
- Laat je berichten terugdraaien
- Behoudt al het werk daarvoor

**Verwacht resultaat:** Sessie terug naar stabiele staat.

**Best practices:**
- Gebruik direct na een fout (niet later)
- Effectiefst voor de laatste 1-3 berichten
- Combineer met een aangepaste prompt na rewind

---

### 4. Nieuwe Sessie

**Wanneer:** Sessie is volledig onherstelbaar.

**Stappen:**

1. **Sla huidige werk op** (als mogelijk):
   ```bash
   # Check git status voor uncommitted changes
   git status
   git stash  # Optioneel: stash changes
   ```

2. **Check CLEO sessie staat:**
   ```bash
   cleo session status
   cleo focus show
   ```

3. **Sluit terminal** (Cmd+W of exit)

4. **Start nieuwe terminal** en resume:
   ```bash
   # Resume CLEO sessie
   cleo session list
   cleo session resume <session-id>

   # Geef context mee
   # "Ik werk aan ROOSE-xxx. Lees eerst de relevante bestanden."
   ```

**Context overdracht tips:**
- Verwijs naar Plane issue ID voor context
- Geef expliciete file paths mee om te lezen
- Gebruik `/init` om project context opnieuw te laden

---

### 5. MCP Downgrade

**Wanneer:** Een specifieke MCP server veroorzaakt herhaalde crashes.

**Stappen:**

1. **Identificeer problematische server:**
   ```
   /mcp
   ```
   Kijk naar servers met error status.

2. **Disable tijdelijk:**
   Bewerk `~/.claude.json` of gebruik de Claude Code UI:
   - Klik op de problematische server
   - Toggle "Enabled" uit

3. **Herstart sessie** (`/clear` of nieuwe terminal)

4. **Gebruik fallback** (zie `~/.claude/CLAUDE.md` → Fallback Strategieën):
   | Server Down | Fallback |
   |-------------|----------|
   | plane | Plane web UI |
   | github | `gh` CLI |
   | brave-search | WebSearch tool |
   | supabase | Supabase dashboard |

5. **Re-enable na stabilisatie**

---

## Diagnostiek

### Error Type Herkenning

| Error | Type | Actie |
|-------|------|-------|
| `prompt is too long` | Context overflow | `/compact` of `/clear` |
| `overloaded_error` | Anthropic API overload | Wacht 30s, probeer opnieuw |
| `tool_name exceeds maximum` | MCP server naam te lang | Disable server of verkort naam |
| `HTTP 400 Bad Request` | MCP parameter error | Check tool parameters |
| `HTTP 403 Forbidden` | API key verlopen | Roteer API key |
| `HTTP 404 Not Found` | Stale resource ID | Valideer via `get_projects()` |
| `HTTP 429 Rate Limited` | Te veel requests | Wacht, reduceer batch sizes |
| `ECONNREFUSED` | MCP server niet draaiend | Start server, check Docker |
| `ETIMEDOUT` | MCP server niet bereikbaar | Check netwerk, restart server |

### Context Usage Checken

```bash
# Via CLEO (als sessie draait)
cleo context
cleo context check  # Exit codes: 0=OK, 50+=warning

# Signalen in output
# - Antwoorden worden korter
# - Model herhaalt zichzelf
# - Tool calls mislukken vaker
```

### MCP Server Health

```bash
# Check alle servers
/mcp

# Test specifieke server
# Roep een simpele read-only tool aan, bijv:
mcp__plane__get_projects()       # Plane
mcp__github__search_code(...)    # GitHub

# Check server process
ps aux | grep -i "mcp\|npx\|node.*server"
```

### Conversatie Analyse

Wanneer een sessie langzaam wordt:

1. **Hoeveel tool calls?** Tel het aantal tool aanroepen. >50 calls = overweeg compact.
2. **Grote bestanden gelezen?** Files >500 regels vullen context snel.
3. **Veel MCP responses?** Plane list_project_issues kan 60KB+ zijn.
4. **Herhaalde fouten?** Retry loops verbranden context.

---

## Preventie

### Context Monitoring

| Signaal | Urgentie | Actie |
|---------|----------|-------|
| Antwoorden worden kort | Waarschuwing | `/compact` binnenkort |
| 70%+ context gebruikt | Waarschuwing | Overweeg compact |
| 85%+ context gebruikt | Kritiek | `/compact` NU |
| 95%+ context gebruikt | Noodgeval | `/clear` of nieuwe sessie |

### Best Practices voor Lange Sessies

1. **Compact preventief** na elke ~30 minuten intensief werk
2. **Beperk file reads** — lees alleen wat je nodig hebt
3. **Gebruik `limit` parameter** bij Read tool voor grote bestanden
4. **Vermijd `list_project_issues`** voor projecten met >50 issues — gebruik filters
5. **Batch MCP calls** — combineer onafhankelijke calls in parallel
6. **Commit regelmatig** — dan is `/clear` veilig

### MCP Server Hygiëne

1. **Disable ongebruikte servers** — elke actieve server kost context
2. **Gebruik korte server namen** — tool namen tellen mee in context
3. **Beperk deferred tools** — ToolSearch laadt tools permanent in context
4. **Monitor server health** — niet-reagerende servers veroorzaken timeouts

### CLEO Sessie Discipline

```bash
# Begin altijd met check
cleo session list
cleo session status

# Eindig altijd netjes
cleo session end --note "Waar ik was + volgende stappen"
```

---

## Preventie Checklist

- [ ] CLEO sessie actief en correct gescoped
- [ ] Niet meer dan 3-4 MCP servers actief tegelijk
- [ ] Regelmatig `/compact` bij lange sessies
- [ ] Git commits na elke voltooide taak
- [ ] Plane issues geüpdatet (state tracking)
- [ ] Geen grote list-operaties zonder filters
- [ ] Context alerts ingeschakeld (`cleo config set contextAlerts.enabled true`)

---

## Escalatie

| Niveau | Situatie | Actie |
|--------|----------|-------|
| L1 | Sessie vast, recovery werkt | Volg bovenstaande stappen |
| L2 | Herhaalde crashes na recovery | Check `~/.claude/settings.json` hooks |
| L3 | Structureel probleem | [Report issue](https://github.com/anthropics/claude-code/issues) |

---

*Gerelateerd: `~/.claude/docs/MCP-REFERENCE.md` | `~/.claude/CLAUDE.md` → Fallback Strategieën*
