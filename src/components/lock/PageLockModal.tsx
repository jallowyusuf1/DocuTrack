import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface PageLockModalProps {
  isOpen: boolean;
  pageName: string;
  onUnlock: (password: string) => Promise<boolean>;
  lockType?: 'pin' | 'password';
}

export default function PageLockModal({ isOpen, pageName, onUnlock, lockType = 'pin' }: PageLockModalProps) {
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const maxLength = lockType === 'pin' ? 6 : 64;
  const minLength = lockType === 'pin' ? 6 : 8;

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setError('');
      setAttempts(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (input.length < minLength) {
      setError(lockType === 'pin' ? 'PIN must be 6 digits' : 'Password must be at least 8 characters');
      triggerHaptic('heavy');
      return;
    }

    setIsLoading(true);
    setError('');
    triggerHaptic('light');

    try {
      const success = await onUnlock(input);

      if (success) {
        triggerHaptic('medium');
        setInput('');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(`Incorrect ${lockType === 'pin' ? 'PIN' : 'password'}. ${3 - newAttempts} attempts remaining.`);
        triggerHaptic('heavy');
        setInput('');

        if (newAttempts >= 3) {
          setError('Too many attempts. Please try again later.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      triggerHaptic('heavy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    if (lockType === 'pin') {
      // Only allow numbers for PIN
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= maxLength) {
        setInput(numericValue);
        setError('');

        // Auto-submit when PIN is complete
        if (numericValue.length === 6) {
          setTimeout(() => {
            handleSubmit();
          }, 100);
        }
      }
    } else {
      // Allow any characters for password
      if (value.length <= maxLength) {
        setInput(value);
        setError('');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md mx-auto"
          >
            {/* Glass Card */}
            <div
              className="relative overflow-hidden rounded-3xl p-8 md:p-10"
              style={{
                background:
                  'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 45%, rgba(0,0,0,0.25) 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(40px) saturate(120%)',
                WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                boxShadow:
                  '0 30px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              {/* Lock Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{
                    background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  <Lock className="w-10 h-10 text-white" />
                </motion.div>
              </div>

              {/* Title */}
              <h2 className="text-center text-white text-2xl font-bold mb-2">
                {pageName} Locked
              </h2>
              <p className="text-center text-white/60 text-sm mb-8">
                Enter your {lockType === 'pin' ? '6-digit PIN' : 'password'} to unlock
              </p>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="relative">
                    <input
                      type={lockType === 'pin' ? 'tel' : showPassword ? 'text' : 'password'}
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={lockType === 'pin' ? '••••••' : 'Enter password'}
                      maxLength={maxLength}
                      autoFocus
                      disabled={isLoading || attempts >= 3}
                      className="w-full h-14 px-5 pr-12 text-white text-center text-lg tracking-widest rounded-2xl outline-none transition-all duration-200"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        boxShadow: error
                          ? '0 0 0 2px rgba(239,68,68,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                          : 'inset 0 1px 0 rgba(255,255,255,0.08)',
                      }}
                    />

                    {lockType === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-white/70" />
                        ) : (
                          <Eye className="w-4 h-4 text-white/70" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* PIN Dots Indicator */}
                  {lockType === 'pin' && (
                    <div className="flex justify-center gap-2 mt-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{
                            scale: input.length === i ? 1.2 : 1,
                            backgroundColor: input.length > i
                              ? 'rgba(255,255,255,0.9)'
                              : 'rgba(255,255,255,0.15)',
                          }}
                          className="w-3 h-3 rounded-full"
                          style={{
                            border: '1px solid rgba(255,255,255,0.2)',
                            boxShadow: input.length > i
                              ? '0 0 10px rgba(255,255,255,0.5)'
                              : 'none',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-3 px-4 py-2.5 rounded-xl flex items-center gap-2"
                        style={{
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.3)',
                        }}
                      >
                        <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
                        <span className="text-red-200 text-sm">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button (only for password) */}
                {lockType === 'password' && (
                  <motion.button
                    type="submit"
                    disabled={isLoading || attempts >= 3 || input.length < minLength}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full h-12 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2"
                    style={{
                      background: isLoading || attempts >= 3 || input.length < minLength
                        ? 'rgba(255,255,255,0.1)'
                        : 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 100%)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                      opacity: isLoading || attempts >= 3 || input.length < minLength ? 0.5 : 1,
                      cursor: isLoading || attempts >= 3 || input.length < minLength ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        />
                        Unlocking...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Unlock
                      </>
                    )}
                  </motion.button>
                )}
              </form>

              {/* Help Text */}
              <p className="text-center text-white/40 text-xs mt-6">
                Forgot your {lockType === 'pin' ? 'PIN' : 'password'}? Go to Settings to reset.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
