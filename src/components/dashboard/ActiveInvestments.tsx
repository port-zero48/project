import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Zap, X } from 'lucide-react';
import { supabase } from '../../services/auth';
import { cancelInvestmentPlan } from '../../services/transactions';
import type { User } from '../../types';

interface ActiveInvestment {
  id: string;
  planName: string;
  amount: number;
  returns: number;
  nextReturnAt: string | null;
  returnsDistributed: number;
}

// Return intervals in minutes: 5, 10, 15, 20, 25
const RETURN_INTERVALS = [5, 10, 15, 20, 25];

export default function ActiveInvestments({ user }: { user: User }) {
  const [investments, setInvestments] = useState<ActiveInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReturns, setTotalReturns] = useState(0);
  const [timeUntilNext, setTimeUntilNext] = useState<{ [key: string]: string }>({});
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    loadInvestments();
    const investmentInterval = setInterval(loadInvestments, 3000); // Refresh every 3 seconds

    // Subscribe to real-time updates on investment_plans
    const subscription = supabase
      .channel(`investment_plans:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'investment_plans',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('Investment plan updated:', payload);
          // Reload investments when any change occurs
          loadInvestments();
        }
      )
      .subscribe();

    return () => {
      clearInterval(investmentInterval);
      subscription.unsubscribe();
    };
  }, [user.id]);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      investments.forEach((inv) => {
        if (inv.nextReturnAt) {
          const nextTime = new Date(inv.nextReturnAt).getTime();
          const now = Date.now();
          const diff = Math.max(0, nextTime - now);

          if (diff === 0) {
            setTimeUntilNext((prev) => ({
              ...prev,
              [inv.id]: 'Processing...',
            }));
          } else {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeUntilNext((prev) => ({
              ...prev,
              [inv.id]: `${minutes}m ${seconds}s`,
            }));
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [investments]);

  const loadInvestments = async () => {
    try {
      const { data: plans, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (error) throw error;

      console.log('📋 Loaded investment plans:', plans?.length || 0);

      if (plans && plans.length > 0) {
        // Get plan IDs for filtering returns
        const planIds = plans.map(p => p.id);
        
        // Get total returns from investment_returns table - only for active plans
        const { data: returns, error: returnsError } = await supabase
          .from('investment_returns')
          .select('return_amount')
          .eq('user_id', user.id)
          .in('investment_plan_id', planIds);

        if (returnsError) {
          console.error('❌ Error fetching investment returns:', returnsError);
          setTotalReturns(0);
        } else if (returns && returns.length > 0) {
          const total = returns.reduce(
            (sum, r) => sum + (r.return_amount || 0),
            0
          );
          console.log('✅ Total returns calculated:', total, 'from', returns.length, 'entries');
          setTotalReturns(total);
        } else {
          console.log('ℹ️ No returns found yet');
          setTotalReturns(0);
        }

        const activeInvs: ActiveInvestment[] = plans.map((plan) => ({
          id: plan.id,
          planName: plan.plan_name,
          amount: plan.amount,
          returns: plan.annual_return_rate,
          nextReturnAt: plan.next_return_at,
          returnsDistributed: plan.returns_distributed || 0,
        }));

        setInvestments(activeInvs);
      } else {
        console.log('ℹ️ No active investment plans found');
        setInvestments([]);
        setTotalReturns(0);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading investments:', err);
      setLoading(false);
    }
  };

  const handleCancelPlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to cancel this investment plan? Your investment will be refunded to your account balance.')) {
      return;
    }

    try {
      setCancellingId(planId);
      await cancelInvestmentPlan(planId, user.id);
      console.log('✓ Investment plan cancelled successfully');
      
      // Clear the returns immediately to show real-time update
      setTotalReturns(0);
      
      // Wait a moment for database to process, then reload
      setTimeout(() => {
        loadInvestments();
      }, 500);
    } catch (err) {
      console.error('❌ Error cancelling plan:', err);
      alert('Failed to cancel plan: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading || investments.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Zap className="h-6 w-6 text-green-400" />
          <div>
            <h3 className="text-xl font-bold text-white">Active Investments</h3>
            <p className="text-sm text-green-300">Your investments are earning returns</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Earned</p>
          <p className="text-2xl font-bold text-green-400">
            ${totalReturns.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {investments.map((inv) => (
          <div key={inv.id} className="bg-black/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-white">{inv.planName} Plan</p>
                <p className="text-sm text-gray-400">
                  Investment: ${inv.amount.toFixed(2)} • Daily Return: ${inv.returns.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {inv.nextReturnAt && inv.returnsDistributed < 4 && (
                  <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-mono text-blue-300">
                      {timeUntilNext[inv.id] || 'Loading...'}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => handleCancelPlan(inv.id)}
                  disabled={cancellingId === inv.id}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                  title="Cancel this investment plan and refund to account balance"
                >
                  <X className="h-4 w-4" />
                  {cancellingId === inv.id ? 'Cancelling...' : 'Cancel'}
                </button>
              </div>
            </div>

            {/* Return Progress */}
            <div className="flex gap-2">
              {RETURN_INTERVALS.map((interval, idx) => {
                // Use modulo to create a looping effect - cycle through 0-4
                const currentInLoop = inv.returnsDistributed % 5;
                const isCompleted = idx < currentInLoop;
                const isNext = idx === currentInLoop;

                return (
                  <div key={interval} className="flex-1">
                    <div
                      className={`p-3 rounded text-center transition-all ${
                        isCompleted
                          ? 'bg-green-500/30 border border-green-500'
                          : isNext
                          ? 'bg-blue-500/30 border border-blue-500 animate-pulse'
                          : 'bg-gray-700/30 border border-gray-600'
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-300 mb-1">
                        {interval}min
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          isCompleted
                            ? 'text-green-300'
                            : isNext
                            ? 'text-blue-300'
                            : 'text-gray-400'
                        }`}
                      >
                        {isCompleted ? '✓' : isNext ? '⏳' : '○'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {inv.returnsDistributed >= 5 && (
              <div className="mt-3 text-center text-sm text-green-400 font-semibold">
                ✓ {Math.floor(inv.returnsDistributed / 5)} cycle(s) complete • Earning continues...
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
