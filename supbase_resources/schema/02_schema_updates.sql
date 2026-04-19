begin;

-- create schema if not exists app;

-- 1) Task source support (direct/template), without coupling tasks to template ids.
alter table if exists public.tasks
  add column if not exists source varchar(16) not null default 'direct';


-- 2) Templates and rules.
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name varchar(128) not null,
  description text,
  type varchar(16) not null,
  is_active boolean not null default true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

update public.templates
set type = 'customized'
where type = 'user';

alter table if exists public.templates
  drop constraint if exists chk_templates_type;

alter table if exists public.templates
  add constraint chk_templates_type check (type in ('predefined', 'customized'));

create table if not exists public.template_rules (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  star_level smallint not null check (star_level between 1 and 5),
  title varchar(256) not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


-- 3) Day-level template assignment and star rating.
alter table if exists public.days
  add column if not exists star_rating smallint not null default 0;

alter table if exists public.days
  add column if not exists template_id uuid;



-- 4) Normalized day+rule completion tracking.
create table if not exists public.day_template_rule_progress (
  day_id uuid not null references public.days(id) on delete cascade,
  template_rule_id uuid not null references public.template_rules(id) on delete cascade,
  status varchar(16) not null default 'pending',
  task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (day_id, template_rule_id)
);


-- 5) Supporting indexes and cleanup of deprecated ones.
create index if not exists idx_tasks_user_source_date on public.tasks(user_id, source, task_date);
create index if not exists idx_days_user_star_date on public.days(user_id, star_rating, day_date);
create index if not exists idx_templates_type_user on public.templates(type, user_id);
create index if not exists idx_template_rules_template_star on public.template_rules(template_id, star_level, sort_order);
create index if not exists idx_day_rule_progress_day_status on public.day_template_rule_progress(day_id, status);
create index if not exists idx_day_rule_progress_task on public.day_template_rule_progress(task_id);

drop index if exists idx_tasks_template_rule_date;
drop index if exists uq_tasks_template_rule_per_day;

commit;
