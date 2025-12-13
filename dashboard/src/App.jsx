import './App.css'
import IncidentMap from './components/IncidentMap'
import LiveFeed from './components/LiveFeed'
import useReports from './hooks/useReports'

function App() {
  // Real-time Firebase listener
  const { reports, loading, error } = useReports()

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

        {/* Connection Status - Dynamic based on Firebase state */}
        <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-full">
          {loading ? (
            <>
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-slate-300">Connecting...</span>
            </>
          ) : error ? (
            <>
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span className="text-sm text-red-400">Disconnected</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-slate-300">Live • {reports.length} reports</span>
            </>
          )}
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
            <IncidentMap reports={reports} />
          </div>
        </section>

        {/* RIGHT: Live Feed Panel (33%) */}
        <LiveFeed reports={reports} loading={loading} />
      </main>
    </div>
  )
}

export default App
