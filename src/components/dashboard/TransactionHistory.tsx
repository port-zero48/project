import { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { fetchTransactionHistory } from '../../services/transactions';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/auth';

interface Transaction {
  id: string;
  transaction_type: 'withdrawal' | 'deposit' | 'investment' | 'return';
  method_type: string | null;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  description: string;
  created_at: string;
  metadata?: any;
}

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'withdrawal' | 'deposit' | 'investment' | 'return'>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTransactions();
    
    // Subscribe to real-time changes
    if (user?.id) {
      const subscription = supabase
        .channel(`transaction-history:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transaction_history',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            loadTransactions();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  const loadTransactions = async () => {
    if (!user?.id) return;
    try {
      const data = await fetchTransactionHistory(user.id);
      // Sort by newest first
      setTransactions(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err) {
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.transaction_type === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTransactionIcon = (type: string) => {
    if (type === 'withdrawal') {
      return <ArrowDownLeft className="h-5 w-5" />;
    } else {
      return <ArrowUpRight className="h-5 w-5" />;
    }
  };

  const getTransactionColor = (type: string) => {
    if (type === 'withdrawal') {
      return 'text-red-400';
    } else {
      return 'text-green-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Transaction History</h2>
          <p className="text-gray-400">View all your deposits, withdrawals, and investments</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`p-2 rounded-lg transition-colors ${
            refreshing
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          title="Refresh"
        >
          <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'withdrawal', 'deposit', 'investment', 'return'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-colors ${
              filter === type
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600 hover:border-gray-500 transition-colors"
            >
              {/* Transaction Type Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  {transaction.transaction_type === 'withdrawal' ? '💳 Withdrawal' : 
                   transaction.transaction_type === 'deposit' ? '💰 Deposit' :
                   transaction.transaction_type === 'investment' ? '📈 Investment' :
                   '📊 Return'}
                </h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(transaction.status)}
                  <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusBadgeColor(transaction.status)}`}>
                    {transaction.status === 'completed' ? '✓ Successful' : 
                     transaction.status === 'pending' ? '⏳ Pending' :
                     transaction.status === 'rejected' ? '✗ Rejected' :
                     'Failed'}
                  </span>
                </div>
              </div>

              {/* Form-like Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Amount */}
                  <div>
                    <label className="block text-gray-400 text-sm font-semibold mb-2">Amount</label>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                      <p className={`text-2xl font-bold ${
                        transaction.transaction_type === 'withdrawal' ? 'text-red-400' : 'text-green-400'
                      }`}>
                        {transaction.transaction_type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Fee (if withdrawal) */}
                  {transaction.metadata?.fee && (
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">Withdrawal Fee</label>
                      <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                        <p className="text-white font-semibold">${transaction.metadata.fee.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {/* Total Deduction */}
                  {transaction.metadata?.totalDeduction && (
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">Total Deduction</label>
                      <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                        <p className="text-red-400 font-bold text-lg">${transaction.metadata.totalDeduction.toFixed(2)}</p>
                      </div>
                    </div>
                  )}

                  {/* Method Type */}
                  {transaction.method_type && (
                    <div>
                      <label className="block text-gray-400 text-sm font-semibold mb-2">Method</label>
                      <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                        <p className="text-white font-semibold capitalize">{transaction.method_type}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Bank Info */}
                  {transaction.metadata?.accountDetails && (
                    <>
                      <div>
                        <label className="block text-gray-400 text-sm font-semibold mb-2">Account Holder</label>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <p className="text-white font-semibold">{transaction.metadata.accountDetails.accountHolder}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm font-semibold mb-2">Account Number</label>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <p className="text-white font-mono">{transaction.metadata.accountDetails.accountNumber}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-sm font-semibold mb-2">Bank Name</label>
                        <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                          <p className="text-white font-semibold">{transaction.metadata.accountDetails.bankName}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom - Date and Description */}
              <div className="mt-6 pt-6 border-t border-gray-600 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="text-gray-400">
                    <span className="text-gray-500">Date & Time:</span> {formatDate(transaction.created_at)}
                  </p>
                </div>
                <p className="text-gray-300">{transaction.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
