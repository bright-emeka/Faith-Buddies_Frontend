import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from 'firebase/auth';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

const persistAuthData = (userData) => {
  if (typeof window === 'undefined') return;
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
};

const clearAuthData = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          providerId: firebaseUser.providerId,
        };
        setUser(userData);
        persistAuthData(userData);
      } else {
        setUser(null);
        clearAuthData();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      
      // Sync user to ensure Firestore document exists
      try {
        const idToken = await firebaseUser.getIdToken();
        await fetch(`${import.meta.env.VITE_API_URL}/users/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            name: firebaseUser.displayName,
            email: firebaseUser.email,
          }),
        });
      } catch (syncError) {
        console.warn('User sync failed (non-critical):', syncError);
      }

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        providerId: firebaseUser.providerId,
      };
      setUser(userData);
      persistAuthData(userData);
      return { user: userData };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email, password, name) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await credential.user.updateProfile({ displayName: name });
      const firebaseUser = credential.user;

      // Register user in backend to create Firestore document
      try {
        const idToken = await firebaseUser.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: name,
            photoURL: firebaseUser.photoURL,
            provider: 'firebase',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create user profile');
        }
      } catch (registerError) {
        console.error('Profile creation failed:', registerError);
        throw registerError;
      }

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        providerId: firebaseUser.providerId,
      };
      setUser(userData);
      persistAuthData(userData);
      return { user: userData };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    clearAuthData();
    setUser(null);
    await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const value = {
    user,
    loading,
    accessToken: user ? null : null,
    refreshToken: null,
    login,
    signUp,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}