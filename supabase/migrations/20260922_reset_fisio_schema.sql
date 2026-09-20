-- ATENÇÃO: remove somente os objetos do Fisio Clínico no schema public.
-- Mantém auth.users, Storage e quaisquer outras tabelas do projeto.
begin;

drop trigger if exists on_auth_user_created on auth.users;
drop table if exists public.user_workspaces cascade;
drop table if exists public.patient_snapshots cascade;
drop table if exists public.profiles cascade;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.set_fisio_updated_at() cascade;

create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  privacy_notice_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.patient_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  local_patient_id text not null,
  patient_code text not null default 'Paciente',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id,local_patient_id)
);

create table public.user_workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_fisio_updated_at()
returns trigger language plpgsql set search_path=public as $$
begin new.updated_at=now(); return new; end; $$;
create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_fisio_updated_at();
create trigger patient_snapshots_updated_at before update on public.patient_snapshots for each row execute procedure public.set_fisio_updated_at();
create trigger user_workspaces_updated_at before update on public.user_workspaces for each row execute procedure public.set_fisio_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,display_name,privacy_notice_accepted_at)
  values(new.id,new.raw_user_meta_data->>'display_name',
    case when coalesce(new.raw_user_meta_data->>'privacy_notice_accepted_at','')='' then null
         else (new.raw_user_meta_data->>'privacy_notice_accepted_at')::timestamptz end)
  on conflict(id) do nothing;
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

insert into public.profiles(id,display_name)
select id,coalesce(raw_user_meta_data->>'display_name',split_part(email,'@',1))
from auth.users on conflict(id) do nothing;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id=auth.uid() and role='admin')
$$;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.patient_snapshots enable row level security;
alter table public.user_workspaces enable row level security;
revoke all on public.profiles,public.patient_snapshots,public.user_workspaces from anon,authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,privacy_notice_accepted_at) on public.profiles to authenticated;
grant select,insert,update,delete on public.patient_snapshots,public.user_workspaces to authenticated;

create policy "profiles read own or admin" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
create policy "profiles update own" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy "patients read own or admin" on public.patient_snapshots for select to authenticated using(owner_id=auth.uid() or public.is_admin());
create policy "patients insert own" on public.patient_snapshots for insert to authenticated with check(owner_id=auth.uid());
create policy "patients update own" on public.patient_snapshots for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "patients delete own" on public.patient_snapshots for delete to authenticated using(owner_id=auth.uid());
create policy "workspace read own or admin" on public.user_workspaces for select to authenticated using(owner_id=auth.uid() or public.is_admin());
create policy "workspace insert own" on public.user_workspaces for insert to authenticated with check(owner_id=auth.uid());
create policy "workspace update own" on public.user_workspaces for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy "workspace delete own" on public.user_workspaces for delete to authenticated using(owner_id=auth.uid());
create index patient_snapshots_owner_idx on public.patient_snapshots(owner_id,updated_at desc);

commit;

-- Depois de criar/confirmar sua conta, promova somente o seu e-mail:
-- update public.profiles set role='admin'
-- where id=(select id from auth.users where email='SEU_EMAIL_AQUI');
