import { useEffect, useState } from 'react'
import { db } from './db'
import IncidentForm from '../components/IncidentForm'
import Login from '../components/Login'
import { useSync } from './hook/useSync';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Wifi, WifiOff, ShieldAlert, User, ChevronUp, ChevronDown, LogOut } from 'lucide-react';

// Main app content (shown when authenticated)
function AppContent() {
  const { user, signOut, isOnline } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Run the sync hook
  useSync(); 

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out? You will need internet access to sign in again.')) {
      await signOut();
    }
  };

  return (
    <>
      {/* Connection Status Bar */}
      <div className={`connection-bar ${isOnline ? 'online' : 'offline'}`}>
        {isOnline ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Wifi size={18} /> Online - Reports will sync
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <WifiOff size={18} /> Offline - Reports saved locally
          </div>
        )}
      </div>
      
      <div className="app-container">
        {/* Header with User Info */}
        <header className="app-header">
          <div className="header-main">
            <div className="app-logo"><ShieldAlert size={32} /></div>
            <div>
              <h1 className="app-title">Aegis Field</h1>
              <p className="app-subtitle">Emergency Response System</p>
            </div>
          </div>
          
          {/* User Profile Button */}
          <div className="user-profile-section">
            <button 
              className="user-profile-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-avatar"><User size={20} /></span>
              <span className="user-name">{user?.displayName || 'Responder'}</span>
              <span className="dropdown-arrow">{showUserMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
            </button>
            
            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <span className="user-email">{user?.email}</span>
                  <span className="session-status">
                    {isOnline ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Wifi size={14} color="#16a34a" /> Online
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <WifiOff size={14} color="#dc2626" /> Offline Mode
                      </div>
                    )}
                  </span>
                </div>
                <button className="signout-btn" onClick={handleSignOut}>
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Form */}
        <IncidentForm />
      </div>
    </>
  );
}

// Auth wrapper component
function AuthenticatedApp() {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner"></div>
        <p>Restoring your session...</p>
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <Login />;
  }

  // Show main app content
  return <AppContent />;
}

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;