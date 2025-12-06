import { useState, useEffect } from 'react';
import { Check, X, Download, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { completeDeposit, rejectDeposit, deleteDepositRequest } from '../../services/transactions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

interface TransactionRequest {
  id: string;
  user_id: string;
  deposit_method: 'transfer' | 'crypto';
  amount: number;
  payment_slip_url?: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  users?: {
    email: string;
  };
}

export default function TransactionRequests() {
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadTransactionRequests();
  }, []);

  const loadTransactionRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all deposit requests first
      const { data, error: fetchError } = await supabase
        .from('deposit_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        setError(`Error: ${fetchError.message}`);
        throw fetchError;
      }
      
      console.log('All deposits:', data);
      
      // Filter for transfer and crypto, and add user data
      if (data) {
        const filtered = await Promise.all(
          data
            .filter((d: any) => ['transfer', 'crypto'].includes(d.deposit_method))
            .map(async (deposit: any) => {
              const { data: userData } = await supabase
                .from('users')
                .select('email')
                .eq('id', deposit.user_id)
                .single();
              
              return {
                ...deposit,
                users: userData
              };
            })
        );
        
        console.log('Filtered transactions:', filtered);
        setRequests(filtered);
      }
    } catch (err) {
      console.error('Error loading transaction requests:', err);
      setError(`Failed to load transactions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await completeDeposit(requestId);
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'completed' } : r));
      alert('Transaction approved! User will receive notification to select investment plan.');
    } catch (err) {
      alert('Error approving transaction');
      console.error(err);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectDeposit(requestId);
      setRequests(requests.map(r => r.id === requestId ? { ...r, status: 'rejected' } : r));
      alert('Transaction rejected');
    } catch (err) {
      alert('Error rejecting transaction');
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDepositRequest(requestId);
      setRequests(requests.filter(r => r.id !== requestId));
      alert('Transaction deleted successfully');
    } catch (err) {
      alert('Error deleting transaction');
      console.error(err);
    }
  };

  const handleDownloadSlip = async (url: string) => {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.indexOf('chat-files');
      const filePath = urlParts.slice(bucketIndex + 1).join('/');
      
      console.log('Downloading from:', filePath);
      
      const { data, error } = await supabase.storage
        .from('chat-files')
        .download(filePath);
      
      if (error) {
        console.error('Download error:', error);
        window.open(url, '_blank');
        return;
      }
      
      const blobUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filePath.split('/').pop() || 'payment-slip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error downloading file:', err);
      window.open(url, '_blank');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return <div className="text-white">Loading transaction requests...</div>;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Transaction Requests (Transfer & Crypto)</h2>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-400 font-semibold">Error loading transactions:</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 text-left">
              <th className="px-4 py-3 text-gray-300 font-semibold">User Email</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Method</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Amount</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Status</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Proof</th>
              <th className="px-4 py-3 text-gray-300 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="px-4 py-3 text-white">{request.users?.email || 'Unknown'}</td>
                <td className="px-4 py-3 text-white">
                  <span className="capitalize px-2 py-1 bg-gray-700 rounded text-sm">
                    {request.deposit_method}
                  </span>
                </td>
                <td className="px-4 py-3 text-white font-semibold">${request.amount.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {request.payment_slip_url ? (
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      <span>View Slip</span>
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">No proof</span>
                  )}
                </td>
                <td className="px-4 py-3 space-x-2 flex">
                  {request.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40 transition-colors"
                        title="Approve"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors"
                        title="Reject"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(request.id)}
                    className="p-2 bg-red-900/20 text-red-500 rounded hover:bg-red-900/40 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No transaction requests found
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Transaction Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-gray-300 mb-6">
              <p><span className="font-semibold">User Email:</span> {selectedRequest.users?.email}</p>
              <p><span className="font-semibold">Method:</span> <span className="capitalize">{selectedRequest.deposit_method}</span></p>
              <p><span className="font-semibold">Amount:</span> ${selectedRequest.amount.toFixed(2)}</p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </p>

              {selectedRequest.deposit_method === 'transfer' && selectedRequest.payment_slip_url && (
                <>
                  <p><span className="font-semibold">Payment Slip:</span></p>
                  <div className="mt-2 mb-4 border border-gray-600 rounded-lg overflow-hidden bg-black/30">
                    {selectedRequest.payment_slip_url.includes('.pdf') ? (
                      <div className="p-4 text-center">
                        <p className="text-gray-400 mb-3">📄 PDF Document</p>
                        <a
                          href={selectedRequest.payment_slip_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download PDF</span>
                        </a>
                      </div>
                    ) : (
                      <img src={selectedRequest.payment_slip_url} alt="Payment Slip" className="w-full max-h-64 object-contain" />
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownloadSlip(selectedRequest.payment_slip_url!)}
                      className="flex-1 inline-flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                    <a
                      href={selectedRequest.payment_slip_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors text-sm text-center"
                    >
                      Open
                    </a>
                  </div>
                </>
              )}

              {selectedRequest.deposit_method === 'crypto' && (
                <p><span className="font-semibold">Type:</span> Cryptocurrency deposit</p>
              )}

              <p><span className="font-semibold">Created:</span> {new Date(selectedRequest.created_at).toLocaleString()}</p>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
            >
              Close Modal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
