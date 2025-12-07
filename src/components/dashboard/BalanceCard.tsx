import { Wallet, TrendingUp } from 'lucide-react';
import { User } from '../../types';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/auth';

interface BalanceCardProps {
  user: User;
}
export default function BalanceCard({ user }: BalanceCardProps) {
  const { user: authUser } = useAuth();
  const [balances, setBalances] = useState({
    accountBalance: user.accountBalance,
    investmentBalance: user.investmentBalance
  });

  useEffect(() => {
    if (!authUser?.id) return;

    console.log('Setting up balance subscription for user:', authUser.id);

    // Subscribe to real-time updates on the users table
    const subscription = supabase
      .channel('public:users')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          // Only update if this is the current user
          if (payload.new.id === authUser.id) {
            console.log('Balance update received:', payload);
            setBalances({
              accountBalance: payload.new.account_balance || 0,
              investmentBalance: payload.new.investment_balance || 0
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Balance subscription status:', status);
      });

    return () => {
      console.log('Cleaning up balance subscription');
      subscription.unsubscribe();
    };
  }, [authUser?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
      <div className="bg-gray-800 rounded-xl p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">Account Balance</h3>
          <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 flex-shrink-0" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white truncate">
          {formatCurrency(balances.accountBalance)}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">Available for trading</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 sm:p-5 md:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">Investment Balance</h3>
          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-green-500 flex-shrink-0" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white truncate">
          {formatCurrency(balances.investmentBalance)}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">Current portfolio value</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-4 sm:p-5 md:p-6 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-white">Total Balance</h3>
          <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500 flex-shrink-0" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-white truncate">
          {formatCurrency(balances.accountBalance + balances.investmentBalance)}
        </p>
        <p className="text-xs sm:text-sm text-gray-400 mt-2">Total net worth</p>
      </div>
    </div>
  );
}