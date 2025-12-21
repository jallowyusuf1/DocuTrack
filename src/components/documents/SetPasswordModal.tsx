import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, AlertCircle, Loader2, Check } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { triggerHaptic } from '../../utils/animations';
import { validatePasswordStrength } from '../../utils/passwordStrength';
import Button from '../ui/Button';

interface SetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordSet: () => void;
}

export default function SetPasswordModal({
  isOpen,
  onClose,
  onPasswordSet,
}: SetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSetting, setIsSetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setError(null);
    }
  }, [isOpen]);

  // Password strength
  const passwordStrength = password ? validatePasswordStrength(password) : null;

  // Hash password using Web Crypto API
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleSetPassword = async () => {
    if (!password || password.length !== 8 || !/^[A-Za-z0-9]{8}$/.test(password)) {
      setError('Please enter a valid 8-character password (letters or numbers)');
      triggerHaptic('heavy');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      triggerHaptic('heavy');
      return;
    }

    if (passwordStrength?.strength === 'weak') {
      setError('Please choose a stronger password');
      triggerHaptic('heavy');
      return;
    }

    setIsSetting(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to set password');
        return;
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Save to user profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          lock_documents_enabled: true,
          lock_password_hash: passwordHash,
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Success!
      triggerHaptic('medium');
      onPasswordSet();
      onClose();
    } catch (err: any) {
      console.error('Set password error:', err);
      setError(err.message || 'Failed to set password. Please try again.');
      triggerHaptic('heavy');
    } finally {
      setIsSetting(false);
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
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-md rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(42, 38, 64, 0.95)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
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
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Lock Password</h2>
                <p className="text-sm" style={{ color: '#A78BFA' }}>
                  Set a password to protect your documents
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Enter 8-Digit Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                <input
                  type="text"
                  maxLength={8}
                  value={password}
                  onChange={(e) => {
                    // Allow alphanumeric only
                    const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
                    setPassword(value);
                    setError(null);
                  }}
                  placeholder="ABCD1234"
                  className="w-full h-[52px] pl-12 pr-4 rounded-xl text-white placeholder:text-purple-300/50 text-center text-2xl tracking-widest font-mono"
                  style={{
                    background: 'rgba(35, 29, 51, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: passwordStrength
                      ? `1px solid ${passwordStrength.color}`
                      : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  autoFocus
                />
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      className="h-full rounded-full"
                      style={{
                        background: passwordStrength?.color || '#EF4444',
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: passwordStrength?.color || '#EF4444',
                    }}
                  >
                    {passwordStrength?.message || 'Weak'}
                  </span>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                <input
                  type="text"
                  maxLength={8}
                  value={confirmPassword}
                  onChange={(e) => {
                    // Allow alphanumeric only
                    const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
                    setConfirmPassword(value);
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSetting) {
                      handleSetPassword();
                    }
                  }}
                  placeholder="ABCD1234"
                  className="w-full h-[52px] pl-12 pr-4 rounded-xl text-white placeholder:text-purple-300/50 text-center text-2xl tracking-widest font-mono"
                  style={{
                    background: 'rgba(35, 29, 51, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: confirmPassword && password === confirmPassword
                      ? '1px solid rgba(16, 185, 129, 0.5)'
                      : confirmPassword && password !== confirmPassword
                        ? '1px solid rgba(239, 68, 68, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>
              {confirmPassword && password === confirmPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 flex items-center gap-2 text-sm"
                  style={{ color: '#10B981' }}
                >
                  <Check className="w-4 h-4" />
                  Passwords match
                </motion.div>
              )}
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

            <Button
              variant="primary"
              fullWidth
              onClick={handleSetPassword}
              disabled={isSetting || password.length !== 8 || confirmPassword.length !== 8 || password !== confirmPassword || passwordStrength?.strength === 'weak'}
              className="h-[52px] flex items-center justify-center gap-2"
            >
              {isSetting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Setting Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Set Password</span>
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
