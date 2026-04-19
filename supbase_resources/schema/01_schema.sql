begin;

-- Required for UUID generation and case-insensitive email
create extension if not exists pgcrypto;
create extension if not exists citext;

create schema if not exists app;

create table if not exists public.ai_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  created_by uuid,
  updated_by uuid,
  skill_level smallint not null default 0,
  months_allocated integer not null,
  hours_per_day numeric(4,2) not null check (hours_per_day > 0 and hours_per_day <= 24),
  ai_response jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text not null default '',
  status varchar(64) not null default 'pending',
  category varchar(64),
  sub_category varchar(64),
  task_date date not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  day_date date not null,
  status_of_day smallint not null default 0,
  comment text,
  streak integer not null default 0 check (streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_days_user_date unique (user_id, day_date)
);

-- Keeps parity with Mongo day.tasks array while still normalized
create table if not exists public.day_tasks (
  day_id uuid not null references public.days(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (day_id, task_id)
);

-- Indexes for current API patterns
create index if not exists idx_tasks_user_date on public.tasks(user_id, task_date);
create index if not exists idx_tasks_user_status_date on public.tasks(user_id, status, task_date);
create index if not exists idx_tasks_user_category_sub on public.tasks(user_id, category, sub_category);
create index if not exists idx_days_user_date on public.days(user_id, day_date);
create index if not exists idx_days_user_status_date on public.days(user_id, status_of_day, day_date);
create index if not exists idx_ai_roadmaps_user on public.ai_roadmaps(user_id);

commit;
