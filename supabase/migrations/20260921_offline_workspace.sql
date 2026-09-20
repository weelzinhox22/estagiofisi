create table if not exists public.user_workspaces (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_workspaces enable row level security;
revoke all on public.user_workspaces from anon,authenticated;
grant select,insert,update,delete on public.user_workspaces to authenticated;
drop policy if exists "workspace read own or admin" on public.user_workspaces;
create policy "workspace read own or admin" on public.user_workspaces for select to authenticated using(owner_id=auth.uid() or public.is_admin());
drop policy if exists "workspace insert own" on public.user_workspaces;
create policy "workspace insert own" on public.user_workspaces for insert to authenticated with check(owner_id=auth.uid());
drop policy if exists "workspace update own" on public.user_workspaces;
create policy "workspace update own" on public.user_workspaces for update to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "workspace delete own" on public.user_workspaces;
create policy "workspace delete own" on public.user_workspaces for delete to authenticated using(owner_id=auth.uid());
