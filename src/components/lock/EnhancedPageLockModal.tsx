import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Fingerprint, ShieldCheck, KeyRound } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';

interface EnhancedPageLockModalProps {
  isOpen: boolean;
  pageName: string;
  onUnlock: (password: string) => Promise<boolean>;
  lockType?: 'pin' | 'password';
}

export default function EnhancedPageLockModal({ isOpen, pageName, onUnlock, lockType = 'pin' }: EnhancedPageLockModalProps) {
  const [input, setInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxLength = lockType === 'pin' ? 6 : 64;
  const minLength = lockType === 'pin' ? 6 : 8;

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setError('');
      setAttempts(0);
      setShowSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (input.length < minLength) {
      setError(lockType === 'pin' ? 'PIN must be 6 digits' : 'Password must be at least 8 characters');
      triggerHaptic('heavy');
      setShakeKey(prev => prev + 1);
      return;
    }

    setIsLoading(true);
    setError('');
    triggerHaptic('light');

    try {
      const success = await onUnlock(input);

      if (success) {
        setShowSuccess(true);
        triggerHaptic('success');
        setTimeout(() => {
          setInput('');
        }, 1000);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(`Incorrect ${lockType === 'pin' ? 'PIN' : 'password'}. ${3 - newAttempts} attempt${3 - newAttempts !== 1 ? 's' : ''} remaining.`);
        triggerHaptic('heavy');
        setShakeKey(prev => prev + 1);
        setInput('');

        if (newAttempts >= 3) {
          setError('Too many attempts. Please try again in 5 minutes.');
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      triggerHaptic('heavy');
      setShakeKey(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    if (lockType === 'pin') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (numericValue.length <= maxLength) {
        setInput(numericValue);
        setError('');

        if (numericValue.length === 6) {
          setTimeout(() => handleSubmit(), 100);
        }
      }
    } else {
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
            background: 'radial-gradient(circle at 50% 50%, rgba(20,20,20,0.98) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(30px) saturate(120%)',
            WebkitBackdropFilter: 'blur(30px) saturate(120%)',
          }}
        >
          {/* Ambient glow effects */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md mx-auto relative z-10"
          >
            {/* Glass Card */}
            <motion.div
              key={shakeKey}
              animate={error ? {
                x: [0, -10, 10, -10, 10, 0],
                transition: { duration: 0.5 }
              } : {}}
              className="relative overflow-hidden rounded-[32px] p-8 md:p-10"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 40%, rgba(0,0,0,0.3) 100%)',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(50px) saturate(150%)',
                WebkitBackdropFilter: 'blur(50px) saturate(150%)',
                boxShadow:
                  '0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08), inset 0 2px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.3)',
              }}
            >
              {/* Top decorative line */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                }}
              />

              {/* Lock Icon with animated ring */}
              <div className="flex justify-center mb-8 relative">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute w-28 h-28 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.1) 90deg, transparent 180deg)',
                  }}
                />

                <motion.div
                  animate={{
                    scale: showSuccess ? [1, 1.2, 1] : [1, 1.05, 1],
                    rotate: showSuccess ? [0, -10, 10, 0] : [0, -3, 3, 0],
                  }}
                  transition={{
                    duration: showSuccess ? 0.6 : 2,
                    repeat: showSuccess ? 0 : Infinity,
                    ease: 'easeInOut'
                  }}
                  className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: showSuccess
                      ? 'radial-gradient(circle at 30% 25%, rgba(34,197,94,0.3) 0%, rgba(34,197,94,0.15) 100%)'
                      : 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
                    border: `2px solid ${showSuccess ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.2)'}`,
                    boxShadow: showSuccess
                      ? '0 15px 50px rgba(34,197,94,0.5), inset 0 2px 0 rgba(255,255,255,0.3)'
                      : '0 15px 50px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.3)',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {showSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                      >
                        <CheckCircle2 className="w-12 h-12 text-green-300" strokeWidth={2.5} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="lock"
                        initial={{ scale: 1 }}
                        animate={{ scale: 1 }}
                      >
                        <Lock className="w-12 h-12 text-white" strokeWidth={2} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-center text-white text-3xl font-bold mb-3" style={{ letterSpacing: '-0.5px' }}>
                  {pageName} Locked
                </h2>
                <p className="text-center text-white/70 text-base mb-8 leading-relaxed">
                  {lockType === 'pin' ? (
                    <span className="flex items-center justify-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Enter your 6-digit PIN to unlock
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      Enter your password to unlock
                    </span>
                  )}
                </p>
              </motion.div>

              {/* Input Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type={lockType === 'pin' ? 'tel' : showPassword ? 'text' : 'password'}
                      value={input}
                      onChange={(e) => handleInputChange(e.target.value)}
                      placeholder={lockType === 'pin' ? '• • • • • •' : 'Enter password'}
                      maxLength={maxLength}
                      autoFocus
                      disabled={isLoading || attempts >= 3}
                      className="w-full h-16 px-6 pr-14 text-white text-center font-medium rounded-2xl outline-none transition-all duration-300"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: error
                          ? '2px solid rgba(239,68,68,0.5)'
                          : input.length > 0
                          ? '2px solid rgba(59,130,246,0.3)'
                          : '2px solid rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(15px)',
                        WebkitBackdropFilter: 'blur(15px)',
                        boxShadow: error
                          ? '0 0 0 4px rgba(239,68,68,0.15), inset 0 2px 0 rgba(255,255,255,0.1)'
                          : input.length > 0
                          ? '0 0 0 4px rgba(59,130,246,0.1), inset 0 2px 0 rgba(255,255,255,0.1)'
                          : 'inset 0 2px 0 rgba(255,255,255,0.1)',
                        fontSize: lockType === 'pin' ? '24px' : '16px',
                        letterSpacing: lockType === 'pin' ? '8px' : 'normal',
                      }}
                    />

                    {lockType === 'password' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <AnimatePresence mode="wait">
                          {showPassword ? (
                            <motion.div
                              key="hide"
                              initial={{ scale: 0, rotate: -90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: 90 }}
                            >
                              <EyeOff className="w-5 h-5 text-white/80" />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="show"
                              initial={{ scale: 0, rotate: 90 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0, rotate: -90 }}
                            >
                              <Eye className="w-5 h-5 text-white/80" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )}
                  </div>

                  {/* PIN Dots Indicator - Enhanced */}
                  {lockType === 'pin' && (
                    <div className="flex justify-center gap-3 mt-6">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{
                            scale: input.length === i ? 1.3 : 1,
                            backgroundColor: input.length > i
                              ? 'rgba(59,130,246,1)'
                              : 'rgba(255,255,255,0.2)',
                          }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="w-4 h-4 rounded-full relative"
                          style={{
                            border: '2px solid rgba(255,255,255,0.3)',
                            boxShadow: input.length > i
                              ? '0 0 15px rgba(59,130,246,0.6), inset 0 1px 0 rgba(255,255,255,0.5)'
                              : 'none',
                          }}
                        >
                          {input.length > i && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                              }}
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Error Message - Enhanced */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 px-5 py-3.5 rounded-2xl flex items-center gap-3"
                        style={{
                          background: 'rgba(239,68,68,0.15)',
                          border: '1px solid rgba(239,68,68,0.4)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 10px 30px rgba(239,68,68,0.3)',
                        }}
                      >
                        <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                        <span className="text-red-200 text-sm font-medium">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submit Button (only for password) */}
                {lockType === 'password' && (
                  <motion.button
                    type="submit"
                    disabled={isLoading || attempts >= 3 || input.length < minLength}
                    whileHover={!isLoading && attempts < 3 && input.length >= minLength ? { scale: 1.02, y: -2 } : {}}
                    whileTap={!isLoading && attempts < 3 && input.length >= minLength ? { scale: 0.98 } : {}}
                    className="w-full h-14 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-3 relative overflow-hidden"
                    style={{
                      background: isLoading || attempts >= 3 || input.length < minLength
                        ? 'rgba(255,255,255,0.1)'
                        : 'radial-gradient(circle at 30% 25%, rgba(59,130,246,0.8) 0%, rgba(37,99,235,0.7) 100%)',
                      border: '2px solid rgba(59,130,246,0.3)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      boxShadow: isLoading || attempts >= 3 || input.length < minLength
                        ? 'none'
                        : '0 15px 40px rgba(59,130,246,0.4), inset 0 2px 0 rgba(255,255,255,0.3)',
                      opacity: isLoading || attempts >= 3 || input.length < minLength ? 0.5 : 1,
                      cursor: isLoading || attempts >= 3 || input.length < minLength ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {!isLoading && !(attempts >= 3 || input.length < minLength) && (
                      <motion.div
                        className="absolute inset-0"
                        animate={{
                          background: [
                            'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                            'linear-gradient(225deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                      />
                    )}

                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full"
                        />
                        <span>Unlocking...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Unlock {pageName}</span>
                      </>
                    )}
                  </motion.button>
                )}
              </form>

              {/* Biometric Option Placeholder */}
              <div className="mt-6 flex items-center justify-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="text-white/40 text-xs font-medium">OR</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-4 w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-white/60 text-sm font-medium"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Fingerprint className="w-5 h-5" />
                <span>Use Biometric (Coming Soon)</span>
              </motion.button>

              {/* Help Text */}
              <p className="text-center text-white/40 text-xs mt-6 leading-relaxed">
                Forgot your {lockType === 'pin' ? 'PIN' : 'password'}?<br />
                Go to <span className="text-white/60 font-medium">Settings → Page Lock Settings</span> to reset.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
