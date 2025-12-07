-- Migration to support Auth0 (String IDs) instead of Supabase Auth (UUIDs)

-- 1. Drop foreign key constraints
alter table public.items drop constraint if exists items_user_id_fkey;
alter table public.users drop constraint if exists users_id_fkey;

-- 2. Change ID columns to text
alter table public.users alter column id type text;
alter table public.items alter column user_id type text;

-- 3. Drop old policies that relied on auth.uid()
drop policy if exists "Users can insert their own profile." on users;
drop policy if exists "Users can update own profile." on users;
drop policy if exists "Users can insert their own items." on items;
drop policy if exists "Users can update their own items." on items;
drop policy if exists "Users can delete their own items." on items;

-- 4. Create new policies (Optional, as we will use Service Role on server)
-- Allow public read access
create policy "Public profiles are viewable by everyone." on users for select using (true);
create policy "Items are viewable by everyone." on items for select using (true);
