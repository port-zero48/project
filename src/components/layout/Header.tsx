import { useAuth } from '../../context/AuthContext';
import { LogOut, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onTrading?: () => void;
  onSupport?: () => void;
  onBalance?: () => void;
}

export default function Header({ onTrading, onSupport, onBalance }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-white">TradePro</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {onTrading && (
              <button
                onClick={onTrading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Trading
              </button>
            )}
            {onSupport && (
              <button
                onClick={onSupport}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                Support
              </button>
            )}
            {onBalance && (
              <button
                onClick={onBalance}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Balance
              </button>
            )}
            
            <span className="text-gray-300">
              Welcome, {user?.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}