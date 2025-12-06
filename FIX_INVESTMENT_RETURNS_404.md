# Fix Investment Returns 404 Error

## Problem
When activating an investment plan, you get:
```
Error activating investment plan. Please try again.
404 GET https://ukizjreylybyidbazgas.supabase.co/rest/v1/investment_returns?select=return_amount&user_id=eq...
```

This happens because the `investment_returns` table hasn't been created in your Supabase database.

## Solution

### Step 1: Get the Migration SQL
The migration file is at: `supabase/migrations/20251204_add_investment_returns_tracking.sql`

Its contents:
```sql
CREATE TABLE IF NOT EXISTS public.investment_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investment_plan_id UUID NOT NULL REFERENCES public.investment_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  return_amount DECIMAL(10, 2) NOT NULL,
  interval_minutes INTEGER NOT NULL,
  distributed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE public.investment_plans
ADD COLUMN IF NOT EXISTS last_return_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS next_return_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS returns_distributed INTEGER DEFAULT 0;

ALTER TABLE public.investment_returns ENABLE ROW LEVEL SECURITY;

CREATE POLICY investment_returns_select_policy ON public.investment_returns
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY investment_returns_insert_policy ON public.investment_returns
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_investment_returns_user_id ON public.investment_returns(user_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_plan_id ON public.investment_returns(investment_plan_id);
CREATE INDEX IF NOT EXISTS idx_investment_returns_interval ON public.investment_returns(interval_minutes);
CREATE INDEX IF NOT EXISTS idx_investment_plans_next_return ON public.investment_plans(next_return_at);
```

### Step 2: Run in Supabase Dashboard
1. Go to: https://app.supabase.com/
2. Select your project: `ukizjreylybyidbazgas`
3. Go to **SQL Editor**
4. Create a **New Query**
5. Copy and paste the SQL above
6. Click **Run**

### Step 3: Verify
After running the migration:
1. Go back to your app
2. Try activating an investment plan again
3. It should work now!

## Alternative: Using Service Key
If you have your Supabase Service Key, you can run:
```powershell
$env:SUPABASE_SERVICE_KEY="your-service-key"
node run-investment-returns-migration.mjs
```

## What Was Fixed
- Created `investment_returns` table to track return distributions
- Added RLS policies so users can only see their own returns
- Added necessary columns to `investment_plans` table
- Updated `ActiveInvestments.tsx` to handle missing table gracefully
