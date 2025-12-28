-- Ensure messages are deleted when referenced chats are deleted
-- This is the "Deep Cascade" often missed.

DO $$ 
BEGIN 
  -- 1. Drop existing constraint on messages
  ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_chat_id_fkey;
  
  -- 2. Re-add with CASCADE
  ALTER TABLE public.messages 
  ADD CONSTRAINT messages_chat_id_fkey 
  FOREIGN KEY (chat_id) 
  REFERENCES public.chats(id) 
  ON DELETE CASCADE;
END $$;

-- 3. Also double check chat_participants constraint if it exists? 
-- (Usually handled by chats table logic, but checking just in case)
