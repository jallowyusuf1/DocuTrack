import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';
import { mfaService } from '../../services/mfaService';
import Button from '../ui/Button';
import { getTransition } from '../../utils/animations';

interface BackupCodesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function BackupCodesModal({ isOpen, onClose, userId }: BackupCodesModalProps) {
  const [backupCodes, setBackupCodes] = useState<{ code: string; used: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      loadBackupCodes();
    }
  }, [isOpen, userId]);

  const loadBackupCodes = async () => {
    setLoading(true);
    try {
      const codes = await mfaService.getBackupCodes(userId);
      setBackupCodes(codes);
    } catch (error) {
      console.error('Error loading backup codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const unusedCodes = backupCodes.filter(bc => !bc.used).map(bc => bc.code);
    const content = `DocuTrackr Backup Codes\n\nSave these codes in a safe place. Each code can only be used once.\n\n${unusedCodes.join('\n')}\n\nGenerated: ${new Date().toLocaleString()}`;
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

  const unusedCodes = backupCodes.filter(bc => !bc.used);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Backup Codes</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400">Loading backup codes...</p>
                </div>
              ) : unusedCodes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No unused backup codes available.</p>
                  <p className="text-gray-500 text-sm">All backup codes have been used. Please regenerate new codes.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Save these codes in a safe place. You can use them to access your account if you lose access to your authenticator app. Each code can only be used once.
                  </p>
                  <div
                    className="p-4 rounded-lg space-y-2 max-h-64 overflow-y-auto"
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {unusedCodes.map((bc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded font-mono text-sm text-white"
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <span>{bc.code}</span>
                        <span className="text-gray-400 text-xs">Unused</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Backup Codes
                  </Button>
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                onClick={onClose}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
