-- Create transaction_history table for tracking all user transactions
CREATE TABLE IF NOT EXISTS transaction_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- 'withdrawal', 'deposit', 'investment', 'return'
  method_type VARCHAR(50), -- 'transfer', 'crypto', 'card'
  amount DECIMAL(15, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'rejected'
  description TEXT,
  reference_id UUID, -- Link to withdrawal_requests, deposits, investment_returns, etc.
  metadata JSONB, -- Store additional info like bank details, account info, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_transaction_history_user_id ON transaction_history(user_id);
CREATE INDEX idx_transaction_history_created_at ON transaction_history(created_at DESC);
CREATE INDEX idx_transaction_history_type ON transaction_history(transaction_type);

-- Enable RLS
ALTER TABLE transaction_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own transaction history"
  ON transaction_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
  ON transaction_history FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update transactions"
  ON transaction_history FOR UPDATE
  USING (true);
