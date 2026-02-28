'use client';

import { useState } from 'react';
import { Play, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  duration: number;
}

export default function IntegrationTestsPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      const res = await fetch('/api/admin/tests/run', { method: 'POST' });
      const data = await res.json();
      setResults(data.results);
    } catch (error) {
      console.error('Failed to run tests', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Integration Suite</h2>
          <p className="text-gray-400 text-sm">Run server-side validation checks against the live environment.</p>
        </div>
        <button
          onClick={runTests}
          disabled={loading}
          className="bg-primary hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-lg shadow-red-900/20"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
          Run All Tests
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        {results.length === 0 && !loading && (
          <div className="p-12 text-center text-gray-500">
            <Play className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Click "Run All Tests" to start the suite.</p>
          </div>
        )}

        {loading && results.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-primary" />
            <p>Running validation checks...</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="divide-y divide-gray-700">
            {results.map((result, idx) => (
              <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-750 transition-colors">
                <div className="flex items-center gap-4">
                  {result.status === 'pass' && <CheckCircle className="h-6 w-6 text-green-500" />}
                  {result.status === 'fail' && <XCircle className="h-6 w-6 text-red-500" />}
                  {result.status === 'warn' && <AlertTriangle className="h-6 w-6 text-yellow-500" />}
                  
                  <div>
                    <h4 className="text-white font-medium">{result.name}</h4>
                    <p className={`text-sm ${
                      result.status === 'fail' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {result.message}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-gray-500">{result.duration}ms</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
