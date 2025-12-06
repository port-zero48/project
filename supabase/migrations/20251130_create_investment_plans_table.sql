-- Create investment plans tracking table
CREATE TABLE IF NOT EXISTS public.investment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  annual_return_rate DECIMAL(5, 2) NOT NULL,
  monthly_return DECIMAL(10, 2) NOT NULL,
  annual_return DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, cancelled
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;

-- Users can view their own investment plans
CREATE POLICY investment_plans_select_policy ON public.investment_plans
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Users can insert their own investment plans
CREATE POLICY investment_plans_insert_policy ON public.investment_plans
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own investment plans
CREATE POLICY investment_plans_update_policy ON public.investment_plans
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    user_id = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Create index for faster queries
CREATE INDEX idx_investment_plans_user_id ON public.investment_plans(user_id);
CREATE INDEX idx_investment_plans_status ON public.investment_plans(status);
