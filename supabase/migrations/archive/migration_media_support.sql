-- SAFE MIGRATION: Add Media Support
-- Run this in Supabase SQL Editor. It will NOT delete your data.

-- 1. Modify 'messages' table to support images
ALTER TABLE public.messages ALTER COLUMN content DROP NOT NULL;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='message_type') THEN
        ALTER TABLE public.messages ADD COLUMN message_type text default 'TEXT';
        ALTER TABLE public.messages ADD CONSTRAINT messages_type_check CHECK (message_type IN ('TEXT', 'IMAGE'));
    END IF;
END $$;

ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url text;

-- 2. Create Storage Bucket for Images (if it doesn't exist)
-- Note: This requires permissions. If it fails, create 'chat-images' bucket manually in Dashboard > Storage.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies (Allow public read, authenticated upload)
-- Drop existing to avoid conflicts during re-runs
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;

CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'chat-images' );

CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'chat-images' AND auth.role() = 'authenticated' );
