-- Cockpit — partage d'équipe
-- Permet à un propriétaire d'inviter un(des) collaborateur(s) qui verront
-- et géreront exactement les mêmes données (clients, contrats, tâches, ...).

create table team_members (
  owner_id uuid not null references auth.users(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (owner_id, member_id),
  check (owner_id <> member_id)
);

alter table team_members enable row level security;

create policy "Owner can manage their team" on team_members
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "Member can see their own membership" on team_members
  for select using (auth.uid() = member_id);

-- ── Fonctions ────────────────────────────────────────────────────────────

-- L'identifiant "propriétaire effectif" des données pour l'utilisateur
-- courant : lui-même s'il n'a rejoint aucune équipe, sinon le propriétaire
-- de l'équipe qu'il a rejointe.
create or replace function effective_owner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select owner_id from team_members where member_id = auth.uid() limit 1),
    auth.uid()
  )
$$;

create or replace function has_data_access(target_user_id uuid)
returns boolean
language sql
stable
as $$
  select target_user_id = effective_owner_id()
$$;

create or replace function invite_team_member(target_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  if effective_owner_id() <> auth.uid() then
    raise exception 'Seul le propriétaire du compte peut inviter des collaborateurs';
  end if;

  select id into target_id from auth.users where lower(email) = lower(target_email);

  if target_id is null then
    raise exception 'Aucun compte trouvé pour cet email — il doit d''abord créer son compte sur Cockpit';
  end if;

  if target_id = auth.uid() then
    raise exception 'Tu ne peux pas t''inviter toi-même';
  end if;

  insert into team_members (owner_id, member_id)
  values (auth.uid(), target_id)
  on conflict do nothing;
end;
$$;

create or replace function remove_team_member(target_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from team_members
  where owner_id = auth.uid() and member_id = target_member_id;
end;
$$;

create or replace function get_my_team_owner()
returns table (owner_id uuid, email text)
language sql
stable
security definer
set search_path = public
as $$
  select u.id, u.email::text
  from team_members tm
  join auth.users u on u.id = tm.owner_id
  where tm.member_id = auth.uid()
  limit 1;
$$;

create or replace function list_team_members()
returns table (member_id uuid, email text, joined_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select tm.member_id, u.email::text, tm.created_at
  from team_members tm
  join auth.users u on u.id = tm.member_id
  where tm.owner_id = auth.uid()
  order by tm.created_at;
$$;

-- ── RLS : remplacer "propriétaire strict" par "accès partagé" ─────────────

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
    execute format('drop policy if exists "Owner can select %1$s" on %1$I', t);
    execute format('drop policy if exists "Owner can insert %1$s" on %1$I', t);
    execute format('drop policy if exists "Owner can update %1$s" on %1$I', t);
    execute format('drop policy if exists "Owner can delete %1$s" on %1$I', t);

    execute format(
      'create policy "Team can select %1$s" on %1$I for select using (has_data_access(user_id))',
      t
    );
    execute format(
      'create policy "Team can insert %1$s" on %1$I for insert with check (has_data_access(user_id))',
      t
    );
    execute format(
      'create policy "Team can update %1$s" on %1$I for update using (has_data_access(user_id)) with check (has_data_access(user_id))',
      t
    );
    execute format(
      'create policy "Team can delete %1$s" on %1$I for delete using (has_data_access(user_id))',
      t
    );
  end loop;
end $$;
