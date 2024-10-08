import axios from 'axios';
import { BASE_URL } from '../../config';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 50000,
});

// Request interceptor to add tokens to request headers
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    const csrfToken = localStorage.getItem('csrf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Function to setup response interceptor
export const setupResponseInterceptor = (navigate) => {
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;

      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          const response = await axiosInstance.post('/api/token/refresh/', {
            refresh: refreshToken
          });

          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);

          axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed', refreshError);
          
          navigate('/'); // Redirect to home or login page
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('csrf_token');
          
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default axiosInstance;