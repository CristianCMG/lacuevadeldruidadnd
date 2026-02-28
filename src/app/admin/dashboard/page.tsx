'use client';

import { Activity, Server, Clock, ShieldCheck } from 'lucide-react';
import StatusCard from '@/components/admin/StatusCard';
import ServiceHealth from '@/components/admin/ServiceHealth';
import { useEffect } from 'react';

export default function DashboardPage() {
  useEffect(() => {
    // Fetch config to verify admin access and get basic info
    // Ideally this would be a real health check endpoint
    const fetchHealth = async () => {
      try {
        // In a real implementation, we'd call /api/admin/health
        // For now, we simulate a load
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (e) {
        console.error(e);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatusCard 
          title="API Status" 
          value="Online" 
          subtitle="99.9% Uptime" 
          icon={Activity} 
          status="success" 
        />
        <StatusCard 
          title="Avg Latency" 
          value="124ms" 
          subtitle="-12ms vs yesterday" 
          icon={Clock} 
          status="success" 
        />
        <StatusCard 
          title="Active Integrations" 
          value="3" 
          subtitle="MeLi, MP, Hostinger" 
          icon={Server} 
          status="neutral" 
        />
        <StatusCard 
          title="Security" 
          value="Secured" 
          subtitle="HTTPS Enforced" 
          icon={ShieldCheck} 
          status="success" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ServiceHealth />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-left px-4 py-3 rounded-lg text-sm text-gray-300 transition-colors">
              Run Smoke Tests
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-left px-4 py-3 rounded-lg text-sm text-gray-300 transition-colors">
              Refresh MeLi Token
            </button>
            <button className="w-full bg-gray-700 hover:bg-gray-600 text-left px-4 py-3 rounded-lg text-sm text-gray-300 transition-colors">
              View Error Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
