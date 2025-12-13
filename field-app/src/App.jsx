import { useEffect, useState } from 'react'
import { db } from './db'
import IncidentForm from '../components/IncidentForm'
import { useSync } from './hook/useSync';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Run the sync hook
  useSync(); 

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Connection Status Bar */}
      <div className={`connection-bar ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? '🟢 Online - Reports will sync' : '🔴 Offline - Reports saved locally'}
      </div>
      
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="app-logo">🛡️</div>
          <h1 className="app-title">Aegis Field</h1>
          <p className="app-subtitle">Emergency Response System</p>
        </header>

        {/* Main Form */}
        <IncidentForm />
      </div>
    </>
  );
}

export default App;