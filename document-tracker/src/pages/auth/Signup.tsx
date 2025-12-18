import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';
import { logTermsAcceptance } from '../../services/terms';
import TermsModal from '../../components/auth/TermsModal';
import { supabase } from '../../config/supabase';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading, checkAuth } = useAuth();
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
    defaultValues: {
      acceptedTerms: false,
    },
  });

  const password = watch('password');
  const fullName = watch('fullName');

  useEffect(() => {
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  if (isAuthenticated) {
    return null;
  }

  const passwordRequirements = {
    minLength: password?.length >= 8,
    hasNumber: /[0-9]/.test(password || ''),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password || ''),
  };

  const onSubmit = async (data: SignupFormData) => {
    setSubmitError(null);
    triggerHaptic('light');
    
    if (!data.acceptedTerms) {
      setSubmitError('You must accept the Terms of Service and Privacy Policy to sign up');
      return;
    }
    
    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
      
      if (result?.session && result.user?.id) {
        await logTermsAcceptance(result.user.id);
        await checkAuth();
        setShowSuccess(true);
        triggerHaptic('medium');
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } else {
        setSubmitError('Please check your email to confirm your account. You will be able to sign in after confirmation.');
      }
    } catch (error) {
      triggerHaptic('heavy');
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setSubmitError(errorMessage);
      const firstError = document.querySelector('.error-message, [aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div
      className="signup-page"
      style={{
        minHeight: '100vh',
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {/* Background */}
        <div
          className="signup-background"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, #F2F2F7 0%, #FFFFFF 100%)',
            zIndex: -1,
          }}
        />

        {/* Container */}
        <div
          className="signup-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 16px',
            maxWidth: '480px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Header - Glass Bubble Navigation */}
          <div className="signup-header" style={{ padding: '16px 0', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'inline-flex',
              borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'saturate(180%) blur(20px)',
              WebkitBackdropFilter: 'saturate(180%) blur(20px)',
              border: '0.5px solid rgba(255, 255, 255, 0.3)',
              padding: '4px',
            }}>
              <Link to="/" style={{ padding: '8px 18px', background: 'transparent', color: '#000000', textDecoration: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: 500, transition: 'background 0.2s ease', WebkitTapHighlightColor: 'transparent' }}>
                Home
              </Link>
              <Link to="/login" style={{ padding: '8px 18px', background: 'transparent', color: '#000000', textDecoration: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: 500, transition: 'background 0.2s ease', WebkitTapHighlightColor: 'transparent' }}>
                Login
              </Link>
              <div style={{ padding: '8px 18px', background: 'rgba(255, 255, 255, 0.6)', color: '#000000', borderRadius: '100px', fontSize: '15px', fontWeight: 600 }}>
                Sign Up
              </div>
            </div>
          </div>

          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="signup-logo-section"
            style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            <div
              className="app-icon"
              style={{
                display: 'inline-block',
                marginBottom: '16px',
              }}
            >
              <svg width="64" height="64" viewBox="0 0 64 64" style={{ borderRadius: '14px', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)' }}>
                <rect width="64" height="64" rx="14" fill="url(#signupGradient)"/>
                <path d="M19 16h26v32H19z" fill="white" opacity="0.9"/>
                <path d="M22 22h20M22 30h20M22 38h13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="signupGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6"/>
                    <stop offset="100%" stopColor="#6D28D9"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1
              className="page-title"
              style={{
                fontSize: '28px',
                fontWeight: 700,
                letterSpacing: '-0.3px',
                color: '#000000',
                marginBottom: '8px',
              }}
            >
              Create your account
            </h1>
            <p
              className="page-subtitle"
              style={{
                fontSize: '17px',
                color: 'rgba(0, 0, 0, 0.6)',
                marginTop: '8px',
              }}
            >
              Start tracking documents in seconds
            </p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Full Name */}
            <div className="apple-input-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                {...register('fullName', {
                  required: 'Full name is required',
                  minLength: {
                    value: 2,
                    message: 'Full name must be at least 2 characters',
                  },
                })}
                ref={firstInputRef}
                type="text"
                id="fullName"
                placeholder="Enter your full name"
                autoComplete="name"
                className={errors.fullName && touchedFields.fullName ? 'error' : ''}
                aria-invalid={errors.fullName ? 'true' : 'false'}
              />
              {errors.fullName && touchedFields.fullName && (
                <p className="apple-error-message">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="apple-input-group">
              <label htmlFor="email">Email</label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                })}
                type="email"
                id="email"
                placeholder="name@example.com"
                autoComplete="email"
                className={errors.email && touchedFields.email ? 'error' : ''}
                aria-invalid={errors.email ? 'true' : 'false'}
              />
              {errors.email && touchedFields.email && (
                <p className="apple-error-message">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="apple-input-group">
              <label htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    validate: (value) =>
                      validatePassword(value) ||
                      'Password must be at least 8 characters with uppercase, lowercase, and number',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className={errors.password && touchedFields.password ? 'error' : ''}
                  style={{ paddingRight: '48px' }}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowPassword(!showPassword);
                  }}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: isDarkMode ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
                  }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && touchedFields.password && (
                <p className="apple-error-message">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}

              {/* Password Requirements */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-2"
                  style={{
                    fontSize: '13px',
                    color: isDarkMode ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
                  }}
                >
                  {[
                    { key: 'minLength', label: 'At least 8 characters', met: passwordRequirements.minLength },
                    { key: 'hasNumber', label: 'One number', met: passwordRequirements.hasNumber },
                    { key: 'hasSpecial', label: 'One special character', met: passwordRequirements.hasSpecial },
                  ].map((req) => (
                    <div key={req.key} className="flex items-center gap-2">
                      {req.met ? (
                        <span style={{ color: '#34C759', fontSize: '16px' }}>✓</span>
                      ) : (
                        <span style={{ color: isDarkMode ? 'rgba(235, 235, 245, 0.3)' : 'rgba(60, 60, 67, 0.3)' }}>○</span>
                      )}
                      <span style={{ color: req.met ? '#34C759' : 'inherit' }}>{req.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="apple-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className={errors.confirmPassword && touchedFields.confirmPassword ? 'error' : ''}
                  style={{ paddingRight: '48px' }}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: isDarkMode ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
                  }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && touchedFields.confirmPassword && (
                <p className="apple-error-message">
                  <AlertCircle className="w-4 h-4" />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="apple-checkbox-container" style={{ marginBottom: '24px' }}>
              <input
                type="checkbox"
                id="acceptedTerms"
                {...register('acceptedTerms', {
                  required: 'You must accept the Terms and Privacy Policy',
                })}
                checked={watch('acceptedTerms') || false}
                onChange={(e) => {
                  setValue('acceptedTerms', e.target.checked);
                  trigger('acceptedTerms');
                }}
              />
              <label htmlFor="acceptedTerms" style={{ fontSize: '15px', cursor: 'pointer', flex: 1 }}>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setTermsModalType('terms');
                    setTermsModalOpen(true);
                  }}
                  className="apple-link"
                  style={{ fontSize: '15px', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Terms
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setTermsModalType('privacy');
                    setPrivacyModalOpen(true);
                  }}
                  className="apple-link"
                  style={{ fontSize: '15px', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  Privacy Policy
                </button>
              </label>
            </div>
            {errors.acceptedTerms && touchedFields.acceptedTerms && (
              <p className="apple-error-message" style={{ marginTop: '-16px', marginBottom: '16px' }}>
                <AlertCircle className="w-4 h-4" />
                {errors.acceptedTerms.message}
              </p>
            )}

            {/* Error Message */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="apple-error-message"
                  style={{ marginBottom: '16px' }}
                >
                  <AlertCircle className="w-4 h-4" />
                  {submitError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Divider */}
            <div style={{ position: 'relative', margin: '8px 0' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100%', height: '1px', background: 'rgba(0, 0, 0, 0.1)' }} />
              </div>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                <span style={{ background: '#FFFFFF', padding: '0 12px', fontSize: '13px', color: 'rgba(0, 0, 0, 0.5)' }}>or continue with</span>
              </div>
            </div>

            {/* Google Sign-Up Button */}
            <button
              type="button"
              onClick={async () => {
                triggerHaptic('medium');
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                      },
                      redirectTo: `${window.location.origin}/dashboard`,
                    }
                  });
                  if (error) throw error;
                } catch (error: any) {
                  console.error('Google sign-up error:', error);
                  
                  // Check for OAuth configuration errors
                  if (error?.message?.includes('invalid_client') || 
                      error?.message?.includes('OAuth client was not found') ||
                      error?.status === 401) {
                    setSubmitError('Google sign-up is not configured. Please use email and password to sign up, or contact support.');
                  } else {
                    setSubmitError('Failed to sign up with Google. Please try again or use email and password.');
                  }
                }
              }}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: '#FFFFFF',
                color: '#000000',
                fontSize: '17px',
                fontWeight: 600,
                border: '1px solid rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                WebkitTapHighlightColor: 'transparent',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0, 0, 0, 0.05)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path fill="#4285F4" d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"/>
                <path fill="#34A853" d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"/>
                <path fill="#FBBC05" d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"/>
                <path fill="#EA4335" d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading || !watch('acceptedTerms')}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: (isLoading || !watch('acceptedTerms'))
                  ? 'rgba(0, 122, 255, 0.3)'
                  : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                color: '#FFFFFF',
                fontSize: '17px',
                fontWeight: 600,
                border: 'none',
                cursor: (isLoading || !watch('acceptedTerms')) ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(0, 122, 255, 0.3)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative',
                zIndex: 10,
                pointerEvents: 'auto',
              }}
              onMouseDown={(e) => {
                if (!isLoading && watch('acceptedTerms')) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3)';
              }}
              onTouchStart={(e) => {
                if (!isLoading && watch('acceptedTerms')) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
                }
              }}
              onTouchEnd={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3)';
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <p
              className="text-center"
              style={{
                marginTop: '32px',
                fontSize: '15px',
                color: isDarkMode ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
              }}
            >
              Already have an account?{' '}
              <Link to="/login" className="apple-link">
                Sign In
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Safe Area */}
      <div
        className="page-safe-area"
        style={{
          height: 'env(safe-area-inset-bottom)',
          background: '#FFFFFF',
        }}
      />

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="apple-success-overlay"
          >
            <div className="apple-success-checkmark">✓</div>
            <p>Account created successfully</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terms Modal */}
      <TermsModal
        type="terms"
        isOpen={termsModalOpen && termsModalType === 'terms'}
        onAccept={() => {
          setValue('acceptedTerms', true);
          trigger('acceptedTerms');
          setTermsModalOpen(false);
        }}
        onDecline={() => {
          setTermsModalOpen(false);
        }}
      />

      {/* Privacy Modal */}
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
    </div>
  );
}
