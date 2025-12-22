import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, AlertCircle, Loader2, Mail } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { triggerHaptic } from '../../utils/animations';
import Button from '../ui/Button';

interface ProfileLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExit?: () => void;
  onUnlock: () => void;
}

export default function ProfileLockModal({
  isOpen,
  onClose,
  onExit,
  onUnlock,
}: ProfileLockModalProps) {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const supportsWebkitTextSecurity =
    typeof window !== 'undefined' &&
    typeof (window as any).CSS !== 'undefined' &&
    typeof (window as any).CSS.supports === 'function' &&
    (window as any).CSS.supports('-webkit-text-security', 'disc');
  const secureInputType: 'text' | 'password' = supportsWebkitTextSecurity ? 'text' : 'password';

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setAttempts(0);
      setError(null);
      setShowEmailVerification(false);
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

  const handleUnlock = async () => {
    if (!password || password.length !== 8 || !/^[A-Za-z0-9]{8}$/.test(password)) {
      setError('Please enter a valid 8-character password (letters or numbers)');
      triggerHaptic('heavy');
      return;
    }

    setIsUnlocking(true);
    setError(null);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Please log in to unlock profile');
        return;
      }

      // Get user profile with lock password hash
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('profile_lock_password_hash')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.profile_lock_password_hash) {
        setError('Profile lock password not configured');
        return;
      }

      // Hash entered password and compare
      const enteredHash = await hashPassword(password);
      
      if (enteredHash === profile.profile_lock_password_hash) {
        // Success!
        triggerHaptic('medium');
        onUnlock();
      } else {
        // Wrong password
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          // Max attempts reached
          setShowEmailVerification(true);
          triggerHaptic('heavy');
          
          // Send email verification
          try {
            await supabase.auth.resend({
              type: 'signup',
              email: user.email || '',
            });
          } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
          }
        } else {
          setError(`Incorrect password. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? 's' : ''} remaining.`);
          triggerHaptic('heavy');
        }
      }
    } catch (err: any) {
      console.error('Unlock error:', err);
      setError(err.message || 'Failed to unlock profile. Please try again.');
      triggerHaptic('heavy');
    } finally {
      setIsUnlocking(false);
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
            background: 'rgba(0,0,0,0.55)',
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
                <h2 className="text-xl font-bold text-white">Unlock Profile</h2>
                <p className="text-sm" style={{ color: '#A78BFA' }}>Enter your profile lock password</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {showEmailVerification ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Maximum Attempts Reached</h3>
                  <p className="text-sm" style={{ color: '#A78BFA' }}>
                    For security reasons, please verify your email to continue unlocking your profile.
                  </p>
                  <p className="text-sm mt-2" style={{ color: '#A78BFA' }}>
                    A verification email has been sent to your registered email address.
                  </p>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={onExit ?? onClose}
                >
                  Back to Dashboard
                </Button>
              </motion.div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Enter 8-Digit Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#A78BFA' }} />
                    <input
                      type={secureInputType}
                      maxLength={8}
                      value={password}
                      onChange={(e) => {
                        // Allow alphanumeric only
                        const value = e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 8).toUpperCase();
                        setPassword(value);
                        setError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isUnlocking) {
                          handleUnlock();
                        }
                      }}
                      placeholder="ABCD1234"
                      className="w-full h-[52px] pl-12 pr-4 rounded-xl text-white placeholder:text-purple-300/50 text-center text-2xl tracking-widest font-mono"
                      style={{
                        background: 'rgba(35, 29, 51, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: error ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                        WebkitTextSecurity: 'disc',
                      }}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
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
                  {attempts > 0 && attempts < 3 && (
                    <p className="mt-2 text-xs" style={{ color: '#EAB308' }}>
                      {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
                    </p>
                  )}
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleUnlock}
                  disabled={isUnlocking || password.length !== 8}
                  className="h-[52px]"
                >
                  {isUnlocking ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Unlock Profile
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onExit ?? onClose}
                  className="h-[48px]"
                >
                  Back to Dashboard
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


