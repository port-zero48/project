-- Proper migration to add withdrawal fee and account details columns to existing withdrawal_requests table
-- This safely adds the missing columns without breaking existing data

ALTER TABLE public.withdrawal_requests
ADD COLUMN IF NOT EXISTS withdrawal_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS proof_file_path TEXT,
ADD COLUMN IF NOT EXISTS account_details JSONB,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON public.withdrawal_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_status ON public.withdrawal_requests(user_id, status);

-- Recreate RLS policies safely (drop first if exists)
DROP POLICY IF EXISTS "Users can view own withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can view own withdrawal requests"
  ON public.withdrawal_requests
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'vit88095@gmail.com');

DROP POLICY IF EXISTS "Users can create withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Users can create withdrawal requests"
  ON public.withdrawal_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin can update withdrawal requests" ON public.withdrawal_requests;
CREATE POLICY "Admin can update withdrawal requests"
  ON public.withdrawal_requests
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'vit88095@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'vit88095@gmail.com');

-- Create storage bucket for withdrawal-proofs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('withdrawal-proofs', 'withdrawal-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage policies for withdrawal-proofs
DROP POLICY IF EXISTS "Users can upload to withdrawal-proofs" ON storage.objects;
CREATE POLICY "Users can upload to withdrawal-proofs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'withdrawal-proofs');

DROP POLICY IF EXISTS "Users can view their own withdrawal proofs" ON storage.objects;
CREATE POLICY "Users can view their own withdrawal proofs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'withdrawal-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Admin can view all withdrawal proofs" ON storage.objects;
CREATE POLICY "Admin can view all withdrawal proofs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'withdrawal-proofs' AND auth.jwt() ->> 'email' = 'vit88095@gmail.com');
