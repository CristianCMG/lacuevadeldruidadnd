'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
}

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('');

  // Mock log generation
  useEffect(() => {
    const mockLogs: LogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'System startup complete', source: 'System' },
      { id: '2', timestamp: new Date(Date.now() - 10000).toISOString(), level: 'warn', message: 'High latency on MeLi API', source: 'Integration' },
      { id: '3', timestamp: new Date(Date.now() - 50000).toISOString(), level: 'info', message: 'User login: admin', source: 'Auth' },
      { id: '4', timestamp: new Date(Date.now() - 120000).toISOString(), level: 'error', message: 'Failed to sync inventory item #442', source: 'SyncWorker' },
    ];
    setLogs(mockLogs);
  }, []);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(filter.toLowerCase()) || 
    log.source.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">System Logs</h2>
        <div className="flex gap-2">
          <button className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded hover:bg-gray-700 flex items-center gap-2 text-sm">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="bg-gray-800 border border-gray-700 text-gray-300 px-3 py-2 rounded hover:bg-gray-700 flex items-center gap-2 text-sm">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input 
          type="text" 
          placeholder="Search logs..." 
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-gray-300 focus:outline-none focus:border-primary"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Logs Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden font-mono text-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-gray-400">
            <tr>
              <th className="px-4 py-2 w-48">Timestamp</th>
              <th className="px-4 py-2 w-24">Level</th>
              <th className="px-4 py-2 w-32">Source</th>
              <th className="px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-2 text-gray-500 whitespace-nowrap">{log.timestamp}</td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold ${
                    log.level === 'info' ? 'bg-blue-900/30 text-blue-400' :
                    log.level === 'warn' ? 'bg-yellow-900/30 text-yellow-400' :
                    log.level === 'error' ? 'bg-red-900/30 text-red-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {log.level}
                  </span>
                </td>
                <td className="px-4 py-2 text-purple-400">{log.source}</td>
                <td className="px-4 py-2 text-gray-300">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-gray-600">No logs found matching your criteria.</div>
        )}
      </div>
    </div>
  );
}
