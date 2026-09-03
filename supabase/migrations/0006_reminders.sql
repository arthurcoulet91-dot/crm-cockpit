-- Cockpit — onglet Rappels
-- Tâches du jour + rappels d'appel à heure précise, avec emails automatiques
-- (digest du matin + notification à l'heure du rappel, gérés côté app).

create type reminder_status as enum ('pending', 'done');

create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  client_id uuid references clients(id) on delete set null,
  remind_date date not null,
  remind_time time,
  status reminder_status not null default 'pending',
  reminder_email_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table reminders enable row level security;

create policy "Team can select reminders" on reminders
  for select using (has_data_access(user_id));
create policy "Team can insert reminders" on reminders
  for insert with check (has_data_access(user_id));
create policy "Team can update reminders" on reminders
  for update using (has_data_access(user_id)) with check (has_data_access(user_id));
create policy "Team can delete reminders" on reminders
  for delete using (has_data_access(user_id));

-- Log des envois du digest quotidien (7h), pour éviter les doublons si le
-- cron externe se déclenche plusieurs fois le même jour.
create table daily_digest_log (
  user_id uuid not null references auth.users(id) on delete cascade,
  sent_date date not null,
  created_at timestamptz not null default now(),
  primary key (user_id, sent_date)
);

alter table daily_digest_log enable row level security;

create policy "Team can select daily_digest_log" on daily_digest_log
  for select using (has_data_access(user_id));
