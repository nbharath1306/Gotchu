-- Promote Specific Users to ADMIN Role
-- This ensures they have DB-level access even if the code hardcoding changes.

UPDATE public.users
SET role = 'ADMIN'
WHERE email IN ('n.bharath3430@gmail.com', 'amazingakhil2006@gmail.com');

-- Verify (Optional select to see if it worked)
-- SELECT email, role FROM public.users WHERE role = 'ADMIN';
