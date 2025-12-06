-- Create withdrawal_settings table for global admin configuration
CREATE TABLE IF NOT EXISTS public.withdrawal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  admin_bank_name TEXT NOT NULL DEFAULT '',
  admin_account_holder TEXT NOT NULL DEFAULT '',
  admin_account_number TEXT NOT NULL DEFAULT '',
  admin_routing_number TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW())
);

-- Enable RLS
ALTER TABLE public.withdrawal_settings ENABLE ROW LEVEL SECURITY;

-- Allow admin (vit88095@gmail.com) to read withdrawal settings
CREATE POLICY "Admin can read withdrawal settings"
  ON public.withdrawal_settings
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'vit88095@gmail.com');

-- Allow admin (vit88095@gmail.com) to update withdrawal settings
CREATE POLICY "Admin can update withdrawal settings"
  ON public.withdrawal_settings
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'vit88095@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vit88095@gmail.com');

-- Allow admin (vit88095@gmail.com) to insert withdrawal settings
CREATE POLICY "Admin can insert withdrawal settings"
  ON public.withdrawal_settings
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'vit88095@gmail.com');

-- Allow all authenticated users to read withdrawal settings
CREATE POLICY "Authenticated users can read withdrawal settings"
  ON public.withdrawal_settings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Insert default row
DO $$
BEGIN
  INSERT INTO public.withdrawal_settings (
    withdrawal_fee,
    admin_bank_name,
    admin_account_holder,
    admin_account_number,
    admin_routing_number
  )
  VALUES (5.00, 'First National Bank', 'Investment Admin', '1234567890', '021000021')
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
