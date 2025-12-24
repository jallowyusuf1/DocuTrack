import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { useToast } from '../../hooks/useToast';
import { triggerHaptic, prefersReducedMotion } from '../../utils/animations';
import { GlassCard, GlassButton } from '../ui/glass/Glass';

interface AccountLinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google' | 'github';
  existingEmail: string;
  socialEmail: string;
  onLinked: () => void;
}

export default function AccountLinkingModal({
  isOpen,
  onClose,
  provider,
  existingEmail,
  socialEmail,
  onLinked,
}: AccountLinkingModalProps) {
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const reduced = prefersReducedMotion();

  const handleLinkAccounts = async () => {
    setIsLinking(true);
    setError(null);
    triggerHaptic('light');

    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // The accounts should already be linked if the email matches
      // Supabase automatically links OAuth accounts with matching emails
      // We just need to refresh the session
      await supabase.auth.refreshSession();

      triggerHaptic('medium');
      showToast('Accounts linked successfully!', 'success');
      onLinked();
      onClose();
    } catch (err) {
      triggerHaptic('heavy');
      const message = err instanceof Error ? err.message : 'Failed to link accounts';
      setError(message);
      showToast(message, 'error');
    } finally {
      setIsLinking(false);
    }
  };

  const handleUseDifferentEmail = () => {
    triggerHaptic('light');
    supabase.auth.signOut();
    onClose();
  };

  if (!isOpen) return null;

  const providerName = provider === 'google' ? 'Google' : 'GitHub';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md pointer-events-auto"
            >
              <GlassCard
                elevated
                className="p-6 md:p-8"
                style={{
                  borderRadius: 30,
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.06) 60%, rgba(139,92,246,0.12) 100%)',
                  border: '1px solid rgba(255,255,255,0.14)',
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-white font-semibold text-xl">Link Accounts?</h2>
                    <p className="text-white/70 text-sm mt-1">
                      This email is already registered with a password.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.10)',
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Account Preview */}
                <div className="space-y-3 mb-6">
                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.10)',
                    }}
                  >
                    <div className="text-xs text-white/60 mb-1">Existing Account</div>
                    <div className="text-white font-medium">{existingEmail}</div>
                    <div className="text-xs text-white/50 mt-1">Email & Password</div>
                  </div>

                  <div
                    className="p-4 rounded-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.10)',
                    }}
                  >
                    <div className="text-xs text-white/60 mb-1">New Account</div>
                    <div className="text-white font-medium">{socialEmail}</div>
                    <div className="text-xs text-white/50 mt-1">{providerName}</div>
                  </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="mb-4 p-3 rounded-xl text-sm flex items-start gap-2"
                      style={{
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.25)',
                        color: 'rgba(255,255,255,0.90)',
                      }}
                    >
                      <AlertCircle className="w-4 h-4 mt-0.5 text-red-300 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="space-y-3">
                  <GlassButton
                    onClick={handleLinkAccounts}
                    disabled={isLinking}
                    className="w-full"
                  >
                    {isLinking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      'Link Accounts'
                    )}
                  </GlassButton>

                  <GlassButton
                    variant="secondary"
                    onClick={handleUseDifferentEmail}
                    disabled={isLinking}
                    className="w-full"
                  >
                    Use Different Email
                  </GlassButton>

                  <button
                    onClick={onClose}
                    disabled={isLinking}
                    className="w-full text-center text-white/70 hover:text-white text-sm transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

