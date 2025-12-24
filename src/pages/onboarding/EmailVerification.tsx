import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import { GlassBackground } from '../../components/ui/glass/GlassBackground';
import { GlassButton, GlassCard, GlassPill } from '../../components/ui/glass/Glass';
import { authService } from '../../services/authService';
import { supabase } from '../../config/supabase';
import { prefersReducedMotion, triggerHaptic } from '../../utils/animations';
import { useTranslation } from 'react-i18next';

type LocationState = {
  email?: string;
};

function useQueryEmail(stateEmail?: string) {
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;
  const params = new URLSearchParams(location.search);
  return (
    stateEmail ||
    state?.email ||
    params.get('email') ||
    localStorage.getItem('onboarding.email') ||
    ''
  );
}

export default function EmailVerification() {
  const reduced = prefersReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const email = useQueryEmail((location.state as LocationState | null)?.email);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [requireVerification, setRequireVerification] = useState<boolean>(true);
  const [checkingConfig, setCheckingConfig] = useState(true);

  const [changingEmail, setChangingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);

  const timerRef = useRef<number | null>(null);

  const canResend = cooldown <= 0 && !sending;

  useMemo(() => void 0, []);

  useEffect(() => {
    // persist email for refresh safety
    if (email) localStorage.setItem('onboarding.email', email);
  }, [email]);

  useEffect(() => {
    // Load admin config via Edge Function (app_settings has RLS).
    let cancelled = false;
    const run = async () => {
      setCheckingConfig(true);
      try {
        const { data, error } = await supabase.functions.invoke('onboarding-config');
        if (cancelled) return;
        if (error) throw error;
        const enabled = Boolean((data as any)?.require_email_verification);
        setRequireVerification(enabled);
      } catch {
        if (!cancelled) setRequireVerification(true);
      } finally {
        if (!cancelled) setCheckingConfig(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = window.setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) {
      setError(t('errors.required', { field: t('auth.email') }));
      return;
    }
    if (!canResend) return;

    triggerHaptic('light');
    setSending(true);
    setError(null);
    setMessage(null);
    try {
      await authService.resendConfirmationEmail(email);
      setMessage(t('onboarding.stage2.resend'));
      setCooldown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.failedToSave'));
    } finally {
      setSending(false);
    }
  };

  const handleSkip = async () => {
    triggerHaptic('light');
    setError(null);
    setMessage(null);

    // If verification not required, allow skipping forward.
    if (!requireVerification) {
      navigate('/onboarding/profile', { replace: true });
      return;
    }

    // If verification is required, user likely has no session until confirmed.
    // Move them to login where they can sign in after verifying.
    navigate('/login?reason=verify_email', { replace: true });
  };

  const handleChangeEmail = async () => {
    triggerHaptic('light');
    setError(null);
    setMessage(null);

    if (!newEmail.trim()) {
      setError(t('errors.required', { field: t('onboarding.stage2.newEmail') }));
      return;
    }
    if (!confirmPassword) {
      setError(t('errors.required', { field: t('onboarding.stage2.confirmPassword') }));
      return;
    }

    setUpdatingEmail(true);
    try {
      // Supabase requires an authenticated session to update email.
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session?.user?.email) {
        throw new Error(t('auth.signIn'));
      }

      // Password confirmation (reauth) — creates a fresh session.
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: confirmPassword,
      });
      if (signInErr) throw signInErr;

      const { error: updateErr } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (updateErr) throw updateErr;

      // Keep onboarding display consistent across refreshes.
      localStorage.setItem('onboarding.email', newEmail.trim());

      // Best-effort resend to the new email (Supabase may already send a confirmation).
      try {
        await authService.resendConfirmationEmail(newEmail.trim());
      } catch {
        // ignore
      }

      setMessage('Email updated. Check your inbox for a new verification link.');
      setCooldown(60);
      setConfirmPassword('');
      setChangingEmail(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errors.failedToSave'));
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleContinue = async () => {
    triggerHaptic('light');
    // If user has a session already, we can continue to Stage 3.
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      navigate('/onboarding/profile', { replace: true });
      return;
    }
    // Otherwise, they must verify first.
    setMessage('Once you verify the link, you’ll be able to continue.');
  };

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
            <div
              className="w-[120px] h-[120px] rounded-[32px] mx-auto flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.9), rgba(109,40,217,0.9))',
                boxShadow: '0 22px 60px rgba(0,0,0,0.45), 0 0 70px rgba(139,92,246,0.35)',
              }}
            >
              <Mail className="w-14 h-14 text-white" />
            </div>

            <h1 className="mt-6 text-white font-semibold tracking-tight text-[32px] leading-tight">
              {t('onboarding.stage2.title')}
            </h1>
            <p className="mt-2 text-white/65 text-[17px] leading-relaxed">
              {t('onboarding.stage2.subtitle')}
            </p>

            <div className="mt-4 flex justify-center">
              <GlassPill className="text-white/90" style={{ color: '#A78BFA' }}>
                {email || 'your email'}
              </GlassPill>
            </div>

            <p className="mt-4 text-white/65 text-sm leading-relaxed">
              {t('onboarding.stage2.instructions')}
            </p>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 rounded-xl px-4 py-3 text-sm flex items-start gap-2"
                  style={{
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: 'rgba(255,255,255,0.90)',
                  }}
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-red-300" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="mt-4 rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: 'rgba(139,92,246,0.12)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    color: 'rgba(255,255,255,0.90)',
                  }}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 space-y-3">
              <GlassButton className="w-full" onClick={handleContinue} disabled={checkingConfig}>
                {t('onboarding.stage2.continue')} <ArrowRight className="w-4 h-4" />
              </GlassButton>

              <div className="text-white/65 text-sm">
                {t('onboarding.stage2.resendPrefix')}{' '}
                <button
                  type="button"
                  className="text-purple-300 hover:text-purple-200 transition-colors font-semibold"
                  onClick={handleResend}
                  disabled={!canResend}
                >
                  {cooldown > 0
                    ? t('onboarding.stage2.resendIn', { seconds: cooldown })
                    : sending
                      ? `${t('common.loading')}`
                      : t('onboarding.stage2.resend')}
                  {cooldown <= 0 && !sending ? <RefreshCw className="inline-block w-4 h-4 ml-2" /> : null}
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-white/60 hover:text-white transition-colors text-sm underline underline-offset-4"
                >
                  {requireVerification ? t('onboarding.stage2.verifyLater') : t('onboarding.stage2.skip')}
                </button>
                {requireVerification ? (
                  <div className="mt-2 text-xs text-white/50">
                    {t('onboarding.stage2.limitedWarning')}
                  </div>
                ) : null}
              </div>

              <div className="pt-3 text-center text-white/60 text-sm">
                {t('onboarding.stage2.wrongEmail')}{' '}
                <button
                  type="button"
                  className="text-white font-semibold hover:opacity-90 underline underline-offset-4"
                  onClick={() => {
                    triggerHaptic('light');
                    setChangingEmail((v) => !v);
                    setNewEmail(email || '');
                    setConfirmPassword('');
                    setError(null);
                    setMessage(null);
                  }}
                >
                  {t('onboarding.stage2.changeEmail')}
                </button>
              </div>

              <AnimatePresence>
                {changingEmail && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 8, height: 0 }}
                    className="mt-4 text-left overflow-hidden"
                  >
                    <div
                      className="rounded-2xl p-4"
                      style={{
                        background: 'rgba(35, 29, 51, 0.55)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                      }}
                    >
                      <div className="text-white font-semibold text-sm mb-3">Change email</div>

                      <label className="block text-white/70 text-xs mb-1">{t('onboarding.stage2.newEmail')}</label>
                      <input
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="glass-input w-full h-11 px-4 text-white placeholder:text-white/45"
                        type="email"
                        autoComplete="email"
                        disabled={updatingEmail}
                      />

                      <label className="block text-white/70 text-xs mb-1 mt-3">{t('onboarding.stage2.confirmPassword')}</label>
                      <div className="relative">
                        <input
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="glass-input w-full h-11 pl-4 pr-11 text-white placeholder:text-white/45"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          disabled={updatingEmail}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setShowConfirmPassword(!showConfirmPassword);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.10)',
                          }}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <GlassButton
                          variant="secondary"
                          className="flex-1"
                          onClick={() => {
                            triggerHaptic('light');
                            setChangingEmail(false);
                            setConfirmPassword('');
                          }}
                          disabled={updatingEmail}
                        >
                          {t('onboarding.stage2.cancel')}
                        </GlassButton>
                        <GlassButton
                          className="flex-1"
                          onClick={handleChangeEmail}
                          disabled={updatingEmail}
                        >
                          {updatingEmail ? t('common.loading') : t('onboarding.stage2.update')}
                        </GlassButton>
                      </div>

                      <div className="mt-3 text-xs text-white/50 leading-relaxed">
                        {t('onboarding.stage2.changeEmailNote')}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}


