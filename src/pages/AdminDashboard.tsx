import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import UserManagement from '../components/admin/UserManagement';
import SupportRequests from '../components/admin/SupportRequests';
import WithdrawalSettings from '../components/admin/WithdrawalSettings';
import AdminWithdrawalSettings from '../components/admin/AdminWithdrawalSettings';
import DepositManagement from '../components/admin/DepositManagement';
import TransactionSettings from '../components/admin/TransactionSettings';
import TransactionRequests from '../components/admin/TransactionRequests';
import WithdrawalRequests from '../components/admin/WithdrawalRequests';
import CryptoSettings from '../components/admin/CryptoSettings';
import DistributeReturnsButton from '../components/admin/DistributeReturnsButton';
import { useState } from 'react';
import { Settings, CreditCard, Send, TrendingDown } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'support' | 'deposits' | 'withdrawals' | 'transactions' | 'settings'>('users');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Access Denied. Admin only.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar 
          onUsers={() => setActiveTab('users')}
          onSupport={() => setActiveTab('support')}
          onSettings={() => setActiveTab('settings')}
        />
        <main className="flex-1 p-6">
          {/* Debug Panel */}
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-sm mb-3">
              Debug: Logged in as {user.email} (Role: {user.role})
            </p>
            <DistributeReturnsButton />
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'users'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'support'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Support
            </button>
            <button
              onClick={() => setActiveTab('deposits')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'deposits'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Card Deposits
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 font-semibold transition-colors flex items-center space-x-2 ${
                activeTab === 'transactions'
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Transactions</span>
            </button>
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`px-4 py-2 font-semibold transition-colors flex items-center space-x-2 ${
                activeTab === 'withdrawals'
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              <span>Withdrawals</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 font-semibold transition-colors flex items-center space-x-2 ${
                activeTab === 'settings'
                  ? 'text-orange-400 border-b-2 border-orange-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'support' && <SupportRequests />}
            {activeTab === 'deposits' && <DepositManagement />}
            {activeTab === 'transactions' && <TransactionRequests />}
            {activeTab === 'withdrawals' && <WithdrawalRequests />}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <AdminWithdrawalSettings />
                <TransactionSettings />
                <CryptoSettings />
                <WithdrawalSettings />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}