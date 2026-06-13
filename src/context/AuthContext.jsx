import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    'https://faith-buddies-backend.onrender.com';

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) return null;

    try {
      return JSON.parse(storedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem('accessToken');
  });

  // Refresh token is stored as an HttpOnly cookie on the backend
  const [refreshToken, setRefreshToken] = useState(null);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message ||
          errorData.error ||
          'Login failed'
      );
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

  const signUp = async (email, password, name, religion) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password,
        name,
        religion,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message ||
          errorData.error ||
          'Sign up failed'
      );
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
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: accessToken
            ? `Bearer ${accessToken}`
            : '',
        },
      });
    } catch {
      // Ignore logout errors
    }

    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const refreshAccessToken = async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      throw new Error(
        errorData.message ||
          errorData.error ||
          'Refresh failed'
      );
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
    refreshToken,
    loading: false,
    login,
    signUp,
    logout,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}