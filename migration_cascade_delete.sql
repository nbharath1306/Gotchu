-- Ensure chats are deleted when referenced items are deleted
-- We need to drop existing constraints and re-add them with CASCADE

-- 1. Handle item_id constraint
DO $$ 
BEGIN 
  -- Try to find the constraint name. Usually it's chats_item_id_fkey but might vary.
  -- We'll try to drop the standard naming. If it fails, users might need to check their specific constraint name.
  -- For Supabase/Postgres default:
  ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_item_id_fkey;
  
  -- Re-add with CASCADE
  ALTER TABLE public.chats 
  ADD CONSTRAINT chats_item_id_fkey 
  FOREIGN KEY (item_id) 
  REFERENCES public.items(id) 
  ON DELETE CASCADE;
END $$;

-- 2. Handle related_item_id constraint
DO $$ 
BEGIN 
    ALTER TABLE public.chats DROP CONSTRAINT IF EXISTS chats_related_item_id_fkey;
    
    ALTER TABLE public.chats 
    ADD CONSTRAINT chats_related_item_id_fkey 
    FOREIGN KEY (related_item_id) 
    REFERENCES public.items(id) 
    ON DELETE CASCADE;
END $$;
