-- Voeg organization_id, soft delete en version kolommen toe aan bestaande tabellen
-- ROOSE-315: Multi-tenant database schema
--
-- 12 tabellen worden bijgewerkt met het BaseTable pattern:
--   - organization_id (FK naar organizations)
--   - deleted_at / deleted_by (soft delete)
--   - version (optimistic concurrency)
--
-- Het time_entries/timers pattern uit 20260226000001 is de referentie.

-- ============================================================
-- 1. developer_surveys
-- ============================================================
ALTER TABLE public.developer_surveys
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.developer_surveys
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.developer_surveys
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.developer_surveys
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_developer_surveys_org
  ON public.developer_surveys(organization_id);

-- ============================================================
-- 2. code_quality_metrics
-- ============================================================
ALTER TABLE public.code_quality_metrics
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.code_quality_metrics
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.code_quality_metrics
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.code_quality_metrics
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_code_quality_metrics_org
  ON public.code_quality_metrics(organization_id);

-- ============================================================
-- 3. developer_activity
-- ============================================================
ALTER TABLE public.developer_activity
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.developer_activity
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.developer_activity
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.developer_activity
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_developer_activity_org
  ON public.developer_activity(organization_id);

-- ============================================================
-- 4. code_review_metrics
-- ============================================================
ALTER TABLE public.code_review_metrics
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.code_review_metrics
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.code_review_metrics
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.code_review_metrics
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_code_review_metrics_org
  ON public.code_review_metrics(organization_id);

-- ============================================================
-- 5. efficiency_metrics
-- ============================================================
ALTER TABLE public.efficiency_metrics
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.efficiency_metrics
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.efficiency_metrics
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.efficiency_metrics
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_efficiency_metrics_org
  ON public.efficiency_metrics(organization_id);

-- ============================================================
-- 6. dora_metrics
-- ============================================================
ALTER TABLE public.dora_metrics
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.dora_metrics
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.dora_metrics
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.dora_metrics
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_dora_metrics_org
  ON public.dora_metrics(organization_id);

-- ============================================================
-- 7. incidents (DORA incidents tabel)
-- ============================================================
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_incidents_org
  ON public.incidents(organization_id);

-- ============================================================
-- 8. ops_incidents
-- ============================================================
ALTER TABLE public.ops_incidents
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.ops_incidents
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.ops_incidents
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.ops_incidents
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_ops_incidents_org
  ON public.ops_incidents(organization_id);

-- ============================================================
-- 9. alert_history
-- ============================================================
ALTER TABLE public.alert_history
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.alert_history
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.alert_history
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.alert_history
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_alert_history_org
  ON public.alert_history(organization_id);

-- ============================================================
-- 10. analytics_events
-- ============================================================
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.analytics_events
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_analytics_events_org
  ON public.analytics_events(organization_id);

-- ============================================================
-- 11. analytics_daily_metrics
-- ============================================================
ALTER TABLE public.analytics_daily_metrics
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.analytics_daily_metrics
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.analytics_daily_metrics
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.analytics_daily_metrics
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_org
  ON public.analytics_daily_metrics(organization_id);

-- ============================================================
-- 12. analytics_cohorts
-- ============================================================
ALTER TABLE public.analytics_cohorts
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.analytics_cohorts
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.analytics_cohorts
  ADD COLUMN IF NOT EXISTS deleted_by UUID;
ALTER TABLE public.analytics_cohorts
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_analytics_cohorts_org
  ON public.analytics_cohorts(organization_id);

-- ============================================================
-- Verificatie
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE 'Multi-tenant kolommen toegevoegd aan 12 tabellen (ROOSE-315)';
  RAISE NOTICE 'Kolommen: organization_id, deleted_at, deleted_by, version';
  RAISE NOTICE '';
  RAISE NOTICE 'Tabellen bijgewerkt:';
  RAISE NOTICE '  1.  developer_surveys';
  RAISE NOTICE '  2.  code_quality_metrics';
  RAISE NOTICE '  3.  developer_activity';
  RAISE NOTICE '  4.  code_review_metrics';
  RAISE NOTICE '  5.  efficiency_metrics';
  RAISE NOTICE '  6.  dora_metrics';
  RAISE NOTICE '  7.  incidents';
  RAISE NOTICE '  8.  ops_incidents';
  RAISE NOTICE '  9.  alert_history';
  RAISE NOTICE '  10. analytics_events';
  RAISE NOTICE '  11. analytics_daily_metrics';
  RAISE NOTICE '  12. analytics_cohorts';
END $$;
