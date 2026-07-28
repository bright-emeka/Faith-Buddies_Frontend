import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://faith-buddies-backend.onrender.com';

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;

  const candidateKeys = ['accessToken', 'token', 'authToken', 'jwt'];
  for (const key of candidateKeys) {
    const value = localStorage.getItem(key);
    if (value) return value;
  }

  return null;
};

const persistToken = (token) => {
  if (typeof window === 'undefined' || !token) return;

  localStorage.setItem('accessToken', token);
  localStorage.setItem('token', token);
  localStorage.setItem('authToken', token);
  localStorage.setItem('jwt', token);
};

const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('jwt');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      const headers = config.headers || {};
      headers.Authorization = `Bearer ${token}`;
      headers['x-access-token'] = token;
      headers['x-auth-token'] = token;
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const token = getStoredToken();
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            timeout: 15000,
            withCredentials: true,
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              ...(token ? { 'x-access-token': token } : {}),
              ...(token ? { 'x-auth-token': token } : {}),
            },
          }
        );

        const newToken =
          refreshResponse?.data?.accessToken ||
          refreshResponse?.data?.token ||
          refreshResponse?.data?.access_token ||
          refreshResponse?.data?.jwt;

        if (newToken) {
          persistToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          originalRequest.headers['x-access-token'] = newToken;
          originalRequest.headers['x-auth-token'] = newToken;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        clearStoredAuth();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

