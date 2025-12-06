import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { fetchCryptoSettings, upsertCryptoSetting, deleteCryptoSetting } from '../../services/crypto';

interface CryptoSetting {
  crypto_name: string;
  crypto_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CryptoSettings() {
  const [settings, setSettings] = useState<CryptoSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ cryptoName: '', cryptoAddress: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await fetchCryptoSettings();
      setSettings(data);
    } catch (err) {
      console.error('Error loading crypto settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cryptoName || !formData.cryptoAddress) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await upsertCryptoSetting(formData.cryptoName, formData.cryptoAddress, true);
      alert('Crypto setting saved successfully!');
      setFormData({ cryptoName: '', cryptoAddress: '' });
      setShowForm(false);
      setEditingId(null);
      loadSettings();
    } catch (err) {
      alert('Error saving crypto setting');
      console.error(err);
    }
  };

  const handleEdit = (setting: CryptoSetting) => {
    setFormData({ cryptoName: setting.crypto_name, cryptoAddress: setting.crypto_address });
    setEditingId(setting.crypto_name);
    setShowForm(true);
  };

  const handleDelete = async (cryptoName: string) => {
    if (!window.confirm(`Delete ${cryptoName} setting?`)) return;

    try {
      await deleteCryptoSetting(cryptoName);
      alert('Crypto setting deleted');
      loadSettings();
    } catch (err) {
      alert('Error deleting crypto setting');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setFormData({ cryptoName: '', cryptoAddress: '' });
    setShowForm(false);
    setEditingId(null);
  };

  if (loading) return <div className="text-center py-8">Loading crypto settings...</div>;

  return (
    <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">💰 Crypto Settings</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Plus size={20} /> Add Crypto
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded mb-6 border border-slate-700">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Crypto Name</label>
              <input
                type="text"
                value={formData.cryptoName}
                onChange={(e) => setFormData({ ...formData, cryptoName: e.target.value })}
                disabled={editingId !== null}
                placeholder="e.g., Bitcoin, Ethereum, USDT"
                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Wallet Address</label>
              <textarea
                value={formData.cryptoAddress}
                onChange={(e) => setFormData({ ...formData, cryptoAddress: e.target.value })}
                placeholder="Paste the wallet address here"
                rows={3}
                className="w-full bg-slate-700 text-white px-3 py-2 rounded border border-slate-600 focus:border-blue-500 outline-none font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <Save size={18} /> Save
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded flex items-center gap-2"
              >
                <X size={18} /> Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {settings.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No crypto settings configured. Add one to get started!
        </div>
      ) : (
        <div className="space-y-3">
          {settings.map((setting) => (
            <div key={setting.crypto_name} className="bg-slate-800 p-4 rounded border border-slate-700 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{setting.crypto_name}</h3>
                <p className="text-gray-400 font-mono text-sm break-all">{setting.crypto_address}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Status: <span className={setting.is_active ? 'text-green-400' : 'text-red-400'}>
                    {setting.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(setting)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(setting.crypto_name)}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
