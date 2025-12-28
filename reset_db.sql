-- DANGER: DATA LOSS AHEAD
-- This script drops all tables and recreates them for Auth0 compatibility and App Logic alignment.
-- 1. DROP EXISTING TABLES
drop table if exists public.messages;
drop table if exists public.chats;
drop table if exists public.items;
drop table if exists public.users;

-- Drop types if they exist (to reset enums)
drop type if exists item_type;
drop type if exists item_category;
drop type if exists item_zone;
drop type if exists item_status;

-- 2. CREATE EXTENSIONS
create extension if not exists "uuid-ossp";

-- 3. CREATE TABLES

-- Users Table
create table public.users (
  id text primary key, -- Auth0 ID (e.g., "auth0|123456")
  email text not null,
  full_name text,
  avatar_url text,
  karma_points int default 0,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.users enable row level security;

-- Policies for Users
create policy "Public profiles are viewable by everyone."
  on users for select
  using ( true );

create policy "Users can insert/update their own profile."
  on users for all
  using ( (auth.jwt() ->> 'sub') = id )
  with check ( (auth.jwt() ->> 'sub') = id );


-- Items Table
create type item_type as enum ('LOST', 'FOUND');
create type item_category as enum ('Electronics', 'ID', 'Keys', 'Other');
create type item_zone as enum ('Innovation_Labs', 'Canteen', 'Bus_Bay', 'Library', 'Hostels', 'Other');
create type item_status as enum ('OPEN', 'RESOLVED');

create table public.items (
  id text primary key, -- NanoID (Text)
  type item_type not null,
  title text not null,
  category item_category not null,
  location_zone item_zone not null,
  status item_status default 'OPEN',
  description text,
  bounty_text text,
  image_url text,
  date_reported text, -- Stores date string 'YYYY-MM-DD'
  user_id text references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.items enable row level security;

-- Policies for Items
create policy "Items are viewable by everyone."
  on items for select
  using ( true );

create policy "Authenticated users can insert items."
  on items for insert
  with check ( (auth.jwt() ->> 'sub') is not null );

create policy "Users can update their own items."
  on items for update
  using ( (auth.jwt() ->> 'sub') = user_id );


-- Chats Table
create table public.chats (
  id text primary key, -- NanoID (Text)
  item_id text references public.items(id) not null,
  user_a text references public.users(id) not null,
  user_b text references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'OPEN' check (status in ('OPEN', 'CLOSED')),
  closure_requested_by text references public.users(id),
  unique(item_id, user_a, user_b)
);

alter table public.chats enable row level security;

-- Policies for Chats
create policy "Users can view their own chats."
  on chats for select
  using ( (auth.jwt() ->> 'sub') = user_a or (auth.jwt() ->> 'sub') = user_b );

create policy "Authenticated users can create chats."
  on chats for insert
  with check ( (auth.jwt() ->> 'sub') is not null );


-- Messages Table
create table public.messages (
  id text primary key, -- UUID/NanoID (Text)
  chat_id text references public.chats(id) not null,
  sender_id text references public.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

-- Policies for Messages
create policy "Users can view messages in their chats."
  on messages for select
  using ( exists (
    select 1 from chats
    where chats.id = messages.chat_id
    and (chats.user_a = (auth.jwt() ->> 'sub') or chats.user_b = (auth.jwt() ->> 'sub'))
  ));

create policy "Users can insert messages in their chats."
  on messages for insert
  with check ( exists (
    select 1 from chats
    where chats.id = messages.chat_id
    and (chats.user_a = (auth.jwt() ->> 'sub') or chats.user_b = (auth.jwt() ->> 'sub'))
  ));
