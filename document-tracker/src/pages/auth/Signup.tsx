import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, Calendar, Camera, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword } from '../../utils/validation';
import { selectImageFromGallery, openCamera, compressImage, validateImage } from '../../utils/imageHandler';
import { supabase } from '../../config/supabase';
import TabSwitcher from '../../components/ui/TabSwitcher';
import Avatar from '../../components/ui/Avatar';
import Checkbox from '../../components/ui/Checkbox';

interface SignupFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
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
  const [showSuccess, setShowSuccess] = useState(false);
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
      agreeToTerms: false,
    },
  });

  const password = watch('password');
  const fullName = watch('fullName');

  // Note: Home button navigation is handled directly in TabSwitcher component

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

  const uploadAvatar = async (file: File, userId: string): Promise<string> => {
    const validation = await validateImage(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image');
    }
    
    const compressed = await compressImage(file, 400, 400, 0.9);
    const finalFile = compressed instanceof File 
      ? compressed 
      : new File([compressed], file.name, { type: 'image/jpeg' });
    
    const fileName = `${userId}/${Date.now()}_${finalFile.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, finalFile, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (error) throw error;
    
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

  const passwordRequirements = {
    minLength: password?.length >= 8,
    hasNumber: /[0-9]/.test(password || ''),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password || ''),
  };

  const onSubmit = async (data: SignupFormData) => {
    setSubmitError(null);
    triggerHaptic('light');
    
    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });
      
      if (result?.session && result.user?.id) {
        if (avatarFile) {
          try {
            const avatarUrl = await uploadAvatar(avatarFile, result.user.id);
            await supabase.auth.updateUser({
              data: { avatar_url: avatarUrl },
            });
            await supabase.from('user_profiles').update({ avatar_url: avatarUrl }).eq('user_id', result.user.id);
          } catch (avatarError) {
            console.error('Avatar upload failed:', avatarError);
          }
        }
        
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
          activeTab="signup"
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
          {/* Success State */}
          <AnimatePresence>
            {showSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
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
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
                <p className="text-sm mb-4" style={{ color: '#A78BFA' }}>Redirecting...</p>
              </motion.div>
            ) : (
              <>
                      {/* Heading */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1.5">Create Account</h2>
                        <p className="text-xs" style={{ color: '#A78BFA' }}>Join us today</p>
                      </div>

                {/* Avatar Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <Avatar
                      src={avatarPreview || undefined}
                      fallback={fullName?.[0]?.toUpperCase() || 'U'}
                      size="large"
                      className="w-20 h-20"
                    />
                    <motion.button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        const useCamera = window.confirm('Take photo? (Cancel to choose from gallery)');
                        handleAvatarSelect(useCamera ? 'camera' : 'gallery');
                      }}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </motion.button>
                  </div>
                </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                      <input
                        {...register('fullName', {
                          required: 'Full name is required',
                          minLength: {
                            value: 2,
                            message: 'Full name must be at least 2 characters',
                          },
                        })}
                        ref={(e) => {
                          const { ref } = register('fullName');
                          ref(e);
                          firstInputRef.current = e;
                        }}
                        type="text"
                        placeholder="Enter your full name"
                        className="w-full h-[52px] pl-12 pr-4 rounded-2xl text-white placeholder:text-purple-300/50 transition-all"
                        style={{
                          background: 'rgba(35, 29, 51, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: errors.fullName ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = errors.fullName ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        aria-invalid={errors.fullName ? 'true' : 'false'}
                      />
                    </div>
                    {errors.fullName && touchedFields.fullName && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-400 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.fullName.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                      <input
                        {...register('email', {
                          required: 'Email is required',
                          validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                        })}
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

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                      <input
                        {...register('password', {
                          required: 'Password is required',
                          validate: (value) =>
                            validatePassword(value) ||
                            'Password must be at least 8 characters with uppercase, lowercase, and number',
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

                    {/* Password Requirements */}
                    {password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-3 rounded-xl"
                        style={{
                          background: 'rgba(35, 29, 51, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <div className="space-y-2">
                          {[
                            { key: 'minLength', label: 'At least 8 characters', met: passwordRequirements.minLength },
                            { key: 'hasNumber', label: 'One number', met: passwordRequirements.hasNumber },
                            { key: 'hasSpecial', label: 'One special character', met: passwordRequirements.hasSpecial },
                          ].map((req) => (
                            <div key={req.key} className="flex items-center gap-2">
                              {req.met ? (
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{
                                    background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                                  }}
                                >
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              ) : (
                                <div
                                  className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                                  style={{
                                    borderColor: '#A78BFA',
                                  }}
                                />
                              )}
                              <span
                                className="text-xs"
                                style={{
                                  color: req.met ? '#A78BFA' : '#6B7280',
                                }}
                              >
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                      <input
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) => value === password || 'Passwords do not match',
                        })}
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        className="w-full h-[52px] pl-12 pr-12 rounded-2xl text-white placeholder:text-purple-300/50 transition-all"
                        style={{
                          background: 'rgba(35, 29, 51, 0.6)',
                          backdropFilter: 'blur(10px)',
                          border: errors.confirmPassword ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                          e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = errors.confirmPassword ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setShowConfirmPassword(!showConfirmPassword);
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
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && touchedFields.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2 text-sm text-red-400 flex items-center gap-1.5"
                      >
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <div>
                    <Checkbox
                      checked={watch('agreeToTerms') || false}
                      onChange={(checked) => {
                        setValue('agreeToTerms', checked);
                        trigger('agreeToTerms');
                      }}
                      id="agreeToTerms"
                      label={
                        <>
                          I agree to the{' '}
                          <Link
                            to="/terms"
                            className="font-semibold underline"
                            style={{ color: '#A78BFA' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Terms of Service
                          </Link>
                          {' '}and{' '}
                          <Link
                            to="/privacy"
                            className="font-semibold underline"
                            style={{ color: '#A78BFA' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Privacy Policy
                          </Link>
                        </>
                      }
                    />
                  </div>
                  {errors.agreeToTerms && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-400 flex items-center gap-1.5 -mt-3"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.agreeToTerms.message}
                    </motion.p>
                  )}

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

                  {/* Sign Up Button */}
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
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </motion.button>
                </form>

                {/* Login Link */}
                <div className="mt-6 text-center">
                  <p className="text-sm text-white">
                    Already have an account?{' '}
                    <Link
                      to="/login"
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
                      Sign In
                    </Link>
                  </p>
                </div>
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
