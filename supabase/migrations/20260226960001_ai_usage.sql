-- AI usage tracking table for cost analytics per organization
-- Stores token consumption and estimated USD cost for each Claude API call

create table ai_usage (
  id               uuid        primary key default gen_random_uuid(),
  organization_id  uuid        references organizations(id) on delete cascade,
  model            text        not null,
  input_tokens     int         not null,
  output_tokens    int         not null,
  estimated_cost_usd numeric(10,6),
  task             text,
  created_at       timestamptz default now()
);

create index idx_ai_usage_org_date on ai_usage(organization_id, created_at);

-- Row Level Security
alter table ai_usage enable row level security;

-- Policy: organizations can only read their own usage
create policy "Organizations read own ai_usage"
  on ai_usage
  for select
  to authenticated
  using (organization_id = (select id from organizations where id = organization_id limit 1));

-- Policy: service role can insert usage records
create policy "Service role insert ai_usage"
  on ai_usage
  for insert
  to service_role
  with check (true);

comment on table  ai_usage                    is 'Per-request AI token consumption and estimated cost tracking';
comment on column ai_usage.organization_id    is 'Owning organization (nullable for system-level calls)';
comment on column ai_usage.model              is 'Claude model identifier (e.g. claude-haiku-4-5-20251001)';
comment on column ai_usage.input_tokens       is 'Prompt tokens consumed';
comment on column ai_usage.output_tokens      is 'Completion tokens generated';
comment on column ai_usage.estimated_cost_usd is 'Estimated USD cost calculated at write time';
comment on column ai_usage.task               is 'Short label identifying the feature/workflow that triggered the call';
