import { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { createTransferDepositRequest, getWithdrawalMethodByType } from '../../services/transactions';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

interface BankDetails {
  bank_name: string;
  account_number: string;
  routing_number: string;
  account_holder_name: string;
  updated_at?: string;
}

export default function DepositTransfer() {
  const { user } = useAuth();
  const [step, setStep] = useState<'amount' | 'details' | 'proof'>('amount');
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch bank details from admin settings
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        const data = await getWithdrawalMethodByType('transfer');
        setBankDetails(data as BankDetails);
      } catch (err) {
        console.error('Error fetching bank details:', err);
        setMessage({ type: 'error', text: 'Failed to load bank details' });
      }
    };

    fetchBankDetails();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File size must be less than 5MB' });
        return;
      }
      setFile(selectedFile);
      setMessage(null);
    }
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setMessage(null);
    setStep('details');
  };

  const handleProofSubmit = async () => {
    if (!file || !user) {
      setMessage({ type: 'error', text: 'Please upload payment proof' });
      return;
    }

    try {
      setUploading(true);

      // Upload payment slip to existing storage bucket
      const fileExt = file.name.split('.').pop() || 'jpg';
      const uniqueName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `payment-slips/${user!.id}/${uniqueName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Create deposit request record
      await createTransferDepositRequest(
        user!.id,
        parseFloat(amount),
        data.publicUrl
      );

      setMessage({ type: 'success', text: 'Payment slip uploaded successfully! Your funds will be credited within 24 hours.' });
      setAmount('');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setStep('amount');
    } catch (err) {
      console.error('Error uploading payment slip:', err);
      setMessage({ type: 'error', text: 'Failed to upload payment slip. Make sure the file is valid.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Bank Transfer Deposit</h3>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Step 1: Amount */}
      {step === 'amount' && (
        <form onSubmit={handleAmountSubmit} className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-400 font-semibold">Step 1: Enter Deposit Amount</p>
            <p className="text-blue-300 text-sm mt-1">Specify how much you want to deposit via bank transfer</p>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Amount (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Proceed to Account Details
          </button>
        </form>
      )}

      {/* Step 2: Bank Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
            <p className="text-green-400 font-semibold">Step 2: Transfer to This Account</p>
            <p className="text-green-300 text-sm mt-1">Amount: <span className="font-bold">${amount}</span></p>
          </div>

          {/* Bank Details Card - Admin Configured */}
          <div className="bg-gray-700 rounded-lg p-6 border border-gray-600 space-y-4">
            <div>
              <label className="text-gray-400 text-sm font-semibold">Bank Name</label>
              <p className="text-white text-lg font-semibold mt-1">{bankDetails?.bank_name || 'Loading...'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-semibold">Account Holder</label>
              <p className="text-white text-lg font-semibold mt-1">{bankDetails?.account_holder_name || 'Loading...'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-semibold">Account Number</label>
              <p className="text-white text-lg font-mono font-semibold mt-1">{bankDetails?.account_number || 'Loading...'}</p>
            </div>
            <div>
              <label className="text-gray-400 text-sm font-semibold">Routing Number</label>
              <p className="text-white text-lg font-mono font-semibold mt-1">{bankDetails?.routing_number || 'Loading...'}</p>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-400 text-sm">
              ⚠️ <span className="font-semibold">Important:</span> Double-check these details before transferring.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep('amount')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('proof')}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Next: Upload Proof
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Upload Proof */}
      {step === 'proof' && (
        <div className="space-y-4">
          <div className="bg-purple-500/10 border border-purple-500 rounded-lg p-4">
            <p className="text-purple-400 font-semibold">Step 3: Upload Payment Proof</p>
            <p className="text-purple-300 text-sm mt-1">Upload screenshot or PDF of your payment confirmation</p>
          </div>

          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors"
            >
              {file ? (
                <div className="space-y-2">
                  <span className="text-2xl block">✓</span>
                  <p className="text-green-400 font-semibold">{file.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-white">Click to upload or drag and drop</p>
                  <p className="text-gray-400 text-sm">PNG, JPG, PDF up to 5MB</p>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                setStep('details');
                setFile(null);
              }}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleProofSubmit}
              disabled={uploading || !file}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {uploading ? 'Uploading...' : 'Submit Payment Slip'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          After you transfer the funds and upload the proof, we will verify and credit your account within 24 hours.
        </p>
      </div>
    </div>
  );
}
