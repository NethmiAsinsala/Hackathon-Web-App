import './App.css'
import IncidentMap from './components/IncidentMap'

function App() {
  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between shrink-0">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Project Aegis</h1>
            <p className="text-xs text-slate-400">Disaster Response Command Center</p>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
          <span className="text-sm text-slate-300">Live Connected</span>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT: Map Panel (66%) */}
        <section className="w-2/3 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              📍 Live Incident Map
            </h2>
          </div>
          <div className="flex-1">
            <IncidentMap />
          </div>
        </section>

        {/* RIGHT: Live Feed Panel (33%) */}
        <section className="w-1/3 bg-slate-800 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              📋 Live Incident Feed
            </h2>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
              0 Active
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {/* Placeholder Incidents */}
            <div className="space-y-3">
              <div className="bg-slate-700/50 rounded-lg p-3 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">🌊 Flood</span>
                  <span className="text-xs text-red-400 font-semibold">HIGH</span>
                </div>
                <p className="text-xs text-slate-400">Ratnapura District</p>
                <p className="text-xs text-slate-500 mt-1">2 mins ago</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">🏚️ Landslide</span>
                  <span className="text-xs text-yellow-400 font-semibold">MEDIUM</span>
                </div>
                <p className="text-xs text-slate-400">Kiriella Area</p>
                <p className="text-xs text-slate-500 mt-1">5 mins ago</p>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">🚑 Medical</span>
                  <span className="text-xs text-blue-400 font-semibold">LOW</span>
                </div>
                <p className="text-xs text-slate-400">Eheliyagoda</p>
                <p className="text-xs text-slate-500 mt-1">12 mins ago</p>
              </div>
            </div>

            {/* Empty State (will show when no incidents) */}
            <div className="hidden flex-col items-center justify-center h-full text-slate-500">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm">No active incidents</p>
              <p className="text-xs">Waiting for field reports...</p>
            </div>
          </div>

          {/* Stats Footer */}
          <div className="border-t border-slate-700 px-4 py-3 bg-slate-900/30">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-red-400">3</p>
                <p className="text-xs text-slate-500">Critical</p>
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">5</p>
                <p className="text-xs text-slate-500">Pending</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-400">12</p>
                <p className="text-xs text-slate-500">Resolved</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
