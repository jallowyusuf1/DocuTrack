import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';

/**
 * OnboardingGate
 * Redirects authenticated users into onboarding until `user_profiles.onboarding_completed` is true.
 *
 * Safety rules:
 * - Never redirect while already on onboarding/verification routes (avoid loops)
 * - Only enforce for brand new users OR when localStorage says onboarding is active
 * - Fail open if the DB lookup fails (don’t block the app)
 */
export default function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.id) {
        if (!cancelled) setReady(true);
        return;
      }

      const path = location.pathname;
      const isOnboardingRoute = path.startsWith('/onboarding');
      const isVerifyRoute = path.startsWith('/verify-email');

      if (isOnboardingRoute || isVerifyRoute) {
        if (!cancelled) setReady(true);
        return;
      }

      const onboardingActive = localStorage.getItem('onboarding.active') === '1';
      const createdAtMs = user.created_at ? new Date(user.created_at).getTime() : 0;
      const isNewUser =
        createdAtMs > 0 ? Date.now() - createdAtMs < 10 * 60 * 1000 : false;

      if (!onboardingActive && !isNewUser) {
        if (!cancelled) setReady(true);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, onboarding_stage')
          .eq('user_id', user.id)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          setReady(true);
          return;
        }

        if (!data) {
          if (onboardingActive || isNewUser) {
            localStorage.setItem('onboarding.active', '1');
            navigate('/onboarding/profile', { replace: true });
            return;
          }
          setReady(true);
          return;
        }

        const completed = Boolean(data.onboarding_completed);
        const stage = Number(data.onboarding_stage ?? 1);

        if (completed) {
          localStorage.removeItem('onboarding.active');
          setReady(true);
          return;
        }

        localStorage.setItem('onboarding.active', '1');
        const to = stage >= 4 ? '/onboarding/security' : '/onboarding/profile';
        navigate(to, { replace: true });
      } catch {
        if (!cancelled) setReady(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, navigate, user?.id]);

  if (!ready) return null;
  return <>{children}</>;
}


