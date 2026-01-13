-- SAFE MIGRATION: Allow all file types
-- Run this in Supabase SQL Editor

-- 1. Drop the existing check constraint on message_type
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_type_check;

-- 2. Add a new, broader constraint (or just allow any text)
ALTER TABLE public.messages ADD CONSTRAINT messages_type_check 
CHECK (message_type IN ('TEXT', 'IMAGE', 'FILE'));
