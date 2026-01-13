-- GOTCHU FULL DATABASE SCHEMA V3 (Fixed & Idempotent)
-- Run this in Supabase SQL Editor. It is now SAFE to run even if you already have tables/types.

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists "vector"; -- For AI Embeddings

-- 2. SAFE TYPE CREATION (Will skip if they already exist)
DO $$ BEGIN
    create type item_type as enum ('LOST', 'FOUND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type item_category as enum ('Electronics', 'ID', 'Keys', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type item_zone as enum ('Innovation_Labs', 'Canteen', 'Bus_Bay', 'Library', 'Hostels', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    create type item_status as enum ('OPEN', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. USERS (Auth0 IDs are TEXT)
create table if not exists public.users (
  id text not null primary key, -- Auth0 user ID
  email text unique not null,
  full_name text,
  avatar_url text,
  karma_points int default 0,
  role text default 'USER',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ITEMS
create table if not exists public.items (
  id uuid default uuid_generate_v4() primary key,
  type item_type not null,
  title text not null,
  category item_category not null,
  location_zone item_zone not null,
  description text,
  status item_status default 'OPEN',
  image_url text,
  user_id text references public.users(id) not null,
  embedding vector(384),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CHATS
create table if not exists public.chats (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) on delete cascade not null,
  related_item_id uuid references public.items(id) on delete cascade,
  user_a text references public.users(id) not null,
  user_b text references public.users(id) not null,
  status text default 'OPEN' check (status in ('OPEN', 'CLOSED')),
  closure_requested_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(item_id, user_a, user_b)
);

-- 6. MESSAGES
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id text references public.users(id) not null,
  content text not null,
  message_type text default 'TEXT',
  media_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. INDEXES
create index if not exists items_embedding_idx on public.items using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- 8. POLICIES (Idempotent Policies are tricky in pure SQL without drop, usually ignoring 'already exists' is fine for tables, but policies throw errors easily. We disable RLS first to be safe or just enable it)
alter table public.users enable row level security;
alter table public.items enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Policy helper: Drop before creating to avoid "Policy already exists" errors
drop policy if exists "Public profiles" on users;
create policy "Public profiles" on users for select using (true);

drop policy if exists "Public items" on items;
create policy "Public items" on items for select using (true);

drop policy if exists "Chat participants read" on chats;
create policy "Chat participants read" on chats for select using (auth.uid()::text = user_a or auth.uid()::text = user_b);

drop policy if exists "Message participants read" on messages;
create policy "Message participants read" on messages for select using (
  exists (select 1 from chats where id = messages.chat_id and (user_a = auth.uid()::text or user_b = auth.uid()::text))
);
