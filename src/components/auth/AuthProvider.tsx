import { useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../config/supabase';
import { ensureBucketExists } from '../../utils/storageSetup';
import { childAccountsService } from '../../services/childAccounts';

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
        // Always attempt to restore auth state on load.
        // ProtectedRoute will wait for hasCheckedAuth before redirecting.
        await checkAuth();

        // Bucket setup should not block auth restore; run after.
        ensureBucketExists().catch(() => {});
      } catch (error) {
        // Only log in development to reduce console noise
        if (import.meta.env.MODE === 'development') {
          console.debug('[Auth] Session restore failed (non-critical):', error instanceof Error ? error.message : error);
        }
      }
    };

    initializeSession();

    // Clear session on page unload if "Remember Me" is false
    const handleBeforeUnload = () => {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      if (!rememberMe) {
        // Clear session from localStorage on page unload
        // sessionStorage will be cleared automatically by browser
        localStorage.removeItem('supabase.auth.token');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Set up auth state change listener for session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // User signed in - refresh auth state
          await checkAuth();
          // Best-effort: if this is a child account, update last active timestamp
          try {
            if (session.user?.id) {
              await childAccountsService.touchLastActive(session.user.id);
            }
          } catch {
            // ignore
          }
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
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [checkAuth]); // Include checkAuth in deps

  return <>{children}</>;
}
