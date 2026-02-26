# Multi-Tenant Database Schema

> **Issue:** ROOSE-315
> **Status:** Geimplementeerd
> **Datum:** 2026-02-26

## Overzicht

Roosevelt OPS gebruikt een **shared database, shared schema** multi-tenant architectuur. Elke tabel bevat een `organization_id` kolom die verwijst naar de `organizations` tabel. Row Level Security (RLS) in PostgreSQL zorgt ervoor dat gebruikers alleen data van hun eigen organisatie kunnen zien en muteren.

### Waarom dit pattern?

| Alternatief | Nadeel |
|-------------|--------|
| Database per tenant | Hoge operationele overhead, moeilijk te schalen |
| Schema per tenant | Complexe migraties, connection pooling problemen |
| **Shared schema + RLS** | **Gekozen: eenvoudig, schaalbaar, native PostgreSQL** |

## Organizations Tabel

De centrale entiteit. Alle andere tabellen hebben een FK naar `organizations.id`.

```sql
organizations (
  id               UUID PK DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  clerk_org_id     TEXT UNIQUE,        -- Clerk SSO koppeling
  plan             TEXT NOT NULL DEFAULT 'free',
  settings         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  deleted_by       UUID,
  version          INTEGER NOT NULL DEFAULT 0
)
```

## Tabeloverzicht

Alle tabellen met hun multi-tenant kolommen:

| Tabel | organization_id | deleted_at | deleted_by | version | RLS Policy |
|-------|:-:|:-:|:-:|:-:|:--|
| `organizations` | n.v.t. (is de org) | v | v | v | `id::text = jwt.org_id` |
| `time_entries` | v | v | v | v | `org_id = jwt.org_id` |
| `timers` | v | - | - | - | `org_id = jwt.org_id` |
| `developer_surveys` | v | v | v | v | `org_id = jwt.org_id` |
| `code_quality_metrics` | v | v | v | v | `org_id = jwt.org_id` |
| `developer_activity` | v | v | v | v | `org_id = jwt.org_id` |
| `code_review_metrics` | v | v | v | v | `org_id = jwt.org_id` |
| `efficiency_metrics` | v | v | v | v | `org_id = jwt.org_id` |
| `dora_metrics` | v | v | v | v | `org_id = jwt.org_id` |
| `incidents` | v | v | v | v | `org_id = jwt.org_id` |
| `ops_incidents` | v | v | v | v | `org_id = jwt.org_id` |
| `alert_history` | v | v | v | v | `org_id = jwt.org_id` |
| `analytics_events` | v | v | v | v | `org_id = jwt.org_id` |
| `analytics_daily_metrics` | v | v | v | v | `org_id = jwt.org_id` |
| `analytics_cohorts` | v | v | v | v | `org_id = jwt.org_id` |
| `audit_trail` | v | - | - | - | `org_id = jwt.org_id` |

## RLS Policy Pattern

Elke tabel heeft dezelfde isolatie-policy:

```sql
ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "<table>_org_isolation" ON public.<table>
  USING (organization_id::text = auth.jwt() ->> 'org_id');
```

### Hoe werkt het?

1. Gebruiker logt in via Clerk
2. Clerk zet `org_id` claim in de JWT
3. Supabase leest de JWT bij elk request
4. RLS filtert automatisch op `organization_id`
5. Geen enkele query kan data van andere organisaties teruggeven

### Service Role

De `service_role` key in Supabase heeft standaard RLS bypass. Gebruik deze voor:
- Cron jobs (materialized view refresh, data cleanup)
- Webhooks (GitHub, Slack, PagerDuty)
- Achtergrondprocessen die cross-org data nodig hebben

## Soft Delete Conventie

Records worden nooit fysiek verwijderd. In plaats daarvan:

```sql
-- Soft delete
UPDATE time_entries
SET deleted_at = NOW(),
    deleted_by = auth.uid(),
    version = version + 1
WHERE id = $1;

-- Herstel
UPDATE time_entries
SET deleted_at = NULL,
    deleted_by = NULL,
    version = version + 1
WHERE id = $1;
```

### Kolommen

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| `deleted_at` | `TIMESTAMPTZ` | Tijdstip van verwijdering. `NULL` = actief |
| `deleted_by` | `UUID` | Wie heeft verwijderd. `NULL` = actief |

### Query Pattern

Voeg altijd `WHERE deleted_at IS NULL` toe aan queries:

```sql
SELECT * FROM time_entries
WHERE organization_id = $1
  AND deleted_at IS NULL;
```

## Optimistic Locking Conventie

Voorkomt conflicten bij gelijktijdige updates:

```sql
-- Update met version check
UPDATE time_entries
SET description = $2,
    version = version + 1,
    updated_at = NOW()
WHERE id = $1
  AND version = $3;  -- verwachte versie

-- Als 0 rijen geupdate: conflict! Opnieuw ophalen en mergen.
```

### Kolommen

| Kolom | Type | Beschrijving |
|-------|------|-------------|
| `version` | `INTEGER DEFAULT 0` | Wordt verhoogd bij elke update |

### Applicatielogica

1. Client haalt record op met huidige `version`
2. Client stuurt update met `version` in WHERE clause
3. Als `version` niet matcht: `409 Conflict` response
4. Client haalt nieuwste versie op en toont merge UI

## Audit Trail

Alle mutaties worden gelogd in `audit_trail`:

```sql
audit_trail (
  id               UUID PK,
  organization_id  UUID NOT NULL FK -> organizations,
  user_id          UUID NOT NULL,
  action           TEXT NOT NULL,     -- create, update, delete, restore
  entity_type      TEXT NOT NULL,     -- tabelnaam
  entity_id        UUID NOT NULL,
  changes          JSONB,            -- {field: {old, new}}
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
```

### Voorbeeld

```json
{
  "action": "update",
  "entity_type": "time_entries",
  "entity_id": "abc-123",
  "changes": {
    "description": {
      "old": "Meeting voorbereiding",
      "new": "Sprint planning voorbereiding"
    },
    "duration_minutes": {
      "old": 30,
      "new": 45
    }
  }
}
```

## Migratie Volgorde

| # | Bestand | Beschrijving |
|---|---------|-------------|
| 1 | `20260226100000_organizations_table.sql` | Organizations tabel aanmaken |
| 2 | `20260226100001_add_org_id_existing_tables.sql` | Kolommen toevoegen aan 12 tabellen |
| 3 | `20260226100002_rls_org_isolation.sql` | RLS policies voor org isolatie |
| 4 | `20260226100003_audit_trail.sql` | Audit trail tabel aanmaken |

## Toekomstige Uitbreidingen

- **organization_members** tabel voor gebruiker-org koppeling met rollen
- **NOT NULL constraint** op `organization_id` nadat alle bestaande data gemigreerd is
- **Composite indexes** met `organization_id` prefix op veelgebruikte queries
- **Partitioning** op `organization_id` voor tabellen met >10M rijen
- **Tenant-aware materialized views** (huidige views zijn niet org-aware)
