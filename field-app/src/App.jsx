import { useEffect, useState } from 'react'
import { db } from './db'
import IncidentForm from '../components/IncidentForm'
import Login from '../components/Login'
import { useSync } from './hook/useSync';
import { AuthProvider, useAuth } from './context/AuthContext';

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
        {isOnline ? '🟢 Online - Reports will sync' : '🔴 Offline - Reports saved locally'}
      </div>
      
      <div className="app-container">
        {/* Header with User Info */}
        <header className="app-header">
          <div className="header-main">
            <div className="app-logo">🛡️</div>
            <h1 className="app-title">Aegis Field</h1>
            <p className="app-subtitle">Emergency Response System</p>
          </div>
          
          {/* User Profile Button */}
          <div className="user-profile-section">
            <button 
              className="user-profile-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="user-avatar">👤</span>
              <span className="user-name">{user?.displayName || 'Responder'}</span>
              <span className="dropdown-arrow">{showUserMenu ? '▲' : '▼'}</span>
            </button>
            
            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <span className="user-email">{user?.email}</span>
                  <span className="session-status">
                    {isOnline ? '🟢 Online' : '🔴 Offline Mode'}
                  </span>
                </div>
                <button className="signout-btn" onClick={handleSignOut}>
                  <span>🚪</span> Sign Out
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