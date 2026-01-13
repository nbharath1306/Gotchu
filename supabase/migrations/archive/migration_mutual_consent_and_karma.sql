-- MUTUAL CONSENT & KARMA MIGRATION
-- Run this in Supabase SQL Editor

-- 1. Update Users Table (Karma)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS karma_points integer DEFAULT 0;

-- 2. Update Chats Table (Status & Consent)
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'PENDING_CLOSURE', 'CLOSED'));

ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS closure_requested_by text;

-- 3. RPC Function for Safe Karma Increment
CREATE OR REPLACE FUNCTION increment_karma(user_ids text[], amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users
  SET karma_points = COALESCE(karma_points, 0) + amount
  WHERE id = ANY(user_ids);
END;
$$;
