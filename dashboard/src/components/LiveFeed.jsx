// LiveFeed Component - Real-time incident table
// ==============================================
import { SEVERITY_COLORS, getSeverityStyles } from '../constants/colors'

// Helper function to format timestamp
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown'
  
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

// Get severity badge inline styles using centralized colors
const getSeverityBadgeStyle = (severity) => {
  return getSeverityStyles(severity)
}

// Get status badge (you can customize based on your data)
const getStatusBadge = (status) => {
  switch (status) {
    case 'Resolved':
      return 'bg-emerald-500/20 text-emerald-400'
    case 'In Progress':
      return 'bg-blue-500/20 text-blue-400'
    default:
      return 'bg-orange-500/20 text-orange-400'
  }
}

function LiveFeed({ reports = [], allReports = null, loading = false, onReportClick = null, selectedReportId = null, newReportId = null, onStatusChange = null }) {
  // Use allReports for stats if provided, otherwise use filtered reports
  const statsSource = allReports || reports
  
  // Calculate stats from all reports (not filtered)
  const stats = {
    critical: statsSource.filter(r => r.severity === 'Critical').length,
    high: statsSource.filter(r => r.severity === 'High').length,
    medium: statsSource.filter(r => r.severity === 'Medium').length,
    low: statsSource.filter(r => r.severity === 'Low').length,
  }

  return (
    <section className="w-1/3 bg-slate-800 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          📋 Live Feed
        </h2>
        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/30">
          {reports.length} Reports
        </span>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="text-4xl mb-2 animate-pulse">⏳</div>
            <p className="text-sm">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="text-4xl mb-2">📭</div>
            <p className="text-sm">No active incidents</p>
            <p className="text-xs">Waiting for field reports...</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-slate-900/50 sticky top-0">
              <tr className="text-slate-400 uppercase">
                <th className="px-3 py-2 text-left font-medium">Type</th>
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-center font-medium">Severity</th>
                <th className="px-3 py-2 text-center font-medium">Status</th>
                <th className="px-3 py-2 text-center font-medium">Action</th>
                <th className="px-3 py-2 text-right font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {reports.map((report, index) => {
                const isSelected = selectedReportId === report.id
                const hasLocation = report.latitude && report.longitude
                const isNewReport = newReportId === report.id
                
                // Get animation class based on severity
                const getAnimationClass = () => {
                  if (!isNewReport) return ''
                  switch (report.severity) {
                    case 'Critical': return 'animate-new-report-critical'
                    case 'High': return 'animate-new-report-high'
                    case 'Medium': return 'animate-new-report-medium'
                    case 'Low': return 'animate-new-report-low'
                    default: return 'animate-new-report'
                  }
                }
                
                return (
                  <tr 
                    key={report.id} 
                    onClick={() => hasLocation && onReportClick?.(report.id)}
                    className={`transition-colors ${getAnimationClass()} ${hasLocation ? 'cursor-pointer hover:bg-slate-700/30' : 'cursor-not-allowed opacity-60'} ${
                      isSelected ? 'bg-emerald-500/20 border-l-2 border-l-emerald-400' : index === 0 && !isNewReport ? 'bg-slate-700/20' : ''
                    }`}
                    title={hasLocation ? 'Click to view on map' : 'No location data'}
                  >
                  <td className="px-3 py-2.5 text-white font-medium whitespace-nowrap">
                    {report.type || 'Unknown'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-300">
                    <div className="max-w-[180px] break-words line-clamp-2" title={report.description}>
                      {report.description || '-'}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                      style={getSeverityBadgeStyle(report.severity)}
                    >
                      {report.severity || 'N/A'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getStatusBadge(report.status)}`}>
                      {report.status || 'Pending'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {/* Status Action Buttons */}
                    {(!report.status || report.status === 'Pending') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onStatusChange?.(report.id, 'In Progress')
                        }}
                        className="px-2 py-1 text-[10px] font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/40 rounded transition-colors border border-blue-500/30"
                        title="Mark as In Progress"
                      >
                        ▶ Start
                      </button>
                    )}
                    {report.status === 'In Progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onStatusChange?.(report.id, 'Resolved')
                        }}
                        className="px-2 py-1 text-[10px] font-medium bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 rounded transition-colors border border-emerald-500/30"
                        title="Mark as Resolved"
                      >
                        ✓ Resolve
                      </button>
                    )}
                    {report.status === 'Resolved' && (
                      <span className="text-[10px] text-slate-500">✓ Done</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-500 whitespace-nowrap">
                    {formatTimeAgo(report.timestamp)}
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats Footer */}
      <div className="border-t border-slate-700 px-4 py-3 bg-slate-900/30">
        <div className="grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-lg font-bold" style={{ color: SEVERITY_COLORS.Critical }}>{stats.critical}</p>
            <p className="text-xs text-slate-500">Critical</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: SEVERITY_COLORS.High }}>{stats.high}</p>
            <p className="text-xs text-slate-500">High</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: SEVERITY_COLORS.Medium }}>{stats.medium}</p>
            <p className="text-xs text-slate-500">Medium</p>
          </div>
          <div>
            <p className="text-lg font-bold" style={{ color: SEVERITY_COLORS.Low }}>{stats.low}</p>
            <p className="text-xs text-slate-500">Low</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LiveFeed
