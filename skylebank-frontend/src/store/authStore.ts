/**
 * File: authStore.ts
 *
 * Purpose:
 * Provides global authentication state management using Zustand.
 *
 * Responsibilities:
 * * Track active user profile, accessToken, and loading/initializing state
 * * Manage user login and logout actions
 * * Cache user profiles in LocalStorage for persistence across page reloads
 *
 * Why this file exists:
 * To provide centralized access to user state for route guards and layout components.
 *
 * Usage Flow:
 * Login Page -> login() action -> useAuthStore state update -> ProtectedRoute unlocks
 *
 * Important Notes:
 * * Access tokens are stored only in memory for security
 *
 * Design Decisions:
 * * Zustand state management pattern
 */
import { create } from 'zustand';


export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (user: UserProfile, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (token: string | null) => void;
  setInitializing: (initializing: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Try to load cached user profile on startup
  const cachedUser = localStorage.getItem('skylebank_user');
  let initialUser: UserProfile | null = null;
  if (cachedUser) {
    try {
      initialUser = JSON.parse(cachedUser);
    } catch {
      localStorage.removeItem('skylebank_user');
    }
  }

  return {
    user: initialUser,
    accessToken: null,
    isAuthenticated: !!initialUser,
    isInitializing: true,
    login: (user, accessToken) => {
      localStorage.setItem('skylebank_user', JSON.stringify(user));
      set({ user, accessToken, isAuthenticated: true, isInitializing: false });
    },
    logout: () => {
      localStorage.removeItem('skylebank_user');
      set({ user: null, accessToken: null, isAuthenticated: false, isInitializing: false });
    },
    setAccessToken: (accessToken) => set({ accessToken }),
    setInitializing: (isInitializing) => set({ isInitializing }),
  };
});
