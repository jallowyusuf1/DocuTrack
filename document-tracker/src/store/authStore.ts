import { create } from 'zustand';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { authService, type SignupData, type LoginData, type UserProfile } from '../services/authService';
import { supabase } from '../config/supabase';

interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signup: (data: SignupData) => Promise<{ user: SupabaseUser; session: Session | null; profile: UserProfile | null } | undefined>;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  signup: async (data: SignupData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.signup(data);
      // Only set as authenticated if we have a session
      // If email confirmation is required, session will be null
      const authenticated = !!result.session;
      set({
        user: result.user,
        profile: result.profile,
        session: result.session,
        isAuthenticated: authenticated,
        isLoading: false,
        error: null,
      });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.login(data);
      set({
        user: result.user,
        profile: result.profile,
        session: result.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      // First, try to get the session from storage (persisted by Supabase)
      const session = await authService.getSession();
      
      if (session?.user && session?.access_token) {
        // Verify the session is still valid by checking token expiry
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        // If token is expired or expiring soon, Supabase will auto-refresh
        // But we should still verify the user is valid
        if (expiresAt && expiresAt > now) {
          // Session is valid - verify the user is still valid
          const user = await authService.getCurrentUser();
          
          // Get profile, but don't fail if it doesn't exist
          let profile = null;
          try {
            profile = await authService.getUserProfile(user.id);
          } catch (profileError) {
            // Profile fetch failed, but user is still authenticated
            console.warn('Profile fetch failed during auth check:', profileError);
          }
          
          set({
            user,
            profile,
            session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Token expired - Supabase should auto-refresh, but if it doesn't, clear state
          // Try to refresh the session
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          if (refreshedSession) {
            const user = await authService.getCurrentUser();
            const profile = await authService.getUserProfile(user.id);
            set({
              user,
              profile,
              session: refreshedSession,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // No valid session
            set({
              user: null,
              profile: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        }
      } else {
        // No session - clear auth state
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      // Don't set error for auth check failures - just mark as not authenticated
      console.warn('Auth check failed:', error);
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null, // Don't show error for failed auth check
      });
    }
  },

  clearError: () => set({ error: null }),
}));
