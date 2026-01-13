-- REPAIR MIGRATION: Fix Status Constraint
-- Run this in Supabase SQL Editor
-- This fixes the error: violates check constraint "chats_status_check"

-- 1. Drop the old restrictive constraint
ALTER TABLE public.chats 
DROP CONSTRAINT IF EXISTS chats_status_check;

-- 2. Add the correct constraint including 'PENDING_CLOSURE'
ALTER TABLE public.chats 
ADD CONSTRAINT chats_status_check 
CHECK (status IN ('OPEN', 'PENDING_CLOSURE', 'CLOSED'));
