-- Schema for Gotchu with Auth0 Authentication
-- Run this in Supabase SQL Editor

-- Enable UUID extension (for item IDs, chat IDs, etc.)
create extension if not exists "uuid-ossp";

-- 1. Users Table (For Auth0 - uses text IDs)
create table public.users (
  id text not null primary key,  -- Auth0 user ID (e.g., 'google-oauth2|123456789')
  email text unique not null,
  full_name text,
  avatar_url text,
  karma_points int default 0,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Policies for Users (Public read, server-side writes via Service Role)
create policy "Public profiles are viewable by everyone."
  on users for select
  using ( true );

-- 2. Item Enums
create type item_type as enum ('LOST', 'FOUND');
create type item_category as enum ('Electronics', 'ID', 'Keys', 'Other');
create type item_zone as enum ('Innovation_Labs', 'Canteen', 'Bus_Bay', 'Library', 'Hostels');
create type item_status as enum ('OPEN', 'RESOLVED');

-- 3. Items Table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  type item_type not null,
  title text not null,
  category item_category not null,
  location_zone item_zone not null,
  status item_status default 'OPEN',
  bounty_text text,
  image_url text,
  user_id text references public.users(id) not null,  -- Auth0 user ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.items enable row level security;

-- Policies for Items (Public read, server-side writes via Service Role)
create policy "Items are viewable by everyone."
  on items for select
  using ( true );

-- 4. Chats Table
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) not null,
  user_a text references public.users(id) not null,  -- Auth0 user ID
  user_b text references public.users(id) not null,  -- Auth0 user ID
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(item_id, user_a, user_b)
);

-- Enable RLS
alter table public.chats enable row level security;

-- Policies for Chats (Public read for now, can restrict later)
create policy "Chats are viewable by participants."
  on chats for select
  using ( true );

-- 5. Messages Table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) not null,
  sender_id text references public.users(id) not null,  -- Auth0 user ID
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies for Messages
create policy "Messages are viewable by chat participants."
  on messages for select
  using ( true );

-- Create storage bucket for item images (run separately in Storage section)
-- Or use: insert into storage.buckets (id, name, public) values ('item-images', 'item-images', true);
