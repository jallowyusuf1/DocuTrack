import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';
import { ensureBucketExists } from '../../utils/storageSetup';
import { authService } from '../../services/authService';

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

    // Check for existing session on app load for session persistence
    const initializeSession = async () => {
      try {
        // Use getSession() which reads from localStorage immediately
        // This is the fastest way to restore session on page refresh
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[Auth] Session check error:', sessionError);
          // If there's an error, still mark as checked so app doesn't hang
          useAuthStore.setState({
            hasCheckedAuth: true,
            isLoading: false,
          });
          return;
        }

        if (session && session.user) {
          // Session exists - restore it immediately
          try {
            // Verify session is still valid
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError || !user) {
              // Session is invalid, clear it
              await supabase.auth.signOut();
              useAuthStore.setState({
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
              const profile = await authService.getUserProfile(user.id);
              useAuthStore.setState({
                user,
                profile,
                session,
                isAuthenticated: true,
                isLoading: false,
                hasCheckedAuth: true,
                error: null,
              });
            } catch (profileError) {
              // If profile fetch fails, still restore session (profile might not exist yet)
              useAuthStore.setState({
                user,
                profile: null,
                session,
                isAuthenticated: true,
                isLoading: false,
                hasCheckedAuth: true,
                error: null,
              });
            }
          } catch (error) {
            console.error('[Auth] User verification failed:', error);
            // If verification fails, still try to restore session
            useAuthStore.setState({
              user: session.user,
              profile: null,
              session,
              isAuthenticated: true,
              isLoading: false,
              hasCheckedAuth: true,
              error: null,
            });
          }
        } else {
          // No session found - mark as checked so ProtectedRoute can redirect
          useAuthStore.setState({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            hasCheckedAuth: true,
            error: null,
          });
        }

        // Bucket setup should not block auth restore; run after.
        ensureBucketExists().catch(() => {});
      } catch (error) {
        console.error('[Auth] Session restore failed:', error);
        // Mark as checked even on error so app doesn't hang
        useAuthStore.setState({
          hasCheckedAuth: true,
          isLoading: false,
        });
      }
    };

    // Initialize session immediately on mount
    initializeSession();

    // Note: Session persistence is handled by Supabase's conditionalStorage
    // which respects the "Remember Me" preference automatically.
    // We don't need to manually clear on beforeunload as it interferes with session restoration.

    // Set up auth state change listener for session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle initial session restoration on page load
        if (event === 'INITIAL_SESSION' && session) {
          // Restore session on page load/refresh
          try {
            const profile = await authService.getUserProfile(session.user.id);
            useAuthStore.setState({
              user: session.user,
              profile,
              session,
              isAuthenticated: true,
              isLoading: false,
              hasCheckedAuth: true,
            });
          } catch (error) {
            // If profile fetch fails, still set session but mark as checked
            useAuthStore.setState({
              user: session.user,
              profile: null,
              session,
              isAuthenticated: true,
              isLoading: false,
              hasCheckedAuth: true,
            });
          }
        } else if (event === 'SIGNED_IN' && session) {
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
            hasCheckedAuth: true,
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
            // Only log in development to reduce console noise
            if (import.meta.env.MODE === 'development') {
              console.debug('[Auth] Token refresh user update failed (non-critical):', error instanceof Error ? error.message : error);
            }
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]); // Include checkAuth in deps

  return <>{children}</>;
}
