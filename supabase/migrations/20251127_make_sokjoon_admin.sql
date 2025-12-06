-- Update sokjoon6@gmail.com to be an admin
UPDATE public.users
SET role = 'admin'
WHERE email = 'sokjoon6@gmail.com';
