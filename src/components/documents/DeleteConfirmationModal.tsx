import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Button from '../ui/Button';
import { getTransition, transitions } from '../../utils/animations';
import { useImageUrl } from '../../hooks/useImageUrl';
import type { Document } from '../../types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  documentName?: string;
  document?: Document;
  isLoading?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  documentName,
  document,
  isLoading = false,
}: DeleteConfirmationModalProps) {
  const { signedUrl: imageUrl } = useImageUrl(document?.image_url || '');
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={getTransition(transitions.spring)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div 
              className="rounded-[28px] shadow-xl w-full p-5 md:p-6"
              style={{
                background: 'rgba(42, 38, 64, 0.85)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
                maxWidth: '380px',
                padding: '20px',
              }}
              data-tablet-delete="true"
              data-desktop-delete="true"
              onClick={(e) => e.stopPropagation()}
            >
              <style>{`
                @media (min-width: 768px) {
                  [data-tablet-delete="true"] {
                    max-width: 460px !important;
                    padding: 24px !important;
                  }
                }
                @media (min-width: 1024px) {
                  [data-desktop-delete="true"] {
                    max-width: 500px !important;
                    padding: 24px !important;
                  }
                }
              `}</style>
              <div className="flex flex-col items-center text-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="rounded-full flex items-center justify-center mb-4"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    width: '64px',
                    height: '64px',
                  }}
                  data-tablet-delete-icon="true"
                >
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-delete-icon="true"] {
                        width: 80px !important;
                        height: 80px !important;
                      }
                    }
                  `}</style>
                  <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                </motion.div>
                <h2 className="text-[17px] md:text-[20px] font-bold text-white mb-2">Delete Document?</h2>
                {documentName && (
                  <p className="text-sm md:text-base text-glass-secondary mb-2">"{documentName}"</p>
                )}
                {document && imageUrl && (
                  <div className="w-32 h-40 rounded-lg overflow-hidden mx-auto mb-3" style={{ background: '#F5F5F5' }}>
                    <img
                      src={imageUrl}
                      alt={documentName || 'Document'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <p className="text-sm md:text-base text-glass-secondary">This action cannot be undone.</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={isLoading}
                  style={{ height: '50px' }}
                  data-tablet-delete-btn="true"
                >
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-delete-btn="true"] {
                        height: 56px !important;
                      }
                    }
                  `}</style>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  onClick={onConfirm}
                  disabled={isLoading}
                  style={{ height: '50px' }}
                  data-tablet-delete-btn2="true"
                >
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-delete-btn2="true"] {
                        height: 56px !important;
                      }
                    }
                  `}</style>
                  {isLoading ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
