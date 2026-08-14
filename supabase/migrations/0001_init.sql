-- Cockpit — schéma initial
-- Toutes les tables sont scopées par user_id (auth.users) avec RLS stricte.

create extension if not exists "pgcrypto";

-- ── Enums ────────────────────────────────────────────────────────────────

create type client_type as enum ('pro', 'particulier');
create type record_source as enum ('manual', 'ghl');

create type contract_status as enum ('draft', 'active', 'completed', 'cancelled');
create type contract_recurrence as enum ('one_off', 'monthly', 'quarterly', 'annual');

create type payment_status as enum ('pending', 'paid', 'overdue');

create type opportunity_stage as enum (
  'proposal_sent',
  'negotiation',
  'contract_signed',
  'in_progress',
  'renewal',
  'lost'
);

create type activity_type as enum ('note', 'call', 'email', 'task_completed');

create type task_status as enum ('todo', 'in_progress', 'done');
create type task_priority as enum ('low', 'medium', 'high');

create type expense_type as enum ('fixed', 'variable');
create type expense_frequency as enum ('monthly', 'annual', 'one_off');

create type integration_provider as enum ('google_calendar', 'ghl');

-- ── Tables ───────────────────────────────────────────────────────────────

create table clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type client_type not null default 'pro',
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  notes text,
  source record_source not null default 'manual',
  ghl_contact_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  title text not null,
  amount numeric(12, 2) not null default 0,
  status contract_status not null default 'draft',
  start_date date,
  end_date date,
  renewal_date date,
  recurrence contract_recurrence not null default 'one_off',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contract_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contract_id uuid not null references contracts(id) on delete cascade,
  amount numeric(12, 2) not null default 0,
  due_date date not null,
  paid_date date,
  status payment_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  title text not null,
  stage opportunity_stage not null default 'proposal_sent',
  amount numeric(12, 2) not null default 0,
  expected_close_date date,
  source record_source not null default 'manual',
  ghl_opportunity_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  contract_id uuid references contracts(id) on delete cascade,
  type activity_type not null default 'note',
  content text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  status task_status not null default 'todo',
  priority task_priority not null default 'medium',
  client_id uuid references clients(id) on delete set null,
  contract_id uuid references contracts(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  amount numeric(12, 2) not null default 0,
  category text,
  type expense_type not null default 'variable',
  frequency expense_frequency not null default 'one_off',
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table calendar_events_cache (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_event_id text not null,
  title text not null,
  start_time timestamptz not null,
  end_time timestamptz,
  description text,
  location text,
  is_all_day boolean not null default false,
  synced_at timestamptz not null default now(),
  unique (user_id, google_event_id)
);

create table integration_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider integration_provider not null,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  external_account_id text,
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  unique (user_id, provider)
);

-- ── Indexes ──────────────────────────────────────────────────────────────

create index clients_user_id_idx on clients (user_id);
create index contracts_user_id_idx on contracts (user_id);
create index contracts_client_id_idx on contracts (client_id);
create index contract_payments_user_id_idx on contract_payments (user_id);
create index contract_payments_contract_id_idx on contract_payments (contract_id);
create index contract_payments_paid_date_idx on contract_payments (paid_date);
create index opportunities_user_id_idx on opportunities (user_id);
create index opportunities_stage_idx on opportunities (stage);
create index activities_user_id_idx on activities (user_id);
create index activities_client_id_idx on activities (client_id);
create index tasks_user_id_idx on tasks (user_id);
create index tasks_status_idx on tasks (status);
create index expenses_user_id_idx on expenses (user_id);
create index calendar_events_cache_user_id_idx on calendar_events_cache (user_id);

-- ── updated_at triggers ──────────────────────────────────────────────────

create function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_set_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger contracts_set_updated_at before update on contracts
  for each row execute function set_updated_at();
create trigger opportunities_set_updated_at before update on opportunities
  for each row execute function set_updated_at();
create trigger tasks_set_updated_at before update on tasks
  for each row execute function set_updated_at();

-- ── Row Level Security ───────────────────────────────────────────────────

alter table clients enable row level security;
alter table contracts enable row level security;
alter table contract_payments enable row level security;
alter table opportunities enable row level security;
alter table activities enable row level security;
alter table tasks enable row level security;
alter table expenses enable row level security;
alter table calendar_events_cache enable row level security;
alter table integration_connections enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'clients', 'contracts', 'contract_payments', 'opportunities',
    'activities', 'tasks', 'expenses', 'calendar_events_cache',
    'integration_connections'
  ]
  loop
    execute format(
      'create policy "Owner can select %1$s" on %1$I for select using (auth.uid() = user_id)',
      t
    );
    execute format(
      'create policy "Owner can insert %1$s" on %1$I for insert with check (auth.uid() = user_id)',
      t
    );
    execute format(
      'create policy "Owner can update %1$s" on %1$I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t
    );
    execute format(
      'create policy "Owner can delete %1$s" on %1$I for delete using (auth.uid() = user_id)',
      t
    );
  end loop;
end $$;
