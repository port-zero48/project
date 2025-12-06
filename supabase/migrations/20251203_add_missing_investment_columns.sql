-- Add missing columns to investment_plans table for proper tracking
ALTER TABLE public.investment_plans
ADD COLUMN IF NOT EXISTS plan_id TEXT,
ADD COLUMN IF NOT EXISTS daily_return_rate DECIMAL(10, 2);

-- Update existing rows to have default values
UPDATE public.investment_plans
SET 
  plan_id = CASE 
    WHEN annual_return_rate >= 525 THEN 'royalty'
    WHEN annual_return_rate >= 420 THEN 'professional'
    WHEN annual_return_rate >= 315 THEN 'active'
    WHEN annual_return_rate >= 210 THEN 'passive'
    ELSE 'beginner'
  END,
  daily_return_rate = annual_return_rate
WHERE plan_id IS NULL OR daily_return_rate IS NULL;

-- Create index for plan_id
CREATE INDEX IF NOT EXISTS idx_investment_plans_plan_id ON public.investment_plans(plan_id);
