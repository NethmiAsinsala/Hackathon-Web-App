import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useRef, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { SEVERITY_COLORS } from '../constants/colors'

// Fix for default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom colored marker icons based on severity
const createColoredIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })
}

// Use centralized severity colors
const severityIcons = {
  Critical: createColoredIcon(SEVERITY_COLORS.Critical), // Dark Red #8B0000
  High: createColoredIcon(SEVERITY_COLORS.High),         // Red #FF0000
  Medium: createColoredIcon(SEVERITY_COLORS.Medium),     // Orange #FFA500
  Low: createColoredIcon(SEVERITY_COLORS.Low),           // Green #008000
  default: createColoredIcon(SEVERITY_COLORS.default),   // Gray
}

// Ratnapura, Sri Lanka coordinates
const RATNAPURA_CENTER = [6.6828, 80.3992]

// Helper function to calculate offset for overlapping markers
const getMarkerOffset = (reports, currentReport, index) => {
  // Find all reports at the same location
  const sameLocationReports = reports.filter(
    (r) => r.latitude === currentReport.latitude && r.longitude === currentReport.longitude
  )
  
  // If only one report at this location, no offset needed
  if (sameLocationReports.length <= 1) {
    return { lat: 0, lng: 0 }
  }
  
  // Find the index of current report among reports at same location
  const localIndex = sameLocationReports.findIndex((r) => r.id === currentReport.id)
  
  // Calculate offset in a circular pattern around the original point
  const offsetDistance = 0.0008 // Roughly 80-100 meters
  const angle = (localIndex * 2 * Math.PI) / sameLocationReports.length
  
  return {
    lat: offsetDistance * Math.cos(angle),
    lng: offsetDistance * Math.sin(angle),
  }
}

// Component to handle flying to selected report
function FlyToMarker({ selectedReportId, reports, markerRefs }) {
  const map = useMap()

  useEffect(() => {
    if (selectedReportId && markerRefs.current[selectedReportId]) {
      const report = reports.find((r) => r.id === selectedReportId)
      if (report && report.latitude && report.longitude) {
        // Calculate the offset position (same logic as in marker rendering)
        const offset = getMarkerOffset(reports, report, reports.indexOf(report))
        const adjustedLat = report.latitude + offset.lat
        const adjustedLng = report.longitude + offset.lng

        // Fly to the marker location
        map.flyTo([adjustedLat, adjustedLng], 15, { duration: 0.8 })

        // Open the popup after flying
        setTimeout(() => {
          markerRefs.current[selectedReportId]?.openPopup()
        }, 800)
      }
    }
  }, [selectedReportId, reports, map, markerRefs])

  return null
}

function IncidentMap({ reports = [], selectedReportId = null }) {
  const markerRefs = useRef({})

  return (
    <MapContainer
      center={RATNAPURA_CENTER}
      zoom={12}
      className="h-full w-full"
      style={{ minHeight: '400px' }}
    >
      {/* OpenStreetMap Tiles */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Fly to selected marker */}
      <FlyToMarker 
        selectedReportId={selectedReportId} 
        reports={reports} 
        markerRefs={markerRefs} 
      />

      {/* Render markers for each report */}
      {reports.map((report, index) => {
        // Skip reports without valid coordinates
        if (!report.latitude || !report.longitude) return null
        
        const icon = severityIcons[report.severity] || severityIcons.default
        const timestamp = report.timestamp?.toDate?.() 
          ? report.timestamp.toDate().toLocaleString()
          : 'Unknown time'

        // Calculate offset for overlapping markers
        const offset = getMarkerOffset(reports, report, index)
        const adjustedLat = report.latitude + offset.lat
        const adjustedLng = report.longitude + offset.lng

        return (
          <Marker
            key={report.id}
            position={[adjustedLat, adjustedLng]}
            icon={icon}
            ref={(ref) => {
              if (ref) markerRefs.current[report.id] = ref
            }}
          >
            <Popup>
              <div className="min-w-[150px]">
                <div className="font-bold text-gray-800">{report.type || 'Unknown'}</div>
                <div className="text-sm text-gray-600 mt-1">{report.description || 'No description'}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span 
                    className="text-xs font-semibold px-2 py-1 rounded"
                    style={{
                      backgroundColor: report.severity === 'Critical' ? 'rgba(139, 0, 0, 0.15)' :
                                       report.severity === 'High' ? 'rgba(255, 0, 0, 0.15)' :
                                       report.severity === 'Medium' ? 'rgba(255, 165, 0, 0.15)' :
                                       report.severity === 'Low' ? 'rgba(0, 128, 0, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                      color: SEVERITY_COLORS[report.severity] || SEVERITY_COLORS.default
                    }}
                  >
                    {report.severity || 'Unknown'}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-2">{timestamp}</div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

export default IncidentMap
