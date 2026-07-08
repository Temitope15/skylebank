/**
 * File: apiClient.ts
 *
 * Purpose:
 * Configures Axios HTTP client instance with base url, credentials, and interceptors.
 *
 * Responsibilities:
 * * Inject JWT access tokens into request Authorization headers
 * * Catch 401 Unauthorized errors and transparently execute silent refresh token rotations
 * * Flush state cache and logout user if refresh rotation fails
 *
 * Why this file exists:
 * To automate secure token handling and credentials persistence for all API requests.
 *
 * Usage Flow:
 * Component -> apiClient.get('/wallet') -> Request Interceptor -> Request sent -> Response / Interceptor rotation
 *
 * Design Decisions:
 * * Axios Interceptor Pattern
 */
import axios from 'axios';

import { useAuthStore } from '../store/authStore';

// Retrieve API URL from Vite environment, fallback to localhost:8080
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for HTTP-only cookie operations
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to append authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle transparent 401 token refreshes
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite refresh loop by checking if retry flag is set
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't try to refresh if request was already to login or register
      if (
        originalRequest.url?.includes('/api/v1/auth/login') ||
        originalRequest.url?.includes('/api/v1/auth/register') ||
        originalRequest.url?.includes('/api/v1/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      try {
        // Request token rotation via HttpOnly refresh cookie
        const response = await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;
        useAuthStore.getState().setAccessToken(accessToken);

        // Retry original failed request
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token is expired or invalid -> log out user
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
