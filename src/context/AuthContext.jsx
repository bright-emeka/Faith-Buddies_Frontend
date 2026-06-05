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
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://faith-buddies-backend.onrender.com';

  // Load tokens from localStorage on startup
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedRefreshToken && storedUser) {
      setAccessToken(storedAccessToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Login failed');
    }

    const data = await response.json();
    const { accessToken, refreshToken, user } = data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);

    return { accessToken, refreshToken, user };
  };

  const signUp = async (email, password, name, religion) => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, religion }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Sign up failed');
    }

    const data = await response.json();
    const { accessToken, refreshToken, user } = data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
    setUser(user);

    return { accessToken, refreshToken, user };
  };

  const logout = () => {
    // Clear tokens and user from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Optionally call backend to invalidate refresh token
    fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }).catch(() => {
      // Ignore error on logout
    });

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // We'll implement token refresh in the axios interceptor, but we can also have a manual refresh function
  const refreshAccessToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Refresh failed');
      }

      const data = await response.json();
      const { accessToken, refreshToken: newRefreshToken } = data;

      // Update tokens
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        setRefreshToken(newRefreshToken);
      }
      setAccessToken(accessToken);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      // On refresh failure, logout user
      logout();
      throw error;
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    login,
    signUp,
    logout,
    refreshAccessToken,
    loading,
  };

  if (loading) {
    return null; // or a loading indicator
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};