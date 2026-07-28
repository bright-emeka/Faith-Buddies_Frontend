import React, { createContext, useState } from 'react';

export const AuthContext = createContext(null);

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;

  const candidateKeys = ['accessToken', 'token', 'authToken', 'jwt'];
  for (const key of candidateKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return null;
};

const persistAuthData = (token, userData) => {
  if (typeof window === 'undefined') return;

  if (token) {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);
    localStorage.setItem('jwt', token);
  }

  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }
};

const clearAuthData = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('jwt');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

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
    return getStoredToken();
  });

  const getAuthHeaders = () => {
    const token = getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(token ? { 'x-access-token': token } : {}),
      ...(token ? { 'x-auth-token': token } : {}),
    };
  };

  // Refresh token is stored as an HttpOnly cookie on the backend
  const [refreshToken, setRefreshToken] = useState(null);

  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || 'Login failed');
    }

    const payload = responseData.data || responseData;
    const token = payload.accessToken || payload.token || payload.access_token || payload.jwt;
    const userData = payload.user || payload.profile || payload.userData || payload.data?.user || null;

    persistAuthData(token, userData);

    setAccessToken(token || null);
    setRefreshToken(null);
    setUser(userData || null);

    return { accessToken: token, user: userData };
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

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        responseData.message ||
          responseData.error ||
          'Sign up failed'
      );
    }

    const payload = responseData.data || responseData;
    const token = payload.accessToken || payload.token || payload.access_token || payload.jwt;
    const userData = payload.user || payload.profile || payload.userData || payload.data?.user || null;

    persistAuthData(token, userData);

    setAccessToken(token || null);
    setRefreshToken(null);
    setUser(userData || null);

    return { accessToken: token, user: userData };
  };

  const logout = async () => {
    clearAuthData();

    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders(),
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
      headers: getAuthHeaders(),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      clearAuthData();
      throw new Error(
        responseData.message ||
          responseData.error ||
          'Refresh failed'
      );
    }

    const payload = responseData.data || responseData;
    const token = payload.accessToken || payload.token || payload.access_token || payload.jwt;

    persistAuthData(token, null);
    setAccessToken(token || null);

    return { accessToken: token };
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