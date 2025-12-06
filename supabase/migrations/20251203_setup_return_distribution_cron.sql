-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a scheduled job to call the distribute-investment-returns function every minute
-- This job calls the function every 1 minute to check and distribute returns
SELECT cron.schedule(
  'distribute-investment-returns-job',
  '* * * * *',  -- Every minute
  'SELECT net.http_post(
    ''https://' || current_setting('app.settings.supabase_url') || '/functions/v1/distribute-investment-returns'',
    jsonb_build_object(),
    ''{"Authorization":"Bearer ' || current_setting('app.settings.service_role_key') || '","Content-Type":"application/json"}''::jsonb
  ) as request_id;'
);

-- Note: You can also use these alternatives:
-- '*/5 * * * *' for every 5 minutes
-- '*/15 * * * *' for every 15 minutes  
-- '0 * * * *' for every hour

-- To view the scheduled jobs:
-- SELECT * FROM cron.job;

-- To remove the job if needed:
-- SELECT cron.unschedule('distribute-investment-returns-job');
