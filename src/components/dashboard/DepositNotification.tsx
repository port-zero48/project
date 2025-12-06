import { useEffect, useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import InvestmentPlan from './InvestmentPlan';
import type { User } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

interface DepositNotificationProps {
  user: User;
}

interface RecentDeposit {
  id: string;
  amount: number;
  created_at: string;
}

export default function DepositNotification({ user }: DepositNotificationProps) {
  const [recentDeposit, setRecentDeposit] = useState<RecentDeposit | null>(null);
  const [showInvestment, setShowInvestment] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false);
  const [autoOpenInvestment, setAutoOpenInvestment] = useState(false);

  useEffect(() => {
    // Initial check
    checkRecentDeposit();

    // Subscribe to real-time updates on deposit_requests
    const subscription = supabase
      .channel(`deposits:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deposit_requests',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          // When a deposit is updated to completed
          if (payload.new.status === 'completed') {
            console.log('Deposit completed, showing investment plan:', payload.new);
            setRecentDeposit({
              id: payload.new.id,
              amount: payload.new.amount,
              created_at: payload.new.updated_at,
            });
            setNotificationShown(true);
            setAutoOpenInvestment(true);
            // Auto-open investment plan immediately
            setShowInvestment(true);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user.id]);

  const checkRecentDeposit = async () => {
    try {
      const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
      
      const { data } = await supabase
        .from('deposit_requests')
        .select('id, amount, updated_at, status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !notificationShown && !dismissedNotifications.includes(data.id)) {
        // Check if deposit was updated recently
        const updatedAt = new Date(data.updated_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - updatedAt.getTime()) / (1000 * 60);

        // Show notification if updated within last 30 minutes
        if (diffMinutes < 30) {
          console.log('Showing recent deposit notification:', data);
          setRecentDeposit({
            id: data.id,
            amount: data.amount,
            created_at: data.updated_at,
          });
          setNotificationShown(true);
          setAutoOpenInvestment(true);
          setShowInvestment(true);
        }
      }
    } catch (err) {
      console.error('Error checking recent deposit:', err);
    }
  };

  if (!recentDeposit || dismissed || !notificationShown) {
    return null;
  }

  // If auto-opening investment, show the investment plan directly
  if (autoOpenInvestment && showInvestment) {
    return (
      <InvestmentPlan
        user={user}
        onClose={() => {
          setShowInvestment(false);
          setDismissed(true);
        }}
        depositAmount={recentDeposit?.amount || 0}
      />
    );
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 max-w-sm">
        <div className="bg-green-900/80 border-2 border-green-500 rounded-lg p-4 shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-green-400">Funds Received! 🎉</h3>
                <p className="text-green-100 text-sm mt-1">
                  Your deposit of <span className="font-bold">${recentDeposit.amount.toFixed(2)}</span> has been approved and added to your account.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setDismissed(true);
                // Save to localStorage so it doesn't show again
                if (recentDeposit) {
                  const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
                  if (!dismissedNotifications.includes(recentDeposit.id)) {
                    dismissedNotifications.push(recentDeposit.id);
                    localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotifications));
                  }
                }
              }}
              className="text-green-300 hover:text-green-100 transition-colors ml-2 flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-green-800/50 rounded px-3 py-2 mb-4 text-sm text-green-100">
            <p>New Balance: <span className="font-bold">${user.accountBalance.toFixed(2)}</span></p>
          </div>

          <button
            onClick={() => {
              setShowInvestment(true);
              // Mark as dismissed when opening investment plans
              if (recentDeposit) {
                const dismissedNotifications = JSON.parse(localStorage.getItem('dismissedNotifications') || '[]');
                if (!dismissedNotifications.includes(recentDeposit.id)) {
                  dismissedNotifications.push(recentDeposit.id);
                  localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedNotifications));
                }
              }
            }}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            View Investment Plans →
          </button>
        </div>
      </div>

      {showInvestment && !autoOpenInvestment && (
        <InvestmentPlan
          user={user}
          onClose={() => {
            setShowInvestment(false);
            setDismissed(true);
          }}
          depositAmount={recentDeposit?.amount || 0}
        />
      )}
    </>
  );
}
