import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createCardDepositRequest, verifyCardDepositCode } from '../../services/transactions';

export default function DepositCard() {
  const { user } = useAuth();
  const [step, setStep] = useState<'amount' | 'payment' | 'verification'>('amount');
  const [amount, setAmount] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [currentDepositId, setCurrentDepositId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  // Countdown timer effect
  useEffect(() => {
    if (step !== 'verification' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAmountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    setMessage(null);
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      setMessage({ type: 'error', text: 'Please fill in all card details' });
      return;
    }

    try {
      setLoading(true);

      const depositData = await createCardDepositRequest(
        user!.id,
        parseFloat(amount),
        cardNumber.slice(-4),
        cardholderName,
        cardNumber,
        expiryDate,
        cvv
      );

      setCurrentDepositId(depositData.id);
      setTimeLeft(15 * 60); // Reset countdown to 15 minutes
      setMessage({
        type: 'success',
        text: `Card details received! Check your email for the verification code.`
      });
      
      // Move to verification step
      setStep('verification');
      
      // Clear sensitive card data
      setCardNumber('');
      setCvv('');
    } catch (err) {
      console.error('Error creating deposit request:', err);
      setMessage({ type: 'error', text: 'Failed to process card deposit' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || !currentDepositId) {
      setMessage({ type: 'error', text: 'Please enter verification code' });
      return;
    }

    try {
      setLoading(true);

      await verifyCardDepositCode(currentDepositId, verificationCode);

      setMessage({ type: 'success', text: 'Code verified! Deposit will be processed shortly.' });
      setCodeVerified(true);
      setVerificationCode('');
    } catch (err) {
      console.error('Error verifying code:', err);
      setMessage({ type: 'error', text: 'Invalid or expired verification code' });
    } finally {
      setLoading(false);
    }
  };

  if (codeVerified) {
    return (
      <div className="space-y-4">
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
          <p className="text-green-400 font-semibold">✓ Deposit Verified</p>
          <p className="text-green-300 text-sm mt-2">Your deposit of ${amount} has been verified. Funds will appear in your account shortly.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Debit/Credit Card Deposit</h3>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Step 1: Amount Selection */}
      {step === 'amount' && !verificationCode && (
        <form onSubmit={handleAmountSubmit} className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-400 font-semibold">Step 1: Enter Deposit Amount</p>
            <p className="text-blue-300 text-sm mt-1">Start by specifying how much you want to deposit</p>
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
            Proceed to Payment Details
          </button>
        </form>
      )}

      {/* Step 2: Payment Details */}
      {step === 'payment' && !verificationCode && (
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="bg-green-500/10 border border-green-500 rounded-lg p-4">
            <p className="text-green-400 font-semibold">Step 2: Enter Your Card Details</p>
            <p className="text-green-300 text-sm mt-1">Amount: <span className="font-bold">${amount}</span></p>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Cardholder Name</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="Full name on card"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="1234 5678 9012 3456"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-semibold mb-2">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="MM/YY"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-white font-semibold mb-2">CVV</label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="123"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep('amount')}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Verification Code */}
      {step === 'verification' && currentDepositId && (
        <div className="space-y-4">
          <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-4">
            <p className="text-purple-400 font-semibold">Step 3: Verify Your Identity</p>
            <p className="text-purple-300 text-sm mt-2">A verification code has been sent to your email</p>
            <p className="text-purple-300 text-sm">Your account will be credited once verification is complete</p>
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              maxLength="6"
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
            />
          </div>

          <div className={`p-3 rounded-lg text-center ${
            timeLeft > 60 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
          } font-semibold`}>
            Time remaining: {formatTime(timeLeft)}
            {timeLeft === 0 && <p className="text-sm mt-1">Verification code expired. Please try again.</p>}
          </div>

          <button
            onClick={handleVerifyCode}
            disabled={loading || verificationCode.length !== 6 || timeLeft === 0}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Verifying...' : 'Complete Verification'}
          </button>
        </div>
      )}
    </div>
  );
}
