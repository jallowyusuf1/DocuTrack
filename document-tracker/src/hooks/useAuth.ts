import { useAuthStore } from '../store/authStore';

/**
 * useAuth hook - provides access to authentication state and methods
 * Note: AuthProvider handles session persistence and auth state changes
 */
export function useAuth() {
  const {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    error,
    signup,
    login,
    logout,
    checkAuth,
    clearError,
  } = useAuthStore();

  return {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    error,
    signup,
    login,
    logout,
    checkAuth,
    clearError,
  };
}

