import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase';
import { db } from '../db';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Cache user session to IndexedDB for offline persistence
  const cacheUserSession = async (userData) => {
    try {
      await db.userSession.put({
        id: 1, // Single session record
        user: userData,
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });
      console.log('💾 Session cached for offline use');
    } catch (error) {
      console.error('Failed to cache session:', error);
    }
  };

  // Clear cached session
  const clearCachedSession = async () => {
    try {
      await db.userSession.delete(1);
      console.log('🗑️ Cached session cleared');
    } catch (error) {
      console.error('Failed to clear cached session:', error);
    }
  };

  // Track online/offline status
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

  // Initialize auth - check cached session first, then Firebase
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, try to restore from local cache (for offline support)
        const cachedSession = await db.userSession.get(1);
        
        if (cachedSession && cachedSession.user) {
          console.log('📱 Restored session from local cache');
          setUser(cachedSession.user);
        }

        // If online, also listen to Firebase auth state
        if (navigator.onLine) {
          const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              // User is signed in with Firebase
              const userData = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
                lastLogin: new Date().toISOString()
              };
              
              // Cache the session locally for offline use
              await cacheUserSession(userData);
              setUser(userData);
              console.log('🔥 Firebase auth synced and cached');
            } else if (!cachedSession?.user) {
              // No Firebase user and no cached session
              setUser(null);
            }
            setLoading(false);
          });

          return () => unsubscribe();
        } else {
          // Offline - just use cached session
          setLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in with email/password
  const signIn = async (email, password) => {
    if (!navigator.onLine) {
      throw new Error('You must be online to sign in. Please connect to the internet.');
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || email.split('@')[0],
        lastLogin: new Date().toISOString()
      };
      
      // Cache for offline use
      await cacheUserSession(userData);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  // Sign up with email/password
  const signUp = async (email, password, displayName) => {
    if (!navigator.onLine) {
      throw new Error('You must be online to create an account. Please connect to the internet.');
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }

      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: displayName || email.split('@')[0],
        lastLogin: new Date().toISOString()
      };
      
      // Cache for offline use
      await cacheUserSession(userData);
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Clear local cache first (works offline)
      await clearCachedSession();
      setUser(null);
      
      // If online, also sign out from Firebase
      if (navigator.onLine) {
        await firebaseSignOut(auth);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Check if session is still valid
  const isSessionValid = async () => {
    try {
      const cachedSession = await db.userSession.get(1);
      if (!cachedSession) return false;
      
      const expiresAt = new Date(cachedSession.expiresAt);
      return expiresAt > new Date();
    } catch {
      return false;
    }
  };

  const value = {
    user,
    loading,
    isOnline,
    signIn,
    signUp,
    signOut,
    isSessionValid,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
