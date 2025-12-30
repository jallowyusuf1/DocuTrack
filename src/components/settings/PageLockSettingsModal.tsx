import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, Eye, EyeOff, AlertCircle, Check, Trash2 } from 'lucide-react';
import { pageLockService, PageType, LockType } from '../../services/pageLock';
import { useAuth } from '../../hooks/useAuth';
import { triggerHaptic } from '../../utils/animations';

interface PageLockSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PAGE_LABELS: Record<PageType, string> = {
  dashboard: 'Dashboard',
  documents: 'Documents',
  profile: 'Profile',
};

export default function PageLockSettingsModal({ isOpen, onClose }: PageLockSettingsModalProps) {
  const { user } = useAuth();
  const [selectedPage, setSelectedPage] = useState<PageType | null>(null);
  const [lockType, setLockType] = useState<LockType>('pin');
  const [lockValue, setLockValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageLocks, setPageLocks] = useState<Map<PageType, { type: LockType; enabled: boolean }>>(new Map());

  useEffect(() => {
    if (isOpen && user?.id) {
      loadPageLocks();
    }
  }, [isOpen, user?.id]);

  const loadPageLocks = async () => {
    if (!user?.id) return;

    const locks = await pageLockService.getAllPageLocks(user.id);
    const lockMap = new Map<PageType, { type: LockType; enabled: boolean }>();

    locks.forEach(lock => {
      lockMap.set(lock.page, {
        type: lock.lock_type,
        enabled: lock.is_enabled,
      });
    });

    setPageLocks(lockMap);
  };

  const handleSetLock = async () => {
    if (!user?.id || !selectedPage) return;

    // Validation
    if (lockType === 'pin') {
      if (!/^\d{6}$/.test(lockValue)) {
        setError('PIN must be exactly 6 digits');
        triggerHaptic('heavy');
        return;
      }
    } else {
      if (lockValue.length < 8) {
        setError('Password must be at least 8 characters');
        triggerHaptic('heavy');
        return;
      }
    }

    if (lockValue !== confirmValue) {
      setError(`${lockType === 'pin' ? 'PINs' : 'Passwords'} do not match`);
      triggerHaptic('heavy');
      return;
    }

    setIsLoading(true);
    setError('');
    triggerHaptic('light');

    const result = await pageLockService.setPageLock(user.id, selectedPage, lockType, lockValue, true);

    if (result.success) {
      setSuccess(`${PAGE_LABELS[selectedPage]} lock set successfully`);
      triggerHaptic('medium');
      setLockValue('');
      setConfirmValue('');
      setSelectedPage(null);
      await loadPageLocks();

      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to set lock');
      triggerHaptic('heavy');
    }

    setIsLoading(false);
  };

  const handleRemoveLock = async (page: PageType) => {
    if (!user?.id) return;

    setIsLoading(true);
    triggerHaptic('light');

    const result = await pageLockService.removePageLock(user.id, page);

    if (result.success) {
      setSuccess(`${PAGE_LABELS[page]} lock removed`);
      triggerHaptic('medium');
      await loadPageLocks();

      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to remove lock');
      triggerHaptic('heavy');
    }

    setIsLoading(false);
  };

  const handleToggleLock = async (page: PageType) => {
    if (!user?.id) return;

    setIsLoading(true);
    triggerHaptic('light');

    const result = await pageLockService.togglePageLock(user.id, page);

    if (result.success) {
      const lock = pageLocks.get(page);
      setSuccess(`${PAGE_LABELS[page]} lock ${lock?.enabled ? 'disabled' : 'enabled'}`);
      triggerHaptic('medium');
      await loadPageLocks();

      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error || 'Failed to toggle lock');
      triggerHaptic('heavy');
    }

    setIsLoading(false);
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glass Card */}
            <div
              className="relative overflow-hidden rounded-3xl p-6 md:p-8"
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
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-bold flex items-center gap-3">
                  <Lock className="w-7 h-7" />
                  Page Lock Settings
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>

              {/* Success/Error Messages */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
                    style={{
                      background: 'rgba(34,197,94,0.15)',
                      border: '1px solid rgba(34,197,94,0.3)',
                    }}
                  >
                    <Check className="w-5 h-5 text-green-300" />
                    <span className="text-green-200 text-sm">{success}</span>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
                    style={{
                      background: 'rgba(239,68,68,0.15)',
                      border: '1px solid rgba(239,68,68,0.3)',
                    }}
                  >
                    <AlertCircle className="w-5 h-5 text-red-300" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Existing Locks */}
              <div className="mb-6 space-y-3">
                <h3 className="text-white/80 text-sm font-medium mb-3">Active Page Locks</h3>

                {(['dashboard', 'documents', 'profile'] as PageType[]).map((page) => {
                  const lock = pageLocks.get(page);

                  return (
                    <div
                      key={page}
                      className="p-4 rounded-2xl flex items-center justify-between"
                      style={{
                        background: lock
                          ? 'rgba(255,255,255,0.08)'
                          : 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    >
                      <div>
                        <div className="text-white font-medium">{PAGE_LABELS[page]}</div>
                        {lock && (
                          <div className="text-white/60 text-sm mt-1">
                            {lock.type === 'pin' ? '6-digit PIN' : 'Password'} • {lock.enabled ? 'Enabled' : 'Disabled'}
                          </div>
                        )}
                        {!lock && (
                          <div className="text-white/40 text-sm mt-1">No lock set</div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {lock && (
                          <>
                            <button
                              onClick={() => handleToggleLock(page)}
                              disabled={isLoading}
                              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                              style={{
                                background: lock.enabled
                                  ? 'rgba(239,68,68,0.2)'
                                  : 'rgba(34,197,94,0.2)',
                                border: lock.enabled
                                  ? '1px solid rgba(239,68,68,0.3)'
                                  : '1px solid rgba(34,197,94,0.3)',
                                color: lock.enabled ? '#fca5a5' : '#86efac',
                              }}
                            >
                              {lock.enabled ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => handleRemoveLock(page)}
                              disabled={isLoading}
                              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                              style={{
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.25)',
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-300" />
                            </button>
                          </>
                        )}

                        {!lock && (
                          <button
                            onClick={() => {
                              setSelectedPage(page);
                              setLockValue('');
                              setConfirmValue('');
                              setError('');
                            }}
                            className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{
                              background: 'rgba(59,130,246,0.2)',
                              border: '1px solid rgba(59,130,246,0.3)',
                              color: '#93c5fd',
                            }}
                          >
                            Set Lock
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add/Edit Lock Form */}
              <AnimatePresence>
                {selectedPage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="p-6 rounded-2xl space-y-4"
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <h3 className="text-white text-lg font-semibold">
                        Set Lock for {PAGE_LABELS[selectedPage]}
                      </h3>

                      {/* Lock Type Selection */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setLockType('pin')}
                          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: lockType === 'pin'
                              ? 'rgba(59,130,246,0.25)'
                              : 'rgba(255,255,255,0.05)',
                            border: lockType === 'pin'
                              ? '1px solid rgba(59,130,246,0.4)'
                              : '1px solid rgba(255,255,255,0.10)',
                            color: lockType === 'pin' ? '#93c5fd' : 'rgba(255,255,255,0.6)',
                          }}
                        >
                          6-Digit PIN
                        </button>
                        <button
                          onClick={() => setLockType('password')}
                          className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: lockType === 'password'
                              ? 'rgba(59,130,246,0.25)'
                              : 'rgba(255,255,255,0.05)',
                            border: lockType === 'password'
                              ? '1px solid rgba(59,130,246,0.4)'
                              : '1px solid rgba(255,255,255,0.10)',
                            color: lockType === 'password' ? '#93c5fd' : 'rgba(255,255,255,0.6)',
                          }}
                        >
                          Password
                        </button>
                      </div>

                      {/* Lock Value Input */}
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          {lockType === 'pin' ? 'Enter 6-digit PIN' : 'Enter Password'}
                        </label>
                        <div className="relative">
                          <input
                            type={lockType === 'pin' ? 'tel' : showPassword ? 'text' : 'password'}
                            value={lockValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (lockType === 'pin') {
                                const numericValue = value.replace(/[^0-9]/g, '');
                                if (numericValue.length <= 6) {
                                  setLockValue(numericValue);
                                  setError('');
                                }
                              } else {
                                setLockValue(value);
                                setError('');
                              }
                            }}
                            placeholder={lockType === 'pin' ? '••••••' : '••••••••'}
                            maxLength={lockType === 'pin' ? 6 : 64}
                            className="w-full h-12 px-4 pr-12 text-white rounded-xl outline-none"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.12)',
                            }}
                          />
                          {lockType === 'password' && (
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center"
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
                      </div>

                      {/* Confirm Value Input */}
                      <div>
                        <label className="block text-white/70 text-sm mb-2">
                          {lockType === 'pin' ? 'Confirm PIN' : 'Confirm Password'}
                        </label>
                        <input
                          type={lockType === 'pin' ? 'tel' : showPassword ? 'text' : 'password'}
                          value={confirmValue}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (lockType === 'pin') {
                              const numericValue = value.replace(/[^0-9]/g, '');
                              if (numericValue.length <= 6) {
                                setConfirmValue(numericValue);
                                setError('');
                              }
                            } else {
                              setConfirmValue(value);
                              setError('');
                            }
                          }}
                          placeholder={lockType === 'pin' ? '••••••' : '••••••••'}
                          maxLength={lockType === 'pin' ? 6 : 64}
                          className="w-full h-12 px-4 text-white rounded-xl outline-none"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                          }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => {
                            setSelectedPage(null);
                            setLockValue('');
                            setConfirmValue('');
                            setError('');
                          }}
                          className="flex-1 h-11 rounded-xl text-sm font-medium"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            color: 'rgba(255,255,255,0.7)',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSetLock}
                          disabled={isLoading || !lockValue || !confirmValue}
                          className="flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                          style={{
                            background: 'radial-gradient(circle at 30% 25%, rgba(59,130,246,0.4) 0%, rgba(37,99,235,0.3) 100%)',
                            border: '1px solid rgba(59,130,246,0.4)',
                            color: '#ffffff',
                            opacity: isLoading || !lockValue || !confirmValue ? 0.5 : 1,
                            cursor: isLoading || !lockValue || !confirmValue ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            />
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              Set Lock
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
