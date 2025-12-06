-- Correct queries to check cron job status in Supabase

-- 1. View all scheduled jobs
SELECT * FROM cron.job;

-- 2. View job execution history (use 'job' instead of 'jobname')
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;

-- 3. Check investment returns recorded
SELECT * FROM public.investment_returns 
ORDER BY created_at DESC 
LIMIT 20;

-- 4. Check investment plans status
SELECT id, plan_name, amount, annual_return_rate, returns_distributed, next_return_at, updated_at 
FROM public.investment_plans 
WHERE status = 'active' 
ORDER BY updated_at DESC 
LIMIT 10;

-- 5. Check user balance changes
SELECT id, email, investment_balance, account_balance, updated_at
FROM public.users 
WHERE role != 'admin'
ORDER BY updated_at DESC 
LIMIT 5;
