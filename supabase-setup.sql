-- Darktism: community wall + reviews tables.
-- Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Visitors can READ and ADD posts. Nobody can edit or delete from the site.
-- You (the band) moderate in Supabase > Table Editor: select a row > Delete.

create table if not exists public.comments (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 40),
  message text not null check (char_length(message) between 2 and 500)
);

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null default 'Anonymous' check (char_length(name) between 1 and 40),
  track text not null check (char_length(track) between 1 and 80),
  rating smallint not null check (rating between 1 and 5),
  liked text not null default '' check (char_length(liked) <= 600),
  improve text not null default '' check (char_length(improve) <= 600)
);

alter table public.comments enable row level security;
alter table public.reviews  enable row level security;

drop policy if exists "public read comments" on public.comments;
drop policy if exists "public add comments"  on public.comments;
drop policy if exists "public read reviews"  on public.reviews;
drop policy if exists "public add reviews"   on public.reviews;

create policy "public read comments" on public.comments for select to anon using (true);
create policy "public add comments"  on public.comments for insert to anon with check (true);
create policy "public read reviews"  on public.reviews  for select to anon using (true);
create policy "public add reviews"   on public.reviews  for insert to anon with check (true);

-- Visitors can't change created_at to fake dates.
revoke insert on public.comments from anon;
revoke insert on public.reviews  from anon;
grant insert (name, message) on public.comments to anon;
grant insert (name, track, rating, liked, improve) on public.reviews to anon;
grant select on public.comments, public.reviews to anon;
