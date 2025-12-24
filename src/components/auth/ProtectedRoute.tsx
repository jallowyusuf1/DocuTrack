import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import TutorialGate from '../onboarding/TutorialGate';
import OnboardingGate from '../onboarding/OnboardingGate';
import LoadingScreen from '../ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasCheckedAuth } = useAuth();

  // Don't redirect during initial session hydration.
  if (!hasCheckedAuth || isLoading) {
    return <LoadingScreen subtitle="Loading your account..." />;
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

