-- Consolidate deposit handling: single table for all deposit methods
-- This replaces the old deposit_requests table structure

DROP TABLE IF EXISTS public.deposit_requests CASCADE;

-- Create unified deposit_requests table for all deposit methods
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deposit_method TEXT NOT NULL CHECK (deposit_method IN ('card', 'transfer', 'crypto')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'code_sent', 'code_verified', 'completed', 'rejected')),
  
  -- For card deposits
  card_last_digits TEXT,
  cardholder_name TEXT,
  verification_code TEXT,
  verification_code_attempts INTEGER DEFAULT 0,
  
  -- For file uploads (transfer method - payment slip)
  payment_slip_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON public.deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON public.deposit_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_method ON public.deposit_requests(deposit_method);

-- Enable RLS
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deposit_requests
CREATE POLICY "users_view_own_deposits" ON public.deposit_requests
  FOR SELECT USING (user_id = auth.uid());    

CREATE POLICY "admins_view_all_deposits" ON public.deposit_requests
  FOR SELECT USING (is_admin());

CREATE POLICY "users_create_deposits" ON public.deposit_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_update_deposits" ON public.deposit_requests
  FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
