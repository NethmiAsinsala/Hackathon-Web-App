// Incident Details Modal Component
// ==================================
// Full incident details view with photo, location, resources, and status management

import { useState } from 'react'
import { 
  X, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Users, 
  Package,
  Image,
  ExternalLink,
  Navigation,
  CheckCircle,
  Loader2,
  Mountain,
  Waves,
  Flame,
  Construction,
  ChevronRight
} from 'lucide-react'
import { SEVERITY_COLORS, getSeverityStyles } from '../constants/colors'

// Format timestamp to readable date
const formatDateTime = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format relative time
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

// Get type icon
const getTypeIcon = (type) => {
  switch (type) {
    case 'Landslide': return <Mountain className="w-6 h-6" />
    case 'Flood': return <Waves className="w-6 h-6" />
    case 'Fire': return <Flame className="w-6 h-6" />
    case 'Blocked Road': return <Construction className="w-6 h-6" />
    default: return <AlertTriangle className="w-6 h-6" />
  }
}

// Get status badge styles
const getStatusBadge = (status) => {
  switch (status) {
    case 'Resolved':
      return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' }
    case 'In Progress':
      return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' }
    default:
      return { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' }
  }
}

// Resource icons and labels
const RESOURCE_LABELS = {
  medical: { label: 'Medical', icon: '🏥' },
  food: { label: 'Food & Water', icon: '🍽️' },
  shelter: { label: 'Shelter', icon: '🏠' },
  rescue: { label: 'Rescue Team', icon: '🚒' },
  evacuation: { label: 'Evacuation', icon: '🚗' },
  equipment: { label: 'Equipment', icon: '🔧' }
}

function IncidentDetailsModal({ report, onClose, onStatusChange, onLocateOnMap }) {
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  if (!report) return null

  const statusBadge = getStatusBadge(report.status)
  const severityStyles = getSeverityStyles(report.severity)

  // Handle status change
  const handleStatusChange = async (newStatus) => {
    setIsUpdatingStatus(true)
    await onStatusChange?.(report.id, newStatus)
    setIsUpdatingStatus(false)
  }

  // Open location in Google Maps
  const openInGoogleMaps = () => {
    if (report.latitude && report.longitude) {
      window.open(
        `https://www.google.com/maps?q=${report.latitude},${report.longitude}`,
        '_blank'
      )
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-6" style={{ zIndex: 9999 }}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: 9999 }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden" style={{ maxHeight: '80vh', zIndex: 10000 }}>
        {/* Header - Non-scrollable */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: severityStyles.backgroundColor, color: severityStyles.color }}
              >
                {getTypeIcon(report.type)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{report.type || 'Unknown Incident'}</h2>
                <p className="text-sm text-slate-400">{formatTimeAgo(report.timestamp)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white shrink-0"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* Severity & Status Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <span 
              className="px-3 py-1.5 rounded-full text-sm font-semibold border"
              style={severityStyles}
            >
              {report.severity || 'Unknown'} Severity
            </span>
            <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}>
              {report.status || 'Pending'}
            </span>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(80vh - 200px)' }}>
          {/* Photo Section - Full Width at Top */}
          {report.photoData && (
            <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Photo Evidence
              </h3>
              <div className="relative">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-700 rounded-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                )}
                {imageError ? (
                  <div className="flex items-center justify-center h-48 bg-slate-700 rounded-lg text-slate-400">
                    <div className="text-center">
                      <Image className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Failed to load image</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={report.photoData}
                    alt="Incident photo"
                    className="w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    style={{ maxHeight: '250px', objectFit: 'cover' }}
                    onClick={() => window.open(report.photoData, '_blank')}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false)
                      setImageError(true)
                    }}
                  />
                )}
                {!imageLoading && !imageError && (
                  <button
                    onClick={() => window.open(report.photoData, '_blank')}
                    className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/70 text-white text-xs rounded-lg hover:bg-black/90"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Full Size
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Two Column Grid for Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Description */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-white leading-relaxed text-sm">
                {report.description || 'No description provided'}
              </p>
            </div>

            {/* Location */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h3>
              {report.latitude && report.longitude ? (
                <div className="space-y-2">
                  <p className="text-slate-300 text-sm">
                    {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onLocateOnMap?.(report.id)
                        onClose()
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded text-xs"
                    >
                      <Navigation className="w-3 h-3" />
                      Map
                    </button>
                    <button
                      onClick={openInGoogleMaps}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Google
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No location data</p>
              )}
            </div>

            {/* People Affected */}
            {report.peopleAffected && (
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  People Affected
                </h3>
                <p className="text-2xl font-bold text-white">{report.peopleAffected}</p>
              </div>
            )}

            {/* Resources Needed */}
            {report.resourcesNeeded && report.resourcesNeeded.length > 0 && (
              <div className="bg-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Resources Needed
                </h3>
                <div className="flex flex-wrap gap-2">
                  {report.resourcesNeeded.map((resource) => {
                    const resourceInfo = RESOURCE_LABELS[resource] || { label: resource, icon: '📦' }
                    return (
                      <span
                        key={resource}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-600/50 rounded text-xs text-white"
                      >
                        <span>{resourceInfo.icon}</span>
                        {resourceInfo.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Timeline
              </h3>
              <div className="space-y-1 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Reported:</span>
                  <span className="text-white text-xs">{formatDateTime(report.timestamp)}</span>
                </div>
                {report.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Updated:</span>
                    <span className="text-white text-xs">{formatDateTime(report.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Report ID: <span className="text-slate-300 font-mono">{report.id}</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Status Change Buttons */}
              {(!report.status || report.status === 'Pending') && (
                <button
                  onClick={() => handleStatusChange('In Progress')}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors font-medium"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                  Start Response
                </button>
              )}
              {report.status === 'In Progress' && (
                <button
                  onClick={() => handleStatusChange('Resolved')}
                  disabled={isUpdatingStatus}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white rounded-lg transition-colors font-medium"
                >
                  {isUpdatingStatus ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Mark Resolved
                </button>
              )}
              {report.status === 'Resolved' && (
                <span className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Resolved
                </span>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IncidentDetailsModal
