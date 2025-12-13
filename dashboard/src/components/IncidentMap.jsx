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

// Ratnapura, Sri Lanka coordinates
const RATNAPURA_CENTER = [6.6828, 80.3992]

function IncidentMap() {
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

      {/* Dummy Test Marker */}
      <Marker position={RATNAPURA_CENTER}>
        <Popup>
          <div className="text-center">
            <strong>📍 Ratnapura</strong>
            <br />
            <span className="text-sm text-gray-600">Command Center HQ</span>
            <br />
            <span className="text-xs text-emerald-600">✓ Map Working!</span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  )
}

export default IncidentMap
