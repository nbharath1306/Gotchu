-- Disable RLS on chats and messages tables
-- Since we are using Auth0 for authentication and the client-side Supabase client
-- uses the anonymous key (without user context), standard RLS policies will block access.
-- For this prototype, we will disable RLS to allow the chat interface to work.
-- NOTE: In a production app, you would proxy requests through a server or use custom JWTs.

ALTER TABLE public.chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Also ensure items and users are accessible if needed by client
-- (Users is usually public read, Items is public read)
-- But let's keep them as is if they are working. 
-- If you see issues with fetching items on client, run:
-- ALTER TABLE public.items DISABLE ROW LEVEL SECURITY;
