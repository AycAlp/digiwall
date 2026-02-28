-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  created_at   timestamptz not null default now()
);

-- Auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "Profiles: authenticated users can read all"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Profiles: users can update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- ─────────────────────────────────────────
-- BOARDS
-- ─────────────────────────────────────────
create table public.boards (
  id               uuid primary key default uuid_generate_v4(),
  owner_id         uuid not null references public.profiles(id) on delete cascade,
  title            text not null check (char_length(title) between 1 and 120),
  background_color text not null default '#f8f7f4',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger boards_updated_at
  before update on public.boards
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.boards enable row level security;

create policy "Boards: owners can do everything"
  on public.boards for all
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ─────────────────────────────────────────
-- POSTS (sticky notes)
-- ─────────────────────────────────────────
create table public.posts (
  id         uuid primary key default uuid_generate_v4(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null default '' check (char_length(content) <= 2000),
  color      text not null default '#fef08a',
  pos_x      integer not null default 100,
  pos_y      integer not null default 100,
  z_index    integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger posts_updated_at
  before update on public.posts
  for each row execute procedure public.set_updated_at();

-- RLS
alter table public.posts enable row level security;

-- Board owners can read/write all posts on their boards
create policy "Posts: board owner full access"
  on public.posts for all
  to authenticated
  using (
    exists (
      select 1 from public.boards
      where boards.id = posts.board_id
        and boards.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.boards
      where boards.id = posts.board_id
        and boards.owner_id = auth.uid()
    )
  );

-- Authors can read/update/delete their own posts (on boards they can access)
create policy "Posts: authors can manage own"
  on public.posts for all
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- ─────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────
alter publication supabase_realtime add table public.posts;
