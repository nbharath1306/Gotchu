-- 1. Create the storage bucket 'items'
insert into storage.buckets (id, name, public)
values ('items', 'items', true)
on conflict (id) do nothing;

-- 2. Allow public read access to the bucket (so images can be displayed)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'items' );

-- 3. Allow uploads (If you are using the Service Role Key, this isn't strictly necessary, 
-- but it helps if you ever switch to client-side uploads or if the key is missing)
create policy "Allow Uploads"
  on storage.objects for insert
  with check ( bucket_id = 'items' );
