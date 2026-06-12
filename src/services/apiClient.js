import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://faith-buddies-backend.onrender.com';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // allow HttpOnly cookies (refresh token) to be sent
});

// Request interceptor: attach access token from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and token refresh (cookie-based)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Backend reads refresh token from HttpOnly cookies
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            timeout: 15000,
            withCredentials: true,
          }
        );

        const { accessToken } = refreshResponse.data;

        localStorage.setItem('accessToken', accessToken);

        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

