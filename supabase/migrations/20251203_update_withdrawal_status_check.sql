-- Update the status CHECK constraint to allow new withdrawal status values
-- This allows the 2-stage approval workflow: pending_approval, proof_approved, awaiting_final_approval

-- Drop the old constraint
ALTER TABLE public.withdrawal_requests
DROP CONSTRAINT withdrawal_requests_status_check;

-- Add the new constraint with all status values
ALTER TABLE public.withdrawal_requests
ADD CONSTRAINT withdrawal_requests_status_check 
CHECK (status IN ('pending', 'pending_approval', 'proof_approved', 'awaiting_final_approval', 'approved', 'rejected', 'completed'));

-- Also update user RLS policy to allow users to update their own withdrawals
DROP POLICY IF EXISTS "Admin can update withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Users can update own withdrawal requests" ON public.withdrawal_requests;
DROP POLICY IF EXISTS "Admin can update all withdrawal requests" ON public.withdrawal_requests;

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
