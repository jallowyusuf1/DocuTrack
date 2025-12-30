import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Shield, Lock, Globe } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useToast } from '../../hooks/useToast';
import Toggle from '../ui/Toggle';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacySettingsModal({ isOpen, onClose }: PrivacySettingsModalProps) {
  const { showToast } = useToast();
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const handleSave = () => {
    triggerHaptic('success');
    showToast('Privacy settings updated', 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative w-full max-w-lg mx-4 mb-4 md:mb-0 rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 22, 37, 0.95), rgba(35, 29, 51, 0.95))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))',
                    }}
                  >
                    <Eye className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Privacy Settings</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Profile Visibility */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                      }}
                    >
                      <Eye className="w-5 h-5" style={{ color: '#60A5FA' }} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Profile Visibility</p>
                      <p className="text-white/60 text-xs mt-0.5">Let family members see your profile</p>
                    </div>
                  </div>
                  <Toggle
                    checked={profileVisibility}
                    onChange={(checked) => {
                      triggerHaptic('light');
                      setProfileVisibility(checked);
                    }}
                  />
                </div>
              </div>

              {/* Activity Status */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
                      }}
                    >
                      <Globe className="w-5 h-5" style={{ color: '#4ADE80' }} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Activity Status</p>
                      <p className="text-white/60 text-xs mt-0.5">Show when you're active</p>
                    </div>
                  </div>
                  <Toggle
                    checked={showActivityStatus}
                    onChange={(checked) => {
                      triggerHaptic('light');
                      setShowActivityStatus(checked);
                    }}
                  />
                </div>
              </div>

              {/* Data Sharing */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2))',
                      }}
                    >
                      <Shield className="w-5 h-5" style={{ color: '#FB923C' }} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Third-Party Data Sharing</p>
                      <p className="text-white/60 text-xs mt-0.5">Share anonymized data for improvements</p>
                    </div>
                  </div>
                  <Toggle
                    checked={dataSharing}
                    onChange={(checked) => {
                      triggerHaptic('light');
                      setDataSharing(checked);
                    }}
                  />
                </div>
              </div>

              {/* Analytics */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(124, 58, 237, 0.2))',
                      }}
                    >
                      <Lock className="w-5 h-5" style={{ color: '#A78BFA' }} />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Usage Analytics</p>
                      <p className="text-white/60 text-xs mt-0.5">Help improve the app with usage data</p>
                    </div>
                  </div>
                  <Toggle
                    checked={analyticsEnabled}
                    onChange={(checked) => {
                      triggerHaptic('light');
                      setAnalyticsEnabled(checked);
                    }}
                  />
                </div>
              </div>

              {/* Info Box */}
              <div
                className="p-4 rounded-xl"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <p className="text-sm text-blue-300 leading-relaxed">
                  Your data is always encrypted and never sold to third parties. Privacy controls help you manage
                  what information you share within the app.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 h-12 rounded-xl font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex-1 h-12 rounded-xl font-medium"
                style={{
                  background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
                  color: '#FFFFFF',
                }}
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
