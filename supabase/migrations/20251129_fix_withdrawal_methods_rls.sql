-- Fix RLS policies for withdrawal_methods table to support UPSERT operations
-- Drop existing policies
DROP POLICY IF EXISTS "admins_update_withdrawal_methods" ON public.withdrawal_methods;
DROP POLICY IF EXISTS "admins_insert_withdrawal_methods" ON public.withdrawal_methods;

-- Recreate INSERT policy with CHECK clause
CREATE POLICY "admins_insert_withdrawal_methods" ON public.withdrawal_methods
  FOR INSERT WITH CHECK (is_admin());

-- Recreate UPDATE policy with proper CHECK for UPSERT support
CREATE POLICY "admins_update_withdrawal_methods" ON public.withdrawal_methods
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

-- Also fix deposit and withdrawal request policies for consistency
DROP POLICY IF EXISTS "admins_update_deposits" ON public.deposit_requests;
DROP POLICY IF EXISTS "admins_update_withdrawals" ON public.withdrawal_requests;

CREATE POLICY "admins_update_withdrawals" ON public.withdrawal_requests
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "admins_update_deposits" ON public.deposit_requests
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
