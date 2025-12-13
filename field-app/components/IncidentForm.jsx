import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../src/db';

function IncidentForm() {
  const { register, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      type: 'Flood',
      severity: 'Medium'
    }
  });
  const [location, setLocation] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('Locating...');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Watch form values for visual feedback
  const selectedType = watch('type');
  const selectedSeverity = watch('severity');

  // 🔴 Live query - auto-updates when database changes
  const reports = useLiveQuery(
    () => db.reports.orderBy('id').reverse().toArray(),
    []
  );

  // Fallback coordinates: Colombo, Sri Lanka
  const FALLBACK_LOCATION = { lat: 6.9271, lng: 79.8612 };

  // Type icons mapping
  const typeIcons = {
    'Landslide': '🏔️',
    'Flood': '🌊',
    'Fire': '🔥',
    'Blocked Road': '🚧'
  };

  // Severity config
  const severityConfig = {
    'Low': { icon: '🟢', color: '#16a34a' },
    'Medium': { icon: '🟡', color: '#f59e0b' },
    'High': { icon: '🟠', color: '#ea580c' },
    'Critical': { icon: '🔴', color: '#dc2626' }
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
      synced: 0
    };

    await db.reports.add(record);
    reset();
    setIsSubmitting(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
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
      {/* Report Form Card */}
      <div className="card">
        {/* GPS Status Banner */}
        <div className={`gps-banner ${isLocating ? 'locating' : isGpsLocked ? 'locked' : 'offline'}`}>
          <span className="gps-icon">{isLocating ? '📡' : isGpsLocked ? '📍' : '⚠️'}</span>
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

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`submit-btn ${showSuccess ? 'success' : ''}`}
            disabled={isLocating || isSubmitting}
          >
            {showSuccess ? (
              <>✅ Report Sent!</>
            ) : isLocating ? (
              <>📡 Getting Location...</>
            ) : isSubmitting ? (
              <>⏳ Saving...</>
            ) : (
              <>🚨 Submit Report</>
            )}
          </button>
        </form>
      </div>

      {/* Reports List */}
      <div className="card reports-section">
        <div className="reports-header">
          <h2 className="reports-title">
            📋 Recent Reports
            <span className="reports-count">{reports?.length || 0}</span>
          </h2>
        </div>

        {reports?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-text">No reports yet. Submit one above!</p>
          </div>
        ) : (
          reports?.map((report) => (
            <div 
              key={report.id} 
              className={`report-card ${report.synced ? 'synced' : 'pending'}`}
            >
              <span className="report-icon">{typeIcons[report.type] || '📋'}</span>
              <div className="report-content">
                <div className="report-type">{report.type}</div>
                <div className="report-meta">
                  <span className={`report-badge badge-severity ${report.severity?.toLowerCase()}`}>
                    {severityConfig[report.severity]?.icon} {report.severity}
                  </span>
                </div>
                <div className={`report-status ${report.synced ? 'status-synced' : 'status-pending'}`}>
                  {report.synced ? '✅ Synced to cloud' : '⏳ Waiting to sync'}
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
