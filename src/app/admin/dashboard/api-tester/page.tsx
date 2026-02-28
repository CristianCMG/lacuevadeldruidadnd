'use client';

import { useState } from 'react';
import { API_REGISTRY, ApiEndpoint } from '@/config/api-registry';
import { Play, Loader2, Code, FileJson } from 'lucide-react';

export default function ApiTesterPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);

  const handleSelect = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setRequestBody(endpoint.body ? JSON.stringify(endpoint.body, null, 2) : '');
    setResponse(null);
    setStatus(null);
  };

  const executeRequest = async () => {
    if (!selectedEndpoint) return;

    setLoading(true);
    setResponse(null);
    setStatus(null);

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (selectedEndpoint.method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const res = await fetch(selectedEndpoint.path, options);
      setStatus(res.status);

      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setResponse(data);
      } else {
        const text = await res.text();
        setResponse(text);
      }
    } catch (error) {
      setResponse({ error: 'Failed to execute request', details: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6">
      {/* Sidebar: Endpoint List */}
      <div className="w-1/3 bg-gray-800 rounded-lg border border-gray-700 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-700 bg-gray-800">
          <h3 className="font-semibold text-white">Endpoints</h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {API_REGISTRY.map((endpoint, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(endpoint)}
              className={`w-full text-left px-3 py-2 rounded text-sm flex items-center gap-2 transition-colors ${
                selectedEndpoint === endpoint ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold w-12 text-center ${
                endpoint.method === 'GET' ? 'bg-blue-900/50 text-blue-400' :
                endpoint.method === 'POST' ? 'bg-green-900/50 text-green-400' :
                endpoint.method === 'PUT' ? 'bg-yellow-900/50 text-yellow-400' :
                'bg-red-900/50 text-red-400'
              }`}>
                {endpoint.method}
              </span>
              <span className="truncate">{endpoint.path}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Request/Response */}
      <div className="w-2/3 flex flex-col gap-6">
        {selectedEndpoint ? (
          <>
            {/* Request Panel */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">{selectedEndpoint.method}</span>
                  <code className="bg-gray-900 px-2 py-1 rounded text-primary">{selectedEndpoint.path}</code>
                </div>
                <button
                  onClick={executeRequest}
                  disabled={loading}
                  className="bg-primary hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-bold transition-colors"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  Send Request
                </button>
              </div>

              {selectedEndpoint.method !== 'GET' && (
                <div className="flex-1 flex flex-col">
                  <label className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                    <Code className="h-3 w-3" /> Request Body (JSON)
                  </label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="flex-1 w-full bg-gray-900 border border-gray-700 rounded p-3 text-sm font-mono text-gray-300 focus:outline-none focus:border-primary resize-none"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>

            {/* Response Panel */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex-1 flex flex-col overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs text-gray-400 flex items-center gap-1">
                  <FileJson className="h-3 w-3" /> Response
                </label>
                {status && (
                  <span className={`text-xs px-2 py-1 rounded font-bold ${
                    status >= 200 && status < 300 ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    Status: {status}
                  </span>
                )}
              </div>
              <div className="flex-1 bg-gray-900 rounded border border-gray-700 p-3 overflow-auto">
                {response ? (
                  <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap">
                    {typeof response === 'object' ? JSON.stringify(response, null, 2) : response}
                  </pre>
                ) : (
                  <p className="text-gray-600 text-sm italic text-center mt-10">No response yet</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an endpoint to verify</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
