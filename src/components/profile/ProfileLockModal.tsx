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
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{
          background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
        }}
      >
        {/* Animated Background Glow Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 20% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)',
            }}
          />
        </div>

        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
          style={{
            background: 'rgba(0,0,0,0.7)',
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
            background: 'linear-gradient(135deg, rgba(42, 38, 64, 0.95) 0%, rgba(35, 29, 51, 0.95) 100%)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 80px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(37, 99, 235, 0.15)',
                  border: '2px solid rgba(37, 99, 235, 0.5)',
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)',
                }}
              >
                <Lock className="w-7 h-7" style={{ color: '#60A5FA' }} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Unlock Profile</h2>
                <p className="text-sm" style={{ color: '#60A5FA' }}>Enter your profile lock password</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 space-y-5">
            {showEmailVerification ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4 py-4"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Maximum Attempts Reached</h3>
                  <p className="text-sm" style={{ color: '#60A5FA' }}>
                    For security reasons, please verify your email to continue unlocking your profile.
                  </p>
                  <p className="text-sm mt-2" style={{ color: '#60A5FA' }}>
                    A verification email has been sent to your registered email address.
                  </p>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={onExit ?? onClose}
                  className="h-[52px] mt-4"
                >
                  Back to Dashboard
                </Button>
              </motion.div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Enter 8-Digit Password
                  </label>
                  <div className="relative">
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
                      placeholder="••••••••"
                      className="w-full h-[56px] px-4 rounded-xl text-white placeholder:text-blue-300/40 text-center text-2xl tracking-[0.5em] font-mono"
                      style={{
                        background: 'rgba(35, 29, 51, 0.7)',
                        backdropFilter: 'blur(10px)',
                        border: error 
                          ? '2px solid rgba(239, 68, 68, 0.6)' 
                          : '2px solid rgba(37, 99, 235, 0.4)',
                        boxShadow: error
                          ? '0 0 20px rgba(239, 68, 68, 0.2)'
                          : '0 0 20px rgba(37, 99, 235, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
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
                      className="mt-3 text-sm text-red-400 flex items-center gap-1.5"
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
                  className="h-[56px] text-base font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(109, 40, 217, 0.95))',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }}
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

                <button
                  onClick={onExit ?? onClose}
                  className="w-full text-center text-sm font-medium transition-colors"
                  style={{ color: '#60A5FA' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#C4B5FD';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#60A5FA';
                  }}
                >
                  Back to Dashboard
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


