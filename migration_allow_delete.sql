-- Enable Deletion for Item Owners
-- By default, Supabase might not allow DELETE on items table for authenticated users.

-- 1. Enable RLS (just in case)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 2. Create Policy: "Users can delete their own items"
DROP POLICY IF EXISTS "Users can delete own items" ON public.items;

CREATE POLICY "Users can delete own items"
ON public.items
FOR DELETE
USING (auth.uid()::text = user_id);

-- 3. Double check Select Policy exists too
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON public.items;
CREATE POLICY "Public items are viewable by everyone"
ON public.items FOR SELECT
USING (true);

-- 4. Double check Insert Policy
DROP POLICY IF EXISTS "Users can insert their own items" ON public.items;
CREATE POLICY "Users can insert their own items"
ON public.items FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- 5. Double check Update Policy
DROP POLICY IF EXISTS "Users can update their own items" ON public.items;
CREATE POLICY "Users can update their own items"
ON public.items FOR UPDATE
USING (auth.uid()::text = user_id);
