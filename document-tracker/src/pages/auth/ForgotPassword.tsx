import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, Loader2, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/validation';
import TabSwitcher from '../../components/ui/TabSwitcher';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'auth'>('auth');
  const [emailSent, setEmailSent] = useState<string>('');
  const emailInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordFormData>();

  const email = watch('email');

  useEffect(() => {
    if (activeTab === 'home') {
      navigate('/');
    }
  }, [activeTab, navigate]);

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

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <motion.div
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
        }}
        animate={{
          background: [
            'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
            'linear-gradient(135deg, #231D33 0%, #2A2640 50%, #1A1625 100%)',
            'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
          ],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-1/2 right-0 w-[350px] h-[350px] rounded-full blur-[100px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full blur-[100px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(236, 72, 153, 0) 70%)',
          }}
          animate={{
            x: [0, 15, 0],
            y: [0, -25, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
            }}
            whileHover={{ scale: 1.05 }}
          >
            <Calendar className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
            DocuTrackr
          </h1>
          <p className="text-sm" style={{ color: '#A78BFA' }}>
            Never miss a deadline
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <TabSwitcher
          activeTab={activeTab}
          onTabChange={setActiveTab}
          authType="login"
        />

        {/* Main Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-8 rounded-[32px]"
          style={{
            background: 'rgba(42, 38, 64, 0.7)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.2)',
          }}
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                    boxShadow: '0 0 40px rgba(139, 92, 246, 0.6)',
                  }}
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-3">Check Your Email</h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: '#C7C3D9' }}>
                  We've sent a password reset link to{' '}
                  <span className="font-semibold text-white">{emailSent}</span>
                </p>
                <p className="text-xs mb-6" style={{ color: '#A78BFA' }}>
                  Didn't receive? Check your spam folder or try again.
                </p>
                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={() => {
                      triggerHaptic('light');
                      setIsSuccess(false);
                      setEmailSent('');
                    }}
                    className="text-sm font-medium transition-all"
                    style={{ color: '#A78BFA' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                    }}
                  >
                    Resend Email
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      triggerHaptic('light');
                      navigate('/login');
                    }}
                    className="w-full h-12 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                    whileHover={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </motion.button>
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
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                  <p className="text-sm" style={{ color: '#A78BFA' }}>
                    Enter your email to receive reset link
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                        })}
                        ref={emailInputRef}
                        type="email"
                        placeholder="Enter your email"
                        className="w-full h-[52px] pl-12 pr-4 rounded-2xl text-white placeholder:text-purple-300/50 transition-all"
                        style={{
                          background: 'rgba(35, 29, 51, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: errors.email ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = errors.email ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        aria-invalid={errors.email ? 'true' : 'false'}
                      />
                    </div>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-400 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {submitError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-xl flex items-start gap-3"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400">{submitError}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Send Reset Link Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: isLoading
                        ? 'rgba(139, 92, 246, 0.5)'
                        : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.5)',
                    }}
                    whileHover={!isLoading ? { scale: 1.02, boxShadow: '0 12px 32px rgba(139, 92, 246, 0.6)' } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Reset Link'
                    )}
                  </motion.button>
                </form>

                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                  <motion.button
                    onClick={() => {
                      triggerHaptic('light');
                      navigate('/login');
                    }}
                    className="flex items-center justify-center gap-2 text-sm font-medium transition-all mx-auto"
                    style={{ color: '#A78BFA' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecoration = 'underline';
                      e.currentTarget.style.color = '#C4B5FD';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecoration = 'none';
                      e.currentTarget.style.color = '#A78BFA';
                    }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Login
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
