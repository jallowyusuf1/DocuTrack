import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, Loader2, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/validation';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState<string>('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>();

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setSubmitError(null);
    setIsLoading(true);
    triggerHaptic('light');
    
    try {
      await authService.resetPassword(data.email);
      setEmailSent(data.email);
      setIsSuccess(true);
      triggerHaptic('medium');
    } catch (error) {
      triggerHaptic('heavy');
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email. Please try again.';
      setSubmitError(errorMessage);
      
      const firstError = document.querySelector('.error-message, [aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      setIsLoading(false);
    }
  };

  const isDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background: isDarkMode ? '#000000' : '#FFFFFF',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px]"
        style={{ marginTop: '80px' }}
      >
        {/* Logo Area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-10"
        >
          <div
            className="w-32 h-32 rounded-[28px] flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            }}
          >
            <Calendar className="w-16 h-16 text-white" />
          </div>
          <h1
            className="text-[28px] font-semibold mb-0"
            style={{
              color: isDarkMode ? '#FFFFFF' : '#000000',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            }}
          >
            DocuTrackr
          </h1>
        </motion.div>

        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              {/* Heading */}
              <h1
                className="text-[34px] font-bold mb-4"
                style={{
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                }}
              >
                Check your email
              </h1>

              {/* Success Card */}
              <div
                style={{
                  background: isDarkMode ? 'rgba(118, 118, 128, 0.12)' : 'rgba(118, 118, 128, 0.08)',
                  borderRadius: '16px',
                  padding: '32px',
                  marginBottom: '24px',
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: '#34C759',
                  }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3
                  className="text-xl font-semibold mb-2"
                  style={{
                    color: isDarkMode ? '#FFFFFF' : '#000000',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Check your email
                </h3>
                <p
                  style={{
                    fontSize: '15px',
                    color: isDarkMode ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
                    lineHeight: '1.5',
                  }}
                >
                  We've sent a password reset link to<br />
                  <strong style={{ color: isDarkMode ? '#FFFFFF' : '#000000' }}>{emailSent}</strong>
                </p>
              </div>

              {/* Back to Sign In Button */}
              <button
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/login');
                }}
                className="apple-primary-button"
                style={{ marginTop: '0' }}
              >
                <ArrowLeft className="w-5 h-5 inline mr-2" />
                Back to Sign In
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Heading */}
              <h1
                className="text-[34px] font-bold mb-4 text-center"
                style={{
                  color: isDarkMode ? '#FFFFFF' : '#000000',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                }}
              >
                Reset your password
              </h1>

              {/* Subtext */}
              <p
                className="text-center mb-8"
                style={{
                  fontSize: '15px',
                  color: isDarkMode ? 'rgba(235, 235, 245, 0.6)' : 'rgba(60, 60, 67, 0.6)',
                  lineHeight: '1.5',
                }}
              >
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Email Input */}
                <div className="apple-input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                    })}
                    ref={emailInputRef}
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    className={errors.email ? 'error' : ''}
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                  {errors.email && (
                    <p className="apple-error-message">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

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

                {/* Send Reset Link Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="apple-primary-button"
                >
                  {isLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div className="apple-spinner" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* Back to Sign In Link */}
              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="apple-link"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => triggerHaptic('light')}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
