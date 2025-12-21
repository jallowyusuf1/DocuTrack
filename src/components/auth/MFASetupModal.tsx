import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Loader2, Check, Download } from 'lucide-react';
import { mfaService } from '../../services/mfaService';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { getTransition } from '../../utils/animations';

interface MFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MFASetupModal({ isOpen, onClose, onSuccess }: MFASetupModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState<'qr' | 'backup'>('qr');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [factorId, setFactorId] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (isOpen && step === 'qr') {
      enrollTOTP();
    }
  }, [isOpen, step]);

  const enrollTOTP = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const enrollment = await mfaService.enrollTOTP('DocuTrackr Authenticator');
      if (enrollment) {
        setQrCode(enrollment.qr_code);
        setSecret(enrollment.secret);
        setFactorId(enrollment.id);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to start 2FA setup', 'error');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showToast('Please enter a valid 6-digit code', 'error');
      return;
    }

    setVerifying(true);
    try {
      const verified = await mfaService.verifyEnrollment(factorId, verificationCode);
      if (verified) {
        // Generate backup codes
        const codes = mfaService.generateBackupCodes(10);
        await mfaService.saveBackupCodes(user!.id, codes);
        setBackupCodes(codes);
        setStep('backup'); // Changed from 'verify' to 'backup' to show backup codes
        showToast('2FA enabled successfully!', 'success');
      } else {
        showToast('Invalid code. Please try again.', 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to verify code', 'error');
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = `DocuTrackr Backup Codes\n\nSave these codes in a safe place. Each code can only be used once.\n\n${backupCodes.join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docutrackr-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={getTransition()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full max-w-md rounded-3xl p-6"
              style={{
                background: 'rgba(26, 22, 37, 0.95)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Enable Two-Factor Authentication</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : step === 'qr' ? (
                <div className="space-y-6">
                  {/* Instructions */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Step 1: Scan QR Code</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Open your authenticator app (Google Authenticator, Authy, etc.) and scan this QR code:
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}
                    >
                      {qrCode ? (
                        <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                      ) : (
                        <div className="w-64 h-64 flex items-center justify-center">
                          <QrCode className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Can't scan? Enter this code manually:</p>
                    <div
                      className="p-3 rounded-lg font-mono text-sm text-white break-all"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {secret}
                    </div>
                  </div>

                  {/* Verification Code Input */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Step 2: Verify Setup</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Enter the 6-digit code from your authenticator app:
                    </p>
                    <Input
                      type="text"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                      }}
                      maxLength={6}
                      className="text-center text-2xl tracking-widest font-mono"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={onClose}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={handleVerify}
                      isLoading={verifying}
                      disabled={verificationCode.length !== 6}
                    >
                      Verify & Enable
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Success Message */}
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-xl mb-2">2FA Enabled Successfully!</h3>
                    <p className="text-gray-400 text-sm">
                      Your account is now protected with two-factor authentication.
                    </p>
                  </div>

                  {/* Backup Codes */}
                  <div>
                    <h3 className="text-white font-semibold mb-2">Backup Codes</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Save these codes in a safe place. You can use them to access your account if you lose access to your authenticator app. Each code can only be used once.
                    </p>
                    <div
                      className="p-4 rounded-lg space-y-2 mb-4"
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded font-mono text-sm text-white"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <span>{code}</span>
                          <span className="text-gray-400 text-xs">Unused</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="secondary"
                      fullWidth
                      onClick={handleDownloadBackupCodes}
                      className="flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Backup Codes
                    </Button>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      onSuccess();
                      onClose();
                    }}
                  >
                    Done
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
