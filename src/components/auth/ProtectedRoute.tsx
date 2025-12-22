import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TutorialGate from '../onboarding/TutorialGate';
import OnboardingGate from '../onboarding/OnboardingGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuth();

  // Don't redirect during initial session hydration.
  if (!hasCheckedAuth || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <OnboardingGate>
      <TutorialGate>{children}</TutorialGate>
    </OnboardingGate>
  );
}

