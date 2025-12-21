import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { triggerHaptic } from '../../utils/animations';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface SetProfileLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  isEnabled: boolean;
}

export default function SetProfileLockModal({
  isOpen,
  onClose,
  onSuccess,
  isEnabled,
}: SetProfileLockModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setError(null);
    }
  }, [isOpen]);

  // Hash password using Web Crypto API
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length !== 8) {
      return 'Password must be exactly 8 characters';
    }
    if (!/^[A-Za-z0-9]{8}$/.test(pwd)) {
      return 'Password must contain only letters and numbers';
    }
    return null;
  };

  const handleSave = async () => {
    setError(null);

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      triggerHaptic('heavy');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      triggerHaptic('heavy');
      return;
    }

    setIsSaving(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to set profile lock');
        return;
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Update or insert user profile
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          profile_lock_enabled: true,
          profile_lock_password_hash: passwordHash,
        }, {
          onConflict: 'user_id',
        });

      if (upsertError) throw upsertError;

      triggerHaptic('medium');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to set profile lock:', err);
      setError(err.message || 'Failed to set profile lock. Please try again.');
      triggerHaptic('heavy');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable = async () => {
    setIsSaving(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to disable profile lock');
        return;
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          profile_lock_enabled: false,
          profile_lock_password_hash: null,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      triggerHaptic('medium');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to disable profile lock:', err);
      setError(err.message || 'Failed to disable profile lock. Please try again.');
      triggerHaptic('heavy');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(42, 38, 64, 0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                }}
              >
                <Lock className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEnabled ? 'Disable Profile Lock' : 'Set Profile Lock'}
                </h2>
                <p className="text-sm" style={{ color: '#A78BFA' }}>
                  {isEnabled ? 'Remove password protection' : 'Protect your profile with a password'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {isEnabled ? (
              // Disable mode
              <>
                <div className="text-center space-y-2">
                  <p className="text-sm text-white">
                    Are you sure you want to disable profile lock? Your profile will no longer be password protected.
                  </p>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={onClose}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleDisable}
                    disabled={isSaving}
                    isLoading={isSaving}
                  >
                    Disable Lock
                  </Button>
                </div>
              </>
            ) : (
              // Enable mode
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Create 8-Digit Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      maxLength={8}
                      value={password}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
                        setPassword(value);
                        setError(null);
                      }}
                      placeholder="ABCD1234"
                      className="w-full h-[52px] pl-12 pr-12 rounded-xl text-white placeholder:text-purple-300/50 text-center text-2xl tracking-widest font-mono"
                      style={{
                        background: 'rgba(35, 29, 51, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: error ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-white/60" />
                      ) : (
                        <Eye className="w-5 h-5 text-white/60" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      maxLength={8}
                      value={confirmPassword}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
                        setConfirmPassword(value);
                        setError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isSaving && password.length === 8 && confirmPassword.length === 8) {
                          handleSave();
                        }
                      }}
                      placeholder="ABCD1234"
                      className="w-full h-[52px] pl-12 pr-12 rounded-xl text-white placeholder:text-purple-300/50 text-center text-2xl tracking-widest font-mono"
                      style={{
                        background: 'rgba(35, 29, 51, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: error ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-white/60" />
                      ) : (
                        <Eye className="w-5 h-5 text-white/60" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-white mb-2">Password Requirements:</div>
                  {[
                    { met: password.length === 8, text: 'Exactly 8 characters' },
                    { met: /^[A-Za-z0-9]{8}$/.test(password), text: 'Letters and numbers only' },
                    { met: password === confirmPassword && confirmPassword.length === 8, text: 'Passwords match' },
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
                        className="text-xs"
                        style={{
                          color: req.met ? '#10B981' : '#A78BFA',
                        }}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-400 flex items-center gap-1.5"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={onClose}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleSave}
                    disabled={isSaving || password.length !== 8 || confirmPassword.length !== 8 || password !== confirmPassword}
                    isLoading={isSaving}
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


