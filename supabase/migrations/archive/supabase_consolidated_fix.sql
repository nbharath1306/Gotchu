-- Consolidated Fix Script
-- Run this to ensure your database schema is fully up to date.

-- 1. Add missing columns
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS date_reported date;

-- 2. Fix Enum for Location Zone (Add 'Other')
ALTER TYPE public.item_zone ADD VALUE IF NOT EXISTS 'Other';

-- 3. Ensure Storage Bucket Exists
insert into storage.buckets (id, name, public)
values ('items', 'items', true)
on conflict (id) do nothing;

-- 4. Ensure ID columns are TEXT (if not already)
-- (This part is idempotent-ish, but if constraints exist they might block. 
--  Ideally you ran supabase_fix_ids.sql already. This is just a safety check for the columns themselves)
--  We won't repeat the full migration here to avoid errors if constraints are already dropped/re-added.
--  But let's ensure the columns are text.
ALTER TABLE public.users ALTER COLUMN id TYPE text;
ALTER TABLE public.items ALTER COLUMN user_id TYPE text;
