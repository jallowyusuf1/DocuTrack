import { create } from 'zustand';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { authService, type SignupData, type LoginData, type UserProfile } from '../services/authService';
import { supabase } from '../config/supabase';
import type { AccountRole, AccountType, ChildSessionContext } from '../services/childSession';
import { clearAccountSession, hydrateAccountType } from '../services/childSession';

interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  error: string | null;
  accountType: AccountType;
  accountRole: AccountRole;
  childContext: ChildSessionContext | null;
  
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
  accountType: 'adult',
  accountRole: 'user',
  childContext: null,

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

      // Only hydrate child/adult when we actually have a session.
      if (result.session?.user?.id) {
        try {
          const detected = await hydrateAccountType(result.session.user.id);
          set({ accountType: detected.accountType, accountRole: detected.role, childContext: detected.child });
        } catch {
          set({ accountType: 'adult', accountRole: 'user', childContext: null });
        }
      }
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
        accountType: 'adult',
        accountRole: 'user',
        childContext: null,
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

      // Detect child vs adult and store session context.
      try {
        const detected = await hydrateAccountType(result.user.id);
        set({ accountType: detected.accountType, accountRole: detected.role, childContext: detected.child });
      } catch {
        set({ accountType: 'adult', accountRole: 'user', childContext: null });
      }
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
        accountType: 'adult',
        accountRole: 'user',
        childContext: null,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      clearAccountSession();
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
        error: null,
        accountType: 'adult',
        accountRole: 'user',
        childContext: null,
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
        // Use the session user immediately; don't depend on network for "refresh persistence".
        const sessionUser = session.user;

        // Verify the session is still valid by checking token expiry
        const expiresAt = session.expires_at;
        const now = Math.floor(Date.now() / 1000);
        
        // If token is expired or expiring soon, Supabase will auto-refresh
        // But we should still verify the user is valid
        if (expiresAt && expiresAt > now) {
          // Session is valid. Prefer session user; optionally confirm with getUser if available.
          let user = sessionUser;
          try {
            const confirmedUser = await authService.getCurrentUser();
            if (confirmedUser) user = confirmedUser;
          } catch {
            // Offline / transient: keep session user.
          }

          // Profile is optional; don't fail auth if it can't be loaded.
          const profile = await authService.getUserProfile(user.id);
          
          set({
            user,
            profile,
            session,
            isAuthenticated: true,
            isLoading: false,
            hasCheckedAuth: true,
            error: null,
          });

          // Hydrate child/adult in background (do not fail auth if it errors)
          try {
            const detected = await hydrateAccountType(user.id);
            set({ accountType: detected.accountType, accountRole: detected.role, childContext: detected.child });
          } catch {
            set({ accountType: 'adult', accountRole: 'user', childContext: null });
          }
        } else {
          // Token expired - Supabase should auto-refresh, but if it doesn't, clear state
          // Try to refresh the session
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          if (refreshedSession) {
            let user = refreshedSession.user;
            try {
              const confirmedUser = await authService.getCurrentUser();
              if (confirmedUser) user = confirmedUser;
            } catch {
              // Keep refreshed session user if offline.
            }
            const profile = await authService.getUserProfile(user.id);
            set({
              user,
              profile,
              session: refreshedSession,
              isAuthenticated: true,
              isLoading: false,
              hasCheckedAuth: true,
              error: null,
            });

            try {
              const detected = await hydrateAccountType(user.id);
              set({ accountType: detected.accountType, accountRole: detected.role, childContext: detected.child });
            } catch {
              set({ accountType: 'adult', accountRole: 'user', childContext: null });
            }
          } else {
            // No valid session
            clearAccountSession();
            set({
              user: null,
              profile: null,
              session: null,
              isAuthenticated: false,
              isLoading: false,
              hasCheckedAuth: true,
              error: null,
              accountType: 'adult',
              accountRole: 'user',
              childContext: null,
            });
          }
        }
      } else {
        // No session - clear auth state
        clearAccountSession();
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          hasCheckedAuth: true,
          error: null,
          accountType: 'adult',
          accountRole: 'user',
          childContext: null,
        });
      }
    } catch (error) {
      // Don't set error for auth check failures - just mark as not authenticated
      // Only log in development to reduce console noise
      if (import.meta.env.MODE === 'development') {
        console.debug('[Auth] Check failed (non-critical):', error instanceof Error ? error.message : error);
      }
      clearAccountSession();
      set({
        user: null,
        profile: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
        error: null, // Don't show error for failed auth check
        accountType: 'adult',
        accountRole: 'user',
        childContext: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
