import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, Loader2, Calendar, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/validation';
import { useTheme } from '../../contexts/ThemeContext';
import { GlassCard, GlassTile } from '../../components/ui/glass/Glass';
import GlassButton from '../../components/ui/glass/GlassButton';
import GlassInput from '../../components/ui/glass/GlassInput';

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

  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#000000';

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative"
      style={{
        background: bgColor,
      }}
    >
      {/* Navigation Bar - Glass buttons at top */}
      <div className="absolute top-6 left-0 right-0 flex justify-center gap-3 z-50">
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => {
            triggerHaptic('light');
            navigate('/login');
          }}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Sign In
        </GlassButton>
        <GlassButton
          variant="secondary"
          size="sm"
          onClick={() => {
            triggerHaptic('light');
            navigate('/');
          }}
          icon={<Home className="w-4 h-4" />}
        >
          Home
        </GlassButton>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[450px]"
      >
        {/* Logo Area - Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <GlassCard
            className="p-6 mb-6"
            style={{
              borderRadius: 28,
              background: isDark
                ? 'rgba(26, 26, 26, 0.8)'
                : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(40px) saturate(120%)',
              border: isDark
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : '1px solid rgba(0, 0, 0, 0.08)',
            }}
          >
            <div
              className="w-24 h-24 rounded-[24px] flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
              }}
            >
              <Calendar className="w-12 h-12 text-white" />
            </div>
            <h1
              className="text-[28px] font-semibold mb-0"
              style={{
                color: textColor,
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
              }}
            >
              DocuTrackr
            </h1>
          </GlassCard>
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
                className="text-[34px] font-bold mb-6 text-center"
                style={{
                  color: textColor,
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                }}
              >
                Check your email
              </h1>

              {/* Success Card - Glass */}
              <GlassCard
                className="p-8 mb-6"
                style={{
                  borderRadius: 24,
                  background: isDark
                    ? 'rgba(26, 26, 26, 0.8)'
                    : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(40px) saturate(120%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  boxShadow: '0 10px 40px rgba(16, 185, 129, 0.15)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: '#10B981',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3
                  className="text-xl font-semibold mb-2 text-center"
                  style={{
                    color: textColor,
                    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Check your email
                </h3>
                <p
                  className="text-center"
                  style={{
                    fontSize: '15px',
                    color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                    lineHeight: '1.5',
                  }}
                >
                  We've sent a password reset link to<br />
                  <strong style={{ color: textColor }}>{emailSent}</strong>
                </p>
              </GlassCard>

              {/* Back to Sign In Button - Glass */}
              <div className="flex gap-3 justify-center">
                <GlassButton
                  variant="secondary"
                  onClick={() => {
                    triggerHaptic('light');
                    navigate('/login');
                  }}
                  icon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Sign In
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  onClick={() => {
                    triggerHaptic('light');
                    navigate('/');
                  }}
                  icon={<Home className="w-4 h-4" />}
                >
                  Home
                </GlassButton>
              </div>
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
                  color: textColor,
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
                  color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  lineHeight: '1.5',
                }}
              >
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {/* Form - Glass Card */}
              <GlassCard
                className="p-6 mb-6"
                style={{
                  borderRadius: 24,
                  background: isDark
                    ? 'rgba(26, 26, 26, 0.8)'
                    : 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(40px) saturate(120%)',
                  border: isDark
                    ? '1px solid rgba(255, 255, 255, 0.1)'
                    : '1px solid rgba(0, 0, 0, 0.08)',
                }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Input - Glass */}
                  <GlassInput
                    {...register('email', {
                      required: 'Email is required',
                      validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                    })}
                    ref={emailInputRef}
                    type="email"
                    id="email"
                    label="Email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    icon={<Mail className="w-5 h-5" />}
                    error={errors.email?.message}
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />

                  {/* Error Message */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center gap-2 p-3 rounded-xl"
                        style={{
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#F87171',
                        }}
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{submitError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Send Reset Link Button - Glass */}
                  <GlassButton
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={isLoading}
                    icon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </GlassButton>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
