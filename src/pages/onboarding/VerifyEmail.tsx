import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { GlassBackground } from '../../components/ui/glass/GlassBackground';
import { GlassButton, GlassCard } from '../../components/ui/glass/Glass';
import { prefersReducedMotion, triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

export default function VerifyEmail() {
  const reduced = prefersReducedMotion();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const { t } = useTranslation();

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const tokenHash = url.searchParams.get('token_hash');
        const type = url.searchParams.get('type') || 'signup';

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (!data.session) throw new Error('Missing session after verification.');
        } else if (tokenHash) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as any,
          });
          if (error) throw error;
        } else {
          throw new Error('Missing verification parameters.');
        }

        await checkAuth();
        if (cancelled) return;
        triggerHaptic('medium');
        setStatus('success');
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : t('onboarding.verifyEmail.errorTitle'));
        setStatus('error');
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [checkAuth]);

  const goNext = () => navigate('/onboarding/profile', { replace: true });
  const goBack = () => navigate('/onboarding/email', { replace: true });

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden flex flex-col"
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <GlassBackground />
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <GlassCard
            elevated
            className="p-6 md:p-8 text-center"
            style={{
              borderRadius: 30,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 60%, rgba(139,92,246,0.12) 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            {status === 'verifying' ? (
              <>
                <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center bg-white/10 border border-white/15">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
                <h1 className="mt-4 text-white font-semibold text-xl">{t('onboarding.verifyEmail.verifyingTitle')}</h1>
                <p className="mt-2 text-white/65 text-sm">{t('onboarding.verifyEmail.verifyingSubtitle')}</p>
              </>
            ) : status === 'success' ? (
              <>
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
                  style={{
                    background: 'rgba(16,185,129,0.20)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
                  }}
                >
                  <Check className="w-6 h-6 text-emerald-200" />
                </div>
                <h1 className="mt-4 text-white font-semibold text-xl">{t('onboarding.verifyEmail.successTitle')}</h1>
                <p className="mt-2 text-white/65 text-sm">{t('onboarding.verifyEmail.successSubtitle')}</p>
                <div className="mt-6">
                  <GlassButton className="w-full" onClick={goNext}>
                    {t('onboarding.stage2.continue')}
                  </GlassButton>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
                  style={{
                    background: 'rgba(239,68,68,0.14)',
                    border: '1px solid rgba(239,68,68,0.25)',
                  }}
                >
                  <AlertTriangle className="w-6 h-6 text-red-200" />
                </div>
                <h1 className="mt-4 text-white font-semibold text-xl">{t('onboarding.verifyEmail.errorTitle')}</h1>
                <p className="mt-2 text-white/65 text-sm">{error || 'Please try resending the email.'}</p>
                <div className="mt-6 space-y-3">
                  <GlassButton className="w-full" onClick={goBack}>
                    {t('onboarding.verifyEmail.backToEmail')}
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate('/login', { replace: true })}
                  >
                    {t('onboarding.verifyEmail.goToSignIn')}
                  </GlassButton>
                </div>
              </>
            )}
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}


