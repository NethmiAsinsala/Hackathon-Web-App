import { useState, useMemo, useEffect } from 'react'
import './App.css'
import IncidentMap from './components/IncidentMap'
import LiveFeed from './components/LiveFeed'
import AnalyticsPanel from './components/AnalyticsPanel'
import useReports from './hooks/useReports'
import useAlertSound from './hooks/useAlertSound'
import useOnlineStatus from './hooks/useOnlineStatus'
import { SEVERITY_COLORS, SEVERITY_BG_COLORS, SEVERITY_BORDER_COLORS } from './constants/colors'
import { 
  WifiOff, 
  BarChart3, 
  Loader2, 
  Shield, 
  MapPin, 
  Bell, 
  BellRing, 
  Volume2, 
  VolumeX,
  LayoutDashboard 
} from 'lucide-react'

// Severity filter options
const SEVERITY_OPTIONS = ['All', 'Critical', 'High', 'Medium', 'Low']

// Offline Banner Component
function OfflineBanner() {
  return (
    <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium animate-pulse flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      You are offline. Some features may not work correctly.
    </div>
  )
}

// Stats Header Component
function StatsHeader({ reports, loading }) {
  // Calculate stats
  const stats = useMemo(() => {
    // Unresolved reports only for severity breakdown (active issues)
    const unresolvedReports = reports.filter(r => r.status !== 'Resolved')
    
    const critical = unresolvedReports.filter(r => r.severity === 'Critical').length
    const high = unresolvedReports.filter(r => r.severity === 'High').length
    const medium = unresolvedReports.filter(r => r.severity === 'Medium').length
    const low = unresolvedReports.filter(r => r.severity === 'Low').length
    
    // Status breakdown (all reports)
    const pending = reports.filter(r => r.status === 'Pending' || !r.status).length
    const inProgress = reports.filter(r => r.status === 'In Progress').length
    const resolved = reports.filter(r => r.status === 'Resolved').length
    
    // Active alerts = Critical/High severity reports that are NOT resolved
    const activeAlerts = critical + high
    
    return { 
      total: reports.length, 
      critical, 
      high, 
      medium, 
      low,
      pending,
      inProgress,
      resolved,
      activeAlerts
    }
  }, [reports])

  if (loading) {
    return (
      <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-2">
        <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading statistics...
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800/50 border-b border-slate-700 px-6 py-2 shrink-0">
      <div className="flex items-center justify-between">
        {/* Left: Report Counts by Severity */}
        <div className="flex items-center gap-4">
          {/* Total Reports */}
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg">
            <BarChart3 className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-lg font-bold text-white leading-none">{stats.total}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-700"></div>

          {/* Severity Breakdown */}
          <div className="flex items-center gap-3">
            {/* Critical */}
            <div 
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${stats.critical > 0 ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: stats.critical > 0 ? SEVERITY_BG_COLORS.Critical : 'rgba(51, 65, 85, 0.3)' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS.Critical }}></span>
              <span className="text-xs text-slate-400">Critical</span>
              <span className="text-sm font-bold" style={{ color: stats.critical > 0 ? SEVERITY_COLORS.Critical : '#64748b' }}>{stats.critical}</span>
            </div>

            {/* High */}
            <div 
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ backgroundColor: stats.high > 0 ? SEVERITY_BG_COLORS.High : 'rgba(51, 65, 85, 0.3)' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS.High }}></span>
              <span className="text-xs text-slate-400">High</span>
              <span className="text-sm font-bold" style={{ color: stats.high > 0 ? SEVERITY_COLORS.High : '#64748b' }}>{stats.high}</span>
            </div>

            {/* Medium */}
            <div 
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ backgroundColor: stats.medium > 0 ? SEVERITY_BG_COLORS.Medium : 'rgba(51, 65, 85, 0.3)' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS.Medium }}></span>
              <span className="text-xs text-slate-400">Medium</span>
              <span className="text-sm font-bold" style={{ color: stats.medium > 0 ? SEVERITY_COLORS.Medium : '#64748b' }}>{stats.medium}</span>
            </div>

            {/* Low */}
            <div 
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{ backgroundColor: stats.low > 0 ? SEVERITY_BG_COLORS.Low : 'rgba(51, 65, 85, 0.3)' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SEVERITY_COLORS.Low }}></span>
              <span className="text-xs text-slate-400">Low</span>
              <span className="text-sm font-bold" style={{ color: stats.low > 0 ? SEVERITY_COLORS.Low : '#64748b' }}>{stats.low}</span>
            </div>
          </div>
        </div>

        {/* Right: Status Breakdown */}
        <div className="flex items-center gap-3">
          {/* Pending */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-orange-500/10">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span className="text-xs text-slate-400">Pending</span>
            <span className={`text-sm font-bold ${stats.pending > 0 ? 'text-orange-400' : 'text-slate-500'}`}>{stats.pending}</span>
          </div>

          {/* In Progress */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-xs text-slate-400">In Progress</span>
            <span className={`text-sm font-bold ${stats.inProgress > 0 ? 'text-blue-400' : 'text-slate-500'}`}>{stats.inProgress}</span>
          </div>

          {/* Resolved */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-slate-400">Resolved</span>
            <span className={`text-sm font-bold ${stats.resolved > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>{stats.resolved}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  // Real-time Firebase listener
  const { reports, loading, error, newReport, updateReportStatus } = useReports()
  
  // Audio alert hook
  const { playAlert, testSound, isUnlocked, stopAlarm } = useAlertSound()
  
  // Online status hook
  const isOnline = useOnlineStatus()
  
  // Sound enabled state
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Track selected report for map focus
  const [selectedReportId, setSelectedReportId] = useState(null)
  
  // Severity filter state
  const [severityFilter, setSeverityFilter] = useState('All')
  
  // Analytics panel visibility
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Play alert when new critical/high report arrives
  useEffect(() => {
    if (newReport && soundEnabled) {
      playAlert(newReport.severity)
    }
  }, [newReport, soundEnabled, playAlert])

  // Filter reports based on selected severity
  const filteredReports = useMemo(() => {
    if (severityFilter === 'All') return reports
    return reports.filter(report => report.severity === severityFilter)
  }, [reports, severityFilter])

  // Handle report click from LiveFeed
  const handleReportClick = (reportId) => {
    // Stop any playing alarm sound (acknowledge the alert)
    stopAlarm()
    
    setSelectedReportId(reportId)
    // Reset after animation completes
    setTimeout(() => setSelectedReportId(null), 2000)
  }

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* ===== OFFLINE BANNER ===== */}
      {!isOnline && <OfflineBanner />}
      
      {/* ===== HEADER ===== */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between shrink-0">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Project Aegis</h1>
            <p className="text-xs text-slate-400">Disaster Response Command Center</p>
          </div>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filter:</span>
          <div className="flex gap-1">
            {SEVERITY_OPTIONS.map((severity) => {
              const isActive = severityFilter === severity
              
              // Get button styles based on severity and active state
              const getButtonStyle = () => {
                if (severity === 'All') {
                  return isActive 
                    ? { backgroundColor: '#475569', color: 'white' }
                    : { backgroundColor: 'rgba(51, 65, 85, 0.5)', color: '#94a3b8' }
                }
                const color = SEVERITY_COLORS[severity]
                const bgColor = SEVERITY_BG_COLORS[severity]
                return isActive
                  ? { backgroundColor: color, color: 'white' }
                  : { backgroundColor: bgColor, color: color }
              }
              
              return (
                <button
                  key={severity}
                  onClick={() => setSeverityFilter(severity)}
                  className="px-3 py-1 text-xs font-medium rounded-full transition-colors hover:opacity-80"
                  style={getButtonStyle()}
                >
                  {severity}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right side: Analytics + Sound Toggle + Connection Status */}
        <div className="flex items-center gap-3">
          {/* Analytics Button */}
          <button
            onClick={() => setShowAnalytics(true)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-full transition-colors"
            title="Open Analytics Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-xs font-medium hidden sm:inline">Analytics</span>
          </button>

          {/* Test Sound Button - Click to unlock audio */}
          <button
            onClick={testSound}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
              isUnlocked
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 animate-pulse'
            }`}
            title={isUnlocked ? 'Click to test alert sound' : 'Click to enable sound alerts'}
          >
            {isUnlocked ? <Volume2 className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
            <span className="text-xs font-medium hidden sm:inline">
              {isUnlocked ? 'Test Sound' : 'Enable Sound'}
            </span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
              soundEnabled 
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                : 'bg-slate-700/50 text-slate-500 hover:bg-slate-700'
            }`}
            title={soundEnabled ? 'Sound alerts ON - Click to mute' : 'Sound alerts OFF - Click to enable'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            <span className="text-xs font-medium hidden sm:inline">
              {soundEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

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
        </div>
      </header>

      {/* ===== STATS HEADER ===== */}
      <StatsHeader reports={reports} loading={loading} />

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 flex overflow-hidden">
        {/* LEFT: Map Panel (66%) */}
        <section className="w-2/3 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Live Incident Map
            </h2>
            {severityFilter !== 'All' && (
              <span className="text-xs text-slate-400">
                Showing {filteredReports.length} of {reports.length} reports
              </span>
            )}
          </div>
          <div className="flex-1">
            <IncidentMap reports={filteredReports} selectedReportId={selectedReportId} />
          </div>
        </section>

        {/* RIGHT: Live Feed Panel (33%) */}
        <LiveFeed 
          reports={filteredReports}
          allReports={reports}
          loading={loading} 
          onReportClick={handleReportClick}
          selectedReportId={selectedReportId}
          newReportId={newReport?.id}
          onStatusChange={updateReportStatus}
        />
      </main>

      {/* ===== ANALYTICS MODAL ===== */}
      {showAnalytics && (
        <AnalyticsPanel 
          reports={reports} 
          onClose={() => setShowAnalytics(false)} 
        />
      )}
    </div>
  )
}

export default App
