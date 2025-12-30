import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Copy, Check, Smartphone } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useToast } from '../../hooks/useToast';
import QRCode from 'qrcode';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TwoFactorModal({ isOpen, onClose, onSuccess }: TwoFactorModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<'scan' | 'verify'>('scan');
  const [verificationCode, setVerificationCode] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey] = useState('JBSWY3DPEHPK3PXP'); // Mock secret key
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useState(() => {
    if (isOpen) {
      // Generate QR code
      const otpauthUrl = `otpauth://totp/DocuTrackr:user@example.com?secret=${secretKey}&issuer=DocuTrackr`;
      QRCode.toDataURL(otpauthUrl).then(setQrCodeUrl);
    }
  });

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    triggerHaptic('light');
    showToast('Secret key copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      showToast('Please enter a 6-digit code', 'error');
      return;
    }

    setLoading(true);
    try {
      // Simulate verification - in production, verify with backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock verification success
      showToast('Two-factor authentication enabled', 'success');
      triggerHaptic('success');
      onSuccess();
    } catch (error) {
      showToast('Invalid verification code', 'error');
    } finally {
      setLoading(false);
    }
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
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(22, 163, 74, 0.2))',
                    }}
                  >
                    <Shield className="w-5 h-5" style={{ color: '#4ADE80' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
                    <p className="text-sm text-white/60">
                      {step === 'scan' ? 'Step 1: Scan QR Code' : 'Step 2: Verify'}
                    </p>
                  </div>
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
            <div className="px-6 py-6">
              {step === 'scan' ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-white/80 text-sm text-center">
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                  </p>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: '#FFFFFF',
                      }}
                    >
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                      ) : (
                        <div className="w-48 h-48 flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div className="mt-4">
                    <p className="text-white/60 text-xs text-center mb-2">Or enter this key manually:</p>
                    <div
                      className="p-3 rounded-xl flex items-center justify-between"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <code className="text-white font-mono text-sm">{secretKey}</code>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopySecret}
                        className="ml-2"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-white/60" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <p className="text-white/80 text-sm text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-14 px-4 rounded-xl text-white text-center text-2xl font-mono tracking-widest"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                    placeholder="000000"
                    autoFocus
                  />

                  <div
                    className="p-3 rounded-xl flex items-start gap-2"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <Smartphone className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300">
                      The code changes every 30 seconds. Make sure your device time is accurate.
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (step === 'verify') {
                    setStep('scan');
                    setVerificationCode('');
                  } else {
                    onClose();
                  }
                }}
                className="flex-1 h-12 rounded-xl font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                }}
              >
                {step === 'verify' ? 'Back' : 'Cancel'}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (step === 'scan') {
                    setStep('verify');
                  } else {
                    handleVerify();
                  }
                }}
                disabled={loading}
                className="flex-1 h-12 rounded-xl font-medium"
                style={{
                  background: loading
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'linear-gradient(135deg, #2563EB, #1E40AF)',
                  color: '#FFFFFF',
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? 'Verifying...' : step === 'scan' ? 'Next' : 'Verify & Enable'}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
