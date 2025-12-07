import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import DepositCard from './DepositCard';
import DepositTransfer from './DepositTransfer';
import DepositCrypto from './DepositCrypto';

interface DepositProps {
  onClose?: () => void;
}

export default function Deposit({ onClose }: DepositProps) {
  const [method, setMethod] = useState<'card' | 'transfer' | 'crypto' | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  if (!method) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 h-[600px] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Deposit Funds</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <p className="text-gray-400 mb-6">Select your preferred deposit method</p>

        {showMessage && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-200 font-semibold">Card deposits unavailable</p>
              <p className="text-yellow-200/80 text-sm mt-1">Please choose another deposit method.</p>
            </div>
            <button
              onClick={() => setShowMessage(false)}
              className="ml-auto text-yellow-200 hover:text-yellow-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => setShowMessage(true)}
            className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 sm:p-6 text-center opacity-50 cursor-not-allowed min-h-[140px] sm:min-h-auto flex flex-col items-center justify-center"
          >
            <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">💳</span>
            <span className="text-gray-400 font-semibold block text-sm sm:text-base">Debit/Credit Card</span>
            <span className="text-gray-500 text-xs sm:text-sm mt-2">Currently unavailable</span>
          </button>

          <button
            onClick={() => setMethod('transfer')}
            className="bg-green-500/20 hover:bg-green-500/40 border border-green-500 rounded-lg p-4 sm:p-6 text-center transition-colors min-h-[140px] sm:min-h-auto flex flex-col items-center justify-center"
          >
            <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">🏦</span>
            <span className="text-white font-semibold block text-sm sm:text-base">Bank Transfer</span>
            <span className="text-gray-400 text-xs sm:text-sm mt-2">Transfer via bank</span>
          </button>

          <button
            onClick={() => setMethod('crypto')}
            className="bg-purple-500/20 hover:bg-purple-500/40 border border-purple-500 rounded-lg p-4 sm:p-6 text-center transition-colors min-h-[140px] sm:min-h-auto flex flex-col items-center justify-center"
          >
            <span className="text-3xl sm:text-4xl mb-2 sm:mb-3 block">₿</span>
            <span className="text-white font-semibold block text-sm sm:text-base">Cryptocurrency</span>
            <span className="text-gray-400 text-xs sm:text-sm mt-2">Send crypto</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 h-[600px] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setMethod(null)}
          className="text-blue-400 hover:text-blue-300 font-semibold"
        >
          ← Back
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {method === 'card' && <DepositCard />}
      {method === 'transfer' && <DepositTransfer />}
      {method === 'crypto' && <DepositCrypto />}
    </div>
  );
}