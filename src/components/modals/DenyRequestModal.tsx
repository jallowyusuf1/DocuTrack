import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import BaseModal from './BaseModal';
import { triggerHaptic } from '../../utils/animations';

interface DenyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  childName: string;
  requestType: string;
}

export default function DenyRequestModal({
  isOpen,
  onClose,
  onConfirm,
  childName,
  requestType,
}: DenyRequestModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestTypeLabel = requestType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deny request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      triggerHaptic('light');
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Deny Request"
      size="md"
      closeOnEscape={!isSubmitting}
    >
      <div className="flex flex-col gap-6">
        {/* Subtitle */}
        <p className="text-white/70 text-sm">
          This will reject <span className="font-semibold text-white">{childName}'s</span> permission request for{' '}
          <span className="font-semibold text-white">{requestTypeLabel}</span>.
        </p>

        {/* Reason Textarea */}
        <div className="flex flex-col gap-2">
          <label htmlFor="denial-reason" className="text-sm font-medium text-white/90">
            Reason for denial <span className="text-white/50">(optional but recommended)</span>
          </label>
          <textarea
            id="denial-reason"
            value={reason}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 500) {
                setReason(value);
              }
            }}
            placeholder="Explain to your child why you're denying this request. This helps them understand your decision."
            rows={4}
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-xl text-white placeholder-white/40 resize-none transition-all"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
            }}
          />
          <div className="flex items-center justify-between text-xs text-white/50">
            <div className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>Tip: Explaining your reason helps your child learn responsible decision-making</span>
            </div>
            <span>
              {reason.length} / 500
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-xl text-sm text-red-400"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
            }}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Denying...
              </>
            ) : (
              'Deny Request'
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

