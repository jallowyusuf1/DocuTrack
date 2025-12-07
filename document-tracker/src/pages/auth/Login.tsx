import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { validateEmail } from '../../utils/validation';

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
  } = useForm<LoginFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    defaultValues: {
      rememberMe: false,
    },
  });

  useEffect(() => {
    // Auto-focus email input on mount
    emailInputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);
  
  // Redirect if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setSubmitError(null);
    
    try {
      await login({
        email: data.email,
        password: data.password,
      });
      navigate('/dashboard', { replace: true });
    } catch (error) {
      let errorMessage = 'Invalid email or password';
      
      if (error instanceof Error) {
        // Handle specific Supabase auth errors
        if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
          errorMessage = 'Your email address has not been confirmed. Please check your inbox for a confirmation email, or try signing up again.';
        } else if (error.message?.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setSubmitError(errorMessage);
      
      // Scroll to first error
      const firstError = document.querySelector('.error-message, [aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center">
            <FileText className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to continue to DocuTrack
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <Input
              {...register('email', {
                required: 'Email is required',
                validate: (value) =>
                  validateEmail(value) || 'Please enter a valid email address',
              })}
              ref={(e) => {
                const { ref } = register('email');
                ref(e);
                emailInputRef.current = e;
              }}
              type="email"
              placeholder="Email"
              className="h-12 text-base"
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && touchedFields.email && (
              <p className="mt-1 text-sm text-red-600 error-message">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Input
                {...register('password', {
                  required: 'Password is required',
                })}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="h-12 text-base pr-12"
                aria-invalid={errors.password ? 'true' : 'false'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && touchedFields.password && (
              <p className="mt-1 text-sm text-red-600 error-message">
                {errors.password.message}
              </p>
            )}
            {/* Forgot Password Link */}
            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              {...register('rememberMe')}
              type="checkbox"
              id="rememberMe"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 text-sm text-gray-700 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="h-[52px] text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Login'}
          </Button>
        </form>

        {/* Signup Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
