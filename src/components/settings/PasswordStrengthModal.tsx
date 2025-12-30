import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Check, AlertCircle, Key } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { useToast } from '../../hooks/useToast';

interface PasswordStrengthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

export default function PasswordStrengthModal({ isOpen, onClose }: PasswordStrengthModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return { score: 0, label: 'No password', color: '#6B7280', suggestions: [] };
    }

    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (password.length >= 8) score += 1;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score += 1;
    else if (password.length >= 8) suggestions.push('Use 12+ characters for better security');

    // Complexity checks
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    else suggestions.push('Mix uppercase and lowercase letters');

    if (/\d/.test(password)) score += 1;
    else suggestions.push('Include numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
    else suggestions.push('Add special characters');

    // Determine strength
    if (score <= 1) return { score, label: 'Weak', color: '#EF4444', suggestions };
    if (score <= 3) return { score, label: 'Fair', color: '#F59E0B', suggestions };
    if (score <= 4) return { score, label: 'Good', color: '#3B82F6', suggestions };
    return { score, label: 'Strong', color: '#10B981', suggestions };
  };

  const strength = calculatePasswordStrength(newPassword);

  const handleChangePassword = async () => {
    if (!user) return;

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (strength.score < 3) {
      showToast('Please use a stronger password', 'error');
      return;
    }

    setLoading(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        showToast('Current password is incorrect', 'error');
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      showToast('Password changed successfully', 'success');
      triggerHaptic('success');
      onClose();
    } catch (error) {
      console.error('Password change error:', error);
      showToast('Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative w-full max-w-lg mx-4 mb-4 md:mb-0 rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 22, 37, 0.95), rgba(35, 29, 51, 0.95))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                    }}
                  >
                    <Key className="w-5 h-5" style={{ color: '#60A5FA' }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Change Password</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-xl text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showCurrent ? (
                      <EyeOff className="w-5 h-5 text-white/40" />
                    ) : (
                      <Eye className="w-5 h-5 text-white/40" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-xl text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showNew ? (
                      <EyeOff className="w-5 h-5 text-white/40" />
                    ) : (
                      <Eye className="w-5 h-5 text-white/40" />
                    )}
                  </button>
                </div>

                {/* Strength Indicator */}
                {newPassword && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/60">Password Strength:</span>
                      <span className="text-sm font-medium" style={{ color: strength.color }}>
                        {strength.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-all"
                          style={{
                            background: i <= strength.score ? strength.color : 'rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      ))}
                    </div>

                    {/* Suggestions */}
                    {strength.suggestions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {strength.suggestions.map((suggestion, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <AlertCircle className="w-3 h-3 text-orange-400 flex-shrink-0" />
                            <span className="text-xs text-white/60">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-12 rounded-xl text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: confirmPassword && newPassword !== confirmPassword
                        ? '1px solid rgba(239, 68, 68, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-5 h-5 text-white/40" />
                    ) : (
                      <Eye className="w-5 h-5 text-white/40" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 mt-2"
                  >
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Passwords match</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 h-12 rounded-xl font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="flex-1 h-12 rounded-xl font-medium"
                style={{
                  background: loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #2563EB, #1E40AF)',
                  color: '#FFFFFF',
                  opacity: loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword ? 0.5 : 1,
                }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
