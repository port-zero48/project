-- Add DELETE policies for withdrawal_requests table
-- Allow admin to delete withdrawal requests

-- Drop existing delete policies if they exist
DROP POLICY IF EXISTS "Admin can delete withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can delete own withdrawal requests" ON public.withdrawal_requests;

-- Create DELETE policy for admin
CREATE POLICY "Admin can delete withdrawal requests"
  ON public.withdrawal_requests
  FOR DELETE
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    OR auth.jwt() ->> 'email' = 'vit88095@gmail.com'
  );

-- Create DELETE policy for users to delete their own (optional)
CREATE POLICY "Users can delete own withdrawal requests"
  ON public.withdrawal_requests
  FOR DELETE
  USING (auth.uid() = user_id);

-- Also ensure there's a SELECT policy for admins to view all withdrawals
DROP POLICY IF EXISTS "Admin can view all withdrawal requests" ON public.withdrawal_requests;

CREATE POLICY "Admin can view all withdrawal requests"
  ON public.withdrawal_requests
  FOR SELECT
  USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    OR auth.jwt() ->> 'email' = 'vit88095@gmail.com'
  );
