import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { triggerHaptic } from '../../utils/animations';
import Button from '../ui/Button';

interface VerifyPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  action: 'lock' | 'unlock';
}

export default function VerifyPasswordModal({
  isOpen,
  onClose,
  onVerified,
  action,
}: VerifyPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPassword('');
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

  const handleVerify = async () => {
    if (!password || password.length !== 8 || !/^[A-Za-z0-9]{8}$/.test(password)) {
      setError('Please enter a valid 8-character password (letters or numbers)');
      triggerHaptic('heavy');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to continue');
        return;
      }

      // Get user profile with lock password hash
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('lock_password_hash')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.lock_password_hash) {
        setError('Password not configured. Please set a password first.');
        return;
      }

      // Hash entered password and compare
      const enteredHash = await hashPassword(password);
      
      if (enteredHash === profile.lock_password_hash) {
        // Success!
        triggerHaptic('medium');
        onVerified();
        onClose();
      } else {
        setError('Incorrect password. Please try again.');
        triggerHaptic('heavy');
      }
    } catch (err: any) {
      console.error('Verify password error:', err);
      setError(err.message || 'Failed to verify password. Please try again.');
      triggerHaptic('heavy');
    } finally {
      setIsVerifying(false);
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
                  background: action === 'lock' 
                    ? 'rgba(139, 92, 246, 0.2)' 
                    : 'rgba(239, 68, 68, 0.2)',
                  border: action === 'lock'
                    ? '1px solid rgba(139, 92, 246, 0.4)'
                    : '1px solid rgba(239, 68, 68, 0.4)',
                }}
              >
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {action === 'lock' ? 'Lock Document' : 'Unlock Document'}
                </h2>
                <p className="text-sm" style={{ color: '#A78BFA' }}>
                  Enter your password to continue
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isVerifying) {
                      handleVerify();
                    }
                  }}
                  placeholder="ABCD1234"
                  className="w-full h-[52px] pl-12 pr-4 rounded-xl text-white placeholder:text-purple-300/50 text-center text-2xl tracking-widest font-mono"
                  style={{
                    background: 'rgba(35, 29, 51, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: error ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  autoFocus
                />
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-400 flex items-center gap-1.5"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.p>
              )}
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={handleVerify}
              disabled={isVerifying || password.length !== 8}
              className="h-[52px]"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  {action === 'lock' ? 'Lock Document' : 'Unlock Document'}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
