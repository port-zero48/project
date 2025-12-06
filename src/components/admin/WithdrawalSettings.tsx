import { useState } from 'react';
import { Settings, Save } from 'lucide-react';

interface WithdrawalConfig {
  method_type: 'card' | 'transfer' | 'crypto';
  card_holder_name?: string;
  card_last_digits?: string;
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  account_holder_name?: string;
  crypto_type?: string;
  wallet_address?: string;
  is_active: boolean;
}

export default function WithdrawalSettings() {
  const [settings, setSettings] = useState<WithdrawalConfig[]>([
    {
      method_type: 'card',
      card_holder_name: '',
      card_last_digits: '',
      is_active: true
    },
    {
      method_type: 'transfer',
      bank_name: '',
      account_number: '',
      routing_number: '',
      account_holder_name: '',
      is_active: true
    },
    {
      method_type: 'crypto',
      crypto_type: 'bitcoin',
      wallet_address: '',
      is_active: true
    }
  ]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = (index: number, field: string, value: any) => {
    const updated = [...settings];
    updated[index] = { ...updated[index], [field]: value };
    setSettings(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Call API to save settings
      setMessage({ type: 'success', text: 'Withdrawal settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-white">Withdrawal Methods Configuration</h2>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Card Withdrawal */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <span>💳 Card Withdrawal</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Card Holder Name</label>
              <input
                type="text"
                value={settings[0].card_holder_name || ''}
                onChange={(e) => handleUpdate(0, 'card_holder_name', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., John Doe"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Card Last 4 Digits</label>
              <input
                type="text"
                value={settings[0].card_last_digits || ''}
                onChange={(e) => handleUpdate(0, 'card_last_digits', e.target.value.slice(-4))}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1234"
                maxLength={4}
              />
            </div>
          </div>
        </div>

        {/* Bank Transfer */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <span>🏦 Bank Transfer</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Bank Name</label>
              <input
                type="text"
                value={settings[1].bank_name || ''}
                onChange={(e) => handleUpdate(1, 'bank_name', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Chase Bank"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Account Holder Name</label>
              <input
                type="text"
                value={settings[1].account_holder_name || ''}
                onChange={(e) => handleUpdate(1, 'account_holder_name', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Business Account"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Account Number</label>
              <input
                type="text"
                value={settings[1].account_number || ''}
                onChange={(e) => handleUpdate(1, 'account_number', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 1234567890"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Routing Number</label>
              <input
                type="text"
                value={settings[1].routing_number || ''}
                onChange={(e) => handleUpdate(1, 'routing_number', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 021000021"
              />
            </div>
          </div>
        </div>

        {/* Cryptocurrency */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold text-white mb-4 flex items-center space-x-2">
            <span>₿ Cryptocurrency</span>
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Cryptocurrency Type</label>
              <select
                value={settings[2].crypto_type || 'bitcoin'}
                onChange={(e) => handleUpdate(2, 'crypto_type', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="bitcoin">Bitcoin</option>
                <option value="ethereum">Ethereum</option>
                <option value="litecoin">Litecoin</option>
                <option value="usdc">USDC</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Wallet Address</label>
              <textarea
                value={settings[2].wallet_address || ''}
                onChange={(e) => handleUpdate(2, 'wallet_address', e.target.value)}
                className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Paste the wallet address here"
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );
}
