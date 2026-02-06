# Alert Deduplication - Production Deployment Guide

## Overview

This guide covers deploying the alert deduplication system to production Supabase.

## What Was Done (Local)

✅ **Local Database Migration Completed**
- Table: `alert_history` created
- Indexes: Optimized for cooldown queries
- Location: `supabase/migrations/20260206030000_create_alert_history_table.sql`

## Production Deployment Options

### Option 1: Supabase Dashboard (Recommended)

**Easiest and safest method for production deployment.**

1. **Login to Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Paste Migration SQL**
   ```bash
   # Copy migration contents
   cat supabase/migrations/20260206030000_create_alert_history_table.sql
   ```

4. **Execute Migration**
   - Paste SQL into editor
   - Click "Run" button
   - Verify: "Success. No rows returned"

5. **Verify Table Created**
   - Go to: Table Editor
   - Check: `alert_history` table exists
   - Verify columns: id, alert_type, alert_message, alert_severity, created_at

### Option 2: Supabase CLI (Advanced)

**Requires Supabase CLI authentication and project linking.**

1. **Login to Supabase**
   ```bash
   supabase login
   ```

2. **Link Project**
   ```bash
   cd ~/Development/projects/roosevelt-ops
   supabase link --project-ref [PROJECT_REF]
   ```

3. **Push Migration**
   ```bash
   supabase db push
   ```

4. **Verify**
   ```bash
   supabase db diff
   # Should show no changes
   ```

### Option 3: Direct psql (If you have DATABASE_URL)

```bash
# From production DATABASE_URL
psql "$DATABASE_URL" < supabase/migrations/20260206030000_create_alert_history_table.sql
```

## Verification Steps

### 1. Check Table Exists

SQL Query:
```sql
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'alert_history'
ORDER BY ordinal_position;
```

Expected output:
| table_name | column_name | data_type |
|------------|-------------|-----------|
| alert_history | id | uuid |
| alert_history | alert_type | text |
| alert_history | alert_message | text |
| alert_history | alert_severity | text |
| alert_history | created_at | timestamp with time zone |

### 2. Check Indexes

SQL Query:
```sql
SELECT indexname
FROM pg_indexes
WHERE tablename = 'alert_history';
```

Expected output:
- `alert_history_pkey`
- `idx_alert_history_type_time`
- `idx_alert_history_created_at`

### 3. Test Insert

SQL Query:
```sql
INSERT INTO alert_history (alert_type, alert_message, alert_severity)
VALUES ('test', 'Test alert message', 'MEDIUM')
RETURNING *;
```

Expected: Row created with auto-generated id and created_at.

### 4. Test Cooldown Query

SQL Query:
```sql
SELECT * FROM alert_history
WHERE alert_type = 'test'
  AND created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 1;
```

Expected: Returns the test row.

### 5. Cleanup Test Data

SQL Query:
```sql
DELETE FROM alert_history WHERE alert_type = 'test';
```

## Workflow Verification

After database migration, test the full workflow:

### 1. Trigger Workflow Manually

```bash
gh workflow run metrics-alerts.yml
```

### 2. Check Workflow Logs

Go to: https://github.com/hansbeeksma/roosevelt-ops/actions

Look for:
- "Check Alert Cooldown" step
- "Send Slack Alerts" step (if alerts triggered)
- "Log Alerts to Database" step

### 3. Verify Database Records

After workflow runs with alerts:

```sql
SELECT
  alert_type,
  alert_message,
  alert_severity,
  created_at
FROM alert_history
ORDER BY created_at DESC
LIMIT 5;
```

Expected: Recent alerts logged.

### 4. Test Cooldown Behavior

1. **First run**: Alerts should be sent (if thresholds breached)
2. **Second run (within 1 hour)**: Alerts should be suppressed
3. **Third run (after 1 hour)**: Alerts should be sent again

Check logs for: "Cooldown active for [alert_type]"

## Troubleshooting

### Error: Table already exists

If migration fails with "relation already exists":

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'alert_history'
);

-- If true, migration already ran
-- Skip migration or DROP TABLE first (careful!)
```

### Error: Permission denied

Ensure Supabase service role key has permissions:

```sql
-- Grant permissions (run as postgres user)
GRANT ALL ON alert_history TO authenticated;
GRANT ALL ON alert_history TO service_role;
```

### Workflow fails to insert alerts

Check GitHub secrets are configured:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

Verify in workflow logs for HTTP errors from Supabase API.

## Rollback Procedure

If alert deduplication causes issues:

### 1. Revert Workflow Changes

```bash
cd ~/Development/projects/roosevelt-ops
git revert 2f8ce65  # Alert deduplication commit
git push
```

### 2. Drop Table (Optional)

**Warning**: This deletes all historical alert data.

```sql
DROP TABLE IF EXISTS alert_history CASCADE;
```

Keep table if you want to preserve data for analysis.

## Maintenance

### Cleanup Old Alerts (>30 days)

Run periodically to prevent table bloat:

```sql
DELETE FROM alert_history
WHERE created_at < NOW() - INTERVAL '30 days';
```

**Recommendation**: Schedule as a Supabase cron job or GitHub Action.

### Monitor Table Size

```sql
SELECT
  pg_size_pretty(pg_total_relation_size('alert_history')) as total_size,
  COUNT(*) as row_count
FROM alert_history;
```

## Status Checklist

- [x] Migration file created
- [x] Local database migration successful
- [x] Migration file committed to git
- [ ] Production database migration (manual step required)
- [ ] Workflow verification in production
- [ ] Alert cooldown behavior tested

**Action Required**: Run production migration via Supabase Dashboard (Option 1).

## Support

For issues with deployment:
1. Check Supabase Dashboard logs
2. Review workflow run logs in GitHub Actions
3. Verify database credentials in GitHub secrets

---

**Related Documentation**:
- [Alert Deduplication Commit](https://github.com/hansbeeksma/roosevelt-ops/commit/2f8ce65)
- [Migration File](../supabase/migrations/20260206030000_create_alert_history_table.sql)
- [Workflow File](../.github/workflows/metrics-alerts.yml)
