export default function SettingsPage() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
      
      <div className="space-y-8">
        <section>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Environment Variables</h3>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Mercado Libre App ID</label>
              <input type="text" value="3315***********" disabled className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Hostinger Token Path</label>
              <input type="text" value="/secure/storage/tokens.enc" disabled className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-500 cursor-not-allowed" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Dashboard Preferences</h3>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Auto-refresh Dashboard</p>
                <p className="text-xs text-gray-400">Update metrics every 30 seconds</p>
              </div>
              <div className="h-6 w-11 bg-green-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Dark Mode</p>
                <p className="text-xs text-gray-400">Always active for Admin Panel</p>
              </div>
              <div className="h-6 w-11 bg-gray-600 rounded-full relative cursor-not-allowed opacity-50">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
