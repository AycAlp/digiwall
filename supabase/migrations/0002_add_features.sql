-- ─────────────────────────────────────────
-- Extend boards
-- ─────────────────────────────────────────
alter table public.boards
  add column if not exists view_mode  text not null default 'canvas'
    check (view_mode in ('canvas','kanban','grid')),
  add column if not exists is_locked  boolean not null default false,
  add column if not exists is_public  boolean not null default false;

-- ─────────────────────────────────────────
-- Kanban COLUMNS table (must exist before posts FK)
-- ─────────────────────────────────────────
create table if not exists public.columns (
  id         uuid primary key default uuid_generate_v4(),
  board_id   uuid not null references public.boards(id) on delete cascade,
  title      text not null default 'Column',
  color      text not null default '#7c3aed',
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

alter publication supabase_realtime add table public.columns;

alter table public.columns enable row level security;

create policy "Columns: board owner full access"
  on public.columns for all to authenticated
  using (
    exists (select 1 from public.boards where boards.id = columns.board_id and boards.owner_id = auth.uid())
  )
  with check (
    exists (select 1 from public.boards where boards.id = columns.board_id and boards.owner_id = auth.uid())
  );

create policy "Columns: public board read"
  on public.columns for select to authenticated
  using (
    exists (select 1 from public.boards where boards.id = columns.board_id and boards.is_public = true)
  );

-- ─────────────────────────────────────────
-- Extend posts
-- ─────────────────────────────────────────
alter table public.posts
  add column if not exists column_id       uuid references public.columns(id) on delete set null,
  add column if not exists column_position integer not null default 0,
  add column if not exists labels          text[]  not null default '{}';

-- ─────────────────────────────────────────
-- REACTIONS
-- ─────────────────────────────────────────
create table if not exists public.reactions (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id, emoji)
);

alter publication supabase_realtime add table public.reactions;

alter table public.reactions enable row level security;

create policy "Reactions: anyone on accessible board can read"
  on public.reactions for select to authenticated
  using (
    exists (
      select 1 from public.posts p
      join public.boards b on b.id = p.board_id
      where p.id = reactions.post_id
        and (b.owner_id = auth.uid() or b.is_public = true)
    )
  );

create policy "Reactions: anyone on accessible board can insert"
  on public.reactions for insert to authenticated
  with check (
    auth.uid() = user_id and
    exists (
      select 1 from public.posts p
      join public.boards b on b.id = p.board_id
      where p.id = reactions.post_id
        and (b.owner_id = auth.uid() or b.is_public = true)
        and b.is_locked = false
    )
  );

create policy "Reactions: users delete own"
  on public.reactions for delete to authenticated
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────
create table if not exists public.comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  author_id  uuid not null references public.profiles(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter publication supabase_realtime add table public.comments;

alter table public.comments enable row level security;

create policy "Comments: read on accessible board"
  on public.comments for select to authenticated
  using (
    exists (
      select 1 from public.posts p
      join public.boards b on b.id = p.board_id
      where p.id = comments.post_id
        and (b.owner_id = auth.uid() or b.is_public = true)
    )
  );

create policy "Comments: insert on accessible board"
  on public.comments for insert to authenticated
  with check (
    auth.uid() = author_id and
    exists (
      select 1 from public.posts p
      join public.boards b on b.id = p.board_id
      where p.id = comments.post_id
        and (b.owner_id = auth.uid() or b.is_public = true)
    )
  );

create policy "Comments: delete own or owner"
  on public.comments for delete to authenticated
  using (
    auth.uid() = author_id or
    exists (
      select 1 from public.posts p
      join public.boards b on b.id = p.board_id
      where p.id = comments.post_id and b.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────
-- Update posts RLS for public boards
-- ─────────────────────────────────────────
-- Allow public board members to read posts
create policy "Posts: public board read"
  on public.posts for select to authenticated
  using (
    exists (
      select 1 from public.boards
      where boards.id = posts.board_id and boards.is_public = true
    )
  );

-- Allow public board members to insert posts (unless locked)
create policy "Posts: public board insert"
  on public.posts for insert to authenticated
  with check (
    auth.uid() = author_id and
    exists (
      select 1 from public.boards
      where boards.id = posts.board_id
        and boards.is_public = true
        and boards.is_locked = false
    )
  );

-- Allow authors to update their own posts on public boards (unless locked)
create policy "Posts: authors update own on public board"
  on public.posts for update to authenticated
  using (
    auth.uid() = author_id and
    exists (
      select 1 from public.boards
      where boards.id = posts.board_id
        and boards.is_public = true
        and boards.is_locked = false
    )
  );

-- Allow authors to delete their own posts on public boards
create policy "Posts: authors delete own on public board"
  on public.posts for delete to authenticated
  using (
    auth.uid() = author_id and
    exists (
      select 1 from public.boards
      where boards.id = posts.board_id and boards.is_public = true
    )
  );
