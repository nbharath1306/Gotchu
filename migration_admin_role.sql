-- Add Role Column to Users Table
-- Start with everyone as 'USER'. We will manually promote Admins.

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MODERATOR'));

-- Index for faster role checks (optional but good practice)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Helper to promote yourself (Replace EMAIL with yours)
-- UPDATE public.users SET role = 'ADMIN' WHERE email = 'your_email@example.com';
