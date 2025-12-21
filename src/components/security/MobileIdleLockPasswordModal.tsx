import { AnimatePresence, motion } from 'framer-motion';
import { Lock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { triggerHaptic } from '../../utils/animations';
import { idleSecurityService } from '../../services/idleSecurityService';

export default function MobileIdleLockPasswordModal({
  isOpen,
  onClose,
  userId,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSaved?: () => void;
}) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPassword('');
    setConfirm('');
    setError(null);
    setLoading(false);
  }, [isOpen]);

  const handleSave = async () => {
    setError(null);
    const p = password.trim();
    if (p.length < 6) {
      setError('Password must be at least 6 characters.');
      triggerHaptic('heavy');
      return;
    }
    if (p !== confirm.trim()) {
      setError('Passwords do not match.');
      triggerHaptic('heavy');
      return;
    }

    setLoading(true);
    try {
      await idleSecurityService.setIdleLockPassword(userId, p);
      triggerHaptic('medium');
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      triggerHaptic('heavy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0"
            onClick={onClose}
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(18px)' }}
          />

          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full rounded-t-[28px] p-6"
            style={{
              background: 'rgba(26, 22, 37, 0.96)',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.35)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold">Idle lock password</div>
                  <div className="text-white/60 text-sm">Set a dedicated password to unlock after timeout.</div>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="New password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                autoFocus
              />
              <Input
                label="Confirm password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
              />
            </div>

            {error ? <div className="mt-4 text-red-300 text-sm">{error}</div> : null}

            <div className="mt-6 flex gap-3">
              <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" fullWidth onClick={handleSave} isLoading={loading}>
                Save
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

