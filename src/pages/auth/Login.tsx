import { useEffect, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Eye, EyeOff, Loader2, ArrowRight, Check } from 'lucide-react';
import { triggerHaptic, prefersReducedMotion } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { validateEmail } from '../../utils/validation';
import NetworkStatusBanner from '../../components/NetworkStatusBanner';
import { GlassBackground } from '../../components/ui/glass/GlassBackground';
import { GlassButton, GlassCard, GlassPill } from '../../components/ui/glass/Glass';
import AuthGlassNav from '../../components/layout/AuthGlassNav';
import BrandLogo from '../../components/ui/BrandLogo';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, accountType, logout } = useAuth();
  const reduced = prefersReducedMotion();

  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Default to true if not set (for better UX - users stay logged in)
  const [rememberMe, setRememberMe] = useState(() => {
    const stored = localStorage.getItem('rememberMe');
    // If not set, default to true for better UX
    return stored === null ? true : stored === 'true';
  });

  const [loginAttempts, setLoginAttempts] = useState(() => {
    const attempts = localStorage.getItem('loginAttempts');
    const lastAttempt = localStorage.getItem('lastLoginAttempt');
    if (attempts && lastAttempt) {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      if (timeSinceLastAttempt > 900000) {
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
        return 0;
      }
      return parseInt(attempts);
    }
    return 0;
  });

  const [isLocked, setIsLocked] = useState(() => {
    const lastAttempt = localStorage.getItem('lastLoginAttempt');
    if (lastAttempt && loginAttempts >= 5) {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      return timeSinceLastAttempt < 900000;
    }
    return false;
  });

  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<LoginFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  useEffect(() => {
    // Don't auto-redirect if user is already on login page - let them see the form
    // Only redirect if they came from inside the app (not from landing)
    if (!isAuthenticated) return;

    const currentPath = window.location.pathname;
    if (currentPath === '/login') {
      // If already on login, don't redirect - user intentionally wants to see login
      return;
    }

    // Child accounts go to the same routes but with supervision UI enabled everywhere.
    // Keeping path stable avoids duplicating dashboards.
    navigate('/dashboard', { replace: true });
  }, [isAuthenticated, accountType, navigate]);

  useEffect(() => {
    if (!isLocked) return;
    const lastAttempt = localStorage.getItem('lastLoginAttempt');
    if (!lastAttempt) return;

    const tick = () => {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      const remaining = Math.max(0, 900000 - timeSinceLastAttempt);
      setLockoutTimeRemaining(Math.ceil(remaining / 1000));
      if (remaining <= 0) {
        setIsLocked(false);
        setLoginAttempts(0);
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastLoginAttempt');
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isLocked]);

  if (isAuthenticated) return null;

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    triggerHaptic('light');

    if (isLocked) {
      setSubmitError(`Too many login attempts. Please try again in ${Math.ceil(lockoutTimeRemaining / 60)} minutes.`);
      return;
    }

    // Store "Remember Me" preference before login
    localStorage.setItem('rememberMe', rememberMe.toString());
    
    // Note: We don't clear the session here anymore - Supabase handles persistence
    // based on persistSession: true configuration. Sessions will persist regardless
    // of "Remember Me" setting for better UX.

    try {
      await login({ email: data.email, password: data.password });

      setLoginAttempts(0);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lastLoginAttempt');

      triggerHaptic('medium');
      // Navigation handled by effect (waits for child/adult detection too).
    } catch (error) {
      triggerHaptic('heavy');

      // Check if this is a network error first
      let errorMessage = 'Incorrect email or password';
      let isNetworkError = false;

      if (error instanceof Error) {
        if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
          errorMessage = 'Please confirm your email address before signing in.';
        } else if (error.message) {
          errorMessage = error.message;
          // Check if this is a network error
          isNetworkError = errorMessage.includes('Network') ||
                          errorMessage.includes('network') ||
                          errorMessage.includes('Failed to fetch') ||
                          errorMessage.includes('connection failed');
        }
      }

      // Only increment attempts and show countdown for authentication errors, NOT network errors
      if (!isNetworkError) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        localStorage.setItem('loginAttempts', newAttempts.toString());
        localStorage.setItem('lastLoginAttempt', Date.now().toString());

        if (newAttempts >= 5) {
          setIsLocked(true);
          setSubmitError('Too many login attempts. Please try again in 15 minutes.');
          return;
        }

        errorMessage += ` (${5 - newAttempts} attempts remaining)`;
      }

      setSubmitError(errorMessage);
    }
  };

  return (
    <motion.div
      className="h-screen relative overflow-hidden flex flex-col"
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <GlassBackground />
      <div className="relative z-10 flex flex-col h-full">
        <NetworkStatusBanner />

        {/* Small Glass Nav */}
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          <div
            className="px-6 py-3 rounded-full backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <img
                  src="/assets/logo.svg"
                  alt="DocuTrackr Logo"
                  className="hidden"
                  style={{
                    filter: 'drop-shadow(0 8px 24px rgba(139,92,246,0.35))',
                  }}
                />
                <BrandLogo className="w-8 h-8" alt="DocuTrackr Logo" />
                <span className="text-white font-semibold text-sm">DocuTrackr</span>
              </div>
              <div className="h-4 w-px bg-white/20" />
              <Link
                to="/"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Home
              </Link>
              <Link
                to="/signup"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <GlassCard
                elevated
                className="p-6 md:p-8"
                style={{
                  borderRadius: 30,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 55%, rgba(139,92,246,0.10) 100%)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                <GlassPill className="text-white/85">
                  <span className="font-medium">Welcome back</span>
                  <span className="text-white/55">— sign in to continue</span>
                </GlassPill>

                <h1 className="mt-4 text-white font-semibold tracking-tight text-2xl">Sign in</h1>
                <p className="mt-2 text-white/65 text-sm leading-relaxed">
                  Your deadlines, organized — across all your devices.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      className="glass-input w-full h-12 px-4 text-white placeholder:text-white/45"
                      {...register('email', {
                        required: 'Email is required',
                        validate: (v: string) => validateEmail(v) || 'Enter a valid email address',
                      })}
                      aria-invalid={errors.email && touchedFields.email ? 'true' : 'false'}
                    />
                    {errors.email && touchedFields.email && (
                      <div className="mt-2 text-sm text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email.message}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="glass-input w-full h-12 pl-4 pr-11 text-white placeholder:text-white/45"
                        {...register('password', { required: 'Password is required' })}
                        aria-invalid={errors.password && touchedFields.password ? 'true' : 'false'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setShowPassword((v: boolean) => !v);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white"
                        style={{
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && touchedFields.password && (
                      <div className="mt-2 text-sm text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password.message}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="flex items-center gap-2 text-white/75 text-sm cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                        className="sr-only"
                      />
                      <span
                        className="relative w-5 h-5 rounded-md flex items-center justify-center"
                        style={{
                          background: rememberMe ? 'rgba(139,92,246,0.22)' : 'rgba(255,255,255,0.06)',
                          border: rememberMe ? '1px solid rgba(167,139,250,0.55)' : '1px solid rgba(255,255,255,0.14)',
                          boxShadow: rememberMe
                            ? '0 10px 30px rgba(139,92,246,0.22), inset 0 1px 0 rgba(255,255,255,0.20)'
                            : 'inset 0 1px 0 rgba(255,255,255,0.14)',
                          backdropFilter: 'blur(16px)',
                          WebkitBackdropFilter: 'blur(16px)',
                          transition: 'all 160ms ease',
                        }}
                        aria-hidden="true"
                      >
                        <AnimatePresence initial={false}>
                          {rememberMe && (
                            <motion.span
                              key="check"
                              initial={{ scale: 0.8, opacity: 0, y: 1 }}
                              animate={{ scale: 1, opacity: 1, y: 0 }}
                              exit={{ scale: 0.8, opacity: 0, y: 1 }}
                              transition={{ duration: 0.16 }}
                              className="text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </span>
                      <span className="leading-none">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-white/70 hover:text-white text-sm">
                      Forgot password?
                    </Link>
                  </div>

                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl px-4 py-3 text-sm flex items-start gap-2"
                        style={{
                          background: 'rgba(239,68,68,0.12)',
                          border: '1px solid rgba(239,68,68,0.25)',
                          color: 'rgba(255,255,255,0.90)',
                        }}
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 text-red-300" />
                        <span>{submitError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <GlassButton
                    type="submit"
                    disabled={isLoading || isSubmitting || isLocked}
                    className="w-full"
                  >
                    {isLoading || isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </GlassButton>

                  <SocialAuthButtons
                    mode="login"
                    onAuthError={(provider, error) => {
                      setSubmitError(`Failed to connect with ${provider}. ${error}`);
                    }}
                  />

                  <div className="pt-2 text-center text-white/70 text-sm">
                    New here?{' '}
                    <Link to="/signup" className="text-white font-semibold hover:opacity-90">
                      Create an account
                    </Link>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

