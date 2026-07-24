-- Enable RLS on admin_actions table
ALTER TABLE IF EXISTS public.admin_actions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admins to read admin_actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Allow service role to manage admin_actions" ON public.admin_actions;

-- Create policy for admin read access
CREATE POLICY "Allow admins to read admin_actions"
ON public.admin_actions
FOR SELECT
USING (
  auth.jwt() ->> 'email' = 'vit88095@gmail.com' OR
  auth.role() = 'service_role'
);

-- Create policy for service role insert
CREATE POLICY "Allow service role to insert admin_actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Create policy for service role update
CREATE POLICY "Allow service role to update admin_actions"
ON public.admin_actions
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create policy for service role delete
CREATE POLICY "Allow service role to delete admin_actions"
ON public.admin_actions
FOR DELETE
USING (auth.role() = 'service_role');

---

-- Enable RLS on user_sessions table
ALTER TABLE IF EXISTS public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Allow service role to manage user_sessions" ON public.user_sessions;

-- Create policy for users to read their own sessions
CREATE POLICY "Users can read their own sessions"
ON public.user_sessions
FOR SELECT
USING (
  auth.uid() = user_id OR
  auth.role() = 'service_role'
);

-- Create policy for service role insert
CREATE POLICY "Allow service role to insert user_sessions"
ON public.user_sessions
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Create policy for service role update
CREATE POLICY "Allow service role to update user_sessions"
ON public.user_sessions
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Create policy for service role delete
CREATE POLICY "Allow service role to delete user_sessions"
ON public.user_sessions
FOR DELETE
USING (auth.role() = 'service_role');

---

-- Enable RLS on cron_jobs table
ALTER TABLE IF EXISTS public.cron_jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role to manage cron_jobs" ON public.cron_jobs;

-- Create policy for service role only (cron jobs are system-level)
CREATE POLICY "Allow service role to manage cron_jobs"
ON public.cron_jobs
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
