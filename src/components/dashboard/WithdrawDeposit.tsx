import { useState, useEffect } from 'react';
import { Upload, CheckCircle, DollarSign } from 'lucide-react';
import { User } from '../../types';
import { supabase } from '../../services/auth';

interface WithdrawalState {
  step: 'fee' | 'withdraw' | 'success';
  amount: number;
  fee: number;
  adminBankName: string;
  adminAccountNumber: string;
  adminAccountHolder: string;
  adminRoutingNumber: string;
  proofFile: File | null;
  loading: boolean;
  error: string | null;
  withdrawalId: string | null;
  userBalance: number;
  withdrawalStatus: 'pending' | 'pending_approval' | 'proof_approved' | 'awaiting_final_approval' | 'approved' | 'rejected';
  userAccountDetails: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    routingNumber: string;
  };
}

export default function WithdrawDeposit({ user }: { user: User }) {
  const [withdrawalState, setWithdrawalState] = useState<WithdrawalState>({
    step: 'fee',
    amount: 0,
    fee: 0,
    adminBankName: '',
    adminAccountNumber: '',
    adminAccountHolder: '',
    adminRoutingNumber: '',
    proofFile: null,
    loading: true,
    error: null,
    withdrawalId: null,
    userBalance: user.accountBalance || 0,
    withdrawalStatus: 'pending',
    userAccountDetails: {
      bankName: '',
      accountHolder: '',
      accountNumber: '',
      routingNumber: '',
    },
  });

  useEffect(() => {
    loadWithdrawalSettings();
  }, []);

  useEffect(() => {
    // Check withdrawal status via polling
    if (withdrawalState.withdrawalId) {
      const checkStatus = async () => {
        const { data } = await supabase
          .from('withdrawal_requests')
          .select('status')
          .eq('id', withdrawalState.withdrawalId)
          .single();

        if (data) {
          setWithdrawalState(prev => {
            const newState = { ...prev, withdrawalStatus: data.status as any };
            
            // Auto-advance to withdraw step when receipt approved
            if (data.status === 'proof_approved' && prev.step === 'fee') {
              newState.step = 'withdraw';
            } else if (data.status === 'approved' && prev.step === 'withdraw') {
              newState.step = 'success';
            }
            
            return newState;
          });
        }
      };

      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [withdrawalState.withdrawalId]);

  const loadWithdrawalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_settings')
        .select('*')
        .single();

      if (error) throw error;

      setWithdrawalState(prev => ({
        ...prev,
        fee: data.withdrawal_fee || 0,
        adminBankName: data.admin_bank_name || '',
        adminAccountNumber: data.admin_account_number || '',
        adminAccountHolder: data.admin_account_holder || '',
        adminRoutingNumber: data.admin_routing_number || '',
        loading: false,
      }));
    } catch (err) {
      setWithdrawalState(prev => ({
        ...prev,
        error: 'Failed to load withdrawal settings. Please contact admin.',
        loading: false,
      }));
      console.error('Error loading settings:', err);
    }
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setWithdrawalState(prev => ({ ...prev, proofFile: e.target.files![0] }));
    }
  };

  const handleSubmitProof = async () => {
    if (!withdrawalState.proofFile) {
      setWithdrawalState(prev => ({ ...prev, error: 'Please upload payment proof' }));
      return;
    }

    try {
      setWithdrawalState(prev => ({ ...prev, loading: true, error: null }));

      // Create a temporary withdrawal request (without amount yet)
      const { data: withdrawalData, error: createError } = await supabase
        .from('withdrawal_requests')
        .insert([
          {
            user_id: user.id,
            amount: 0, // Amount will be set when user submits on withdraw step
            status: 'pending',
            method_type: 'transfer',
            withdrawal_fee: withdrawalState.fee,
          },
        ])
        .select('id')
        .single();

      if (createError) throw createError;

      console.log('✓ Withdrawal created with ID:', withdrawalData.id);

      // Upload proof file
      const fileName = `${withdrawalData.id}/${Date.now()}-${withdrawalState.proofFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('withdrawal-proofs')
        .upload(fileName, withdrawalState.proofFile);

      if (uploadError) throw uploadError;

      console.log('✓ Proof file uploaded:', fileName);

      // Update withdrawal with proof file path and change status to pending_approval
      console.log('Attempting to update withdrawal:', {
        id: withdrawalData.id,
        fileName,
        userId: user.id,
      });

      const { error: updateError, data: updateData } = await supabase
        .from('withdrawal_requests')
        .update({
          proof_file_path: fileName,
          status: 'pending_approval',
        })
        .eq('id', withdrawalData.id)
        .select();

      if (updateError) {
        console.error('❌ Update error details:', {
          error: updateError,
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
        });
        throw updateError;
      }

      console.log('✓ Status updated to pending_approval', { updateData });

      setWithdrawalState(prev => ({
        ...prev,
        loading: false,
        withdrawalId: withdrawalData.id,
        withdrawalStatus: 'pending_approval',
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload proof';
      console.error('❌ Proof upload/status update error:', errorMsg, err);
      setWithdrawalState(prev => ({
        ...prev,
        error: errorMsg,
        loading: false,
      }));
    }
  };

  const handleStartNewWithdrawal = () => {
    setWithdrawalState(prev => ({
      ...prev,
      step: 'fee',
      amount: 0,
      proofFile: null,
      withdrawalId: null,
      error: null,
      withdrawalStatus: 'pending',
      userAccountDetails: {
        bankName: '',
        accountHolder: '',
        accountNumber: '',
        routingNumber: '',
      },
    }));
  };

  const handleSubmitAccountDetails = async () => {
    const { bankName, accountNumber, accountHolder } = withdrawalState.userAccountDetails;
    
    if (!bankName || !accountNumber || !accountHolder) {
      setWithdrawalState(prev => ({ ...prev, error: 'Please fill in all required account details' }));
      return;
    }

    if (withdrawalState.amount <= 0) {
      setWithdrawalState(prev => ({ ...prev, error: 'Please enter a valid withdrawal amount' }));
      return;
    }

    if (withdrawalState.amount > withdrawalState.userBalance) {
      setWithdrawalState(prev => ({ ...prev, error: 'Insufficient balance for this withdrawal' }));
      return;
    }

    if (!withdrawalState.withdrawalId) {
      setWithdrawalState(prev => ({ ...prev, error: 'No withdrawal request found' }));
      return;
    }

    try {
      setWithdrawalState(prev => ({ ...prev, loading: true, error: null }));

      const { error: updateError } = await supabase
        .from('withdrawal_requests')
        .update({
          amount: withdrawalState.amount,
          account_details: withdrawalState.userAccountDetails,
          status: 'awaiting_final_approval',
        })
        .eq('id', withdrawalState.withdrawalId);

      if (updateError) throw updateError;

      setWithdrawalState(prev => ({
        ...prev,
        loading: false,
      }));
    } catch (err) {
      setWithdrawalState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to submit account details',
        loading: false,
      }));
    }
  };

  if (withdrawalState.loading && !withdrawalState.withdrawalId) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <p className="text-gray-400">Loading withdrawal settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 h-[600px] overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h2>

      {withdrawalState.error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
          {withdrawalState.error}
        </div>
      )}

      {/* Card 1: Withdrawal Fee - Show balance, fee, admin details, upload receipt */}
      {withdrawalState.step === 'fee' && !withdrawalState.withdrawalId && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center mb-6">
              <DollarSign className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-xl font-bold text-white">Available Balance</h3>
            </div>
            <p className="text-4xl font-bold text-green-400">${withdrawalState.userBalance.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-2">Your current balance</p>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-lg font-bold text-white mb-4">Withdrawal Fee</h3>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-yellow-400">${withdrawalState.fee.toFixed(2)}</p>
              <p className="text-gray-400 text-sm mt-2">Fee charged on all withdrawals</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-lg font-bold text-white mb-4">Send Payment To (Admin Account)</h3>
            <div className="space-y-2 text-sm bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-400">Bank Name: <span className="text-white font-semibold">{withdrawalState.adminBankName}</span></p>
              <p className="text-gray-400">Account Holder: <span className="text-white font-semibold">{withdrawalState.adminAccountHolder}</span></p>
              <p className="text-gray-400">Account Number: <span className="text-white font-semibold">{withdrawalState.adminAccountNumber}</span></p>
              {withdrawalState.adminRoutingNumber && (
                <p className="text-gray-400">Routing Number: <span className="text-white font-semibold">{withdrawalState.adminRoutingNumber}</span></p>
              )}
            </div>
            <p className="text-gray-400 text-xs mt-3">Send payment to this account and upload proof of payment below</p>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-lg font-bold text-white mb-4">Upload Payment Receipt</h3>
            
            <label className="w-full bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-red-500 transition-colors block">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 font-semibold">Click to upload or drag and drop</p>
              <p className="text-gray-500 text-sm">PNG, JPG, PDF (max. 10MB)</p>
              <input
                type="file"
                onChange={handleProofUpload}
                className="hidden"
                accept=".png,.jpg,.jpeg,.pdf"
              />
            </label>

            {withdrawalState.proofFile && (
              <div className="mt-3 bg-green-500/10 border border-green-500 rounded-lg p-3">
                <p className="text-green-400 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  {withdrawalState.proofFile.name}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleSubmitProof}
            disabled={!withdrawalState.proofFile || withdrawalState.loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {withdrawalState.loading ? 'Uploading...' : 'Submit Receipt'}
          </button>

          {withdrawalState.withdrawalStatus === 'pending_approval' && (
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-400 text-sm">⏳ Waiting for admin approval of your receipt...</p>
            </div>
          )}
        </div>
      )}

      {/* Card 1: After admin approves receipt - Show "you can now withdraw" */}
      {withdrawalState.step === 'fee' && withdrawalState.withdrawalId && withdrawalState.withdrawalStatus === 'proof_approved' && (
        <div className="space-y-6">
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-400 mb-2">✅ Receipt Approved!</h3>
            <p className="text-gray-300">You can now proceed to withdraw funds</p>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600">
            <div className="flex items-center mb-6">
              <DollarSign className="h-6 w-6 text-green-500 mr-3" />
              <h3 className="text-xl font-bold text-white">Available Balance</h3>
            </div>
            <p className="text-4xl font-bold text-green-400">${withdrawalState.userBalance.toFixed(2)}</p>
            <p className="text-gray-400 text-sm mt-2">Your current balance</p>
          </div>

          <button
            onClick={() => setWithdrawalState(prev => ({ ...prev, step: 'withdraw' }))}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 rounded-lg transition-colors text-lg"
          >
            Withdraw
          </button>
        </div>
      )}

      {/* Card 2: Withdraw - User enters amount and account details */}
      {withdrawalState.step === 'withdraw' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-yellow-900/20 to-gray-800 rounded-xl p-6 border border-yellow-500">
            <h3 className="text-2xl font-bold text-yellow-400 mb-2">Withdraw Funds</h3>
            <p className="text-gray-400">Enter the amount and your account details</p>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-lg font-bold text-white mb-4">Withdrawal Amount</h3>
            <div>
              <label className="block text-white font-semibold mb-2">Amount to Withdraw (USD) *</label>
              <input
                type="number"
                id="withdrawAmount"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                max={withdrawalState.userBalance}
                onChange={(e) => setWithdrawalState(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                value={withdrawalState.amount || ''}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <p className="text-gray-500 text-xs mt-2">Maximum: ${withdrawalState.userBalance.toFixed(2)}</p>
            </div>

            <div className="mt-4 bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-semibold">${withdrawalState.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fee:</span>
                <span className="text-yellow-400 font-semibold">${withdrawalState.fee.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-600 pt-2 flex justify-between text-sm">
                <span className="text-gray-300">You Will Receive:</span>
                <span className="text-green-400 font-bold">${Math.max(0, withdrawalState.amount - withdrawalState.fee).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-6 border border-gray-600">
            <h3 className="text-lg font-bold text-white mb-4">Your Receiving Bank Account</h3>
            <p className="text-gray-400 text-sm mb-4">Funds will be transferred to this account</p>

            <div className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Bank Name *</label>
                <input
                  type="text"
                  value={withdrawalState.userAccountDetails.bankName}
                  onChange={(e) => setWithdrawalState(prev => ({
                    ...prev,
                    userAccountDetails: { ...prev.userAccountDetails, bankName: e.target.value }
                  }))}
                  placeholder="e.g., Chase Bank"
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Account Holder Name *</label>
                <input
                  type="text"
                  value={withdrawalState.userAccountDetails.accountHolder}
                  onChange={(e) => setWithdrawalState(prev => ({
                    ...prev,
                    userAccountDetails: { ...prev.userAccountDetails, accountHolder: e.target.value }
                  }))}
                  placeholder="Your full name"
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Account Number *</label>
                <input
                  type="text"
                  value={withdrawalState.userAccountDetails.accountNumber}
                  onChange={(e) => setWithdrawalState(prev => ({
                    ...prev,
                    userAccountDetails: { ...prev.userAccountDetails, accountNumber: e.target.value }
                  }))}
                  placeholder="Your account number"
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">Routing Number (Optional)</label>
                <input
                  type="text"
                  value={withdrawalState.userAccountDetails.routingNumber}
                  onChange={(e) => setWithdrawalState(prev => ({
                    ...prev,
                    userAccountDetails: { ...prev.userAccountDetails, routingNumber: e.target.value }
                  }))}
                  placeholder="Your routing number"
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitAccountDetails}
            disabled={withdrawalState.loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {withdrawalState.loading ? 'Submitting...' : 'Submit & Request Withdrawal'}
          </button>

          {withdrawalState.withdrawalStatus === 'awaiting_final_approval' && (
            <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-400 text-sm">✓ Your withdrawal request has been sent successfully. You will receive your funds shortly.</p>
            </div>
          )}

          <button
            onClick={() => setWithdrawalState(prev => ({ ...prev, step: 'fee' }))}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
          >
            ← Back
          </button>
        </div>
      )}

      {/* Card 3: Success - Approved */}
      {withdrawalState.step === 'success' && (
        <div className="bg-gradient-to-br from-green-900/20 to-gray-800 rounded-xl p-6 border border-green-500 text-center space-y-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">✅ Withdrawal Approved!</h3>
            <p className="text-gray-300 text-lg">You will receive funds shortly</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 text-left space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Withdrawal Amount:</span>
              <span className="text-white font-semibold">${withdrawalState.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Withdrawal Fee:</span>
              <span className="text-yellow-400 font-semibold">${withdrawalState.fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-600 pt-3 flex justify-between">
              <span className="text-gray-300 font-semibold">Net Amount:</span>
              <span className="text-green-400 font-bold">${(withdrawalState.amount - withdrawalState.fee).toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-400 text-sm">Funds will be transferred to your bank account within 1-3 business days.</p>
          </div>

          <button
            onClick={handleStartNewWithdrawal}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Start New Withdrawal
          </button>
        </div>
      )}
    </div>
  );
}
