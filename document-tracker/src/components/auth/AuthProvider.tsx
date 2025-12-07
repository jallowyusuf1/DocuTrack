import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider component that initializes auth state on app load
 * and sets up session persistence with automatic token refresh
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const initialized = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (initialized.current) return;
    initialized.current = true;

    // Check for existing session on app load (from localStorage)
    checkAuth().catch(() => {
      // Silently fail - no session exists
    });

    // Set up auth state change listener for session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in - refresh auth state
          await checkAuth();
        } else if (event === 'SIGNED_OUT') {
          // User signed out - clear state
          useAuthStore.setState({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token refreshed automatically - update session without full check
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              useAuthStore.setState((state) => ({
                ...state,
                session,
                user,
              }));
            }
          } catch (error) {
            console.warn('Failed to update user on token refresh:', error);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty deps - only run once

  return <>{children}</>;
}
