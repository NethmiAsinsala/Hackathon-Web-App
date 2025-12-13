import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../src/db';
import { 
  Mountain, Waves, Flame, Construction, 
  CircleCheck, CircleAlert, TriangleAlert, OctagonAlert,
  Hospital, Utensils, Home, Truck, Car, Wrench,
  AlertTriangle, Siren, Satellite, MapPin, Camera, Image,
  CheckCircle, Hourglass, Inbox, ClipboardList, Users
} from 'lucide-react';

function IncidentForm() {
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      type: 'Flood',
      severity: 'Medium',
      peopleAffected: '',
      resourcesNeeded: []
    }
  });
  const [location, setLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Locating...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 📸 Photo capture state
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);

  // Watch form values for visual feedback
  const selectedType = watch('type');
  const selectedSeverity = watch('severity');
  const selectedResources = watch('resourcesNeeded');

  // 🔴 Live query - auto-updates when database changes
  const reports = useLiveQuery(
    () => db.reports.orderBy('id').reverse().toArray(),
    []
  );

  // Fallback coordinates: Colombo, Sri Lanka
  const FALLBACK_LOCATION = { lat: 6.9271, lng: 79.8612 };

  // Type icons mapping
  const typeIcons = {
    'Landslide': <Mountain size={24} />,
    'Flood': <Waves size={24} />,
    'Fire': <Flame size={24} />,
    'Blocked Road': <Construction size={24} />
  };

  // Severity config
  const severityConfig = {
    'Low': { icon: <CircleCheck size={20} />, color: '#16a34a' },
    'Medium': { icon: <CircleAlert size={20} />, color: '#f59e0b' },
    'High': { icon: <TriangleAlert size={20} />, color: '#ea580c' },
    'Critical': { icon: <OctagonAlert size={20} />, color: '#dc2626' }
  };

  // 🚑 Resources options
  const resourceOptions = [
    { id: 'medical', label: 'Medical', icon: <Hospital size={20} /> },
    { id: 'food', label: 'Food & Water', icon: <Utensils size={20} /> },
    { id: 'shelter', label: 'Shelter', icon: <Home size={20} /> },
    { id: 'rescue', label: 'Rescue Team', icon: <Truck size={20} /> },
    { id: 'evacuation', label: 'Evacuation', icon: <Car size={20} /> },
    { id: 'equipment', label: 'Equipment', icon: <Wrench size={20} /> }
  ];

  // 📸 Handle photo capture
  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported by this browser');
      setLocation(FALLBACK_LOCATION);
      setGpsStatus('GPS Not Supported ⚠️');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGpsStatus('GPS Locked');
      },
      (error) => {
        // Fail gracefully - use fallback coordinates (Colombo, Sri Lanka)
        console.warn('Geolocation error:', error.message);
        setLocation(FALLBACK_LOCATION);
        setGpsStatus('Using Default Location');
      },
      { timeout: 5000 }
    );
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    // Check if using fallback coordinates
    const isFallback = location.lat === FALLBACK_LOCATION.lat && location.lng === FALLBACK_LOCATION.lng;
    
    const record = {
      ...data,
      latitude: location.lat,
      longitude: location.lng,
      locationAccuracy: isFallback ? 'unknown' : 'precise',
      timestamp: new Date(),
      synced: 0,
      isSOS: false,
      // Store photo as base64 for offline support (will be uploaded on sync)
      photoData: photoPreview || null,
      peopleAffected: data.peopleAffected ? parseInt(data.peopleAffected) : 0,
      resourcesNeeded: data.resourcesNeeded || []
    };

    await db.reports.add(record);
    reset();
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsSubmitting(false);
    setShowSuccess(true);
    
    // Vibration feedback on mobile
    if (navigator.vibrate) navigator.vibrate(200);
    
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // 🆘 SOS Emergency Handler
  const handleSOS = async () => {
    if (!location) {
      alert("⚠️ Still getting your location. Please wait...");
      return;
    }

    const confirmSOS = window.confirm(
      "🆘 EMERGENCY SOS\n\nThis will immediately send a CRITICAL alert with your current location.\n\nContinue?"
    );

    if (!confirmSOS) return;

    setIsSubmitting(true);

    const isFallback = location.lat === FALLBACK_LOCATION.lat && location.lng === FALLBACK_LOCATION.lng;

    const sosRecord = {
      type: 'Emergency SOS',
      severity: 'Critical',
      description: '🆘 EMERGENCY SOS - Immediate assistance required!',
      latitude: location.lat,
      longitude: location.lng,
      locationAccuracy: isFallback ? 'unknown' : 'precise',
      timestamp: new Date(),
      synced: 0,
      isSOS: true,
      photoData: null,
      peopleAffected: 1,
      resourcesNeeded: ['rescue', 'medical']
    };

    await db.reports.add(sosRecord);
    
    // Strong vibration pattern for SOS
    if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
    
    setIsSubmitting(false);
    alert("🆘 SOS Alert Sent!\n\nYour location has been shared. Help is on the way.");
  };

  const isLocating = gpsStatus === 'Locating...';
  const isGpsLocked = gpsStatus === 'GPS Locked';

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* 🆘 SOS Emergency Button - Always visible at top */}
      <div className="sos-container">
        <button 
          type="button" 
          className="sos-btn"
          onClick={handleSOS}
          disabled={isSubmitting || !location}
        >
          <span className="sos-icon"><Siren size={24} /></span>
          <span className="sos-text">EMERGENCY SOS</span>
          <span className="sos-subtext">Tap for immediate help</span>
        </button>
      </div>

      {/* Report Form Card */}
      <div className="card">
        {/* GPS Status Banner */}
        <div className={`gps-banner ${isLocating ? 'locating' : isGpsLocked ? 'locked' : 'offline'}`}>
          <span className="gps-icon">{isLocating ? <Satellite size={16} /> : isGpsLocked ? <MapPin size={16} /> : <AlertTriangle size={16} />}</span>
          <span>{gpsStatus}</span>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Incident Type */}
          <div className="form-group">
            <label className="form-label">What's happening?</label>
            <div className="type-grid">
              {Object.entries(typeIcons).map(([type, icon]) => (
                <div key={type} className="type-option">
                  <input
                    type="radio"
                    id={`type-${type}`}
                    value={type}
                    {...register('type')}
                  />
                  <label htmlFor={`type-${type}`}>
                    <span className="type-icon">{icon}</span>
                    <span className="type-text">{type}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div className="form-group">
            <label className="form-label">How severe is it?</label>
            <div className="severity-grid">
              {Object.entries(severityConfig).map(([severity, config]) => (
                <div key={severity} className="severity-option">
                  <input
                    type="radio"
                    id={`severity-${severity}`}
                    value={severity}
                    {...register('severity')}
                  />
                  <label htmlFor={`severity-${severity}`}>
                    <span className="severity-icon">{config.icon}</span>
                    <span className="severity-text">{severity}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Additional Details</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the situation, any injuries, blocked roads, etc..."
              {...register('description')}
            />
          </div>

          {/* People Affected */}
          <div className="form-group">
            <label className="form-label">People Affected (estimated)</label>
            <input
              type="number"
              className="form-input"
              placeholder="Enter number of people affected"
              min="0"
              {...register('peopleAffected')}
            />
          </div>

          {/* Resources Needed */}
          <div className="form-group">
            <label className="form-label">Resources Needed</label>
            <div className="resources-grid">
              {resourceOptions.map((resource) => (
                <div key={resource.id} className="resource-option">
                  <input
                    type="checkbox"
                    id={`resource-${resource.id}`}
                    value={resource.id}
                    {...register('resourcesNeeded')}
                  />
                  <label htmlFor={`resource-${resource.id}`}>
                    <span className="resource-icon">{resource.icon}</span>
                    <span className="resource-text">{resource.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Capture */}
          <div className="form-group">
            <label className="form-label">Attach Photo (optional)</label>
            <div className="photo-capture">
              {photoPreview ? (
                <div className="photo-preview-container">
                  <img src={photoPreview} alt="Preview" className="photo-preview" />
                  <button 
                    type="button" 
                    className="photo-remove-btn"
                    onClick={removePhoto}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div className="photo-buttons">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handlePhotoCapture}
                    className="photo-input"
                    id="photo-capture"
                  />
                  <label htmlFor="photo-capture" className="photo-capture-btn">
                    <span className="photo-btn-icon"><Camera size={20} /></span>
                    <span>Take Photo</span>
                  </label>
                  <label htmlFor="photo-capture" className="photo-upload-btn">
                    <span className="photo-btn-icon"><Image size={20} /></span>
                    <span>Gallery</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`submit-btn ${showSuccess ? 'success' : ''}`}
            disabled={isLocating || isSubmitting}
          >
            {showSuccess ? (
              <><CheckCircle size={18} className="inline mr-2" /> Report Sent!</>
            ) : isLocating ? (
              <><Satellite size={18} className="inline mr-2" /> Getting Location...</>
            ) : isSubmitting ? (
              <><Hourglass size={18} className="inline mr-2" /> Saving...</>
            ) : (
              <><Siren size={18} className="inline mr-2" /> Submit Report</>
            )}
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="card reports-section">
        <div className="reports-header">
          <h2 className="reports-title">
            Recent Reports
            <span className="reports-count">{reports?.length || 0}</span>
          </h2>
        </div>

        {reports?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Inbox size={48} /></div>
            <p className="empty-text">No reports yet. Submit one above!</p>
          </div>
        ) : (
          reports?.map((report) => (
            <div 
              key={report.id} 
              className={`report-card ${report.synced ? 'synced' : 'pending'} ${report.isSOS ? 'sos-report' : ''}`}
            >
              <span className="report-icon">
                {report.isSOS ? <Siren size={24} /> : typeIcons[report.type] || <ClipboardList size={24} />}
              </span>
              <div className="report-content">
                <div className="report-type">
                  {report.type}
                  {report.isSOS && <span className="sos-badge">SOS</span>}
                </div>
                <div className="report-meta">
                  <span className={`report-badge badge-severity ${report.severity?.toLowerCase()}`}>
                    {severityConfig[report.severity]?.icon} {report.severity}
                  </span>
                  {report.peopleAffected > 0 && (
                    <span className="report-badge badge-people">
                      <Users size={14} className="inline mr-1" /> {report.peopleAffected}
                    </span>
                  )}
                  {report.photoData && (
                    <span className="report-badge badge-photo"><Camera size={14} /></span>
                  )}
                </div>
                {report.resourcesNeeded?.length > 0 && (
                  <div className="report-resources" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {report.resourcesNeeded.map(r => {
                      const option = resourceOptions.find(opt => opt.id === r);
                      return option ? <span key={r} title={option.label}>{option.icon}</span> : null;
                    })}
                  </div>
                )}
                <div className={`report-status ${report.synced ? 'status-synced' : 'status-pending'}`}>
                  {report.synced ? <><CheckCircle size={14} className="inline mr-1" /> Synced to cloud</> : <><Hourglass size={14} className="inline mr-1" /> Waiting to sync</>}
                  {report.timestamp && ` • ${formatTime(report.timestamp)}`}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default IncidentForm;
