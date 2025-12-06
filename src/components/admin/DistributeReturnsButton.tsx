import { useState } from 'react';
import { Play, Loader } from 'lucide-react';
import { supabase } from '../../services/auth';

export default function DistributeReturnsButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const triggerDistribution = async () => {
    try {
      setLoading(true);
      setResult(null);

      const { data: session } = await supabase.auth.getSession();
      const token = session?.session?.access_token;

      if (!token) {
        setResult({ error: 'Not authenticated' });
        return;
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/distribute-investment-returns`;

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      console.log('Distribution result:', data);
      setResult(data);
    } catch (err) {
      console.error('Error triggering distribution:', err);
      setResult({ error: err instanceof Error ? err.message : String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-600/20 border border-blue-500/50 rounded-lg p-4 mb-4">
      <button
        onClick={triggerDistribution}
        disabled={loading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition"
      >
        {loading ? (
          <>
            <Loader className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Trigger Distribution Now
          </>
        )}
      </button>

      {result && (
        <div className="mt-3 p-3 bg-black/20 rounded text-sm">
          <pre className="text-gray-300 overflow-auto max-h-40">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
