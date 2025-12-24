import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { GlassBackground } from '../../components/ui/glass/GlassBackground';
import { GlassCard } from '../../components/ui/glass/Glass';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuthStore();
  const { showToast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params first
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (errorParam) {
          throw new Error(errorDescription || 'Authentication failed');
        }

        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!data.session) {
          throw new Error('No session found. Please try again.');
        }

        const user = data.session.user;

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at, onboarding_completed, onboarding_stage')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn('Profile fetch error:', profileError);
        }

        // If no profile exists, create one from OAuth metadata
        if (!profile) {
          const fullName = user.user_metadata?.full_name || 
                          user.user_metadata?.name || 
                          user.user_metadata?.preferred_username ||
                          user.email?.split('@')[0] || 
                          null;
          
          const avatarUrl = user.user_metadata?.avatar_url || 
                           user.user_metadata?.picture || 
                           null;

          // Create profile
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: user.id,
              full_name: fullName,
              avatar_url: avatarUrl,
              account_role: 'user',
              onboarding_completed: false,
              onboarding_stage: 3, // Start at profile completion
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (createError) {
            console.warn('Profile creation error:', createError);
            // Don't throw - profile might be created by trigger
          }
        }

        // Refresh auth state
        await checkAuth();

        setStatus('success');
        showToast('Welcome! Redirecting...', 'success');

        // Check if user needs onboarding
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed, onboarding_stage')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!userProfile || !userProfile.onboarding_completed) {
          localStorage.setItem('onboarding.active', '1');
          setTimeout(() => {
            navigate('/onboarding/profile', { replace: true });
          }, 1000);
        } else {
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 1000);
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        const message = error instanceof Error ? error.message : 'Authentication failed. Please try again.';
        setErrorMessage(message);
        setStatus('error');
        showToast(message, 'error');
        
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, checkAuth, showToast]);

  return (
    <motion.div
      className="h-screen relative overflow-hidden flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <GlassBackground />
      <div className="relative z-10 flex flex-col h-full items-center justify-center px-4">
        <GlassCard
          elevated
          className="p-8 max-w-md w-full text-center"
          style={{
            borderRadius: 30,
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 55%, rgba(139,92,246,0.10) 100%)',
            border: '1px solid rgba(255,255,255,0.14)',
          }}
        >
          {status === 'loading' && (
            <>
              <div className="flex justify-center mb-4">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
              <h2 className="text-white font-semibold text-xl mb-2">Completing sign in...</h2>
              <p className="text-white/70 text-sm">Please wait while we set up your account.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(16,185,129,0.20)',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <Check className="w-6 h-6 text-emerald-200" />
                </div>
              </div>
              <h2 className="text-white font-semibold text-xl mb-2">Success!</h2>
              <p className="text-white/70 text-sm">Redirecting to your dashboard...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(239,68,68,0.20)',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  <AlertCircle className="w-6 h-6 text-red-300" />
                </div>
              </div>
              <h2 className="text-white font-semibold text-xl mb-2">Authentication failed</h2>
              <p className="text-white/70 text-sm mb-4">{errorMessage}</p>
              <p className="text-white/50 text-xs">Redirecting to login...</p>
            </>
          )}
        </GlassCard>
      </div>
    </motion.div>
  );
}

