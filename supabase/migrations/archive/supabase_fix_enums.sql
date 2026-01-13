-- Add 'Other' to the item_zone enum to support the "Other Sector" option in the report form.
-- This fixes the "invalid input value for enum item_zone: "Other"" error.

ALTER TYPE public.item_zone ADD VALUE IF NOT EXISTS 'Other';
