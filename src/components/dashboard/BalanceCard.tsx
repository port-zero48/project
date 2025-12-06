import { Wallet, TrendingUp } from 'lucide-react';
import { User } from '../../types';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Account Balance</h3>
          <Wallet className="h-6 w-6 text-blue-500" />
        </div>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(balances.accountBalance)}
        </p>
        <p className="text-gray-400 mt-2">Available for trading</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Investment Balance</h3>
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(balances.investmentBalance)}
        </p>
        <p className="text-gray-400 mt-2">Current portfolio value</p>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Total Balance</h3>
          <Wallet className="h-6 w-6 text-purple-500" />
        </div>
        <p className="text-3xl font-bold text-white">
          {formatCurrency(balances.accountBalance + balances.investmentBalance)}
        </p>
        <p className="text-gray-400 mt-2">Total net worth</p>
      </div>
    </div>
  );
}