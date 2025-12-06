-- Create withdrawal_methods table for admin to configure withdraw details
CREATE TABLE IF NOT EXISTS public.withdrawal_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  method_type TEXT NOT NULL UNIQUE CHECK (method_type IN ('card', 'transfer', 'crypto')),
  
  -- For card withdrawals
  card_holder_name TEXT,
  card_last_digits TEXT,
  
  -- For bank transfer
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  account_holder_name TEXT,
  
  -- For crypto
  crypto_type TEXT, -- 'bitcoin', 'ethereum', etc
  wallet_address TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method_type TEXT NOT NULL CHECK (method_type IN ('card', 'transfer', 'crypto')),
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create deposit_requests table for card deposits
CREATE TABLE IF NOT EXISTS public.deposit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  card_last_digits TEXT NOT NULL,
  cardholder_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'code_sent', 'code_verified', 'completed', 'rejected')),
  verification_code TEXT,
  verification_code_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_user_id ON public.deposit_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deposit_requests_status ON public.deposit_requests(status);

-- Enable RLS
ALTER TABLE public.withdrawal_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for withdrawal_methods (admin only for updates)
CREATE POLICY "withdrawal_methods_public_read" ON public.withdrawal_methods
  FOR SELECT USING (is_active = true);

CREATE POLICY "admins_insert_withdrawal_methods" ON public.withdrawal_methods
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "admins_update_withdrawal_methods" ON public.withdrawal_methods
  FOR UPDATE USING (is_admin());

CREATE POLICY "admins_delete_withdrawal_methods" ON public.withdrawal_methods
  FOR DELETE USING (is_admin());

-- RLS Policies for withdrawal_requests
CREATE POLICY "users_view_own_withdrawals" ON public.withdrawal_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "admins_view_all_withdrawals" ON public.withdrawal_requests
  FOR SELECT USING (is_admin());

CREATE POLICY "users_create_withdrawals" ON public.withdrawal_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_update_withdrawals" ON public.withdrawal_requests
  FOR UPDATE USING (is_admin());

-- RLS Policies for deposit_requests
CREATE POLICY "users_view_own_deposits" ON public.deposit_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "admins_view_all_deposits" ON public.deposit_requests
  FOR SELECT USING (is_admin());

CREATE POLICY "users_create_deposits" ON public.deposit_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "admins_update_deposits" ON public.deposit_requests
  FOR UPDATE USING (is_admin());
