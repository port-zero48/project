import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createCryptoDepositRequest } from '../../services/transactions';
import { fetchCryptoSettings } from '../../services/crypto';

interface CryptoDetails {
  crypto_address: string;
  crypto_name: string;
  is_active: boolean;
}

export default function DepositCrypto() {
  const { user } = useAuth();
  const [step, setStep] = useState<'amount' | 'select' | 'details'>('amount');
  const [cryptoList, setCryptoList] = useState<CryptoDetails[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        setLoading(true);
        const data = await fetchCryptoSettings();
        const activeCryptos = data.filter((c: any) => c.is_active);
        setCryptoList(activeCryptos);
        if (activeCryptos.length > 0) {
          setSelectedCrypto(activeCryptos[0]);
        }
      } catch (err) {
        console.error('Error fetching crypto details:', err);
        setMessage({ type: 'error', text: 'Failed to load crypto wallet details' });
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  const handleCopyAddress = () => {
    if (selectedCrypto?.crypto_address) {
      navigator.clipboard.writeText(selectedCrypto.crypto_address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setMessage(null);
    setStep('select');
  };

  const handleSelectCrypto = (crypto: CryptoDetails) => {
    setSelectedCrypto(crypto);
    setStep('details');
  };

  const handleSubmit = async () => {
    try {
      await createCryptoDepositRequest(user!.id, parseFloat(amount));

      setMessage({
        type: 'success',
        text: `Transfer ${amount} ${selectedCrypto?.crypto_name} to the address above. Once confirmed on blockchain, your account will be credited.`
      });
      setAmount('');
      setStep('amount');
    } catch (err) {
      console.error('Error creating crypto deposit:', err);
      setMessage({ type: 'error', text: 'Failed to record deposit' });
    }
  };

  if (loading) {
    return <div className="text-white">Loading crypto wallets...</div>;
  }

  if (cryptoList.length === 0) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
        <p className="text-yellow-400 font-semibold">Crypto wallets not configured</p>
        <p className="text-yellow-300 text-sm mt-1">Admin has not set up cryptocurrency wallets yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Cryptocurrency Deposit</h3>

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
            <p className="text-blue-300 text-sm mt-1">How much crypto do you want to send?</p>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.00000001"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Proceed to Select Crypto
          </button>
        </form>
      )}

      {/* Step 2: Select Crypto */}
      {step === 'select' && (
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-400 font-semibold">Step 2: Select Cryptocurrency</p>
            <p className="text-blue-300 text-sm mt-1">Which crypto do you want to send?</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {cryptoList.map((crypto) => (
              <button
                key={crypto.crypto_name}
                onClick={() => handleSelectCrypto(crypto)}
                className="text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-blue-500 transition-colors"
              >
                <p className="text-white font-semibold">{crypto.crypto_name}</p>
                <p className="text-gray-300 text-sm truncate">{crypto.crypto_address}</p>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep('amount')}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Back
          </button>
        </div>
      )}

      {/* Step 3: Wallet Details */}
      {step === 'details' && selectedCrypto && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
            <p className="text-green-400 font-semibold">Step 3: Send Crypto</p>
            <p className="text-green-300 text-sm mt-1">Amount: <span className="font-bold">{amount} {selectedCrypto?.crypto_name?.toUpperCase()}</span></p>
          </div>

          {/* Crypto Wallet Card - Admin Configured */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-900 rounded-lg p-6 border border-purple-500">
            <h4 className="font-semibold text-white mb-4">Send {selectedCrypto?.crypto_name} to:</h4>
            
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm mb-2">Wallet Address</p>
              <div className="flex items-center justify-between">
                <p className="text-white font-mono text-sm break-all pr-2">{selectedCrypto?.crypto_address}</p>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="flex-shrink-0 ml-2 p-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                >
                  {copiedAddress ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500 rounded p-3">
              <p className="text-yellow-400 text-sm">
                ⚠️ <span className="font-semibold">Important:</span> Always verify this address. Copy and paste to avoid errors.
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4 space-y-2">
            <p className="text-blue-400 font-semibold">How to send:</p>
            <ol className="text-blue-300 text-sm space-y-1 list-decimal list-inside">
              <li>Copy the wallet address above (use the copy button)</li>
              <li>Open your crypto wallet</li>
              <li>Paste the address and send exactly {amount} {selectedCrypto?.crypto_name?.toUpperCase()}</li>
              <li>Wait for blockchain confirmation (usually 1-30 minutes)</li>
              <li>Your account will be credited automatically</li>
            </ol>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep('select')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              I've Sent the Crypto
            </button>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-400 text-sm font-semibold mb-2">⚠️ Important:</p>
            <p className="text-yellow-300 text-sm">
              Send only {selectedCrypto?.crypto_name} to this address. Sending other cryptocurrencies will result in permanent loss of funds.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
