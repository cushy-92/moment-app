-- MOMENT App - Phase 1 Schema
-- Run this in Supabase SQL Editor

create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- POSTS (parent_id enables REMIX tree)
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  parent_id uuid references public.posts(id) on delete set null,
  content text,
  media_url text,
  media_type text check (media_type in ('image', 'video', 'none')) default 'none',
  like_count int default 0,
  comment_count int default 0,
  remix_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index posts_author_id_idx on public.posts(author_id);
create index posts_parent_id_idx on public.posts(parent_id);
create index posts_created_at_idx on public.posts(created_at desc);

-- LIKES
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  post_id uuid references public.posts(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- COMMENTS
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- FOLLOWS
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

-- CHATS
create type chat_type as enum ('direct', 'group', 'channel');

create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  type chat_type not null default 'direct',
  name text,
  description text,
  avatar_url text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table public.chat_members (
  chat_id uuid references public.chats(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  primary key (chat_id, user_id)
);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete set null,
  content text,
  media_url text,
  created_at timestamptz default now()
);

create index messages_chat_id_created_at_idx on public.messages(chat_id, created_at);

-- RLS
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;
alter table public.chats enable row level security;
alter table public.chat_members enable row level security;
alter table public.messages enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "Posts are viewable by everyone" on public.posts for select using (true);
create policy "Authenticated users can create posts" on public.posts for insert with check (auth.uid() = author_id);
create policy "Users can update own posts" on public.posts for update using (auth.uid() = author_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = author_id);

create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Users can like/unlike" on public.likes for all using (auth.uid() = user_id);

create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can comment" on public.comments for insert with check (auth.uid() = author_id);

create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Users can follow/unfollow" on public.follows for all using (auth.uid() = follower_id);

create policy "Chat members can view chats" on public.chats for select using (
  exists (select 1 from public.chat_members where chat_id = id and user_id = auth.uid())
);
create policy "Authenticated users can create chats" on public.chats for insert with check (auth.uid() = created_by);

create policy "Members can view messages" on public.messages for select using (
  exists (select 1 from public.chat_members where chat_id = messages.chat_id and user_id = auth.uid())
);
create policy "Members can send messages" on public.messages for insert with check (
  auth.uid() = sender_id and
  exists (select 1 from public.chat_members where chat_id = messages.chat_id and user_id = auth.uid())
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'display_name', 'New User')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
