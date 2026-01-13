-- 1. Create the column first (Safe to run multiple times)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'USER';

-- 2. Add the check constraint separately to avoid transaction issues
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check') THEN 
        ALTER TABLE public.users 
        ADD CONSTRAINT users_role_check CHECK (role IN ('USER', 'ADMIN', 'MODERATOR')); 
    END IF; 
END $$;

-- 3. Promote yourself (Customize email in SQL Editor)
-- UPDATE public.users SET role = 'ADMIN' WHERE email = 'YOUR_EMAIL_HERE';
