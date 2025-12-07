import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart2, 
  MessageSquare, 
  Users, 
  Wallet,
  Settings,
  TrendingUp,
  Menu,
  X
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
  

  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const handleMenuClick = (handler?: () => void) => {
    handler?.();
    closeMenu();
  };

  if (user?.role === 'admin') {
    return (
      <>
        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Overlay */}
        {isOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeMenu}
          />
        )}

        {/* Admin Sidebar */}
        <aside className={`
          fixed md:relative top-0 left-0 z-40
          bg-gray-900 w-64 min-h-screen p-4
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="space-y-2 mt-16 md:mt-0">
            <button
              onClick={() => handleMenuClick(onUsers)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors bg-blue-500 text-white"
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </button>
            <button
              onClick={() => handleMenuClick(onSupport)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Support</span>
            </button>
            <button
              onClick={() => handleMenuClick(onSettings)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>
        </aside>
      </>
    );
  }

  // User Sidebar
  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* User Sidebar */}
      <aside className={`
        fixed md:relative top-0 left-0 z-40
        bg-gray-900 w-64 min-h-screen p-4
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <nav className="space-y-2 mt-16 md:mt-0">
          <button
            onClick={() => handleMenuClick(onTrading)}
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
            onClick={() => handleMenuClick(onSupport)}
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
            onClick={() => handleMenuClick(onBalance)}
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
            onClick={() => handleMenuClick(onDeposit)}
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
            onClick={() => handleMenuClick(onWithdraw)}
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
            onClick={() => handleMenuClick(onInvestment)}
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
            onClick={() => handleMenuClick(onHistory)}
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
    </>
  );
}