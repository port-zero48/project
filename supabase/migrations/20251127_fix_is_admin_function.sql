-- Fix is_admin() function to check public.users table instead of auth.users
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
SELECT EXISTS (
  SELECT 1 FROM public.users
  WHERE public.users.id = auth.uid()
  AND public.users.role = 'admin'
);
$$ LANGUAGE SQL SECURITY DEFINER;
