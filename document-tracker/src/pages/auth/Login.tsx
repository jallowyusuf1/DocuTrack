import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validation';
import TabSwitcher from '../../components/ui/TabSwitcher';
import Checkbox from '../../components/ui/Checkbox';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    setValue,
  } = useForm<LoginFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      rememberMe: false,
    },
  });

  // Note: Home button navigation is handled directly in TabSwitcher component

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    triggerHaptic('light');
    
    try {
      await login({
        email: data.email,
        password: data.password,
      });
      triggerHaptic('medium');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      triggerHaptic('heavy');
      let errorMessage = 'Invalid email or password';
      
      if (error instanceof Error) {
        if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
          errorMessage = 'Your email address has not been confirmed. Please check your inbox for a confirmation email.';
        } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSubmitError(errorMessage);
      const firstError = document.querySelector('.error-message, [aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        className="relative z-10 w-full max-w-md px-4"
      >
              {/* Logo Section */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-6"
              >
                <motion.div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Calendar className="w-7 h-7 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-1.5" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}>
                  DocuTrackr
                </h1>
                <p className="text-xs" style={{ color: '#A78BFA' }}>
                  Never miss a deadline
                </p>
              </motion.div>

        {/* Tab Switcher */}
        <TabSwitcher
          activeTab="login"
        />

        {/* Main Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-[24px] w-full max-w-md"
          style={{
            background: 'rgba(42, 38, 64, 0.7)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.2)',
          }}
        >
          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1.5">Welcome Back</h2>
            <p className="text-xs" style={{ color: '#A78BFA' }}>Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  ref={(e) => {
                    const { ref } = register('email');
                    ref(e);
                    emailInputRef.current = e;
                  }}
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
              {errors.email && touchedFields.email && (
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

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                <input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full h-[52px] pl-12 pr-12 rounded-2xl text-white placeholder:text-purple-300/50 transition-all"
                  style={{
                    background: 'rgba(35, 29, 51, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: errors.password ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.password ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all"
                  style={{ color: '#A78BFA' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && touchedFields.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </motion.p>
              )}
              {/* Forgot Password Link */}
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium transition-all"
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
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Remember Me */}
            <Checkbox
              checked={watch('rememberMe') || false}
              onChange={(checked) => {
                setValue('rememberMe', checked);
              }}
              label="Remember me"
              id="rememberMe"
            />

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

            {/* Login Button */}
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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-white">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold transition-all"
                style={{ color: '#A78BFA' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C4B5FD';
                  e.currentTarget.style.textShadow = '0 0 10px rgba(139, 92, 246, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A78BFA';
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                Sign Up
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
