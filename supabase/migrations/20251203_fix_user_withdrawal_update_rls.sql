-- Fix RLS policy to allow users to update their own withdrawal requests
-- Users need to be able to update proof_file_path and status when uploading proof

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Admin can update withdrawal requests" ON public.withdrawal_requests;

-- Create separate policies for admin and user updates
CREATE POLICY "Users can update own withdrawal requests"
  ON public.withdrawal_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update all withdrawal requests"
  ON public.withdrawal_requests
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'vit88095@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vit88095@gmail.com');
