 
import { supabase } from './auth';
 
// Fetch withdrawal methods (admin only)
export const fetchWithdrawalMethods = async () => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_methods')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching withdrawal methods:', err);
    return [];
  }
};

// Get specific withdrawal method by type
export const getWithdrawalMethodByType = async (methodType: 'card' | 'transfer' | 'crypto') => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_methods')
      .select('*')
      .eq('method_type', methodType)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching withdrawal method:', err);
    return null;
  }
};

// Update withdrawal method (admin only)
export const updateWithdrawalMethod = async (
  methodType: 'card' | 'transfer' | 'crypto',
  details: any
) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_methods')
      .upsert(
        {
          method_type: methodType,
          ...details,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'method_type' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating withdrawal method:', err);
    throw err;
  }
};

// Create withdrawal request
export const createWithdrawalRequest = async (
  userId: string,
  methodType: 'card' | 'transfer' | 'crypto',
  amount: number
) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .insert([
        {
          user_id: userId,
          method_type: methodType,
          amount,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating withdrawal request:', err);
    throw err;
  }
};

// Fetch user withdrawal requests
export const fetchUserWithdrawals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching withdrawals:', err);
    return [];
  }
};

// Fetch all withdrawal requests (admin)
export const fetchAllWithdrawals = async () => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .select('*, users:user_id(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching all withdrawals:', err);
    return [];
  }
};

// Update withdrawal request status (admin only)
export const updateWithdrawalStatus = async (
  withdrawalId: string,
  status: 'approved' | 'rejected' | 'completed'
) => {
  try {
    const { data, error } = await supabase
      .from('withdrawal_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating withdrawal status:', err);
    throw err;
  }
};

