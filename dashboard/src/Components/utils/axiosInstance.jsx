import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';
// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,  // Replace with your backend URL
  timeout: 5000,  // Timeout if API request takes longer than 5 seconds
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
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    const navigate = useNavigate(); // Hook to navigate

    // Check if the error status is 401 (Unauthorized) and if the request has not been retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axiosInstance.post('/api/token/refresh/', {
          refresh: refreshToken
        });

        // Save the new access token
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);

        // Retry the original request with the new access token
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${response.data.access}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Handle token refresh errors
        console.error('Token refresh failed', refreshError);
        
        // Redirect to login or home page
        navigate('/'); // Redirect to home or login page
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('csrf_token');
        
        return Promise.reject(refreshError);
      }
    }

    // If not a 401 error or if retry failed, reject the promise
    return Promise.reject(error);
  }
);

export default axiosInstance;
