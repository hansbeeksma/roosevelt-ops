-- RLS Policies voor organisatie-isolatie
-- ROOSE-315: Multi-tenant database schema
--
-- Vervangt bestaande permissieve RLS policies door org-gebaseerde isolatie.
-- JWT claim 'org_id' wordt gezet door de applicatie bij inloggen (via Clerk).
-- Pattern: organization_id::text = auth.jwt() ->> 'org_id'
--
-- BELANGRIJK: Bestaande policies worden eerst verwijderd om conflicten te voorkomen.
-- Elke DROP POLICY gebruikt IF EXISTS voor idempotentie.

-- ============================================================
-- 1. organizations
-- ============================================================
-- Organisatie-leden mogen alleen hun eigen organisatie zien.
-- Hier gebruiken we id ipv organization_id (het IS de organisatie).
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_org_isolation" ON public.organizations
  USING (id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 2. developer_surveys
-- ============================================================
-- Verwijder oude permissieve policy
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.developer_surveys;

CREATE POLICY "developer_surveys_org_isolation" ON public.developer_surveys
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 3. code_quality_metrics
-- ============================================================
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.code_quality_metrics;

CREATE POLICY "code_quality_metrics_org_isolation" ON public.code_quality_metrics
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 4. developer_activity
-- ============================================================
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.developer_activity;

CREATE POLICY "developer_activity_org_isolation" ON public.developer_activity
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 5. code_review_metrics
-- ============================================================
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.code_review_metrics;

CREATE POLICY "code_review_metrics_org_isolation" ON public.code_review_metrics
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 6. efficiency_metrics
-- ============================================================
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.efficiency_metrics;

CREATE POLICY "efficiency_metrics_org_isolation" ON public.efficiency_metrics
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 7. dora_metrics
-- ============================================================
DROP POLICY IF EXISTS "Allow public read access" ON public.dora_metrics;
DROP POLICY IF EXISTS "Allow service role to insert" ON public.dora_metrics;

CREATE POLICY "dora_metrics_org_isolation" ON public.dora_metrics
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 8. incidents (DORA incidents)
-- ============================================================
DROP POLICY IF EXISTS "Allow public read access" ON public.incidents;
DROP POLICY IF EXISTS "Allow service role to insert/update" ON public.incidents;

CREATE POLICY "incidents_org_isolation" ON public.incidents
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 9. ops_incidents
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.ops_incidents;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON public.ops_incidents;
DROP POLICY IF EXISTS "Allow authenticated update access" ON public.ops_incidents;

CREATE POLICY "ops_incidents_org_isolation" ON public.ops_incidents
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 10. alert_history
-- ============================================================
CREATE POLICY "alert_history_org_isolation" ON public.alert_history
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 11. analytics_events
-- ============================================================
-- Verwijder oude permissieve policies
DROP POLICY IF EXISTS "anon_insert_events" ON public.analytics_events;
DROP POLICY IF EXISTS "authenticated_insert_events" ON public.analytics_events;
DROP POLICY IF EXISTS "service_read_events" ON public.analytics_events;
DROP POLICY IF EXISTS "service_all_events" ON public.analytics_events;

CREATE POLICY "analytics_events_org_isolation" ON public.analytics_events
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 12. analytics_daily_metrics
-- ============================================================
DROP POLICY IF EXISTS "service_all_daily_metrics" ON public.analytics_daily_metrics;

CREATE POLICY "analytics_daily_metrics_org_isolation" ON public.analytics_daily_metrics
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- 13. analytics_cohorts
-- ============================================================
DROP POLICY IF EXISTS "service_all_cohorts" ON public.analytics_cohorts;

CREATE POLICY "analytics_cohorts_org_isolation" ON public.analytics_cohorts
  USING (organization_id::text = auth.jwt() ->> 'org_id');

-- ============================================================
-- Service role bypass
-- ============================================================
-- De service_role heeft standaard RLS bypass in Supabase.
-- Voor achtergrondprocessen (cron jobs, webhooks) die cross-org data
-- moeten lezen/schrijven, gebruik altijd de service_role key.

-- ============================================================
-- Verificatie
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'RLS org-isolatie policies aangemaakt voor 13 tabellen (ROOSE-315)';
  RAISE NOTICE 'Pattern: organization_id::text = auth.jwt() ->> ''org_id''';
  RAISE NOTICE '';
  RAISE NOTICE 'Oude permissieve policies verwijderd waar nodig.';
  RAISE NOTICE 'Service role behoudt standaard RLS bypass voor achtergrondprocessen.';
END $$;
