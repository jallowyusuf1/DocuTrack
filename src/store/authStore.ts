import { create } from 'zustand';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { authService, type SignupData, type LoginData, type UserProfile } from '../services/authService';
import { supabase } from '../config/supabase';
import { pageLockService } from '../services/pageLock';

interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
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
  hasCheckedAuth: false,
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
        hasCheckedAuth: true,
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
        hasCheckedAuth: true,
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
        hasCheckedAuth: true,
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
        hasCheckedAuth: true,
        error: errorMessage,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      // Get current user ID before logout to clear page lock sessions
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      await authService.logout();

      // Clear page lock session unlocks
      if (userId) {
        pageLockService.clearSessionUnlocks(userId);
      }

      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Use getSession() which reads from localStorage immediately
      // This ensures we get the persisted session on page refresh
      const { data: { session: sessionData }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('[Auth] Session error:', sessionError);
        throw sessionError;
      }

      if (sessionData && sessionData.user) {
        // Verify the session is still valid by getting the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          // Session is invalid, clear it
          await supabase.auth.signOut();
          set({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedAuth: true,
          });
          return;
        }

        // Session is valid - restore it
        try {
          const profile = await authService.getProfile(user.id);
          set({
            user,
            profile,
            session: sessionData,
            isAuthenticated: true,
            isLoading: false,
            hasCheckedAuth: true,
            error: null,
          });
        } catch (profileError) {
          // If profile fetch fails, still restore session (profile might not exist yet)
          set({
            user,
            profile: null,
            session: sessionData,
            isAuthenticated: true,
            isLoading: false,
            hasCheckedAuth: true,
            error: null,
          });
        }
      } else {
        // No session found
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          hasCheckedAuth: true,
          error: null,
        });
      }
    } catch (error) {
      console.error('[Auth] Check auth failed:', error);
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
        error: error instanceof Error ? error.message : 'Auth check failed',
      });
    }
  },

  clearError: () => set({ error: null }),
}));
