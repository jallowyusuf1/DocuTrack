import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validation';
import { supabase } from '../../config/supabase';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('rememberMe') === 'true';
  });
  const [loginAttempts, setLoginAttempts] = useState(() => {
    const attempts = localStorage.getItem('loginAttempts');
    const lastAttempt = localStorage.getItem('lastLoginAttempt');
    if (attempts && lastAttempt) {
      const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
      // Reset after 15 minutes (900000ms)
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
      if (timeSinceLastAttempt < 900000) {
        return true;
      }
    }
    return false;
  });
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isSubmitting },
    watch,
  } = useForm<LoginFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });


  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Update lockout timer
  useEffect(() => {
    if (isLocked) {
      const lastAttempt = localStorage.getItem('lastLoginAttempt');
      if (lastAttempt) {
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
        const remaining = Math.max(0, 900000 - timeSinceLastAttempt);
        setLockoutTimeRemaining(Math.ceil(remaining / 1000));
        
        const interval = setInterval(() => {
          const newTimeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
          const newRemaining = Math.max(0, 900000 - newTimeSinceLastAttempt);
          setLockoutTimeRemaining(Math.ceil(newRemaining / 1000));
          
          if (newRemaining <= 0) {
            setIsLocked(false);
            setLoginAttempts(0);
            localStorage.removeItem('loginAttempts');
            localStorage.removeItem('lastLoginAttempt');
            clearInterval(interval);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, [isLocked]);
  
  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    triggerHaptic('light');
    
    // Check rate limiting
    if (isLocked) {
      setSubmitError(`Too many login attempts. Please try again in ${Math.ceil(lockoutTimeRemaining / 60)} minutes.`);
      return;
    }

    // Save remember me preference
    localStorage.setItem('rememberMe', rememberMe.toString());
    if (rememberMe) {
      // Use localStorage for session persistence (already default in Supabase)
      localStorage.setItem('sessionStorage', 'false');
    } else {
      // Use sessionStorage
      localStorage.setItem('sessionStorage', 'true');
    }
    
    try {
      await login({
        email: data.email,
        password: data.password,
      });
      
      // Reset login attempts on success
      setLoginAttempts(0);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('lastLoginAttempt');
      
      triggerHaptic('medium');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      triggerHaptic('heavy');
      
      // Increment login attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      localStorage.setItem('lastLoginAttempt', Date.now().toString());
      
      // Lock after 5 attempts
      if (newAttempts >= 5) {
        setIsLocked(true);
        setSubmitError('Too many login attempts. Please try again in 15 minutes.');
        return;
      }
      
      let errorMessage = 'Invalid email or password';
      
      if (error instanceof Error) {
        if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
          errorMessage = 'Your email address has not been confirmed. Please check your inbox for a confirmation email.';
        } else if (error.message?.includes('Invalid login credentials') || error.message?.includes('timed out')) {
          errorMessage = error.message;
        } else {
          errorMessage = error.message || 'Login failed. Please try again.';
        }
      }
      
      // Show remaining attempts
      if (newAttempts < 5) {
        errorMessage += ` (${5 - newAttempts} attempts remaining)`;
      }
      
      setSubmitError(errorMessage);
      const firstError = document.querySelector('.error-message, [aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const isDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div 
      className="login-page"
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
        className="login-background"
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
        className="login-container"
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
        <div className="login-header" style={{ padding: '16px 0', marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
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
            <div style={{ padding: '8px 18px', background: 'rgba(255, 255, 255, 0.6)', color: '#000000', borderRadius: '100px', fontSize: '15px', fontWeight: 600 }}>
              Login
            </div>
            <Link to="/signup" style={{ padding: '8px 18px', background: 'transparent', color: '#000000', textDecoration: 'none', borderRadius: '100px', fontSize: '15px', fontWeight: 500, transition: 'background 0.2s ease', WebkitTapHighlightColor: 'transparent' }}>
              Sign Up
            </Link>
          </div>
        </div>

        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="login-logo-section"
          style={{
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          <div
            className="app-icon"
            style={{
              display: 'inline-block',
              marginBottom: '16px',
            }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ borderRadius: '18px', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)' }}>
              <rect width="80" height="80" rx="18" fill="url(#loginGradient)"/>
              <path d="M24 20h32v40H24z" fill="white" opacity="0.9"/>
              <path d="M28 28h24M28 38h24M28 48h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <defs>
                <linearGradient id="loginGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#6D28D9"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1
            className="app-name"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: '#000000',
            }}
          >
            DocuTrackr
        </h1>
        </motion.div>

        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="login-form-section"
        >
          <h2
            className="form-title"
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.3px',
              color: '#000000',
              textAlign: 'center',
              marginBottom: '32px',
            }}
          >
            Sign in to your account
          </h2>

        {/* Form */}
          <form
            className="login-form"
            onSubmit={handleSubmit(onSubmit)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Email Input */}
            <div
              className="input-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <label
                htmlFor="email"
                className="input-label"
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'rgba(0, 0, 0, 0.6)',
                  paddingLeft: '4px',
                }}
              >
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
              {...register('email', {
                required: 'Email is required',
                    validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                  })}
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="name@example.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    height: '50px',
                    padding: '0 16px',
                    fontSize: '17px',
                    background: 'rgba(118, 118, 128, 0.12)',
                    border: errors.email && touchedFields.email ? '1px solid #FF3B30' : '1px solid transparent',
                    borderRadius: '12px',
                    color: '#000000',
                    transition: 'all 0.2s ease',
                    WebkitAppearance: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(118, 118, 128, 0.16)';
                    e.target.style.border = '1px solid #007AFF';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(118, 118, 128, 0.12)';
                    e.target.style.border = errors.email && touchedFields.email ? '1px solid #FF3B30' : '1px solid transparent';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            {errors.email && touchedFields.email && (
                <p
                  className="input-error"
                  id="emailError"
                  style={{
                    fontSize: '13px',
                    color: '#FF3B30',
                    paddingLeft: '4px',
                    minHeight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </p>
            )}
          </div>

            {/* Password Input */}
            <div
              className="input-group"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <label
                htmlFor="password"
                className="input-label"
                style={{
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'rgba(0, 0, 0, 0.6)',
                  paddingLeft: '4px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                {...register('password', {
                  required: 'Password is required',
                })}
                type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="form-input"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    height: '50px',
                    padding: '0 16px',
                    paddingRight: '44px',
                    fontSize: '17px',
                    background: 'rgba(118, 118, 128, 0.12)',
                    border: errors.password && touchedFields.password ? '1px solid #FF3B30' : '1px solid transparent',
                    borderRadius: '12px',
                    color: '#000000',
                    transition: 'all 0.2s ease',
                    WebkitAppearance: 'none',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onFocus={(e) => {
                    e.target.style.background = 'rgba(118, 118, 128, 0.16)';
                    e.target.style.border = '1px solid #007AFF';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 122, 255, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.background = 'rgba(118, 118, 128, 0.12)';
                    e.target.style.border = errors.password && touchedFields.password ? '1px solid #FF3B30' : '1px solid transparent';
                    e.target.style.boxShadow = 'none';
                  }}
              />
              <button
                type="button"
                  className="password-toggle"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowPassword(!showPassword);
                  }}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    border: 'none',
                    background: 'none',
                    color: 'rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s ease',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.color = 'rgba(0, 0, 0, 0.8)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)';
                  }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && touchedFields.password && (
                <p
                  className="input-error"
                  id="passwordError"
                  style={{
                    fontSize: '13px',
                    color: '#FF3B30',
                    paddingLeft: '4px',
                    minHeight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <AlertCircle className="w-4 h-4" />
                {errors.password.message}
              </p>
            )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div
              className="form-actions"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '-8px',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  color: 'rgba(0, 0, 0, 0.7)',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#007AFF',
                  }}
                />
                <span>Remember me</span>
              </label>
              
              <Link
                to="/forgot-password"
                className="forgot-link"
                style={{
                  fontSize: '15px',
                  color: '#007AFF',
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    fontSize: '13px',
                    color: '#FF3B30',
                    padding: '8px 12px',
                    background: 'rgba(255, 59, 48, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
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

            {/* Apple Sign-In Button */}
            <button
              type="button"
              onClick={async () => {
                triggerHaptic('medium');
                try {
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'apple',
                    options: {
                      redirectTo: `${window.location.origin}/dashboard`,
                    }
                  });
                  if (error) throw error;
                } catch (error: any) {
                  console.error('Apple sign-in error:', error);
                  
                  if (error?.message?.includes('invalid_client') || 
                      error?.message?.includes('OAuth client was not found') ||
                      error?.status === 401) {
                    setSubmitError('Apple sign-in is not configured. Please use email and password to sign in.');
                  } else {
                    setSubmitError('Failed to sign in with Apple. Please try again or use email and password.');
                  }
                }
              }}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: '#000000',
                color: '#FFFFFF',
                fontSize: '17px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                WebkitTapHighlightColor: 'transparent',
                marginBottom: '12px',
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.opacity = '1';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.28 3.22c.94.95 2.47 1.06 3.74.35-.32 1.02-.86 1.93-1.5 2.64-.68.75-1.38 1.42-2.32 1.37-.94-.05-1.3-.58-2.45-.58-1.15 0-1.56.58-2.54.62-.99.05-1.73-.76-2.42-1.51C4.74 4.75 4.06 2.62 4.86 1.04c.63-1.24 1.75-2.03 2.97-2.03 1.03 0 1.6.62 2.41.62.81 0 1.31-.62 2.4-.62 1.05 0 1.92.59 2.5 1.38-2.17 1.21-1.9 4.37.14 5.28zm1.05 12.12c-.51.57-1.18.98-1.9 1.01-.7.03-1.02-.38-1.91-.38-.89 0-1.16.38-1.89.36-.73-.02-1.4-.45-1.92-1.03-1.05-1.16-1.66-2.91-1.46-4.68.19-1.69 1.07-3.12 2.23-4.15.55-.5 1.2-.87 1.9-1.1.69-.22 1.35-.28 1.98-.22.5.05.98.19 1.43.37.36.14.69.32.98.52.23.16.44.35.62.55-.53.32-1.01.75-1.4 1.28-.61.83-.93 1.85-.93 2.97 0 1.33.41 2.59 1.15 3.69z"/>
              </svg>
              <span>Sign in with Apple</span>
            </button>

            {/* Google Sign-In Button */}
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
                  console.error('Google sign-in error:', error);
                  
                  // Check for OAuth configuration errors
                  if (error?.message?.includes('invalid_client') || 
                      error?.message?.includes('OAuth client was not found') ||
                      error?.status === 401) {
                    setSubmitError('Google sign-in is not configured. Please use email and password to sign in, or contact support.');
                  } else {
                    setSubmitError('Failed to sign in with Google. Please try again or use email and password.');
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
              <span>Sign in with Google</span>
            </button>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || isSubmitting || isLocked}
              onClick={(e) => {
                triggerHaptic('light');
                // Don't prevent default - let form submit naturally
              }}
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '12px',
                background: isLoading
                  ? 'rgba(0, 122, 255, 0.3)'
                  : 'linear-gradient(135deg, #007AFF 0%, #0051D5 100%)',
                color: '#FFFFFF',
                fontSize: '17px',
                fontWeight: 600,
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
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
                if (!isLoading && !isSubmitting) {
                  e.currentTarget.style.transform = 'scale(0.98)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 122, 255, 0.3)';
              }}
              onTouchStart={(e) => {
                if (!isLoading && !isSubmitting) {
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
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
          </div>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <p
              className="signup-prompt"
              style={{
                textAlign: 'center',
                fontSize: '15px',
                color: 'rgba(0, 0, 0, 0.7)',
                marginTop: '8px',
              }}
            >
          Don't have an account?{' '}
          <Link
            to="/signup"
                className="signup-link"
                style={{
                  color: '#007AFF',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'opacity 0.2s ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Create one
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
    </div>
  );
}