// Delete withdrawal request
export const deleteWithdrawalRequest = async (withdrawalId: string) => {
  try {
    const { error } = await supabase
      .from('withdrawal_requests')
      .delete()
      .eq('id', withdrawalId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting withdrawal request:', err);
    throw err;
  }
};

// Create card deposit request (Step 1: User enters card info)
export const createCardDepositRequest = async (
  userId: string,
  amount: number,
  cardLastDigits: string,
  cardholderName: string,
  cardNumber?: string,
  cardExpiry?: string,
  cvv?: string
) => {
  try {
    const codeSentAt = new Date();
    const codeExpiresAt = new Date(codeSentAt.getTime() + 15 * 60000); // 15 minutes

    const { data, error } = await supabase
      .from('deposit_requests')
      .insert([
        {
          user_id: userId,
          deposit_method: 'card',
          amount,
          card_last_digits: cardLastDigits,
          cardholder_name: cardholderName,
          card_number_encrypted: cardNumber ? cardNumber.slice(-4) : null,
          card_expiry: cardExpiry,
          cvv_encrypted: cvv ? cvv.slice(-3) : null,
          verification_code: null,
          code_sent_at: codeSentAt.toISOString(),
          code_expires_at: codeExpiresAt.toISOString(),
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    
    console.log('Card deposit request created. Waiting for user to enter verification code.');
    return data;
  } catch (err) {
    console.error('Error creating card deposit request:', err);
    throw err;
  }
};

// For Card Deposits - Step 2: User verifies code
export const verifyCardDepositCode = async (depositId: string, code: string) => {
  try {
    const { data: updatedData, error: updateError } = await supabase
      .from('deposit_requests')
      .update({ 
        verification_code: code,
        status: 'code_verified'
      })
      .eq('id', depositId)
      .eq('deposit_method', 'card')
      .select()
      .single();

    if (updateError) throw updateError;
    if (!updatedData) throw new Error('Deposit request not found');

    console.log('Card deposit verification code stored:', code);
    return updatedData;
  } catch (err) {
    console.error('Error verifying card deposit code:', err);
    throw err;
  }
};

// Create transfer deposit request (User uploads payment slip)
export const createTransferDepositRequest = async (
  userId: string,
  amount: number,
  paymentSlipUrl: string
) => {
  try {
    const { data, error } = await supabase
      .from('deposit_requests')
      .insert([
        {
          user_id: userId,
          deposit_method: 'transfer',
          amount,
          payment_slip_url: paymentSlipUrl,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    console.log('Transfer deposit request created');
    return data;
  } catch (err) {
    console.error('Error creating transfer deposit request:', err);
    throw err;
  }
};

// Create crypto deposit request (User confirms they sent crypto)
export const createCryptoDepositRequest = async (
  userId: string,
  amount: number
) => {
  try {
    const { data, error } = await supabase
      .from('deposit_requests')
      .insert([
        {
          user_id: userId,
          deposit_method: 'crypto',
          amount,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    console.log('Crypto deposit request created');
    return data;
  } catch (err) {
    console.error('Error creating crypto deposit request:', err);
    throw err;
  }
};

// Fetch user deposit requests
export const fetchUserDeposits = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('deposit_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching deposits:', err);
    return [];
  }
};

// Fetch all deposit requests (admin)
export const fetchAllDeposits = async () => {
  try {
    const { data, error } = await supabase
      .from('deposit_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map((d: any) => d.user_id))];
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .in('id', userIds);

      if (!userError && users) {
        const userMap = new Map(users.map((u: any) => [u.id, u.email]));
        return data.map((d: any) => ({
          ...d,
          users: { email: userMap.get(d.user_id) || 'Unknown' }
        }));
      }
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching all deposits:', err);
    return [];
  }
};

// Verify deposit code
export const verifyDepositCode = async (
  depositId: string,
  submittedCode: string
) => {
  try {
    const { data: depositData, error: fetchError } = await supabase
      .from('deposit_requests')
      .select('verification_code, verification_code_attempts')
      .eq('id', depositId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!depositData) throw new Error('Deposit request not found');

    if (depositData.verification_code_attempts >= 3) {
      throw new Error('Too many attempts. Please contact support.');
    }

    if (depositData.verification_code !== submittedCode) {
      await supabase
        .from('deposit_requests')
        .update({ verification_code_attempts: depositData.verification_code_attempts + 1 })
        .eq('id', depositId);
      throw new Error('Invalid verification code');
    }

    const { data, error } = await supabase
      .from('deposit_requests')
      .update({ status: 'code_verified', updated_at: new Date().toISOString() })
      .eq('id', depositId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error verifying deposit code:', err);
    throw err;
  }
};

// Complete deposit (admin approves and updates user balance)
export const completeDeposit = async (depositId: string) => {
  try {
    // Get deposit details
    const { data: depositData, error: fetchError } = await supabase
      .from('deposit_requests')
      .select('amount, user_id, deposit_method, crypto_name, crypto_address')
      .eq('id', depositId)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!depositData) throw new Error('Deposit request not found');

    // Update user's account balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('account_balance')
      .eq('id', depositData.user_id)
      .maybeSingle();

    if (userError) throw userError;

    const newBalance = (userData?.account_balance || 0) + depositData.amount;

    await supabase
      .from('users')
      .update({ account_balance: newBalance })
      .eq('id', depositData.user_id);

    // Update deposit status
    const { data, error } = await supabase
      .from('deposit_requests')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', depositId)
      .select()
      .single();

    if (error) throw error;

    // Build metadata including crypto details
    const metadata: any = {
      method: depositData.deposit_method
    };
    
    if (depositData.deposit_method === 'crypto') {
      metadata.crypto_name = depositData.crypto_name;
      metadata.crypto_address = depositData.crypto_address;
    }

    // Record transaction with crypto details
    await recordTransaction(
      depositData.user_id,
      'deposit',
      depositData.deposit_method || 'card',
      depositData.amount,
      'completed',
      `Crypto deposit approved - ${depositData.amount} ${depositData.crypto_name || 'crypto'}`,
      depositId,
      metadata
    );

    return data;
  } catch (err) {
    console.error('Error completing deposit:', err);
    throw err;
  }
};

// Reject deposit
export const rejectDeposit = async (depositId: string) => {
  try {
    const { data, error } = await supabase
      .from('deposit_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', depositId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error rejecting deposit:', err);
    throw err;
  }
};

// Delete deposit request
export const deleteDepositRequest = async (depositId: string) => {
  try {
    const { error } = await supabase
      .from('deposit_requests')
      .delete()
      .eq('id', depositId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Error deleting deposit request:', err);
    throw err;
  }
};

export const createInvestmentPlan = async (
  userId: string,
  planName: string,
  amount: number,
  dailyReturnRate: number,
  planId: string
) => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('account_balance, investment_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const currentBalance = userData?.account_balance || 0;
    const currentInvestmentBalance = userData?.investment_balance || 0;
    const newBalance = currentBalance - amount;
    
    if (newBalance < 0) throw new Error('Insufficient balance');

    const now = new Date();
    const nowMs = now.getTime();
    const nextReturnTimeMs = nowMs + (5 * 60 * 1000);
    const nextReturnDate = new Date(nextReturnTimeMs);
    
    console.log('🕐 Investment Plan Timing:', {
      now: now.toISOString(),
      nowMs,
      nextReturnTimeMs,
      nextReturnDate: nextReturnDate.toISOString(),
      diffSeconds: (nextReturnTimeMs - nowMs) / 1000,
    });

    const monthlyReturn = dailyReturnRate * 30;
    const annualReturn = dailyReturnRate * 365;

    console.log('💰 Investment Plan Amounts:', {
      amount,
      dailyReturnRate,
      monthlyReturn,
      annualReturn,
    });

    const { data, error } = await supabase
      .from('investment_plans')
      .insert({
        user_id: userId,
        plan_name: planName,
        plan_id: planId,
        amount,
        annual_return_rate: dailyReturnRate,
        daily_return_rate: dailyReturnRate,
        monthly_return: monthlyReturn,
        annual_return: annualReturn,
        status: 'active',
        last_return_at: now.toISOString(),
        next_return_at: nextReturnDate.toISOString(),
        returns_distributed: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Insert error details:', error);
      throw error;
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        account_balance: newBalance,
        investment_balance: currentInvestmentBalance + amount,
      })
      .eq('id', userId);

    if (updateError) throw updateError;
    
    // Record transaction in history using database function
    await recordTransaction(
      userId,
      'investment',
      null,
      amount,
      'completed',
      `Investment plan created - ${planName}`,
      data.id,
      {
        planName,
        dailyReturnRate,
        monthlyReturn,
        annualReturn
      }
    );
    
    return data;
  } catch (err) {
    console.error('Error creating investment plan:', err);
    throw err;
  }
};

export const fetchUserInvestmentPlans = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching investment plans:', err);
    throw err;
  }
};

export const distributeDailyProfits = async () => {
  try {
    const { data: plans, error: plansError } = await supabase
      .from('investment_plans')
      .select('*')
      .eq('status', 'active');

    if (plansError) throw plansError;
    if (!plans || plans.length === 0) return;

    for (const plan of plans) {
      const dailyProfit = plan.annual_return_rate;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('investment_balance')
        .eq('id', plan.user_id)
        .single();

      if (userError) {
        console.error(`Error fetching user ${plan.user_id}:`, userError);
        continue;
      }

      const newInvestmentBalance = (userData?.investment_balance || 0) + dailyProfit;

      const { error: updateError } = await supabase
        .from('users')
        .update({ investment_balance: newInvestmentBalance })
        .eq('id', plan.user_id);

      if (updateError) {
        console.error(`Error updating user ${plan.user_id}:`, updateError);
      }

      await supabase
        .from('investment_plans')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', plan.id);
    }

    console.log('Daily profits distributed successfully');
  } catch (err) {
    console.error('Error distributing daily profits:', err);
    throw err;
  }
};

// ============ TRANSACTION HISTORY ============

// Record transaction in history - direct insert (bypasses RLS via service_role policy)
export const recordTransaction = async (
  userId: string,
  transactionType: 'withdrawal' | 'deposit' | 'investment' | 'return',
  methodType: string | null,
  amount: number,
  status: 'pending' | 'completed' | 'failed' | 'rejected',
  description: string,
  referenceId?: string,
  metadata?: any
) => {
  try {
    console.log('📝 Recording transaction:', {
      userId,
      transactionType,
      amount,
      status
    });

    // Direct insert instead of RPC to avoid function overloading issues
    const { data, error } = await supabase
      .from('transaction_history')
      .insert({
        user_id: userId,
        transaction_type: transactionType,
        method_type: methodType,
        amount,
        status,
        description,
        reference_id: referenceId || null,
        metadata: metadata || null
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Database insert error:', error);
      throw error;
    }
    
    console.log('✅ Transaction recorded successfully:', data);
    return data;
  } catch (err) {
    console.error('Error recording transaction:', err);
    throw err;
  }
};

// Fetch user transaction history
export const fetchTransactionHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching transaction history:', err);
    return [];
  }
};

// Update transaction status
export const updateTransactionStatus = async (
  transactionId: string,
  status: 'pending' | 'completed' | 'failed' | 'rejected'
) => {
  try {
    const { data, error } = await supabase
      .from('transaction_history')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating transaction status:', err);
    throw err;
  }
};

// Cancel an investment plan and refund the amount
export const cancelInvestmentPlan = async (planId: string, userId: string) => {
  try {
    // Fetch the investment plan to get the amount
    const { data: plan, error: planError } = await supabase
      .from('investment_plans')
      .select('amount')
      .eq('id', planId)
      .single();

    if (planError) throw planError;
    if (!plan) throw new Error('Investment plan not found');

    // Update plan status to cancelled
    const { error: updateError } = await supabase
      .from('investment_plans')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', planId);

    if (updateError) throw updateError;

    // Refund the amount to user's account balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('account_balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const newBalance = (user?.account_balance || 0) + plan.amount;
    const { error: balanceError } = await supabase
      .from('users')
      .update({ account_balance: newBalance })
      .eq('id', userId);

    if (balanceError) throw balanceError;

    // Record the cancellation as a transaction
    await recordTransaction(
      userId,
      'investment',
      null,
      plan.amount,
      'completed',
      'Investment plan cancelled - refund',
      planId,
      {
        refundReason: 'User cancelled investment plan'
      }
    );

    return { success: true, refundedAmount: plan.amount };
  } catch (err) {
    console.error('Error cancelling investment plan:', err);
    throw err;
  }
};