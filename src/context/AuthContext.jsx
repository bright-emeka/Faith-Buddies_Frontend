import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Refresh token is stored server-side in HttpOnly cookies (not in localStorage)
  const [refreshToken, setRefreshToken] = useState(null);

  const [loading, setLoading] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://faith-buddies-backend.onrender.com';

  // Load access token + user from localStorage on startup
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedUser) {
      setAccessToken(storedAccessToken);
      setUser(JSON.parse(storedUser));
    }

    // Avoid setState cascades in strict-mode by deferring the final update
    setTimeout(() => setLoading(false), 0);
  }, []);


  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Login failed');
    }

    const data = await response.json();
    const { accessToken, user } = data;

    // Backend sets refresh token as HttpOnly cookie; only accessToken is returned in JSON.
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    setAccessToken(accessToken);
    setRefreshToken(null);
    setUser(user);

    return { accessToken, user };
  };

  const signUp = async (email, password, name, religion) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, religion }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Sign up failed');
    }

    const data = await response.json();
    const { accessToken, user } = data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));

    setAccessToken(accessToken);
    setRefreshToken(null);
    setUser(user);

    return { accessToken, user };
  };

  const logout = async () => {
    // Clear tokens and user from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Ask backend to clear HttpOnly cookies
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch {
      // Ignore logout failures
    }

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // Manual refresh (optional). Not required if axios interceptor handles it.
  const refreshAccessToken = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Refresh failed');
    }

    const data = await response.json();
    const { accessToken } = data;

    localStorage.setItem('accessToken', accessToken);
    setAccessToken(accessToken);

    return { accessToken };
  };

  const value = {
    user,
    accessToken,
    refreshToken, // remains null; refresh token is cookie-based
    login,
    signUp,
    logout,
    refreshAccessToken,
    loading,
  };

  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

