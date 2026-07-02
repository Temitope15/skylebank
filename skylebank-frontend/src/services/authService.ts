/**
 * File: authService.ts
 *
 * Purpose:
 * Provides concrete API client wrappers for all authentication endpoints.
 *
 * Responsibilities:
 * * Execute POST requests to register, login, logout, refresh, and password reset endpoints
 * * Synchronize user session state back to the Zustand authStore
 *
 * Why this file exists:
 * To isolate HTTP auth endpoint bindings from page/view component logic.
 *
 * Usage Flow:
 * Page Component -> authService.login() -> apiClient call -> authStore login() triggered
 *
 * Design Decisions:
 * * Client Service Layer Pattern
 */
import { apiClient } from './apiClient';

import { useAuthStore } from '../store/authStore';
import type { UserProfile } from '../store/authStore';
import type { LoginCredentials, RegisterData } from '../types/auth';

interface LoginResponsePayload {
  accessToken: string;
  tokenType: string;
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const authService = {
  /**
   * Submit registration payload to the backend.
   */
  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/register', data);
    return response.data;
  },

  /**
   * Perform user authentication login.
   */
  async login(credentials: LoginCredentials): Promise<UserProfile> {
    const response = await apiClient.post<LoginResponsePayload>('/api/v1/auth/login', credentials);
    const { accessToken, id, email, firstName, lastName, role } = response.data;
    
    const user: UserProfile = { id, email, firstName, lastName, role };
    useAuthStore.getState().login(user, accessToken);
    return user;
  },

  /**
   * Log out from the active session.
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } finally {
      useAuthStore.getState().logout();
    }
  },

  /**
   * Silently verify and fetch fresh access token on application boot.
   */
  async checkSession(): Promise<string | null> {
    const store = useAuthStore.getState();
    store.setInitializing(true);
    try {
      const response = await apiClient.post<{ accessToken: string }>('/api/v1/auth/refresh');
      const { accessToken } = response.data;
      store.setAccessToken(accessToken);
      
      // If user info is cached but we lacked access token, this refreshes the connection
      if (store.user) {
        store.login(store.user, accessToken);
      }
      return accessToken;
    } catch {
      store.logout();
      return null;
    } finally {
      store.setInitializing(false);
    }
  },
  
  /**
   * Initiate forgot password request.
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },
  
  /**
   * Submit new password using reset token.
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/reset-password', { token, newPassword });
    return response.data;
  }
};
