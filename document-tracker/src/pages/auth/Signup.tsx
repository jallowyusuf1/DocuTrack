import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, FileText, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import { validateEmail, validatePassword } from '../../utils/validation';
import { selectImageFromGallery, openCamera, compressImage, validateImage } from '../../utils/imageHandler';
import { supabase } from '../../config/supabase';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup, isAuthenticated, isLoading, checkAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
  } = useForm<SignupFormData>({
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  });

  const password = watch('password');

  useEffect(() => {
    // Auto-focus first input on mount
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
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

  const uploadAvatar = async (file: File, userId: string): Promise<string> => {
    // Validate and compress
    const validation = await validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image');
    }
    
    const compressed = await compressImage(file, 400, 400, 0.9);
    const finalFile = compressed instanceof File 
      ? compressed 
      : new File([compressed], file.name, { type: 'image/jpeg' });
    
    // Upload to avatars bucket
    const fileName = `${userId}/${Date.now()}_${finalFile.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, finalFile, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  };

  const handleAvatarSelect = async (source: 'camera' | 'gallery') => {
    try {
      setIsUploadingAvatar(true);
      const file = source === 'camera' 
        ? await openCamera()
        : await selectImageFromGallery();
      
      if (!file) return;
      
      setAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreview(preview);
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to select image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setSubmitError(null);
    
    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
      
      // If we have a session, user is immediately authenticated
      if (result?.session && result.user?.id) {
        // Upload avatar if selected
        if (avatarFile) {
          try {
            const avatarUrl = await uploadAvatar(avatarFile, result.user.id);
            // Update user metadata with avatar
            await supabase.auth.updateUser({
              data: { avatar_url: avatarUrl },
            });
            // Also update user_profiles if it exists
            await supabase
              .from('user_profiles')
              .update({ avatar_url: avatarUrl })
              .eq('user_id', result.user.id);
          } catch (avatarError) {
            console.error('Failed to upload avatar:', avatarError);
            // Don't fail signup if avatar upload fails
          }
        }
        
        // Refresh auth state to ensure everything is up to date
        await checkAuth();
        // Small delay to ensure state propagation
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        // No session means email confirmation is required
        setSubmitError('Please check your email to confirm your account. You will be able to sign in after confirmation.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setSubmitError(errorMessage);
      
      // Scroll to first error
      const firstError = document.querySelector('.error-message, [aria-invalid="true"]');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white py-8">
      <div className="w-full max-w-md">
        {/* Avatar Upload */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Avatar
              src={avatarPreview || undefined}
              fallback={watch('fullName')?.[0]?.toUpperCase() || 'U'}
              size="large"
              className="w-20 h-20"
            />
            <button
              type="button"
              onClick={() => {
                const useCamera = window.confirm('Take photo? (Cancel to choose from gallery)');
                handleAvatarSelect(useCamera ? 'camera' : 'gallery');
              }}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary-600 border-2 border-white"
            >
              {isUploadingAvatar ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Create Account
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign up to start tracking your documents
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <input
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters',
                },
                validate: (value) => {
                  const trimmed = value?.trim();
                  if (!trimmed || trimmed.length < 2) {
                    return 'Full name must be at least 2 characters';
                  }
                  return true;
                },
              })}
              ref={(e) => {
                const { ref } = register('fullName');
                ref(e);
                firstInputRef.current = e;
              }}
              type="text"
              placeholder="Full Name"
              className="h-12 text-base w-full px-4 py-2 bg-white border-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 border-black"
              aria-invalid={errors.fullName ? 'true' : 'false'}
            />
            {errors.fullName && touchedFields.fullName && (
              <p className="mt-1 text-sm text-red-600 error-message">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Input
              {...register('email', {
                required: 'Email is required',
                validate: (value) =>
                  validateEmail(value) || 'Please enter a valid email address',
              })}
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
                  validate: (value) =>
                    validatePassword(value) ||
                    'Password must be at least 8 characters with uppercase, lowercase, and number',
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
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Input
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === password || 'Passwords do not match',
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                className="h-12 text-base pr-12"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && touchedFields.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 error-message">
                {errors.confirmPassword.message}
              </p>
            )}
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
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
