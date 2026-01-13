-- Add related_item_id to chats to track the "initiating" item in a match
ALTER TABLE public.chats 
ADD COLUMN IF NOT EXISTS related_item_id text REFERENCES public.items(id);

-- Verify it works
-- SELECT * FROM chats LIMIT 1;
