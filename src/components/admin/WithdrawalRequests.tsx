import { useState, useEffect } from 'react';
import { Check, X, Download, DollarSign, AlertCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../services/auth';
import { deleteWithdrawalRequest, recordTransaction } from '../../services/transactions';

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  withdrawal_fee: number;
  status: 'pending' | 'pending_approval' | 'proof_approved' | 'awaiting_final_approval' | 'approved' | 'rejected' | 'completed';
  proof_file_path?: string;
  account_details?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    routingNumber?: string;
  };
  created_at: string;
  approved_at?: string;
  users?: {
    email: string;
  };
}

interface FeeModalState {
  isOpen: boolean;
  requestId: string | null;
  fee: number;
}

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feeModal, setFeeModal] = useState<FeeModalState>({
    isOpen: false,
    requestId: null,
    fee: 0,
  });

  useEffect(() => {
    loadWithdrawalRequests();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('withdrawal_requests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'withdrawal_requests' },
        () => {
          loadWithdrawalRequests();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadWithdrawalRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        setError(`Error: ${fetchError.message}`);
        throw fetchError;
      }

      // Fetch user emails
      if (data) {
        const withUserData = await Promise.all(
          data.map(async (request: any) => {
            const { data: userData } = await supabase
              .from('users')
              .select('email')
              .eq('id', request.user_id)
              .single();

            return {
              ...request,
              users: userData,
            };
          })
        );

        setRequests(withUserData);
      }
    } catch (err) {
      console.error('Error loading withdrawal requests:', err);
      setError(`Failed to load withdrawal requests: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetFee = async () => {
    if (!feeModal.requestId) return;

    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ withdrawal_fee: feeModal.fee })
        .eq('id', feeModal.requestId);

      if (error) throw error;

      setFeeModal({ isOpen: false, requestId: null, fee: 0 });
      loadWithdrawalRequests();
    } catch (err) {
      console.error('Error setting fee:', err);
      alert(`Failed to set fee: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleApproveReceipt = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'proof_approved',
        })
        .eq('id', requestId);

      if (error) throw error;

      loadWithdrawalRequests();
    } catch (err) {
      console.error('Error approving receipt:', err);
      alert(`Failed to approve receipt: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleApproveWithdrawal = async (requestId: string) => {
    try {
      // Get withdrawal request details
      const { data: withdrawalRequest, error: fetchError } = await supabase
        .from('withdrawal_requests')
        .select('user_id, amount, withdrawal_fee, method_type, account_details')
        .eq('id', requestId)
        .single();

      if (fetchError) throw fetchError;
      if (!withdrawalRequest) throw new Error('Withdrawal request not found');

      const totalDeduction = withdrawalRequest.amount + withdrawalRequest.withdrawal_fee;

      // Get current user balance
      const { data: userData, error: userFetchError } = await supabase
        .from('users')
        .select('account_balance')
        .eq('id', withdrawalRequest.user_id)
        .single();

      if (userFetchError) throw userFetchError;

      const currentBalance = userData?.account_balance || 0;
      const newBalance = Math.max(0, currentBalance - totalDeduction);

      // Update user balance and withdrawal status in parallel
      const [balanceUpdateResult, statusUpdateResult] = await Promise.all([
        supabase
          .from('users')
          .update({ account_balance: newBalance })
          .eq('id', withdrawalRequest.user_id),
        supabase
          .from('withdrawal_requests')
          .update({
            status: 'approved',
            approved_at: new Date().toISOString(),
          })
          .eq('id', requestId),
      ]);

      if (balanceUpdateResult.error) throw balanceUpdateResult.error;
      if (statusUpdateResult.error) throw statusUpdateResult.error;

      // Record transaction in history
      await recordTransaction(
        withdrawalRequest.user_id,
        'withdrawal',
        withdrawalRequest.method_type || 'transfer',
        withdrawalRequest.amount,
        'completed',
        `Withdrawal approved - ${withdrawalRequest.amount} with fee $${withdrawalRequest.withdrawal_fee}`,
        requestId,
        {
          fee: withdrawalRequest.withdrawal_fee,
          totalDeduction,
          accountDetails: withdrawalRequest.account_details
        }
      );

      loadWithdrawalRequests();
    } catch (err) {
      console.error('Error approving withdrawal:', err);
      alert(`Failed to approve withdrawal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRejectWithdrawal = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({
          status: 'rejected',
        })
        .eq('id', requestId);

      if (error) throw error;

      loadWithdrawalRequests();
    } catch (err) {
      console.error('Error rejecting withdrawal:', err);
      alert(`Failed to reject withdrawal: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteWithdrawal = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this withdrawal request? This action cannot be undone.')) {
      return;
    }

    try {
      // Remove from local state immediately
      setRequests(requests.filter(r => r.id !== requestId));
      
      // Delete from database
      await deleteWithdrawalRequest(requestId);
      console.log('✓ Withdrawal request deleted successfully');
      
      // Reload to ensure consistency
      setTimeout(() => {
        loadWithdrawalRequests();
      }, 500);
    } catch (err) {
      console.error('Error deleting withdrawal:', err);
      alert(`Failed to delete withdrawal: ${err instanceof Error ? err.message : 'Unknown error'}`);
      // Reload to show current state
      loadWithdrawalRequests();
    }
  };

  const downloadProof = async (proofPath: string, fileName: string) => {
    try {
      console.log(`Downloading proof file: ${proofPath}`);
      
      const { data, error } = await supabase.storage
        .from('withdrawal-proofs')
        .download(proofPath);

      if (error) {
        console.error('Download error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No file data received');
      }

      console.log(`Downloaded file size: ${data.size} bytes`);
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'proof-file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✓ File downloaded successfully');
    } catch (err) {
      console.error('Error downloading proof:', err);
      alert(`Failed to download proof file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
      case 'pending_approval':
        return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'proof_approved':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'awaiting_final_approval':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'completed':
        return 'bg-green-700/20 text-green-300 border-green-600';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-6 w-6 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Withdrawal Requests</h2>
        </div>
        <p className="text-gray-400">Loading withdrawal requests...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="h-6 w-6 text-red-500" />
        <h2 className="text-2xl font-bold text-white">Withdrawal Requests</h2>
      </div>

      {/* Debug Info */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3 mb-6">
        <p className="text-blue-400 text-xs">
          Debug: {requests.length} withdrawal request(s) found. Loading: {loading ? 'Yes' : 'No'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-6 text-center">
          <p className="text-yellow-400 font-semibold">No withdrawal requests yet</p>
          <p className="text-gray-400 text-sm mt-2">Users can make their first withdrawal request by going to their Dashboard → Withdraw Funds</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-gray-400 text-sm">User Email</p>
                  <p className="text-white font-semibold">{request.users?.email || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Amount</p>
                  <p className="text-white font-semibold">${request.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadgeColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Created</p>
                  <p className="text-white text-sm">{new Date(request.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Fee and Account Details Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 bg-gray-800 p-4 rounded">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Withdrawal Fee</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-lg">${request.withdrawal_fee?.toFixed(2) || '0.00'}</p>
                    {request.status === 'pending' && (
                      <button
                        onClick={() => setFeeModal({ isOpen: true, requestId: request.id, fee: request.withdrawal_fee || 0 })}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-semibold transition-colors"
                      >
                        Set Fee
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 text-sm mb-2">Net Amount</p>
                  <p className="text-green-400 font-semibold text-lg">
                    ${(request.amount - (request.withdrawal_fee || 0)).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Debug: Show raw status and account details */}
              <div className="mb-4 bg-gray-900 p-3 rounded border border-gray-700 text-xs">
                <p className="text-gray-500">Debug - Status: "{request.status}" | Account Details: {request.account_details ? 'Present' : 'NULL'} | Proof Path: {request.proof_file_path ? 'Present' : 'NULL'}</p>
              </div>

              {/* Account Details */}
              {request.account_details && (
                <div className="mb-4 bg-gray-800 p-4 rounded">
                  <p className="text-gray-400 text-sm mb-3 font-semibold">User's Account Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <p className="text-gray-300">
                      Bank: <span className="text-white">{request.account_details.bankName || request.account_details.bankName}</span>
                    </p>
                    <p className="text-gray-300">
                      Account Holder: <span className="text-white">{request.account_details.accountHolder || request.account_details.accountHolder}</span>
                    </p>
                    <p className="text-gray-300">
                      Account #: <span className="text-white">{request.account_details.accountNumber || request.account_details.accountNumber}</span>
                    </p>
                    {(request.account_details.routingNumber || request.account_details.routingNumber) && (
                      <p className="text-gray-300">
                        Routing #: <span className="text-white">{request.account_details.routingNumber || request.account_details.routingNumber}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Proof File */}
              {request.proof_file_path && (
                <div className="mb-4 bg-gray-800 p-4 rounded flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Payment Proof</p>
                    <p className="text-white font-semibold">{request.proof_file_path.split('/').pop()}</p>
                  </div>
                  <button
                    onClick={() => downloadProof(request.proof_file_path!, 'payment-proof')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download Proof
                  </button>
                </div>
              )}

              {/* Action Buttons - Status: Pending (No Proof Uploaded Yet) */}
              {request.status === 'pending' && (
                <div className="space-y-3">
                  <div className="bg-orange-500/10 border border-orange-500 p-3 rounded flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-400" />
                    <p className="text-orange-400">Waiting for user to upload payment proof...</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWithdrawal(request.id)}
                    className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Request
                  </button>
                </div>
              )}

              {/* Action Buttons - Stage 1: Approve Receipt (pending_approval) */}
              {request.status === 'pending_approval' && (
                <div>
                  <p className="text-yellow-400 font-semibold mb-3 text-sm">STAGE 1: RECEIPT VERIFICATION</p>
                  <p className="text-gray-400 text-sm mb-3">User has uploaded payment proof. Review and approve to allow them to proceed.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveReceipt(request.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Approve Receipt
                    </button>
                    <button
                      onClick={() => handleRejectWithdrawal(request.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleDeleteWithdrawal(request.id)}
                      className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons - Stage 2: Approve Final Withdrawal (awaiting_final_approval) */}
              {request.status === 'awaiting_final_approval' && (
                <div>
                  <p className="text-blue-400 font-semibold mb-3 text-sm">STAGE 2: FINAL APPROVAL</p>
                  <p className="text-gray-400 text-sm mb-3">User has entered withdrawal amount and account details. Review and approve to complete.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveWithdrawal(request.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check className="h-4 w-4" />
                      Approve Withdrawal
                    </button>
                    <button
                      onClick={() => handleRejectWithdrawal(request.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleDeleteWithdrawal(request.id)}
                      className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Status: Receipt Approved - Waiting for User */}
              {request.status === 'proof_approved' && (
                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500 p-3 rounded flex items-center gap-2">
                    <Check className="h-5 w-5 text-blue-400" />
                    <p className="text-blue-400">Receipt approved. Waiting for user to enter withdrawal details...</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWithdrawal(request.id)}
                    className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Request
                  </button>
                </div>
              )}

              {/* Status: Approved */}
              {request.status === 'approved' && (
                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500 p-3 rounded flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-400" />
                    <p className="text-green-400">
                      Approved on {request.approved_at ? new Date(request.approved_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteWithdrawal(request.id)}
                    className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Request
                  </button>
                </div>
              )}

              {/* Status: Rejected */}
              {request.status === 'rejected' && (
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500 p-3 rounded flex items-center gap-2">
                    <X className="h-5 w-5 text-red-400" />
                    <p className="text-red-400">Withdrawal rejected</p>
                  </div>
                  <button
                    onClick={() => handleDeleteWithdrawal(request.id)}
                    className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded font-semibold flex items-center justify-center gap-2 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Request
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fee Modal */}
      {feeModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Set Withdrawal Fee</h3>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Fee Amount (USD)</label>
              <input
                type="number"
                value={feeModal.fee}
                onChange={(e) => setFeeModal(prev => ({ ...prev, fee: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                min="0"
                step="0.01"
              />
              <p className="text-gray-400 text-sm mt-2">
                Net amount user will receive: ${(
                  (requests.find(r => r.id === feeModal.requestId)?.amount || 0) - feeModal.fee
                ).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSetFee}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Set Fee
              </button>
              <button
                onClick={() => setFeeModal({ isOpen: false, requestId: null, fee: 0 })}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
