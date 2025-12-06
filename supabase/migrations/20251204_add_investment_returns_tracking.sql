-- Create table to track investment return distributions at intervals
-- This allows users to see returns credited at 10min, 20min, 30min, and 1 hour intervals

CREATE TABLE IF NOT EXISTS public.investment_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_plan_id UUID NOT NULL REFERENCES public.investment_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  return_amount DECIMAL(10, 2) NOT NULL,
  interval_minutes INTEGER NOT NULL, -- 10, 20, 30, 60
  distributed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add columns to investment_plans to track return distribution
ALTER TABLE public.investment_plans
ADD COLUMN IF NOT EXISTS last_return_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_return_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS returns_distributed INTEGER DEFAULT 0; -- Count of intervals completed (0, 1, 2, 3, 4)

-- Enable RLS
ALTER TABLE public.investment_returns ENABLE ROW LEVEL SECURITY;

-- Users can view their own investment returns
CREATE POLICY investment_returns_select_policy ON public.investment_returns
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Users can insert their own investment returns
CREATE POLICY investment_returns_insert_policy ON public.investment_returns
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_investment_returns_user_id ON public.investment_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_plan_id ON public.investment_returns(investment_plan_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_interval ON public.investment_returns(interval_minutes);
CREATE INDEX IF NOT EXISTS idx_investment_plans_next_return ON public.investment_plans(next_return_at);
