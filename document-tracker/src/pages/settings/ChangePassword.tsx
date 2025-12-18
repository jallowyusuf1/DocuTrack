import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { triggerHaptic } from '../../utils/animations';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

export default function ChangePassword() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { toasts, showToast, removeToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Password requirements
  const passwordRequirements = {
    minLength: newPassword.length >= 8,
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };

  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!passwordRequirements.hasNumber) {
      newErrors.newPassword = 'Password must contain at least one number';
    } else if (!passwordRequirements.hasSpecial) {
      newErrors.newPassword = 'Password must contain at least one special character';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    if (!validate()) {
      return;
    }

    if (!user?.email) {
      showToast('User not found', 'error');
      return;
    }

    setLoading(true);

    try {
      // Verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setErrors({ currentPassword: 'Current password is incorrect' });
        setLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      showToast('Password updated successfully', 'success');
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to update password:', error);
      showToast(error.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: 'transparent' }}>
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 z-20 h-[70px] flex items-center px-4 border-b border-white/10"
        style={{
          background: 'rgba(35, 29, 51, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
          style={{
            background: 'rgba(42, 38, 64, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h1 className="text-2xl font-bold text-white">Change Password</h1>
      </div>

      {/* Content */}
      <div className="pt-[86px] px-4">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Glass Card */}
          <div
            className="rounded-[20px] p-6"
            style={{
              background: 'rgba(42, 38, 64, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Current Password */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  label="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  error={errors.currentPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowCurrentPassword(!showCurrentPassword);
                  }}
                  className="absolute right-4 top-[42px] text-glass-secondary hover:text-white transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  error={errors.newPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowNewPassword(!showNewPassword);
                  }}
                  className="absolute right-4 top-[42px] text-glass-secondary hover:text-white transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              {newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium text-white mb-2">Password Requirements:</div>
                  {[
                    { met: passwordRequirements.minLength, text: 'At least 8 characters' },
                    { met: passwordRequirements.hasNumber, text: 'At least one number' },
                    { met: passwordRequirements.hasSpecial, text: 'At least one special character' },
                  ].map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: req.met
                            ? 'linear-gradient(135deg, #10B981, #059669)'
                            : 'rgba(107, 102, 126, 0.3)',
                        }}
                      >
                        {req.met && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span
                        className="text-sm"
                        style={{
                          color: req.met ? '#10B981' : '#A78BFA',
                        }}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowConfirmPassword(!showConfirmPassword);
                  }}
                  className="absolute right-4 top-[42px] text-glass-secondary hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Update Button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || !allRequirementsMet || !currentPassword || !confirmPassword}
            isLoading={loading}
          >
            Update Password
          </Button>
        </motion.form>
      </div>

      {/* Toasts */}
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





