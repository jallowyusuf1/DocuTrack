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
    hasCheckedAuth,
    error,
    signup,
    login,
    logout,
    checkAuth,
    clearError,
  } = useAuthStore();

  // Derive accountType from profile.account_role
  const accountType = profile?.account_role || null;

  // TODO: Implement child context when child account feature is fully integrated
  const childContext = null;

  return {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    hasCheckedAuth,
    error,
    accountType, // Add accountType for backward compatibility
    childContext, // Placeholder for child account context
    signup,
    login,
    logout,
    checkAuth,
    clearError,
  };
}

