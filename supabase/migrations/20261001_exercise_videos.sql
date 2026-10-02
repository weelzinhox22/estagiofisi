begin;
create table if not exists public.exercise_videos (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique, nome text not null, regiao_ou_categoria text not null,
  descricao text not null default '', objetivos text not null default '', orientacoes text not null default '',
  musculos text not null default '', equipamentos text not null default '', dosagem_mencionada_no_video text not null default 'Não identificada',
  cuidados text not null default '', ai_analysis jsonb not null default '{}'::jsonb,
  status text not null default 'published' check(status in ('draft','published','hidden')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.exercise_videos enable row level security;
grant select,insert,update,delete on public.exercise_videos to authenticated;
drop policy if exists "exercise videos read own" on public.exercise_videos;
create policy "exercise videos read own" on public.exercise_videos for select to authenticated using(owner_id=auth.uid() or public.is_admin());
drop policy if exists "exercise videos insert own" on public.exercise_videos;
create policy "exercise videos insert own" on public.exercise_videos for insert to authenticated with check(owner_id=auth.uid());
drop policy if exists "exercise videos update own" on public.exercise_videos;
create policy "exercise videos update own" on public.exercise_videos for update to authenticated using(owner_id=auth.uid() or public.is_admin()) with check(owner_id=auth.uid() or public.is_admin());
drop policy if exists "exercise videos delete own" on public.exercise_videos;
create policy "exercise videos delete own" on public.exercise_videos for delete to authenticated using(owner_id=auth.uid() or public.is_admin());
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('exercise-videos','exercise-videos',false,104857600,array['video/mp4','video/webm','video/quicktime'])
on conflict(id) do update set public=false,file_size_limit=104857600,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "exercise video uploads own folder" on storage.objects;
create policy "exercise video uploads own folder" on storage.objects for insert to authenticated with check(bucket_id='exercise-videos' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "exercise video reads own folder" on storage.objects;
create policy "exercise video reads own folder" on storage.objects for select to authenticated using(bucket_id='exercise-videos' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
drop policy if exists "exercise video delete own folder" on storage.objects;
create policy "exercise video delete own folder" on storage.objects for delete to authenticated using(bucket_id='exercise-videos' and ((storage.foldername(name))[1]=auth.uid()::text or public.is_admin()));
commit;
