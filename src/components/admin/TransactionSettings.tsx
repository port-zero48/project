import { useState } from 'react';
import { Save, Clock, Check } from 'lucide-react';
import { updateWithdrawalMethod } from '../../services/transactions';

interface TransactionConfig {
  method: 'transfer' | 'crypto';
  bank_name?: string;
  account_number?: string;
  routing_number?: string;
  account_holder_name?: string;
  crypto_type?: string;
  wallet_address?: string;
  lastSaved?: Date;
  countdown?: number;
}

export default function TransactionSettings() {
  const [config, setConfig] = useState<TransactionConfig[]>([
    {
      method: 'transfer',
      bank_name: '',
      account_number: '',
      routing_number: '',
      account_holder_name: '',
      lastSaved: undefined,
      countdown: 0
    },
    {
      method: 'crypto',
      crypto_type: 'bitcoin',
      wallet_address: '',
      lastSaved: undefined,
      countdown: 0
    }
  ]);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFieldChange = (index: number, field: string, value: string) => {
    const updated = [...config];
    updated[index] = { ...updated[index], [field]: value, countdown: 0 };
    setConfig(updated);
  };

  const handleSave = async (index: number) => {
    try {
      setSaving(true);
      const item = config[index];

      if (item.method === 'transfer') {
        if (!item.bank_name || !item.account_number || !item.routing_number || !item.account_holder_name) {
          setMessage({ type: 'error', text: 'Please fill all transfer details' });
          return;
        }

        await updateWithdrawalMethod('transfer', {
          bank_name: item.bank_name,
          account_number: item.account_number,
          routing_number: item.routing_number,
          account_holder_name: item.account_holder_name,
          is_active: true
        });
      }

      // Mark as saved without countdown
      const updated = [...config];
      updated[index] = {
        ...updated[index],
        lastSaved: new Date()
      };
      setConfig(updated);

      setMessage({ type: 'success', text: `${item.method.charAt(0).toUpperCase() + item.method.slice(1)} details updated successfully!` });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error('Error saving transaction settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Clock className="h-6 w-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Bank Transfer Deposit Settings</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Bank Transfer Settings */}
      <div className="bg-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <span>🏦</span>
            <span>Bank Transfer Details</span>
          </h3>
          {config[0].lastSaved && (
            <div className="flex items-center space-x-2 text-sm text-green-300">
              <Check className="h-4 w-4 text-green-400" />
              <span>Last updated: {new Date(config[0].lastSaved).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Bank Name</label>
            <input
              type="text"
              value={config[0].bank_name || ''}
              onChange={(e) => handleFieldChange(0, 'bank_name', e.target.value)}
              placeholder="e.g., Chase Bank"
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Account Holder Name</label>
            <input
              type="text"
              value={config[0].account_holder_name || ''}
              onChange={(e) => handleFieldChange(0, 'account_holder_name', e.target.value)}
              placeholder="Full name"
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Account Number</label>
            <input
              type="text"
              value={config[0].account_number || ''}
              onChange={(e) => handleFieldChange(0, 'account_number', e.target.value)}
              placeholder="XXXX XXXX XXXX"
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-300 font-semibold mb-2">Routing Number</label>
            <input
              type="text"
              value={config[0].routing_number || ''}
              onChange={(e) => handleFieldChange(0, 'routing_number', e.target.value)}
              placeholder="e.g., 123456789"
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={() => handleSave(0)}
          disabled={saving}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Update Transfer Details'}</span>
        </button>
      </div>

      {/* Info box */}
      <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
        <p className="text-blue-400 text-sm">
          ℹ️ <span className="font-semibold">Note:</span> Update these bank transfer details to display to users during the bank deposit process.
        </p>
      </div>
    </div>
  );
}
