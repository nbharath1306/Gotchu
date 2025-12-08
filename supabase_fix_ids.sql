-- Fix ID columns to be TEXT to support Auth0 IDs (which are strings)
-- instead of UUIDs. This prevents "invalid input syntax for type uuid" errors.

-- 1. Drop foreign key constraints first to allow type changes
ALTER TABLE public.items DROP CONSTRAINT IF EXISTS items_user_id_fkey;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_user_a_fkey;
ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_user_b_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- Drop the constraint to auth.users if it exists (usually named users_id_fkey or similar)
-- We are decoupling from Supabase Auth since we use Auth0
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 2. Change types to TEXT
ALTER TABLE public.users ALTER COLUMN id TYPE text;
ALTER TABLE public.items ALTER COLUMN user_id TYPE text;
ALTER TABLE public.chats ALTER COLUMN user_a TYPE text;
ALTER TABLE public.chats ALTER COLUMN user_b TYPE text;
ALTER TABLE public.messages ALTER COLUMN sender_id TYPE text;

-- 3. Re-add foreign key constraints
ALTER TABLE public.items ADD CONSTRAINT items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE public.chats ADD CONSTRAINT chats_user_a_fkey FOREIGN KEY (user_a) REFERENCES public.users(id);
ALTER TABLE public.chats ADD CONSTRAINT chats_user_b_fkey FOREIGN KEY (user_b) REFERENCES public.users(id);
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);
