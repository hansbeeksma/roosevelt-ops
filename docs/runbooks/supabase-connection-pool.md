# Runbook: Supabase - Connection Pool Exhaustion

**Last Updated**: 2026-02-05
**Owner**: Backend Team
**Severity**: SEV-1
**Estimated Time**: 5-10 minutes

---

## Quick Reference

**One-line summary**: Resolve database connection pool exhaustion causing API timeouts.

**When to use**: API routes timing out, Sentry shows Supabase connection errors, or database queries hanging.

---

## Prerequisites

- [ ] Access to Supabase dashboard (https://supabase.com/dashboard)
- [ ] Supabase project: Roosevelt OPS
- [ ] Local Supabase CLI installed (for local dev)

---

## Symptoms

Observable signs indicating connection pool exhaustion:

- [ ] **API timeouts**: All API routes respond slowly or timeout
- [ ] **Sentry errors**: `Error: Connection pool exhausted` or `ECONNREFUSED`
- [ ] **Database dashboard**: Active connections at or near limit
- [ ] **Slow queries**: All queries taking 10s+ to execute

**Monitoring**:
- Sentry: https://roosevelt-ops.sentry.io/
- Supabase dashboard: https://supabase.com/dashboard/project/[project-id]/database/tables
- Grafana: Database connection metrics

---

## Diagnosis

### Step 1: Verify connection pool status

**Via Supabase Dashboard**:
1. Go to https://supabase.com/dashboard/project/[project-id]/database/query
2. Run this query:
   ```sql
   SELECT count(*) as active_connections,
          max_conn
   FROM pg_stat_database,
        (SELECT setting::int as max_conn FROM pg_settings WHERE name = 'max_connections') s
   WHERE datname = current_database();
   ```

**Expected output**:
- `active_connections`: Should be < 80% of `max_conn`
- If `active_connections` ≈ `max_conn` → Pool exhausted ✅

---

### Step 2: Identify connection leaks

```sql
-- Show active connections by application
SELECT
  application_name,
  count(*) as num_connections,
  state,
  max(query_start) as last_query
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY application_name, state
ORDER BY num_connections DESC;
```

**Look for**:
- Many connections in `idle` state (connection leak)
- One application holding many connections
- Long-running queries (check `query_start`)

---

### Step 3: Check for long-running queries

```sql
-- Show queries running > 30 seconds
SELECT
  pid,
  usename,
  application_name,
  state,
  query,
  now() - query_start as duration
FROM pg_stat_activity
WHERE state != 'idle'
  AND (now() - query_start) > interval '30 seconds'
ORDER BY duration DESC;
```

**Common causes**:
1. **Unoptimized query**: Missing indexes, no pagination
2. **Connection leak**: Application not releasing connections
3. **Too many concurrent requests**: Traffic spike
4. **Long-running transactions**: Blocked queries

---

## Mitigation

### Option A: Restart Connection Pool (Immediate)

**Use when**: Quick recovery needed, connection leak suspected

**Steps**:

1. **Restart Supabase Pooler** (Supabase Cloud):
   - Go to Supabase dashboard → Settings → Database
   - Click "Restart connection pooler"
   - Wait 30 seconds for restart

   **OR locally** (for development):
   ```bash
   # Stop local Supabase
   npx supabase stop

   # Start fresh
   npx supabase start
   ```

2. **Verify connections dropped**:
   ```sql
   SELECT count(*) FROM pg_stat_activity
   WHERE datname = current_database();
   ```

   **Expected**: Connection count drops to near zero, then gradually increases.

3. **Monitor recovery**:
   - Check Sentry: Error rate should drop
   - Test API endpoint: `curl https://your-app.vercel.app/api/health`
   - Watch connection count: Should stay < 80% of max

**Success criteria**:
- ✅ Connection count < 80% of maximum
- ✅ API responses < 2s
- ✅ No timeout errors in Sentry

---

### Option B: Kill Long-Running Queries

**Use when**: Specific queries are blocking the pool

**Steps**:

1. **Identify problematic query**:
   ```sql
   -- See step 3 in Diagnosis
   SELECT pid, query FROM pg_stat_activity
   WHERE (now() - query_start) > interval '1 minute';
   ```

2. **Kill the query** (use with caution!):
   ```sql
   -- Cancel query (graceful)
   SELECT pg_cancel_backend([pid]);

   -- If cancel doesn't work, terminate (forceful)
   SELECT pg_terminate_backend([pid]);
   ```

3. **Verify query is stopped**:
   ```sql
   SELECT * FROM pg_stat_activity WHERE pid = [pid];
   ```

   **Expected**: Query no longer appears in results.

---

### Option C: Scale Connection Pool

**Use when**: Legitimate traffic spike exceeds current capacity

**Steps**:

1. **Increase max_connections** (Supabase Cloud):
   - Go to Settings → Database → Connection Pooling
   - Increase "Max Connections" (default: 20, max depends on plan)
   - Click "Save"

2. **Update application connection limit**:
   ```typescript
   // lib/supabase/server.ts
   const supabase = createClient(url, key, {
     db: {
       poolSize: 20, // Match Supabase setting
     },
   });
   ```

3. **Redeploy application**:
   ```bash
   git commit -am "chore: increase connection pool size"
   git push origin main
   ```

4. **Monitor new limit**:
   - Connection count should have more headroom
   - API performance should improve

**Warning**: Increasing connections uses more database resources. Monitor CPU/memory.

---

### Option D: Implement Connection Pooling (Long-term)

**Use when**: Recurring connection pool issues

**Steps**:

1. **Use Supabase connection pooler** (recommended):
   ```typescript
   // Use pooler URL instead of direct database URL
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Uses pooler by default
   ```

2. **Add connection timeout**:
   ```typescript
   const supabase = createClient(url, key, {
     db: {
       poolSize: 10,
       idleTimeoutMillis: 30000, // Release idle connections after 30s
     },
   });
   ```

3. **Implement proper connection cleanup**:
   ```typescript
   // API route example
   export async function GET(request: Request) {
     const supabase = createClient(); // Create per-request

     try {
       const { data, error } = await supabase.from('table').select();
       return Response.json(data);
     } finally {
       // Connection released automatically on function exit
     }
   }
   ```

---

## Verification

After mitigation, verify resolution:

- [ ] **Connection count healthy**:
  ```sql
  SELECT count(*) FROM pg_stat_activity
  WHERE datname = current_database();
  -- Should be < 80% of max_connections
  ```

- [ ] **No timeouts in logs**: Check Sentry for 5 minutes
- [ ] **API latency normal**: P95 < 2s
- [ ] **No idle connections accumulating**: Check every minute
- [ ] **Post resolution to #incidents**

---

## Prevention

**Short-term** (implement immediately):
- [ ] Add connection pool monitoring alert (> 80% usage)
- [ ] Review all API routes for proper connection cleanup
- [ ] Set connection timeout to 30s

**Long-term** (add to backlog):
- [ ] Implement connection pool metrics dashboard (Plane: ROOSE-XXX)
- [ ] Add query performance testing to CI (Plane: ROOSE-XXX)
- [ ] Implement read replicas for read-heavy queries (Plane: ROOSE-XXX)
- [ ] Add connection leak detection (Plane: ROOSE-XXX)

**Monitoring improvements**:
- [ ] Grafana dashboard for database connections
- [ ] Alert on connection pool > 80% for 5 minutes
- [ ] Alert on queries running > 30 seconds

---

## Rollback Plan

If mitigation worsens the situation:

1. **Revert connection pool size**:
   - Supabase dashboard → Settings → Database
   - Set back to previous value

2. **Restart application**:
   ```bash
   vercel rollback --yes
   ```

3. **Escalate**:
   - Post to #incidents: "Connection pool mitigation failed"
   - Contact Supabase support if platform issue suspected

---

## Communication Templates

### Internal (#incidents)

```
🔴 SEV-1: Database connection pool exhausted
Runbook: supabase-connection-pool
Status: Restarting connection pooler
Impact: All API routes timing out
ETA: 5 minutes
Commander: @[your-name]
```

### Status Update

```
Update: Connection pooler restarted. Connections dropped from 20/20 to 3/20.
API responses normalizing. Monitoring for 10 minutes before closing.
```

---

## Common Connection Pool Issues

### Issue: Idle connections accumulating

**Symptom**: Many connections in `idle` state

**Cause**: Application not releasing connections properly

**Fix**:
```typescript
// Ensure proper cleanup
const { data, error } = await supabase
  .from('table')
  .select()
  .single();

// Connection released when function exits
```

---

### Issue: Connection leak in long-running process

**Symptom**: Connection count increases over time

**Cause**: Background job or webhook handler not releasing

**Fix**:
```typescript
// Create new client per operation
async function processWebhook(payload) {
  const supabase = createClient();
  // ... process webhook
  // Connection released on exit
}
```

---

### Issue: Connection limit hit during traffic spike

**Symptom**: Intermittent timeouts during peak hours

**Cause**: Legitimate high traffic exceeds pool capacity

**Fix**: Scale connection pool (Option C) or implement caching

---

## Related Runbooks

- `vercel-deployment-failed.md`: If issue started after deployment
- `rate-limit-exceeded.md`: If connection issue is rate-limit related
- `sentry-alert-storm.md`: If alert fatigue is causing noise

---

## FAQs

**Q: What's the default connection limit on Supabase?**
A: Free tier: 60 connections. Pro tier: 200 connections. Adjust based on plan.

**Q: Will restarting the pooler cause downtime?**
A: Brief (< 30s) connection interruption. Plan during low-traffic window if possible.

**Q: How do I prevent connection leaks?**
A: Always create Supabase client per-request, never globally. Use connection timeouts.

**Q: Should I increase max_connections?**
A: Only if legitimate traffic needs it. First fix connection leaks and optimize queries.

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-02-05 | Initial creation | Sam Swaab |

---

**Runbook Owner**: Backend Team
**Review Cadence**: Quarterly
**Next Review**: 2026-05-05
