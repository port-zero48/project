# Supabase Edge Function Setup - Daily Profit Distribution

## What This Does

This Edge Function runs daily to:
1. Find all active investment plans
2. Calculate daily profit: (amount × annual_return_rate) / 365
3. Add profit to user's `investment_balance`
4. Update timestamps for tracking

## Setup Steps

### Step 1: Deploy the Edge Function

```bash
cd c:\Users\hp\Downloads\project112\project

# Deploy the function
supabase functions deploy distribute-daily-profits
```

### Step 2: Set Environment Variable in Supabase

1. Go to **Supabase Dashboard**
2. Navigate to **Settings → Edge Functions**
3. Add this environment variable:
   - Key: `PROFIT_DISTRIBUTION_SECRET`
   - Value: `your-secret-key-here` (use a strong random string)

Example:
```
PROFIT_DISTRIBUTION_SECRET=sk_prod_abc123def456ghi789jkl
```

### Step 3: Set Up Automated Scheduling

**Option A: Using Supabase Cron (Recommended)**

Create a new table for cron jobs in Supabase SQL Editor:

```sql
-- Create table for tracking profit distributions
CREATE TABLE IF NOT EXISTS profit_distribution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMP DEFAULT NOW(),
  processed_count INT,
  total_plans INT,
  errors TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profit_distribution_logs ENABLE ROW LEVEL SECURITY;

-- Admin only access
CREATE POLICY profit_logs_admin ON profit_distribution_logs
  FOR ALL
  USING ((SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');
```

**Option B: Using External Cron Service (EasyCron.com)**

1. Go to https://www.easycron.com
2. Create a new cron job with:
   - **URL**: `https://[your-project].functions.supabase.co/distribute-daily-profits`
   - **Method**: POST
   - **Headers**: 
     ```
     Authorization: Bearer sk_prod_abc123def456ghi789jkl
     Content-Type: application/json
     ```
   - **Schedule**: Every day at 00:00 UTC
     - Cron Expression: `0 0 * * *`

**Option C: Using GitHub Actions**

Create `.github/workflows/daily-profits.yml`:

```yaml
name: Distribute Daily Profits

on:
  schedule:
    # Run every day at midnight UTC
    - cron: '0 0 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  distribute:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger profit distribution
        run: |
          curl -X POST https://[your-project].functions.supabase.co/distribute-daily-profits \
            -H "Authorization: Bearer ${{ secrets.PROFIT_DISTRIBUTION_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{}'
```

## Testing the Function

### Test Locally

```bash
# Start Supabase locally
supabase start

# Invoke the function
supabase functions invoke distribute-daily-profits \
  --header "Authorization: Bearer your-secret-key-here"
```

### Test in Production

Use curl or Postman:

```bash
curl -X POST https://[your-project].functions.supabase.co/distribute-daily-profits \
  -H "Authorization: Bearer sk_prod_abc123def456ghi789jkl" \
  -H "Content-Type: application/json"
```

Expected Response:
```json
{
  "success": true,
  "message": "Daily profits distributed",
  "processed": 5,
  "total": 5,
  "errors": null
}
```

## How to Find Your Project URL

Your Edge Function URL is:
```
https://[project-ref].functions.supabase.co/distribute-daily-profits
```

Find `[project-ref]` from:
1. Supabase Dashboard → Settings → General
2. Look for "Project URL" (e.g., `https://abc123def.supabase.co`)
3. Extract the part before `.supabase.co` (e.g., `abc123def`)

Full URL example:
```
https://abc123def.functions.supabase.co/distribute-daily-profits
```

## Monitoring & Logs

### View Function Logs

```bash
supabase functions list
supabase functions delete distribute-daily-profits --dry-run
```

Or in Supabase Dashboard:
1. Go to **Functions**
2. Click **distribute-daily-profits**
3. View logs in the dashboard

### Check Profit Distributions

Query the logs table:
```sql
SELECT * FROM profit_distribution_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

Check user investment balances updated:
```sql
SELECT email, investment_balance, updated_at 
FROM users 
WHERE investment_balance > 0 
ORDER BY updated_at DESC;
```

## Common Issues

### 401 Unauthorized
- Check the `Authorization` header matches exactly: `Bearer {PROFIT_DISTRIBUTION_SECRET}`
- Verify the secret key in Supabase settings

### No profits being added
- Check investment plans are marked as `status = 'active'`
- Verify users have `investment_balance` column (should already exist)
- Check function logs for errors

### Function times out
- This shouldn't happen with < 1000 plans
- If you have many plans, modify the function to process in batches

## Daily Profit Examples

**Example: User with $1,000 in 30% "Active" plan**
```
Daily Profit = (1000 × 30) / 100 / 365
Daily Profit = 300 / 365
Daily Profit = $0.82/day

Monthly: ~$24.66
Yearly: ~$300.00
```

**Example: User with $5,000 in 50% "Royalty" plan**
```
Daily Profit = (5000 × 50) / 100 / 365
Daily Profit = 2500 / 365
Daily Profit = $6.85/day

Monthly: ~$205.48
Yearly: ~$2,500.00
```

## Deployment Checklist

- [ ] Edge Function created in `supabase/functions/distribute-daily-profits/index.ts`
- [ ] Function deployed with `supabase functions deploy`
- [ ] `PROFIT_DISTRIBUTION_SECRET` set in Supabase Settings
- [ ] Cron schedule configured (EasyCron, GitHub Actions, or Supabase)
- [ ] Test run successful with profits added to investment_balance
- [ ] Logs table created for tracking
- [ ] Monitoring set up to check logs daily

## Quick Command Reference

```bash
# Deploy
supabase functions deploy distribute-daily-profits

# Test locally
supabase functions invoke distribute-daily-profits \
  --header "Authorization: Bearer your-secret-key"

# View logs
supabase functions logs distribute-daily-profits

# List all functions
supabase functions list
```

---

**That's it!** Once set up, profits will automatically distribute every day at your configured time.
