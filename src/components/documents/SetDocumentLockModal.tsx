import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import FrostedModal from '../ui/FrostedModal';
import { documentLockService } from '../../services/documentLockService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

interface SetDocumentLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: 'set' | 'change';
}

export default function SetDocumentLockModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
}: SetDocumentLockModalProps) {
  const { user } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (password.length < 4) {
      return 'Password must be at least 4 characters';
    }
    if (password.length > 20) {
      return 'Password must be less than 20 characters';
    }
    return null;
  };

  const handleSubmit = async () => {
    if (!user) return;

    setError('');

    // Validate old password if changing
    if (mode === 'change') {
      if (!oldPassword) {
        setError('Please enter your current password');
        return;
      }
    }

    // Validate new password
    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Check confirmation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'set') {
        // Set new password
        await documentLockService.setLockPassword(user.id, newPassword);
      } else {
        // Change password
        const success = await documentLockService.updateLockPassword(
          user.id,
          oldPassword,
          newPassword
        );

        if (!success) {
          setError('Current password is incorrect');
          setIsLoading(false);
          return;
        }
      }

      // Success
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error setting lock password:', err);
      setError('Failed to set password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  const passwordStrength = (password: string): { label: string; color: string; width: string } => {
    if (password.length === 0) return { label: '', color: '', width: '0%' };
    if (password.length < 4) return { label: 'Too short', color: 'bg-red-500', width: '25%' };
    if (password.length < 8) return { label: 'Weak', color: 'bg-orange-500', width: '50%' };
    if (password.length < 12) return { label: 'Good', color: 'bg-yellow-500', width: '75%' };
    return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  };

  const strength = passwordStrength(newPassword);

  return (
    <FrostedModal isOpen={isOpen} onClose={handleClose} maxWidthClass="max-w-md" zIndexClassName="z-[100]">
      <div className="flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b border-white/10"
          style={{
            background: 'rgba(26, 22, 37, 0.35)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(37, 99, 235, 0.18)',
                border: '1px solid rgba(37, 99, 235, 0.35)',
                boxShadow: '0 10px 30px rgba(37, 99, 235, 0.18)',
              }}
            >
              <Lock className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="text-white text-xl font-bold leading-tight">
                {mode === 'set' ? 'Set Document Lock' : 'Change Document Lock'}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#60A5FA' }}>
                Protect your documents with a password
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
              color: 'rgba(255, 255, 255, 0.80)',
            }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          {/* Info message */}
          <div
            className="flex gap-3 p-4 rounded-2xl"
            style={{
              background: 'rgba(35, 29, 51, 0.55)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
            }}
          >
            <AlertCircle className="w-5 h-5 text-blue-300 flex-shrink-0 mt-0.5" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>
              {mode === 'set'
                ? "Create a password to secure your documents. You'll need it to unlock the Documents page."
                : 'Enter your current password and choose a new one.'}
            </p>
          </div>

          {/* Old password (only for change mode) */}
          {mode === 'change' && (
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full h-[52px] px-4 pr-12 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
                  placeholder="Enter current password"
                  style={{
                    background: 'rgba(35, 29, 51, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
                  style={{
                    color: '#60A5FA',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(37, 99, 235, 0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                  aria-label={showOldPassword ? 'Hide password' : 'Show password'}
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* New password */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              {mode === 'set' ? 'Password' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-[52px] px-4 pr-12 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
                placeholder="Enter password (4-20 characters)"
                style={{
                  background: 'rgba(35, 29, 51, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
                style={{
                  color: '#60A5FA',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">Strength</span>
                  <span
                    className="text-xs font-semibold"
                    style={{
                      color:
                        strength.label === 'Strong'
                          ? '#34D399'
                          : strength.label === 'Good'
                            ? '#FBBF24'
                            : strength.label === 'Weak'
                              ? '#FB923C'
                              : '#F87171',
                    }}
                  >
                    {strength.label}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255, 255, 255, 0.10)' }}
                >
                  <div
                    className={`h-full ${strength.color} transition-all duration-300`}
                    style={{ width: strength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-[52px] px-4 pr-16 rounded-xl text-white placeholder:text-white/40 focus:outline-none"
                placeholder="Confirm password"
                style={{
                  background: 'rgba(35, 29, 51, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors"
                style={{
                  color: '#60A5FA',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 99, 235, 0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {confirmPassword && newPassword === confirmPassword && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex gap-2 p-3 rounded-xl"
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
              }}
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex gap-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleSubmit}
              loading={isLoading}
              disabled={!newPassword || !confirmPassword || (mode === 'change' && !oldPassword)}
            >
              {mode === 'set' ? 'Set Password' : 'Change Password'}
            </Button>
          </div>
        </div>
      </div>
    </FrostedModal>
  );
}
