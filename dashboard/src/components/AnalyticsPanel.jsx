// Analytics Panel Component
// ==========================
// Shows charts and statistics for incident data visualization

import { useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import { SEVERITY_COLORS } from '../constants/colors'
import {
  BarChart3,
  Clock,
  FileText,
  CheckCircle2,
  Loader2,
  TrendingUp,
  Zap,
  X,
  PieChart,
  Activity,
  ClipboardList,
  LayoutDashboard
} from 'lucide-react'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Chart default options for dark theme
const darkThemeOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#94a3b8', // slate-400
        font: { size: 11 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#64748b' }, // slate-500
      grid: { color: 'rgba(71, 85, 105, 0.3)' }
    },
    y: {
      ticks: { color: '#64748b' },
      grid: { color: 'rgba(71, 85, 105, 0.3)' }
    }
  }
}

function AnalyticsPanel({ reports = [], onClose }) {
  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date()
    const last24h = reports.filter(r => {
      const reportDate = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp)
      return (now - reportDate) < 24 * 60 * 60 * 1000
    })
    
    const resolved = reports.filter(r => r.status === 'Resolved')
    const avgResponseTime = resolved.length > 0
      ? resolved.reduce((sum, r) => {
          const created = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp)
          const updated = r.updatedAt?.toDate ? r.updatedAt.toDate() : new Date(r.updatedAt || created)
          return sum + (updated - created)
        }, 0) / resolved.length / 60000 // Convert to minutes
      : 0
    
    return {
      total: reports.length,
      last24h: last24h.length,
      resolved: resolved.length,
      pending: reports.filter(r => !r.status || r.status === 'Pending').length,
      inProgress: reports.filter(r => r.status === 'In Progress').length,
      avgResponseTime: Math.round(avgResponseTime),
      resolutionRate: reports.length > 0 ? Math.round((resolved.length / reports.length) * 100) : 0
    }
  }, [reports])

  // Severity breakdown for doughnut chart
  const severityData = useMemo(() => {
    const counts = {
      Critical: reports.filter(r => r.severity === 'Critical').length,
      High: reports.filter(r => r.severity === 'High').length,
      Medium: reports.filter(r => r.severity === 'Medium').length,
      Low: reports.filter(r => r.severity === 'Low').length,
    }
    
    return {
      labels: ['Critical', 'High', 'Medium', 'Low'],
      datasets: [{
        data: [counts.Critical, counts.High, counts.Medium, counts.Low],
        backgroundColor: [
          SEVERITY_COLORS.Critical,
          SEVERITY_COLORS.High,
          SEVERITY_COLORS.Medium,
          SEVERITY_COLORS.Low,
        ],
        borderColor: 'rgba(30, 41, 59, 1)', // slate-800
        borderWidth: 2,
      }]
    }
  }, [reports])

  // Incident type breakdown for bar chart
  const typeData = useMemo(() => {
    const typeCounts = {}
    reports.forEach(r => {
      const type = r.type || 'Unknown'
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    
    const sortedTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8) // Top 8 types
    
    return {
      labels: sortedTypes.map(([type]) => type),
      datasets: [{
        label: 'Incidents',
        data: sortedTypes.map(([, count]) => count),
        backgroundColor: 'rgba(16, 185, 129, 0.7)', // emerald-500
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }]
    }
  }, [reports])

  // Timeline data for line chart (last 7 days)
  const timelineData = useMemo(() => {
    const days = []
    const counts = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayCount = reports.filter(r => {
        const reportDate = r.timestamp?.toDate ? r.timestamp.toDate() : new Date(r.timestamp)
        return reportDate >= date && reportDate < nextDate
      }).length
      
      days.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
      counts.push(dayCount)
    }
    
    return {
      labels: days,
      datasets: [{
        label: 'Incidents',
        data: counts,
        borderColor: 'rgba(59, 130, 246, 1)', // blue-500
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      }]
    }
  }, [reports])

  // Status breakdown for horizontal bar
  const statusData = useMemo(() => {
    return {
      labels: ['Pending', 'In Progress', 'Resolved'],
      datasets: [{
        label: 'Reports',
        data: [stats.pending, stats.inProgress, stats.resolved],
        backgroundColor: [
          'rgba(249, 115, 22, 0.7)', // orange-500
          'rgba(59, 130, 246, 0.7)', // blue-500
          'rgba(16, 185, 129, 0.7)', // emerald-500
        ],
        borderColor: [
          'rgba(249, 115, 22, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
        borderRadius: 4,
      }]
    }
  }, [stats])

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between shrink-0 bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Analytics Dashboard</h2>
              <p className="text-xs text-slate-400">Real-time incident statistics and trends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-800">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            <StatCard label="Total Reports" value={stats.total} icon={<FileText className="w-4 h-4" />} color="bg-slate-700" />
            <StatCard label="Last 24 Hours" value={stats.last24h} icon={<Clock className="w-4 h-4" />} color="bg-blue-500/20" textColor="text-blue-400" iconColor="text-blue-400" />
            <StatCard label="Pending" value={stats.pending} icon={<Clock className="w-4 h-4" />} color="bg-orange-500/20" textColor="text-orange-400" iconColor="text-orange-400" />
            <StatCard label="In Progress" value={stats.inProgress} icon={<Loader2 className="w-4 h-4" />} color="bg-blue-500/20" textColor="text-blue-400" iconColor="text-blue-400" />
            <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 className="w-4 h-4" />} color="bg-emerald-500/20" textColor="text-emerald-400" iconColor="text-emerald-400" />
            <StatCard label="Resolution Rate" value={`${stats.resolutionRate}%`} icon={<TrendingUp className="w-4 h-4" />} color="bg-purple-500/20" textColor="text-purple-400" iconColor="text-purple-400" />
            <StatCard label="Avg Response" value={`${stats.avgResponseTime}m`} icon={<Zap className="w-4 h-4" />} color="bg-yellow-500/20" textColor="text-yellow-400" iconColor="text-yellow-400" />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Timeline Chart */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Incidents Over Time (Last 7 Days)
              </h3>
              <div className="h-[180px]">
                <Line data={timelineData} options={{
                  ...darkThemeOptions,
                  plugins: { ...darkThemeOptions.plugins, legend: { display: false } }
                }} />
              </div>
            </div>

            {/* Severity Doughnut */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-purple-400" />
                Severity Distribution
              </h3>
              <div className="h-[180px] flex items-center justify-center">
                <div className="w-full max-w-[300px]">
                  <Doughnut data={severityData} options={{
                    ...darkThemeOptions,
                    cutout: '55%',
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: { 
                          color: '#94a3b8', 
                          font: { size: 11 }, 
                          padding: 12,
                          boxWidth: 12
                        }
                      }
                    }
                  }} />
                </div>
              </div>
            </div>

            {/* Incident Types Bar */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                Incidents by Type
              </h3>
              <div className="h-[180px]">
                <Bar data={typeData} options={{
                  ...darkThemeOptions,
                  indexAxis: 'y',
                  plugins: { ...darkThemeOptions.plugins, legend: { display: false } }
                }} />
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-orange-400" />
                Status Breakdown
              </h3>
              <div className="h-[180px]">
                <Bar data={statusData} options={{
                  ...darkThemeOptions,
                  plugins: { ...darkThemeOptions.plugins, legend: { display: false } }
                }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ label, value, icon, color = 'bg-slate-700', textColor = 'text-white', iconColor = 'text-slate-400' }) {
  return (
    <div className={`${color} rounded-lg p-3 border border-slate-600/50`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={iconColor}>{icon}</span>
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
    </div>
  )
}

export default AnalyticsPanel
