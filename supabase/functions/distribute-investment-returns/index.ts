import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

const RETURN_INTERVALS = [5, 10, 15, 20, 25];

function calculateIntervalReturn(planAmount: number, annualReturnRate: number, intervalMinutes: number) {
  const dailyReturn = annualReturnRate;
  const returnPerMinute = dailyReturn / (24 * 60);
  return returnPerMinute * intervalMinutes;
}

Deno.serve(async (req: Request) => {
  try {
    console.log('===== DISTRIBUTING INVESTMENT RETURNS =====');
    
    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('status', 'active');

    if (plansError) throw plansError;
    if (!plans || plans.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No plans', dailyProcessed: 0, intervalProcessed: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    let dailyProcessedCount = 0;
    let intervalProcessedCount = 0;
    const errors: Array<any> = [];
    const now = new Date();

    // DAILY PROFITS
    console.log('\n===== DAILY PROFITS =====');
    for (const plan of plans) {
      try {
        const dailyProfit = plan.annual_return_rate;
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('investment_balance')
          .eq('id', plan.user_id)
          .single();

        if (userError) throw userError;

        const newBalance = (userData?.investment_balance || 0) + dailyProfit;
        const { error: updateError } = await supabase
          .from('users')
          .update({ investment_balance: newBalance })
          .eq('id', plan.user_id);

        if (updateError) throw updateError;
        console.log(`✓ ${plan.plan_name}: +$${dailyProfit.toFixed(2)}`);
        dailyProcessedCount++;
      } catch (err) {
        console.error(`✗ Daily profit error for ${plan.plan_name}:`, err);
        errors.push(err);
      }
    }

    // INTERVALS & ROLLOVERS
    console.log('\n===== INTERVALS & ROLLOVERS =====');
    for (const plan of plans) {
      try {
        let intervalIndex = plan.returns_distributed || 0;
        console.log(`\n${plan.plan_name}: returns_distributed=${intervalIndex}`);

        // NULL CHECK FIRST
        if (!plan.next_return_at) {
          console.log(`  → Initializing next_return_at`);
          const nextReturnAt = new Date(now.getTime() + RETURN_INTERVALS[0] * 60000).toISOString();
          const { error } = await supabase
            .from('investment_plans')
            .update({ next_return_at: nextReturnAt })
            .eq('id', plan.id);
          if (error) throw error;
          continue;
        }

        // DUE CHECK
        const isDue = new Date(plan.next_return_at).getTime() <= now.getTime();
        console.log(`  → next_return_at=${plan.next_return_at}, isDue=${isDue}`);
        if (!isDue) continue;

        // ROLLOVER CHECK - if completed all 5 intervals, reset to 0
        if (intervalIndex >= RETURN_INTERVALS.length) {
          console.log(`  → All 5 intervals completed, ROLLING OVER and processing interval 1/5`);
          intervalIndex = 0; // Reset to start new cycle
        }

        // DISTRIBUTE THIS INTERVAL
        const interval = RETURN_INTERVALS[intervalIndex];
        const returnAmount = calculateIntervalReturn(plan.amount, plan.annual_return_rate, interval);
        console.log(`  → Distributing interval ${intervalIndex + 1}/5 (${interval}min): $${returnAmount.toFixed(2)}`);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('investment_balance')
          .eq('id', plan.user_id)
          .single();
        if (userError) throw userError;

        const oldBalance = userData?.investment_balance || 0;
        const newBalance = oldBalance + returnAmount;
        const { error: updateError } = await supabase
          .from('users')
          .update({ investment_balance: newBalance })
          .eq('id', plan.user_id);
        if (updateError) throw updateError;

        const { error: recordError } = await supabase
          .from('investment_returns')
          .insert({ investment_plan_id: plan.id, user_id: plan.user_id, return_amount: returnAmount, interval_minutes: interval });
        if (recordError) throw recordError;

        // Move to next interval
        const nextIntervalIndex = intervalIndex + 1;
        
        // Schedule next interval (or if this was interval 5, next will be handled on next rollover)
        let nextReturnAt: string;
        if (nextIntervalIndex >= RETURN_INTERVALS.length) {
          // Just completed the last interval, next run will rollover
          nextReturnAt = new Date(now.getTime() + 60000).toISOString(); // 1 minute from now
          console.log(`  → Completed interval 5/5, next run will rollover`);
        } else {
          nextReturnAt = new Date(now.getTime() + RETURN_INTERVALS[nextIntervalIndex] * 60000).toISOString();
        }
        
        const { error: updatePlanError } = await supabase
          .from('investment_plans')
          .update({ 
            returns_distributed: nextIntervalIndex, 
            next_return_at: nextReturnAt, 
            last_return_at: now.toISOString(), 
            updated_at: now.toISOString() 
          })
          .eq('id', plan.id);
        if (updatePlanError) throw updatePlanError;

        console.log(`  ✓ Distributed $${returnAmount.toFixed(2)} (${oldBalance.toFixed(2)} → ${newBalance.toFixed(2)})`);
        console.log(`  → Next: interval ${nextIntervalIndex + 1}/5 at ${nextReturnAt}`);
        intervalProcessedCount++;
      } catch (err) {
        console.error(`✗ Interval error for ${plan.plan_name}:`, err);
        errors.push(err);
      }
    }

    console.log(`\n✓ Complete: ${dailyProcessedCount} daily, ${intervalProcessedCount} intervals`);
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Distribution complete', 
      dailyProcessed: dailyProcessedCount, 
      intervalProcessed: intervalProcessedCount, 
      total: plans.length, 
      errors: errors.length > 0 ? errors : null 
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err) {
    console.error('Fatal error:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
});