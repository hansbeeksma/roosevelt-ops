create table daily_insights (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  date date not null,
  summary text not null,
  highlights jsonb default '[]',
  risks jsonb default '[]',
  recommendations jsonb default '[]',
  utilization_status text not null,
  generated_at timestamptz default now(),
  unique(organization_id, date)
);

alter table daily_insights enable row level security;

create index idx_daily_insights_org_date on daily_insights(organization_id, date desc);
create index idx_daily_insights_date on daily_insights(date desc);
