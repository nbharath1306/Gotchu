-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table (Extends Supabase Auth)
create table public.users (
  id uuid references auth.users not null primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  karma_points int default 0,
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Policies for Users
create policy "Public profiles are viewable by everyone."
  on users for select
  using ( true );

create policy "Users can insert their own profile."
  on users for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on users for update
  using ( auth.uid() = id );

-- 2. Items Table
create type item_type as enum ('LOST', 'FOUND');
create type item_category as enum ('Electronics', 'ID', 'Keys', 'Other');
create type item_zone as enum ('Innovation_Labs', 'Canteen', 'Bus_Bay', 'Library', 'Hostels');
create type item_status as enum ('OPEN', 'RESOLVED');

create table public.items (
  id uuid default uuid_generate_v4() primary key,
  type item_type not null,
  title text not null,
  category item_category not null,
  location_zone item_zone not null,
  status item_status default 'OPEN',
  bounty_text text,
  image_url text,
  user_id uuid references public.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.items enable row level security;

-- Policies for Items
create policy "Items are viewable by everyone."
  on items for select
  using ( true );

create policy "Authenticated users can insert items."
  on items for insert
  with check ( auth.role() = 'authenticated' );

create policy "Users can update their own items."
  on items for update
  using ( auth.uid() = user_id );

-- 3. Chats Table
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  item_id uuid references public.items(id) not null,
  user_a uuid references public.users(id) not null, -- The person who initiated (e.g., the Loser contacting the Finder)
  user_b uuid references public.users(id) not null, -- The other person
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(item_id, user_a, user_b)
);

-- Enable RLS
alter table public.chats enable row level security;

-- Policies for Chats
create policy "Users can view their own chats."
  on chats for select
  using ( auth.uid() = user_a or auth.uid() = user_b );

create policy "Authenticated users can create chats."
  on chats for insert
  with check ( auth.role() = 'authenticated' );

-- 4. Messages Table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  chat_id uuid references public.chats(id) not null,
  sender_id uuid references public.users(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies for Messages
create policy "Users can view messages in their chats."
  on messages for select
  using ( exists (
    select 1 from chats
    where chats.id = messages.chat_id
    and (chats.user_a = auth.uid() or chats.user_b = auth.uid())
  ));

create policy "Users can insert messages in their chats."
  on messages for insert
  with check ( exists (
    select 1 from chats
    where chats.id = messages.chat_id
    and (chats.user_a = auth.uid() or chats.user_b = auth.uid())
  ));

-- Trigger to handle new user signup (automatically create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
