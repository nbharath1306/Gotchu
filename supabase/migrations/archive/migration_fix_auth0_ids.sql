-- Migration: Fix Auth0 ID mismatch
-- 1. Drop existing Foreign Key constraints that reference public.users
ALTER TABLE public.items DROP CONSTRAINT items_user_id_fkey;
ALTER TABLE public.chats DROP CONSTRAINT chats_user_a_fkey;
ALTER TABLE public.chats DROP CONSTRAINT chats_user_b_fkey;
ALTER TABLE public.messages DROP CONSTRAINT messages_sender_id_fkey;

-- 2. Drop the constraint linking public.users to auth.users
ALTER TABLE public.users DROP CONSTRAINT users_id_fkey;

-- 3. Change ID columns from UUID to TEXT
-- Note: We must cast to text. If tabel is empty this is trivial.
ALTER TABLE public.users ALTER COLUMN id TYPE text;
ALTER TABLE public.items ALTER COLUMN user_id TYPE text;
ALTER TABLE public.chats ALTER COLUMN user_a TYPE text;
ALTER TABLE public.chats ALTER COLUMN user_b TYPE text;
ALTER TABLE public.messages ALTER COLUMN sender_id TYPE text;

-- 4. Re-establish Foreign Keys to local public.users table
ALTER TABLE public.items 
  ADD CONSTRAINT items_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id);

ALTER TABLE public.chats 
  ADD CONSTRAINT chats_user_a_fkey 
  FOREIGN KEY (user_a) REFERENCES public.users(id);

ALTER TABLE public.chats 
  ADD CONSTRAINT chats_user_b_fkey 
  FOREIGN KEY (user_b) REFERENCES public.users(id);

ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.users(id);

-- 5. Drop the trigger that auto-creates users from auth.users (since we use Auth0 now)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- 6. Update RLS Policies to handle Text IDs and Service Role
-- Since we can't use auth.uid() (which is UUID) for Auth0 users, 
-- we need to rely on the API layer enforcing permissions, OR 
-- store the Auth0 ID in a way Supabase auth can understand (complex).
-- For now, we will relax RLS to allow the Service Role (API) to do everything,
-- and public read access where appropriate.

-- Temporarily disable RLS on users to ensure sync works easily from API
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- We will rely on our API routes using the Service Role Key to manage data safely.
