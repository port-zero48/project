import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl || '', supabaseServiceKey || '');

Deno.serve(async (req: Request) => {
  try {
    console.log('===== DISTRIBUTING DAILY PROFITS =====');
    
    // Fetch all active investment plans
    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('status', 'active');

    if (plansError) {
      console.error('Error fetching plans:', plansError.message);
      throw plansError;
    }
    
    console.log(`Found ${plans?.length || 0} active plans`);
    
    if (!plans || plans.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active investment plans found', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;
    const errors: Array<{userId?: string; planId?: string; error: string}> = [];

    // For each plan, add fixed daily profit to user's investment_balance
    for (const plan of plans) {
      try {
        console.log(`Processing plan ${plan.id} for user ${plan.user_id}, daily profit: $${plan.annual_return_rate}`);
        
        // Use the fixed daily return rate directly
        const dailyProfit = plan.annual_return_rate;

        // Get current user investment balance
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('investment_balance')
          .eq('id', plan.user_id)
          .single();

        if (userError) {
          console.error(`Error fetching user ${plan.user_id}:`, userError.message);
          errors.push({ userId: plan.user_id, error: userError.message });
          continue;
        }

        const oldBalance = userData?.investment_balance || 0;
        const newInvestmentBalance = oldBalance + dailyProfit;
        console.log(`User ${plan.user_id}: balance ${oldBalance} → ${newInvestmentBalance}`);

        // Update user's investment_balance
        const { error: updateError } = await supabase
          .from('users')
          .update({ investment_balance: newInvestmentBalance })
          .eq('id', plan.user_id);

        if (updateError) {
          console.error(`Error updating user ${plan.user_id}:`, updateError.message);
          errors.push({ userId: plan.user_id, error: updateError.message });
          continue;
        }

        // Update investment plan's updated_at timestamp
        await supabase
          .from('investment_plans')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', plan.id);

        processedCount++;
        console.log(`✓ Successfully processed user ${plan.user_id}`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error processing plan ${plan.id}:`, errorMessage);
        errors.push({ planId: plan.id, error: errorMessage });
      }
    }

    const result = {
      success: true,
      message: 'Daily profits distributed',
      processed: processedCount,
      total: plans.length,
      errors: errors.length > 0 ? errors : null,
    };
    
    console.log('Final result:', result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Fatal error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
