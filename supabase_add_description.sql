-- Add description field to items table
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS description text;
