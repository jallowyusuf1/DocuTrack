import { useEffect, useState } from 'react';
import DesktopModal from '../ui/DesktopModal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { idleSecurityService } from '../../services/idleSecurityService';

export default function SetIdleLockPasswordModal({
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
      return;
    }
    if (p !== confirm.trim()) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await idleSecurityService.setIdleLockPassword(userId, p);
      onSaved?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DesktopModal isOpen={isOpen} onClose={onClose} title="Set Idle Lock Password" width={520}>
      <div className="p-8">
        <p className="text-white/70 mb-6">
          Create a dedicated password used to unlock the app after idle timeout.
        </p>

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

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} isLoading={loading}>
            Save Password
          </Button>
        </div>
      </div>
    </DesktopModal>
  );
}

