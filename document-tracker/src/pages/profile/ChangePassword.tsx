import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Toast from '../../components/ui/Toast';
import { triggerHaptic } from '../../utils/animations';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (data.newPassword !== data.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    if (data.newPassword.length < 8) {
      showToast('New password must be at least 8 characters', 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not found');
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      showToast('Password updated successfully!', 'success');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to update password:', error);
      showToast(
        error.message || 'Failed to update password. Please try again.',
        'error'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="pb-[72px] min-h-screen relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
            transform: 'translate(50%, 50%)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header 
          className="px-5 py-4 flex items-center gap-4"
          style={{
            background: 'rgba(35, 29, 51, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('light');
              navigate('/profile');
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(35, 29, 51, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="text-2xl font-bold text-white">Change Password</h1>
        </header>

        {/* Form */}
        <div className="px-4 pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Current Password */}
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              {...register('currentPassword', {
                required: 'Current password is required',
              })}
              error={errors.currentPassword?.message}
              className="h-[52px]"
            />

            {/* New Password */}
            <div>
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                })}
                error={errors.newPassword?.message}
                className="h-[52px]"
              />
              <p className="mt-1 text-xs" style={{ color: '#A78BFA' }}>
                Must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: (value) =>
                  value === newPassword || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
              className="h-[52px]"
            />

            {/* Password Requirements */}
            <div 
              className="rounded-xl p-4 mt-6"
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <h3 className="text-sm font-semibold text-white mb-2">
                Password Requirements:
              </h3>
              <ul className="text-xs space-y-1" style={{ color: '#A78BFA' }}>
                <li>• At least 8 characters long</li>
                <li>• Mix of letters and numbers recommended</li>
                <li>• Avoid common words or personal information</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="pt-6 pb-24">
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isUpdating}
                className="h-[52px]"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
