import Link from 'next/link';
import { Activity, Server, FileText, Settings, LogOut, LayoutDashboard, TestTube } from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary font-display">Druida Admin</h1>
          <p className="text-xs text-gray-400 mt-1">DevTools & Monitoring</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            Overview
          </Link>
          <Link href="/admin/dashboard/api-tester" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
            <Server className="h-5 w-5 mr-3" />
            API Explorer
          </Link>
          <Link href="/admin/dashboard/tests" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
            <TestTube className="h-5 w-5 mr-3" />
            Integration Tests
          </Link>
          <Link href="/admin/dashboard/logs" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
            <FileText className="h-5 w-5 mr-3" />
            System Logs
          </Link>
          <Link href="/admin/dashboard/settings" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <Link href="/" className="flex items-center px-4 py-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut className="h-5 w-5 mr-3" />
            Exit to Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-900/50 text-green-400 text-xs rounded border border-green-800">
              Environment: Production (Simulated)
            </span>
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
