import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { Document } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface MarkRenewedModalProps {
  document: Document | null;
  onClose: () => void;
  onSave: (documentId: string, newExpirationDate: string) => Promise<void>;
}

export default function MarkRenewedModal({
  document,
  onClose,
  onSave,
}: MarkRenewedModalProps) {
  const [newExpirationDate, setNewExpirationDate] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!document) return null;

  const handleSave = async () => {
    if (!newExpirationDate) return;

    setIsSaving(true);
    try {
      await onSave(document.id, newExpirationDate);
      onClose();
    } catch (error) {
      console.error('Failed to update document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Set default to 1 year from today
  const defaultDate = new Date();
  defaultDate.setFullYear(defaultDate.getFullYear() + 1);
  const defaultDateString = defaultDate.toISOString().split('T')[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={getTransition(transitions.spring)}
          className="glass-card-elevated rounded-2xl p-6 w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Mark as Renewed?</h2>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-2 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
            >
              <X className="w-5 h-5 text-glass-primary" />
            </motion.button>
          </div>

          {/* Document Info */}
          <div className="mb-4 p-3 glass-card-subtle rounded-xl">
            <p className="text-sm text-glass-secondary mb-1">Document</p>
            <p className="font-semibold text-white">{document.document_name}</p>
          </div>

        {/* New Expiration Date */}
        <div className="mb-6">
          <Input
            type="date"
            label="New Expiration Date"
            value={newExpirationDate || defaultDateString}
            onChange={(e) => setNewExpirationDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="h-12"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={isSaving}
            className="h-12"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            disabled={isSaving || !newExpirationDate}
            className="h-12"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

