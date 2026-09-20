create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'user' check (role in ('user','admin')),
  privacy_notice_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  local_patient_id text not null,
  patient_code text not null default 'Paciente',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, local_patient_id)
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into public.profiles(id,display_name,privacy_notice_accepted_at) values(new.id,new.raw_user_meta_data->>'display_name',nullif(new.raw_user_meta_data->>'privacy_notice_accepted_at','')::timestamptz) on conflict(id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;
alter table public.profiles enable row level security;
alter table public.patient_snapshots enable row level security;
revoke all on public.profiles,public.patient_snapshots from anon,authenticated;
grant select on public.profiles to authenticated;
grant update(display_name,privacy_notice_accepted_at) on public.profiles to authenticated;
grant select,insert,update,delete on public.patient_snapshots to authenticated;
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
drop policy if exists "patients read own or admin" on public.patient_snapshots;
create policy "patients read own or admin" on public.patient_snapshots for select to authenticated using(owner_id=auth.uid() or public.is_admin());
drop policy if exists "patients insert own" on public.patient_snapshots;
create policy "patients insert own" on public.patient_snapshots for insert to authenticated with check(owner_id=auth.uid());
drop policy if exists "patients update own" on public.patient_snapshots;
create policy "patients update own" on public.patient_snapshots for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "patients delete own" on public.patient_snapshots;
create policy "patients delete own" on public.patient_snapshots for delete to authenticated using(owner_id=auth.uid());
create index if not exists patient_snapshots_owner_idx on public.patient_snapshots(owner_id,updated_at desc);

-- Promova o administrador manualmente no SQL Editor, nunca pelo cliente:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='admin@exemplo.com');

insert into public.profiles(id,display_name,privacy_notice_accepted_at)
select id,raw_user_meta_data->>'display_name',nullif(raw_user_meta_data->>'privacy_notice_accepted_at','')::timestamptz from auth.users on conflict(id) do nothing;
revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;
