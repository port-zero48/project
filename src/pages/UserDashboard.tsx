import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import BalanceCard from '../components/dashboard/BalanceCard';
import MarketChart from '../components/dashboard/MarketChart';
import TradingChat from '../components/dashboard/TradingChat';
import SupportChat from '../components/dashboard/SupportChat';
import Deposit from '../components/dashboard/Deposit';
import WithdrawDeposit from '../components/dashboard/WithdrawDeposit';
import InvestmentPlan from '../components/dashboard/InvestmentPlan';
import TransactionHistory from '../components/dashboard/TransactionHistory';
import DepositNotification from '../components/dashboard/DepositNotification';
import ActiveInvestments from '../components/dashboard/ActiveInvestments';
import LiveActivityNotifications from '../components/dashboard/LiveActivityNotifications';
import LiveInvestorList from '../components/dashboard/LiveInvestorList';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useState } from 'react';
import { X } from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<'trading' | 'support' | 'balance' | 'deposit' | 'withdraw' | 'investment' | 'history' | null>(null);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header 
        onTrading={() => setActiveView('trading')}
        onSupport={() => setActiveView('support')}
        onBalance={() => setActiveView('balance')}
      />
      {activeView === null && <DepositNotification user={user} />}
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeView={activeView}
          onTrading={() => setActiveView('trading')}
          onSupport={() => setActiveView('support')}
          onBalance={() => setActiveView('balance')}
          onDeposit={() => setActiveView('deposit')}
          onWithdraw={() => setActiveView('withdraw')}
          onInvestment={() => setActiveView('investment')}
          onHistory={() => setActiveView('history')}
        />
        
        <main className="flex-1 overflow-y-auto">
          <div className="w-full max-w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
            <div className="space-y-4 sm:space-y-6">
              {activeView === null ? (
                <>
                  <BalanceCard user={user} />
                  <ActiveInvestments user={user} />
                  <div className="w-full h-140 sm:h-96 md:h-[500px]">
                    <ErrorBoundary>
                      <MarketChart />
                    </ErrorBoundary>
                  </div>
                  <div className="relative rounded-2xl border border-gray-800 bg-gray-900/80 p-3 sm:p-5 shadow-2xl">
                    <TradingChat />
                  </div>
                  <LiveActivityNotifications />
                  <LiveInvestorList />
                </>
              ) : (
                <div className="relative min-h-[calc(100vh-10rem)] rounded-2xl border border-gray-800 bg-gray-900/90 p-3 sm:p-5 shadow-2xl">
                  <button
                    onClick={() => setActiveView(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {activeView === 'trading' && <TradingChat />}
                  {activeView === 'support' && <SupportChat />}
                  {activeView === 'balance' && <WithdrawDeposit user={user} />}
                  {activeView === 'deposit' && <Deposit onClose={() => setActiveView(null)} />}
                  {activeView === 'withdraw' && <WithdrawDeposit user={user} />}
                  {activeView === 'investment' && <InvestmentPlan user={user} onClose={() => setActiveView(null)} />}
                  {activeView === 'history' && <TransactionHistory />}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}