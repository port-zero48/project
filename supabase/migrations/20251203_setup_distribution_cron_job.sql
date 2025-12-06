-- Setup cron job to automatically distribute investment returns (daily + intervals)
-- This calls the distribute-investment-returns edge function every minute

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Schedule the distribution job to run every 1 minute
-- Adjust the schedule as needed:
-- '* * * * *' = every minute (most responsive)
-- '*/5 * * * *' = every 5 minutes  
-- '0 * * * *' = every hour
SELECT cron.schedule(
  'distribute-investment-returns',
  '* * * * *',
  $$
  SELECT net.http_post(
    'https://ukizjreylybyidbazgas.supabase.co/functions/v1/distribute-investment-returns',
    jsonb_build_object(),
    jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
  ) as request_id;
  $$
);

-- Note: If you get an error about the job already existing, run this to remove it first:
-- SELECT cron.unschedule('distribute-investment-returns');

-- To view all scheduled jobs:
-- SELECT * FROM cron.job WHERE jobname LIKE 'distribute%';

-- To view job execution logs:
-- SELECT * FROM cron.job_run_details WHERE jobname = 'distribute-investment-returns' ORDER BY start_time DESC LIMIT 10;
