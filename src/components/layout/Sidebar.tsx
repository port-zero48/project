import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  MessageSquare, 
  Users, 
  Wallet,
  Settings,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeView?: 'trading' | 'support' | 'balance' | 'deposit' | 'withdraw' | 'investment' | 'history' | null;
  onTrading?: () => void;
  onSupport?: () => void;
  onBalance?: () => void;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  onInvestment?: () => void;
  onHistory?: () => void;
  onUsers?: () => void;
  onSettings?: () => void;
}

export default function Sidebar({ activeView, onTrading, onSupport, onBalance, onDeposit, onWithdraw, onInvestment, onHistory, onUsers, onSettings }: SidebarProps) {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return (
      <aside className="bg-gray-900 w-64 min-h-screen p-4">
        <nav className="space-y-2">
          <button
            onClick={onUsers}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-blue-500 text-white"
          >
            <Users className="h-5 w-5" />
            <span>Users</span>
          </button>
          <button
            onClick={onSupport}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Support</span>
          </button>
          <button
            onClick={onSettings}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </nav>
      </aside>
    );
  }

  // User Sidebar
  return (
    <aside className="bg-gray-900 w-64 min-h-screen p-4">
      <nav className="space-y-2">
        <button
          onClick={onTrading}
          className={`
            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${activeView === 'trading'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
          `}
        >
          <BarChart2 className="h-5 w-5" />
          <span>Trading</span>
        </button>
        
        <button
          onClick={onSupport}
          className={`
            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${activeView === 'support'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
          `}
        >
          <MessageSquare className="h-5 w-5" />
          <span>Support</span>
        </button>
        
        <button
          onClick={onBalance}
          className={`
            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${activeView === 'balance'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
          `}
        >
          <Wallet className="h-5 w-5" />
          <span>Balance</span>
        </button>

        <div className="my-4 border-t border-gray-700"></div>

        <button
          onClick={onDeposit}
          className={`
            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${activeView === 'deposit'
              ? 'bg-green-500 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
          `}
        >
          <span className="text-xl">💰</span>
          <span>Deposit</span>
        </button>

        <button
          onClick={onWithdraw}
          className={`
            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${activeView === 'withdraw'
              ? 'bg-red-500 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
          `}
        >
          <span className="text-xl">📤</span>
          <span>Withdraw</span>
        </button>

        <button
          onClick={onInvestment}
          className={`
            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${activeView === 'investment'
              ? 'bg-purple-500 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
          `}
        >
          <TrendingUp className="h-5 w-5" />
          <span>Investment Plans</span>
        </button>

        <button
          onClick={onHistory}
          className={`
            w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
            ${activeView === 'history'
              ? 'bg-blue-500 text-white'
              : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
          `}
        >
          <BarChart2 className="h-5 w-5" />
          <span>Transaction History</span>
        </button>
      </nav>
    </aside>
  );
}