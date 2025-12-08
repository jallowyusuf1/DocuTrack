import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import Button from '../ui/Button';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDataModal({
  isOpen,
  onClose,
}: ExportDataModalProps) {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!user?.id) return;

    setIsExporting(true);
    try {
      const documents = await documentService.getDocuments(user.id);

      const exportData = {
        user: {
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
        },
        documents: documents.map((doc) => ({
          id: doc.id,
          document_type: doc.document_type,
          document_name: doc.document_name,
          document_number: doc.document_number,
          issue_date: doc.issue_date,
          expiration_date: doc.expiration_date,
          category: doc.category,
          notes: doc.notes,
          image_url: doc.image_url,
          created_at: doc.created_at,
        })),
        exported_at: new Date().toISOString(),
      };

      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `docutrack-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      triggerHaptic('success');
      onClose();
      alert('Data exported successfully!');
    } catch (error: any) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={getTransition(transitions.spring)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="rounded-2xl p-6 w-full max-w-md"
              style={{
                background: 'rgba(42, 38, 64, 0.85)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Export All Documents?</h2>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  className="p-2 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Message */}
              <p className="text-white/80 mb-6">
                Creates a JSON file with all your documents and data. This file can be
                used to backup or restore your data.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={isExporting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleExport}
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2 inline" />
                      Export
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
