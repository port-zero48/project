-- Fix admin access to deposit_requests by using direct role check

-- Drop existing policies
DROP POLICY IF EXISTS "admins_view_all_deposits" ON public.deposit_requests;
DROP POLICY IF EXISTS "admins_update_deposits" ON public.deposit_requests;
DROP POLICY IF EXISTS "admins_delete_deposits" ON public.deposit_requests;

-- Create new policies with direct role check instead of is_admin() function
CREATE POLICY "admins_view_all_deposits" ON public.deposit_requests
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admins_update_deposits" ON public.deposit_requests
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  ) WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "admins_delete_deposits" ON public.deposit_requests
  FOR DELETE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );


