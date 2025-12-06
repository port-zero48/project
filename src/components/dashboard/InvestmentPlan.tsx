import { useState, useEffect } from 'react';
import { X, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { createInvestmentPlan, fetchUserInvestmentPlans } from '../../services/transactions';
import type { User } from '../../types';

interface InvestmentPlanProps {
  user: User;
  onClose: () => void;
  depositAmount?: number;
}

interface PlanTier {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  returnRate: number; // Annual return percentage
  color: string;
  icon: string;
}

const PLAN_TIERS: PlanTier[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    minAmount: 100,
    maxAmount: 1000,
    returnRate: 105, // $105 daily
    color: 'blue',
    icon: '🌱',
  },
  {
    id: 'passive',
    name: 'Passive',
    minAmount: 1000,
    maxAmount: 10000,
    returnRate: 420, // $420 daily (doubled from 210)
    color: 'green',
    icon: '📈',
  },
  {
    id: 'active',
    name: 'Active',
    minAmount: 10000,
    maxAmount: 30000,
    returnRate: 315, // $315 daily
    color: 'yellow',
    icon: '🚀',
  },
  {
    id: 'professional',
    name: 'Professional',
    minAmount: 30000,
    maxAmount: 60000,
    returnRate: 840, // $840 daily (doubled from 420)
    color: 'purple',
    icon: '💎',
  },
  {
    id: 'royalty',
    name: 'Royalty',
    minAmount: 60000,
    maxAmount: 100000,
    returnRate: 1050, // $1050 daily (doubled from 525)
    color: 'red',
    icon: '👑',
  },
];

const colorClasses = {
  blue: 'border-blue-500 bg-blue-500/10 hover:bg-blue-500/20',
  green: 'border-green-500 bg-green-500/10 hover:bg-green-500/20',
  yellow: 'border-yellow-500 bg-yellow-500/10 hover:bg-yellow-500/20',
  purple: 'border-purple-500 bg-purple-500/10 hover:bg-purple-500/20',
  red: 'border-red-500 bg-red-500/10 hover:bg-red-500/20',
};

const textColorClasses = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  purple: 'text-purple-400',
  red: 'text-red-400',
};

export default function InvestmentPlan({
  user,
  onClose,
  depositAmount = 0,
}: InvestmentPlanProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ planName: string; amount: number; dailyReturn: number } | null>(null);

  const totalBalance = (user.accountBalance || 0) + depositAmount;

  const getEligiblePlans = () => {
    // User can choose any plan they have enough balance for (minimum amount)
    return PLAN_TIERS.filter((plan) => totalBalance >= plan.minAmount);
  };

  const calculateMonthlyReturn = (dailyRate: number) => {
    return dailyRate * 30;
  };

  const calculateAnnualReturn = (dailyRate: number) => {
    return dailyRate * 365;
  };

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    setIsProcessing(true);

    try {
      const selectedPlanData = PLAN_TIERS.find(p => p.id === planId);
      if (!selectedPlanData) throw new Error('Plan not found');

      // Use the plan's minimum amount, not the entire account balance
      const investAmount = selectedPlanData.minAmount;

      // Check if user has enough balance
      if ((user.accountBalance || 0) < investAmount) {
        throw new Error(`Insufficient balance. Plan requires $${investAmount}, you have $${user.accountBalance}`);
      }

      await createInvestmentPlan(
        user.id,
        selectedPlanData.name,
        investAmount,
        selectedPlanData.returnRate,
        planId
      );

      const dailyReturn = selectedPlanData.returnRate;

      // Show success notification
      setSuccessData({
        planName: selectedPlanData.name,
        amount: investAmount,
        dailyReturn: dailyReturn,
      });
      setShowSuccess(true);
      setIsProcessing(false);

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error('Error selecting investment plan:', err);
      alert('Error activating investment plan. Please try again.');
      setIsProcessing(false);
    }
  };

  const eligiblePlans = getEligiblePlans();
  const allPlans = PLAN_TIERS;

  if (totalBalance < PLAN_TIERS[0].minAmount) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Investment Plans</h2>
            <button
              onClick={onClose}
              className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-center">
            <p className="text-red-400 font-semibold mb-2">Insufficient Funds</p>
            <p className="text-gray-300 text-sm">
              Your total balance (${totalBalance.toFixed(2)}) is below the minimum
              required amount (${PLAN_TIERS[0].minAmount.toFixed(2)}) to invest.
            </p>
            <p className="text-gray-400 text-xs mt-3">
              Deposit more funds to start investing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Investment Plans</h2>
            <p className="text-gray-400 text-sm mt-2">
              Total Balance: <span className="text-green-400 font-semibold">${totalBalance.toFixed(2)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {eligiblePlans.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-300 text-sm mb-4 font-semibold">
              Available Plans for Your Balance:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eligiblePlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isProcessing}
                  className={`border-2 rounded-lg p-6 transition-all transform hover:scale-105 ${
                    colorClasses[plan.color as keyof typeof colorClasses]
                  } ${selectedPlan === plan.id ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''}`}
                >
                  <div className="text-4xl mb-3">{plan.icon}</div>
                  <h3 className={`text-lg font-bold mb-2 ${textColorClasses[plan.color as keyof typeof textColorClasses]}`}>
                    {plan.name}
                  </h3>
                  <div className="text-left">
                    <p className="text-gray-300 text-sm mb-3">
                      Min: ${plan.minAmount.toFixed(0)} | Max: ${plan.maxAmount.toFixed(0)}
                    </p>
                    <div className="bg-black/20 rounded p-2 mb-3">
                      <div className="flex items-center mb-1">
                        <TrendingUp className="h-4 w-4 text-green-400 mr-2" />
                        <span className="text-green-400 font-bold">${plan.returnRate.toFixed(2)}</span>
                        <span className="text-gray-400 text-xs ml-1">Daily</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-6">
                        Monthly: ${calculateMonthlyReturn(plan.returnRate).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 ml-6">
                        Yearly: ${calculateAnnualReturn(plan.returnRate).toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm text-gray-300 font-semibold">
                      {selectedPlan === plan.id ? '✓ Selected' : 'Click to select'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {eligiblePlans.length === 0 && (
          <div className="mb-6 bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-400 font-semibold mb-2">No Matching Plans</p>
            <p className="text-gray-300 text-sm">
              Your balance doesn't match available plans. Deposit more funds to access other plans.
            </p>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {showSuccess && successData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-green-900/90 border-2 border-green-500 rounded-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Plan Activated! 🎉</h2>
            <p className="text-gray-100 mb-4">
              Your <span className="font-bold text-green-400">${successData.amount.toFixed(2)}</span> is now invested in the
            </p>
            <p className="text-xl font-bold text-green-300 mb-6">{successData.planName} Plan</p>
            
            <div className="bg-green-800/50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                <span className="text-green-100">Daily Earnings:</span>
              </div>
              <p className="text-3xl font-bold text-green-400">${successData.dailyReturn.toFixed(2)}</p>
            </div>

            <p className="text-sm text-gray-300">
              Returns are credited immediately. Check your Active Investments section.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
