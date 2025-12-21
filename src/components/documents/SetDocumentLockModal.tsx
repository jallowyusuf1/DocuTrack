import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import BaseModal from '../modals/BaseModal';
import { documentLockService } from '../../services/documentLockService';
import { useAuth } from '../../hooks/useAuth';

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
    <BaseModal isOpen={isOpen} onClose={handleClose}>
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {mode === 'set' ? 'Set Lock Password' : 'Change Lock Password'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info message */}
          <div className="flex gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <AlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-purple-900 dark:text-purple-300">
              {mode === 'set'
                ? 'Create a password to secure your documents. You\'ll need this password to unlock your documents page.'
                : 'Enter your current password and choose a new one.'}
            </p>
          </div>

          {/* Old password (only for change mode) */}
          {mode === 'change' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {mode === 'set' ? 'Password' : 'New Password'}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Enter password (4-20 characters)"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Strength</span>
                  <span className={`text-xs font-medium ${
                    strength.label === 'Strong' ? 'text-green-600' :
                    strength.label === 'Good' ? 'text-yellow-600' :
                    strength.label === 'Weak' ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              {confirmPassword && newPassword === confirmPassword && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
              )}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !newPassword || !confirmPassword || (mode === 'change' && !oldPassword)}
            className="flex-1 px-4 py-3 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:hover:brightness-100 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                {mode === 'set' ? 'Setting...' : 'Changing...'}
              </div>
            ) : (
              mode === 'set' ? 'Set Password' : 'Change Password'
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
