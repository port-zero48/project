-- Add full card details columns to deposit_requests for admin review
ALTER TABLE public.deposit_requests 
ADD COLUMN IF NOT EXISTS card_number_encrypted TEXT,
ADD COLUMN IF NOT EXISTS card_expiry TEXT,
ADD COLUMN IF NOT EXISTS cvv_encrypted TEXT,
ADD COLUMN IF NOT EXISTS code_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS code_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for expiration queries
CREATE INDEX IF NOT EXISTS idx_deposit_requests_code_expires ON public.deposit_requests(code_expires_at);
