import { useState } from 'react';
import { useAuth } from '../src/context/AuthContext';

function Login() {
  const { signIn, signUp, isOnline } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation for sign up
    if (isSignUp) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      // Success - AuthContext will update and App will show main content
    } catch (err) {
      console.error('Auth error:', err);
      
      // User-friendly error messages
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Use at least 6 characters.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else if (err.message.includes('online')) {
        setError(err.message);
      } else {
        setError(isSignUp ? 'Sign up failed. Please try again.' : 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Offline Warning Banner */}
      {!isOnline && (
        <div className="offline-login-warning">
          <span className="warning-icon">📡</span>
          <div>
            <strong>You're offline</strong>
            <p>Connect to the internet to {isSignUp ? 'create an account' : 'sign in'}</p>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="login-card">
        {/* Logo & Header */}
        <div className="login-header">
          <div className="login-logo">🛡️</div>
          <h1 className="login-title">Aegis Field</h1>
          <p className="login-subtitle">Emergency Response System</p>
        </div>

        {/* Mode Toggle */}
        <div className="auth-toggle">
          <button 
            type="button"
            className={`toggle-btn ${!isSignUp ? 'active' : ''}`}
            onClick={() => isSignUp && toggleMode()}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`toggle-btn ${isSignUp ? 'active' : ''}`}
            onClick={() => !isSignUp && toggleMode()}
          >
            Sign Up
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="displayName">Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                disabled={!isOnline || isLoading}
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="responder@agency.gov"
              required
              disabled={!isOnline || isLoading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
              required
              disabled={!isOnline || isLoading}
              className="form-input"
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                disabled={!isOnline || isLoading}
                className="form-input"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!isOnline || isLoading}
            className={`login-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                {isSignUp ? 'Creating account...' : 'Signing in...'}
              </>
            ) : (
              <>
                <span>{isSignUp ? '✨' : '🔐'}</span> {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        {/* Info Footer */}
        <div className="login-footer">
          <p>
            <span>💡</span> {isSignUp ? 'Create your account while online. Your session will persist for offline use.' : 'Sign in while online. Your session will persist for offline use.'}
          </p>
        </div>
      </div>

      {/* Deployment Info */}
      <div className="deployment-info">
        <p>Field Responder App v1.0</p>
        <p>🔒 Secure offline-capable authentication</p>
      </div>
    </div>
  );
}

export default Login;
