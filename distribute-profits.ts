#!/usr/bin/env node
/**
 * Manual script to trigger investment return distribution
 * Usage: npx ts-node distribute-profits.ts
 * 
 * This script:
 * 1. Fetches all active investment plans
 * 2. Checks if they're due for returns at 10min, 20min, 30min, 60min intervals
 * 3. Calculates and distributes returns
 * 4. Updates user balances and investment plan records
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment variables not set:');
  console.error('   VITE_SUPABASE_URL=');
  console.error('   SUPABASE_SERVICE_KEY=');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const RETURN_INTERVALS = [10, 20, 30, 60]; // in minutes

function calculateIntervalReturn(
  planAmount: number,
  annualReturnRate: number,
  intervalMinutes: number
): number {
  // Annual return in dollars
  const annualReturn = (planAmount * annualReturnRate) / 100;

  // Daily return
  const dailyReturn = annualReturn / 365;

  // Return per minute
  const returnPerMinute = dailyReturn / (24 * 60);

  // Return for this interval
  return returnPerMinute * intervalMinutes;
}

async function distributeReturns() {
  try {
    console.log('⏳ Fetching active investment plans...\n');

    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('status', 'active');

    if (plansError) throw plansError;

    if (!plans || plans.length === 0) {
      console.log('ℹ️  No active investment plans found');
      return;
    }

    console.log(`Found ${plans.length} active investment plan(s)\n`);

    const now = new Date();
    let distributedCount = 0;

    for (const plan of plans) {
      const lastReturnAt = plan.last_return_at
        ? new Date(plan.last_return_at)
        : new Date(plan.started_at);

      const timeSinceLastReturn =
        (now.getTime() - lastReturnAt.getTime()) / 60000; // in minutes

      console.log(`📊 Plan: ${plan.plan_name}`);
      console.log(`   Amount: $${plan.amount}`);
      console.log(`   Daily Rate: ${plan.annual_return_rate}%`);
      console.log(`   Time since last return: ${timeSinceLastReturn.toFixed(1)}min`);

      const intervalsCompleted = plan.returns_distributed || 0;

      // Check each interval
      for (let i = 0; i < RETURN_INTERVALS.length; i++) {
        const interval = RETURN_INTERVALS[i];

        // If this interval hasn't been completed and enough time has passed
        if (i >= intervalsCompleted && timeSinceLastReturn >= interval) {
          console.log(
            `   ✓ Distributing ${interval}min return (${i + 1}/4)...`
          );

          // Calculate return
          const returnAmount = calculateIntervalReturn(
            plan.amount,
            plan.annual_return_rate,
            interval
          );

          // Get current user balance
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('investment_balance')
            .eq('id', plan.user_id)
            .single();

          if (userError) {
            console.error(`     ❌ Error fetching user: ${userError.message}`);
            continue;
          }

          const newBalance = (userData?.investment_balance || 0) + returnAmount;

          // Update user balance
          const { error: updateUserError } = await supabase
            .from('users')
            .update({ investment_balance: newBalance })
            .eq('id', plan.user_id);

          if (updateUserError) {
            console.error(
              `     ❌ Error updating user balance: ${updateUserError.message}`
            );
            continue;
          }

          // Record the return
          const { error: recordError } = await supabase
            .from('investment_returns')
            .insert({
              investment_plan_id: plan.id,
              user_id: plan.user_id,
              return_amount: returnAmount,
              interval_minutes: interval,
            });

          if (recordError) {
            console.error(
              `     ❌ Error recording return: ${recordError.message}`
            );
            continue;
          }

          // Update investment plan
          const nextReturnAt =
            i + 1 < RETURN_INTERVALS.length
              ? new Date(
                  now.getTime() + RETURN_INTERVALS[i + 1] * 60000
                ).toISOString()
              : null;

          const { error: updatePlanError } = await supabase
            .from('investment_plans')
            .update({
              last_return_at: now.toISOString(),
              returns_distributed: i + 1,
              next_return_at: nextReturnAt,
            })
            .eq('id', plan.id);

          if (updatePlanError) {
            console.error(
              `     ❌ Error updating plan: ${updatePlanError.message}`
            );
            continue;
          }

          console.log(`     Amount: $${returnAmount.toFixed(2)}`);
          console.log(`     New Balance: $${newBalance.toFixed(2)}`);
          distributedCount++;
        }
      }

      if (intervalsCompleted >= 4) {
        console.log('   ✅ All returns completed!');
      }

      console.log('');
    }

    console.log(`\n✅ Distributed ${distributedCount} return(s) successfully!`);
  } catch (err) {
    console.error('❌ Error:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

distributeReturns();
