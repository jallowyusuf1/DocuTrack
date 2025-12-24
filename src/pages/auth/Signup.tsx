import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Check, Eye, EyeOff, Loader2 } from 'lucide-react';
import { triggerHaptic, prefersReducedMotion } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';
import { logTermsAcceptance } from '../../services/terms';
import TermsModal from '../../components/auth/TermsModal';
import NetworkStatusBanner from '../../components/NetworkStatusBanner';
import { GlassBackground } from '../../components/ui/glass/GlassBackground';
import { GlassButton, GlassCard, GlassPill, GlassTile } from '../../components/ui/glass/Glass';
import AuthGlassNav from '../../components/layout/AuthGlassNav';
import { calculateAgeYears } from '../../utils/age';
import BrandLogo from '../../components/ui/BrandLogo';
import SocialAuthButtons from '../../components/auth/SocialAuthButtons';

interface SignupFormData {
  fullName: string;
  dateOfBirth: string;
  accountRole: 'user' | 'parent';
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading, checkAuth } = useAuth();
  const reduced = prefersReducedMotion();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy'>('terms');
  const firstInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    setValue,
    trigger,
  } = useForm<SignupFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: { acceptedTerms: false, accountRole: 'user' },
  });

  const password = watch('password');
  const email = watch('email');
  const dateOfBirth = watch('dateOfBirth');
  const accountRole = watch('accountRole');
  const fullNameReg = register('fullName', {
    required: 'Full name is required',
    minLength: { value: 2, message: 'Full name must be at least 2 characters' },
  });
  const dobReg = register('dateOfBirth', {
    required: 'Date of birth is required',
    validate: (value) => {
      if (!value) return 'Date of birth is required';
      // Must be 13+ for compliance
      const age = calculateAgeYears(value);
      if (Number.isNaN(age)) return 'Invalid date of birth';
      if (age < 13) return 'You must be at least 13 years old';
      if (age > 120) return 'Please enter a valid age';
      return true;
    },
  });

  useEffect(() => {
    const t = window.setTimeout(() => firstInputRef.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    // If we just created an account, force onboarding instead of dashboard.
    const onboardingActive = localStorage.getItem('onboarding.active') === '1';
    if (onboardingActive) {
      navigate('/onboarding/email', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return null;

  const passwordRequirements = {
    minLength: (password?.length ?? 0) >= 8,
    hasUpper: /[A-Z]/.test(password || ''),
    hasLower: /[a-z]/.test(password || ''),
    hasNumber: /[0-9]/.test(password || ''),
  };

  const onSubmit = async (data: SignupFormData) => {
    setSubmitError(null);
    triggerHaptic('light');

    if (!data.acceptedTerms) {
      setSubmitError('You must accept the Terms of Service and Privacy Policy to sign up.');
      return;
    }

    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        accountRole: data.accountRole,
      });

      if (result?.session && result.user?.id) {
        await logTermsAcceptance(result.user.id);
        await checkAuth();
        triggerHaptic('medium');
        // Mark onboarding active so authenticated redirect doesn't jump to dashboard.
        localStorage.setItem('onboarding.active', '1');
        localStorage.setItem('onboarding.email', data.email);
        navigate('/onboarding/email', { replace: true, state: { email: data.email } });
      } else {
        // Email confirmation required: we won't have a session yet, but we still enter onboarding flow.
        localStorage.setItem('onboarding.active', '1');
        localStorage.setItem('onboarding.email', data.email);
        setShowSuccess(true);
        triggerHaptic('medium');
      }
    } catch (error) {
      triggerHaptic('heavy');
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setSubmitError(errorMessage);
    }
  };

  const acceptedTerms = !!watch('acceptedTerms');

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
                to="/login"
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-md">
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <div
                className="p-6 md:p-8 overflow-y-auto"
                style={{
                  maxHeight: 'calc(100vh - 180px)',
                  borderRadius: 30,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 55%, rgba(139,92,246,0.10) 100%)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(34px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(34px) saturate(180%)',
                  boxShadow:
                    '0 26px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.22)',
                }}
              >
                <GlassPill className="text-white/85">Create your account</GlassPill>

                <h1 className="mt-4 text-white font-semibold tracking-tight text-2xl">Start tracking in minutes</h1>
                <p className="mt-2 text-white/65 text-sm leading-relaxed">
                  Real content. Real reminders. A glass‑smooth experience from day one.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                  {/* Account type */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Account type</label>
                    <div
                      className="rounded-2xl p-1 flex items-center gap-1"
                      style={{
                        background: 'rgba(42, 38, 64, 0.55)',
                        border: '1px solid rgba(255, 255, 255, 0.10)',
                        backdropFilter: 'blur(14px)',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setValue('accountRole', 'user')}
                        className="flex-1 h-11 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                          background:
                            accountRole === 'user'
                              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(109, 40, 217, 0.95))'
                              : 'transparent',
                          color: accountRole === 'user' ? '#fff' : 'rgba(255,255,255,0.75)',
                        }}
                      >
                        User
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue('accountRole', 'parent')}
                        className="flex-1 h-11 rounded-xl text-sm font-semibold transition-colors"
                        style={{
                          background:
                            accountRole === 'parent'
                              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.95), rgba(109, 40, 217, 0.95))'
                              : 'transparent',
                          color: accountRole === 'parent' ? '#fff' : 'rgba(255,255,255,0.75)',
                        }}
                      >
                        Parent
                      </button>
                      {/* Hidden input for RHF */}
                      <input type="hidden" {...register('accountRole')} />
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                      Parents can create and manage supervised child accounts. Children are created by a parent/guardian.
                    </p>
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2" htmlFor="fullName">
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      className="glass-input w-full h-12 px-4 text-white placeholder:text-white/45"
                      {...fullNameReg}
                      ref={(el) => {
                        fullNameReg.ref(el);
                        firstInputRef.current = el;
                      }}
                      aria-invalid={errors.fullName && touchedFields.fullName ? 'true' : 'false'}
                    />
                    {errors.fullName && touchedFields.fullName && (
                      <div className="mt-2 text-sm text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.fullName.message}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2" htmlFor="dateOfBirth">
                      Date of birth
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      autoComplete="bday"
                      className="glass-input w-full h-12 px-4 text-white placeholder:text-white/45"
                      {...dobReg}
                      aria-invalid={errors.dateOfBirth && touchedFields.dateOfBirth ? 'true' : 'false'}
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-white/60">Age</span>
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color:
                            dateOfBirth && typeof errors.dateOfBirth?.message === 'string'
                              ? '#FCA5A5'
                              : '#A78BFA',
                        }}
                      >
                        {dateOfBirth ? `${Math.max(0, calculateAgeYears(dateOfBirth))} years old` : '—'}
                      </span>
                    </div>
                    {errors.dateOfBirth && touchedFields.dateOfBirth && (
                      <div className="mt-2 text-sm text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.dateOfBirth.message}</span>
                      </div>
                    )}
                  </div>

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
                        autoComplete="new-password"
                        placeholder="Create a password"
                        className="glass-input w-full h-12 pl-4 pr-11 text-white placeholder:text-white/45"
                        {...register('password', {
                          required: 'Password is required',
                        validate: (v: string) =>
                            validatePassword(v) || 'Password must be at least 8 characters with uppercase, lowercase, and number',
                        })}
                        aria-invalid={errors.password && touchedFields.password ? 'true' : 'false'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setShowPassword((v: boolean) => !v);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
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

                  <div>
                    <label className="block text-white/70 text-sm mb-2" htmlFor="confirmPassword">
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                        className="glass-input w-full h-12 pl-4 pr-11 text-white placeholder:text-white/45"
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                        validate: (v: string) => v === password || 'Passwords do not match',
                        })}
                        aria-invalid={errors.confirmPassword && touchedFields.confirmPassword ? 'true' : 'false'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setShowConfirmPassword((v: boolean) => !v);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && touchedFields.confirmPassword && (
                      <div className="mt-2 text-sm text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.confirmPassword.message}</span>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {!!password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {[
                            { label: '8+ chars', ok: passwordRequirements.minLength },
                            { label: 'Uppercase', ok: passwordRequirements.hasUpper },
                            { label: 'Lowercase', ok: passwordRequirements.hasLower },
                            { label: 'Number', ok: passwordRequirements.hasNumber },
                          ].map((r) => (
                            <GlassTile
                              key={r.label}
                              className="px-3 py-2"
                              style={{
                                borderRadius: 18,
                                background: r.ok ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.10)',
                              }}
                            >
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-white/80">{r.label}</span>
                                <span className={r.ok ? 'text-emerald-200' : 'text-white/35'}>
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </GlassTile>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-start gap-3 pt-1">
                    <input
                      type="checkbox"
                      id="acceptedTerms"
                      checked={acceptedTerms}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setValue('acceptedTerms', e.target.checked);
                        trigger('acceptedTerms');
                      }}
                      style={{ accentColor: '#8B5CF6', marginTop: 3 }}
                    />
                    <label htmlFor="acceptedTerms" className="text-white/70 text-sm leading-relaxed">
                      I agree to the{' '}
                      <button
                        type="button"
                        className="text-white font-semibold underline underline-offset-4"
                        onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          setTermsModalType('terms');
                          setTermsModalOpen(true);
                        }}
                      >
                        Terms
                      </button>{' '}
                      and{' '}
                      <button
                        type="button"
                        className="text-white font-semibold underline underline-offset-4"
                        onClick={(e: ReactMouseEvent<HTMLButtonElement>) => {
                          e.preventDefault();
                          setTermsModalType('privacy');
                          setPrivacyModalOpen(true);
                        }}
                      >
                        Privacy Policy
                      </button>
                      .
                    </label>
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

                  <GlassButton type="submit" disabled={isLoading || !acceptedTerms} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        Create account <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </GlassButton>

                  <SocialAuthButtons
                    mode="signup"
                    onAuthError={(provider, error) => {
                      setSubmitError(`Failed to connect with ${provider}. ${error}`);
                    }}
                  />

                  <div className="pt-2 text-center text-white/70 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-white font-semibold hover:opacity-90">
                      Sign in
                    </Link>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Email verification success screen */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(18px)' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md"
            >
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
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
                  style={{
                    background: 'rgba(16,185,129,0.20)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
                  }}
                >
                  <Check className="w-6 h-6 text-emerald-200" />
                </div>
                <h2 className="mt-4 text-white font-semibold text-xl">Check your email</h2>
                <p className="mt-2 text-white/70 text-sm leading-relaxed">
                  We sent a verification link to <span className="text-white font-semibold">{email || 'your email'}</span>. Click it to activate your account.
                </p>
                <div className="mt-6 space-y-3">
                  <GlassButton
                    className="w-full"
                    onClick={() => {
                      setShowSuccess(false);
                      navigate('/onboarding/email', {
                        state: { email: email || localStorage.getItem('onboarding.email') || '' },
                      });
                    }}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </GlassButton>
                  <GlassButton variant="secondary" className="w-full" onClick={() => setShowSuccess(false)}>
                    Close
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <TermsModal
        type="terms"
        isOpen={termsModalOpen && termsModalType === 'terms'}
        onAccept={() => {
          setValue('acceptedTerms', true);
          trigger('acceptedTerms');
          setTermsModalOpen(false);
        }}
        onDecline={() => setTermsModalOpen(false)}
      />
      <TermsModal
        type="privacy"
        isOpen={privacyModalOpen || (termsModalOpen && termsModalType === 'privacy')}
        onAccept={() => {
          setValue('acceptedTerms', true);
          trigger('acceptedTerms');
          setPrivacyModalOpen(false);
          setTermsModalOpen(false);
        }}
        onDecline={() => {
          setPrivacyModalOpen(false);
          setTermsModalOpen(false);
        }}
      />
    </motion.div>
  );
}

