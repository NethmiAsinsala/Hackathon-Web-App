import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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

const severityIcons = {
  Critical: createColoredIcon('#a855f7'), // Purple
  High: createColoredIcon('#ef4444'),     // Red
  Medium: createColoredIcon('#f59e0b'),   // Yellow/Orange
  Low: createColoredIcon('#3b82f6'),      // Blue
  default: createColoredIcon('#6b7280'),  // Gray
}

// Ratnapura, Sri Lanka coordinates
const RATNAPURA_CENTER = [6.6828, 80.3992]

function IncidentMap({ reports = [] }) {
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

      {/* Render markers for each report */}
      {reports.map((report) => {
        // Skip reports without valid coordinates
        if (!report.latitude || !report.longitude) return null
        
        const icon = severityIcons[report.severity] || severityIcons.default
        const timestamp = report.timestamp?.toDate?.() 
          ? report.timestamp.toDate().toLocaleString()
          : 'Unknown time'

        return (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={icon}
          >
            <Popup>
              <div className="min-w-[150px]">
                <div className="font-bold text-gray-800">{report.type || 'Unknown'}</div>
                <div className="text-sm text-gray-600 mt-1">{report.description || 'No description'}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    report.severity === 'High' ? 'bg-red-100 text-red-600' :
                    report.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-600'
                  }`}>
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
