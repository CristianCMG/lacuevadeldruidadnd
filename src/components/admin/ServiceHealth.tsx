'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number;
}

export default function ServiceHealth() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Database (Postgres)', status: 'operational', latency: 45 },
    { name: 'Auth Service', status: 'operational', latency: 120 },
    { name: 'Mercado Libre API', status: 'operational', latency: 350 },
    { name: 'Hostinger Storage', status: 'degraded', latency: 800 },
  ]);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-700">
        <h3 className="font-semibold text-white">System Health</h3>
      </div>
      <div className="divide-y divide-gray-700">
        {services.map((service) => (
          <div key={service.name} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              {service.status === 'operational' && <CheckCircle className="h-5 w-5 text-green-500 mr-3" />}
              {service.status === 'degraded' && <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />}
              {service.status === 'down' && <XCircle className="h-5 w-5 text-red-500 mr-3" />}
              <span className="text-gray-200">{service.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 font-mono">{service.latency}ms</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                service.status === 'operational' ? 'bg-green-900/30 text-green-400' :
                service.status === 'degraded' ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {service.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
