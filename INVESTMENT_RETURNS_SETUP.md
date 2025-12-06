# Investment Returns System - Setup & Usage

## Overview

The investment return system automatically distributes earnings to users at 4 intervals after they select an investment plan:
- **10 minutes**: First return distribution (25% of hourly return)
- **20 minutes**: Second return distribution (25% of hourly return)
- **30 minutes**: Third return distribution (25% of hourly return)
- **60 minutes**: Final return distribution (25% of hourly return)

Users see real-time progress of their returns being earned with countdown timers.

## What Was Changed

### 1. Database Schema Updates
**File**: `supabase/migrations/20251204_add_investment_returns_tracking.sql`

New tables and columns:
- `investment_returns` table: Tracks each return distribution with amount, interval, and timestamp
- `investment_plans` columns added:
  - `last_return_at`: When the last return was distributed
  - `next_return_at`: When the next return will be distributed
  - `returns_distributed`: Counter (0-4) showing how many intervals completed

### 2. Backend - Supabase Edge Function
**File**: `supabase/functions/distribute-investment-returns/index.ts`

This function:
- Runs on a schedule (you need to set up a cron job)
- Fetches all active investment plans
- Checks if they're due for returns at any interval
- Calculates proportional returns for the time period
- Updates user balances
- Records the distribution in `investment_returns` table

**Return Calculation Formula**:
```
Annual Return = Investment Amount × (Annual Rate % / 100)
Daily Return = Annual Return / 365
Return per Minute = Daily Return / (24 × 60)
Interval Return = Return per Minute × Interval Minutes
```

### 3. Frontend - New Component
**File**: `src/components/dashboard/ActiveInvestments.tsx`

Displays:
- Active investment cards with real-time countdown timers
- Visual progress bars showing which intervals are completed (✓✓✓○)
- Next return countdown (e.g., "9m 45s")
- Total earned from all returns
- Auto-refreshes every 5 seconds

**Added to**: `src/pages/UserDashboard.tsx`

### 4. Updated Services
**File**: `src/services/transactions.ts`

Modified `createInvestmentPlan()` to:
- Set `last_return_at` to now
- Set `next_return_at` to 10 minutes from now
- Initialize `returns_distributed` to 0

## How to Use

### Manual Testing (For Development)

1. **Run the migration first**:
   Go to Supabase SQL Editor and run:
   ```sql
   supabase/migrations/20251204_add_investment_returns_tracking.sql
   ```

2. **Manual Return Distribution**:
   ```bash
   # Set environment variables
   $env:VITE_SUPABASE_URL="https://ukizjreylybyidbazgas.supabase.co"
   $env:SUPABASE_SERVICE_KEY="your-service-key"
   
   # Run distribution script
   npx ts-node distribute-profits.ts
   ```

   This will:
   - Find all active investment plans
   - Check if they're due for returns
   - Distribute returns and update balances
   - Display detailed logs

3. **Test Cycle**:
   ```
   User selects investment plan
   ↓
   System creates investment with returns_distributed=0, next_return_at=now+10min
   ↓
   Wait 10 minutes (or run distribute-profits.ts manually)
   ↓
   First return distributed, returns_distributed=1, next_return_at=now+20min
   ↓
   Repeat for 20, 30, 60 minute intervals
   ↓
   After 60 minutes: All returns distributed, next_return_at=NULL
   ```

### Production Setup - Scheduled Distribution

To run returns automatically, set up a Supabase cron job:

1. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy distribute-investment-returns
   ```

2. **Set up a Cron Job** (in Supabase dashboard):
   - Go to Edge Functions
   - Create a scheduled function
   - Set interval: Every 1 minute (to check for due returns)
   - Call: `distribute-investment-returns`

   Or use an external cron service to call:
   ```
   https://your-project.supabase.co/functions/v1/distribute-investment-returns
   ```

### Frontend Display

The active investments widget shows:
- Investment name and amount
- Current daily return rate
- Progress bars: ✓ = completed, ⏳ = processing, ○ = pending
- Countdown timer to next return
- "All returns distributed!" message when complete

**Example**:
```
┌─────────────────────────────────────────────────┐
│ ⚡ Active Investments                 Total: $12.50 │
├─────────────────────────────────────────────────┤
│ Professional Plan - $5000                       │
│ Investment: $5000 • Daily Return: $40.00        │
│ ⏳ 9m 45s                                        │
│ [✓] [✓] [⏳] [○]                                 │
│ 10min 20min 30min 60min                         │
└─────────────────────────────────────────────────┘
```

## Return Amounts

**Example with Professional Plan ($5000, 40% annual rate)**:

```
Annual Return: $5000 × 40% = $2000/year
Daily Return: $2000 / 365 = $5.48/day
Hourly Return: $5.48 / 24 = $0.23/hour

10-minute interval: $0.23 × (10/60) = $0.038
20-minute interval: $0.23 × (20/60) = $0.077
30-minute interval: $0.23 × (30/60) = $0.115
60-minute interval: $0.23 × (60/60) = $0.23

Total per cycle: $0.038 + $0.077 + $0.115 + $0.23 = $0.46/hour
```

## Troubleshooting

### Returns not showing up?

1. Check if investment plan was created with correct status='active'
2. Verify `last_return_at` and `returns_distributed` are set
3. Run: `SELECT * FROM investment_plans WHERE status='active';`
4. Manually run: `npx ts-node distribute-profits.ts`

### Timers not updating?

1. Clear browser cache (Ctrl+F5)
2. Check browser console for errors
3. Verify Supabase connection is working

### Edge Function not triggering?

1. Deploy: `supabase functions deploy distribute-investment-returns`
2. Check Supabase logs: Edge Functions → Function Logs
3. Manually trigger the function from the dashboard

## Database Queries

### Get all active investments with their returns
```sql
SELECT 
  p.id,
  p.plan_name,
  p.amount,
  p.annual_return_rate,
  COUNT(r.id) as returns_count,
  COALESCE(SUM(r.return_amount), 0) as total_returned,
  p.returns_distributed,
  p.next_return_at
FROM investment_plans p
LEFT JOIN investment_returns r ON p.id = r.investment_plan_id
WHERE p.status = 'active'
GROUP BY p.id
ORDER BY p.created_at DESC;
```

### Get total returns for a user
```sql
SELECT 
  user_id,
  COUNT(*) as distribution_count,
  SUM(return_amount) as total_earned,
  MIN(interval_minutes) as min_interval,
  MAX(interval_minutes) as max_interval
FROM investment_returns
WHERE user_id = 'user-id-here'
GROUP BY user_id;
```

## Files Modified/Created

### Created:
- `supabase/migrations/20251204_add_investment_returns_tracking.sql`
- `supabase/functions/distribute-investment-returns/index.ts`
- `supabase/functions/distribute-investment-returns/deno.json`
- `src/components/dashboard/ActiveInvestments.tsx`
- `distribute-profits.ts` (manual distribution script)

### Modified:
- `src/services/transactions.ts` - Updated createInvestmentPlan()
- `src/pages/UserDashboard.tsx` - Added ActiveInvestments component
- `src/components/dashboard/InvestmentPlan.tsx` - Added import for Clock icon

## Next Steps

1. ✅ Database schema created
2. ✅ Edge function ready for deployment
3. ✅ Frontend component showing returns
4. 🔄 Deploy edge function to Supabase
5. 🔄 Set up cron job for scheduled distribution
6. 🔄 Test with real investment plans
