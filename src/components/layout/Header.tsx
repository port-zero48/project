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
      <div className="container py-3 sm:py-4">
        {/* Top row: Logo and Sign Out */}
        <div className="flex items-center justify-between mb-2 sm:mb-0">
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            <span className="text-lg sm:text-2xl font-bold text-white">TradePro</span>
          </Link>
          
          <button
            onClick={signOut}
            className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors px-2 py-2 text-xs rounded-lg hover:bg-gray-800 whitespace-nowrap"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Bottom row: Email and Action buttons - All inline */}
        <div className="flex items-center gap-2 w-full">
          {/* Email with Welcome text - Left side with flex-grow */}
          {user?.email && (
            <span className="text-xs sm:text-sm text-gray-400 truncate flex-1">
              Welcome, {user.email}
            </span>
          )}

          {/* Action buttons - Right side, no wrapping */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onTrading && (
              <button
                onClick={onTrading}
                className="px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap"
              >
                Trading
              </button>
            )}
            {onSupport && (
              <button
                onClick={onSupport}
                className="px-2 sm:px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap"
              >
                Support
              </button>
            )}
            {onBalance && (
              <button
                onClick={onBalance}
                className="px-2 sm:px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap"
              >
                Balance
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}