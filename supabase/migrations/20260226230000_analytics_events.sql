-- Analytics Events Table — Roosevelt OPS
-- Package: packages/analytics-layer (@rooseveltops/analytics-layer)
-- Tracks operational events: page_view, feature_used, ai_scoping_started,
--   invoice_generated, team_member_added, project_created

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id text,
  event_type text not null,
  properties jsonb default '{}',
  created_at timestamptz default now()
);

comment on table analytics_events is 'Operational events tracked via @rooseveltops/analytics-layer';
comment on column analytics_events.event_type is 'Event type: page_view, feature_used, ai_scoping_started, invoice_generated, team_member_added, project_created';
comment on column analytics_events.properties is 'Event-specific properties as unvalidated JSON';
comment on column analytics_events.user_id is 'Clerk user ID (text, not UUID)';

alter table analytics_events enable row level security;

-- Org members can read their own org events
create policy "org members can read own events"
  on analytics_events
  for select
  using (
    organization_id = (
      select organization_id
      from user_profiles
      where clerk_id = auth.uid()::text
    )
  );

-- Service role has full access (for server-side writes via service key)
create policy "service role full access"
  on analytics_events
  for all
  to service_role
  using (true)
  with check (true);

create index idx_analytics_events_org on analytics_events(organization_id);
create index idx_analytics_events_type on analytics_events(event_type, created_at desc);
create index idx_analytics_events_created on analytics_events(created_at desc);
