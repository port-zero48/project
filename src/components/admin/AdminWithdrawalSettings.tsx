import { useState, useEffect } from 'react';
import { DollarSign, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/auth';

interface WithdrawalSettings {
  id: string;
  withdrawal_fee: number;
  admin_bank_name: string;
  admin_account_number: string;
  admin_account_holder: string;
  admin_routing_number: string;
  updated_at: string;
}

export default function AdminWithdrawalSettings() {
  const [settings, setSettings] = useState<WithdrawalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    withdrawal_fee: 0,
    admin_bank_name: '',
    admin_account_number: '',
    admin_account_holder: '',
    admin_routing_number: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get existing settings (there should only be one row)
      const { data, error: fetchError } = await supabase
        .from('withdrawal_settings')
        .select('*')
        .single();

      if (fetchError) {
        // If table doesn't exist (404) or no rows, show empty form to create
        if (fetchError.code === 'PGRST116' || fetchError.message?.includes('not found')) {
          console.log('Withdrawal settings table not found or empty - starting fresh');
          setSettings(null);
          setFormData({
            withdrawal_fee: 0,
            admin_bank_name: '',
            admin_account_number: '',
            admin_account_holder: '',
            admin_routing_number: '',
          });
        } else {
          throw fetchError;
        }
      } else if (data) {
        setSettings(data);
        setFormData({
          withdrawal_fee: data.withdrawal_fee,
          admin_bank_name: data.admin_bank_name,
          admin_account_number: data.admin_account_number,
          admin_account_holder: data.admin_account_holder,
          admin_routing_number: data.admin_routing_number,
        });
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      // Don't block if table doesn't exist
      if (err instanceof Error && err.message.includes('404')) {
        setError('Withdrawal settings table not yet created. Please run the migration first.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (!formData.withdrawal_fee || formData.withdrawal_fee < 0) {
        setError('Please enter a valid withdrawal fee');
        setSaving(false);
        return;
      }

      if (!formData.admin_bank_name || !formData.admin_account_number || !formData.admin_account_holder) {
        setError('Please fill in all required bank details');
        setSaving(false);
        return;
      }

      if (settings) {
        // Update existing
        const { error: updateError, data } = await supabase
          .from('withdrawal_settings')
          .update({
            withdrawal_fee: formData.withdrawal_fee,
            admin_bank_name: formData.admin_bank_name,
            admin_account_number: formData.admin_account_number,
            admin_account_holder: formData.admin_account_holder,
            admin_routing_number: formData.admin_routing_number,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (updateError) {
          console.error('Update error:', updateError);
          throw updateError;
        }
        console.log('Updated:', data);
      } else {
        // Insert new
        const { error: insertError, data } = await supabase
          .from('withdrawal_settings')
          .insert([{
            withdrawal_fee: formData.withdrawal_fee,
            admin_bank_name: formData.admin_bank_name,
            admin_account_number: formData.admin_account_number,
            admin_account_holder: formData.admin_account_holder,
            admin_routing_number: formData.admin_routing_number,
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        console.log('Inserted:', data);
      }

      setSuccess('Withdrawal settings saved successfully!');
      setTimeout(() => {
        loadSettings();
      }, 500);
    } catch (err) {
      console.error('Error saving settings:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to save settings';
      if (errorMsg.includes('404')) {
        setError('Withdrawal settings table not found. Please ensure the migration has been run.');
      } else if (errorMsg.includes('permission')) {
        setError('You do not have permission to save withdrawal settings. Ensure you are logged in as the admin.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'withdrawal_fee' ? parseFloat(value as string) || 0 : value,
    }));
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-6">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <DollarSign className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold text-white">Withdrawal Settings</h2>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="space-y-6">
        {/* Withdrawal Fee Section */}
        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Fee</h3>
          <p className="text-gray-400 text-sm mb-4">
            This fee will be charged for every withdrawal request and displayed to users
          </p>

          <div>
            <label className="block text-white font-semibold mb-2">Fee Amount (USD)</label>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">$</span>
              <input
                type="number"
                value={formData.withdrawal_fee}
                onChange={(e) => handleInputChange('withdrawal_fee', e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Admin Bank Details Section */}
        <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
          <h3 className="text-lg font-semibold text-white mb-4">Your Bank Account Details</h3>
          <p className="text-gray-400 text-sm mb-4">
            These details will be shown to users so they know where to send their payment proof
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-white font-semibold mb-2">Bank Name *</label>
              <input
                type="text"
                value={formData.admin_bank_name}
                onChange={(e) => handleInputChange('admin_bank_name', e.target.value)}
                placeholder="e.g., Chase Bank"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Account Holder Name *</label>
              <input
                type="text"
                value={formData.admin_account_holder}
                onChange={(e) => handleInputChange('admin_account_holder', e.target.value)}
                placeholder="Your full name"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Account Number *</label>
              <input
                type="text"
                value={formData.admin_account_number}
                onChange={(e) => handleInputChange('admin_account_number', e.target.value)}
                placeholder="Your account number"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Routing Number (Optional)</label>
              <input
                type="text"
                value={formData.admin_routing_number}
                onChange={(e) => handleInputChange('admin_routing_number', e.target.value)}
                placeholder="Your routing number"
                className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {formData.admin_bank_name && (
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-400 mb-4">Preview (What Users Will See)</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">Withdrawal Fee: <span className="text-white font-semibold">${formData.withdrawal_fee.toFixed(2)}</span></p>
              <p className="text-gray-300">Bank Name: <span className="text-white font-semibold">{formData.admin_bank_name}</span></p>
              <p className="text-gray-300">Account Holder: <span className="text-white font-semibold">{formData.admin_account_holder}</span></p>
              <p className="text-gray-300">Account Number: <span className="text-white font-semibold">{formData.admin_account_number}</span></p>
              {formData.admin_routing_number && (
                <p className="text-gray-300">Routing Number: <span className="text-white font-semibold">{formData.admin_routing_number}</span></p>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
