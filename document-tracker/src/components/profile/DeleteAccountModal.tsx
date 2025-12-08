import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { supabase } from '../../config/supabase';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const { user } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    if (!user?.id) return;

    setIsDeleting(true);
    try {
      const documents = await documentService.getDocuments(user.id);
      for (const doc of documents) {
        await documentService.deleteDocument(doc.id, user.id);
      }

      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      await supabase.auth.signOut();

      triggerHaptic('heavy');
      onConfirm();
    } catch (error: any) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
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
                background: 'rgba(26, 22, 37, 0.95)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* Warning Icon */}
              <div className="flex justify-center mb-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '2px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>

              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white mb-2">
                  Delete Account?
                </h2>
                <p className="text-sm text-white/70">
                  This will permanently delete all your documents and data. This
                  action cannot be undone.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <Input
                  label="Type DELETE to confirm"
                  placeholder="DELETE"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="h-[52px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleDelete}
                  disabled={isDeleting || confirmText !== 'DELETE'}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
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
