-- Run this in your Supabase Dashboard > SQL Editor
ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS status text default 'OPEN' check (status in ('OPEN', 'CLOSED'));

ALTER TABLE chats 
ADD COLUMN IF NOT EXISTS closure_requested_by text;
