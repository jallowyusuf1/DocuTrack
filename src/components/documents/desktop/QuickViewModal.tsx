import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Calendar, FileText, AlertCircle, Share2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Document } from '../../../types';
import { getDaysUntil, getUrgencyLevel, formatDate } from '../../../utils/dateUtils';
import { triggerHaptic } from '../../../utils/animations';

interface QuickViewModalProps {
  isOpen: boolean;
  document: Document | null;
  onClose: () => void;
  onOpenFullDetail: (id: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const getUrgencyColor = (expiryDate: string) => {
  const urgency = getUrgencyLevel(expiryDate);
  switch (urgency) {
    case 'expired':
      return '#6B7280';
    case 'urgent':
      return '#EF4444';
    case 'soon':
    case 'upcoming':
      return '#F59E0B';
    case 'valid':
      return '#10B981';
    default:
      return '#8B5CF6';
  }
};

const getUrgencyLabel = (expiryDate: string) => {
  const days = getDaysUntil(expiryDate);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires Today';
  if (days === 1) return 'Expires Tomorrow';
  if (days < 7) return `Expires in ${days} days`;
  if (days < 30) return `Expires in ${days} days`;
  return `${Math.floor(days / 30)} months remaining`;
};

export default function QuickViewModal({
  isOpen,
  document,
  onClose,
  onOpenFullDetail,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}: QuickViewModalProps) {
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext, hasPrevious, hasNext]);

  if (!document) return null;

  const urgencyColor = getUrgencyColor(document.expiration_date);
  const urgencyLabel = getUrgencyLabel(document.expiration_date);
  const daysLeft = getDaysUntil(document.expiration_date);

  const handleOpenFullDetail = () => {
    triggerHaptic('medium');
    onOpenFullDetail(document.id);
  };

  const handleClose = () => {
    triggerHaptic('light');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[rgba(26,22,37,0.95)] backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col"
              style={{
                boxShadow: '0 25px 80px rgba(0, 0, 0, 0.6)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-white">Quick View</h2>
                  <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-sm font-medium">
                    {document.document_type}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Navigation Arrows */}
                  {(hasPrevious || hasNext) && (
                    <>
                      <button
                        onClick={onPrevious}
                        disabled={!hasPrevious}
                        className={`p-2 rounded-lg transition-colors ${
                          hasPrevious
                            ? 'text-white hover:bg-white/10'
                            : 'text-white/20 cursor-not-allowed'
                        }`}
                        title="Previous document (←)"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={onNext}
                        disabled={!hasNext}
                        className={`p-2 rounded-lg transition-colors ${
                          hasNext
                            ? 'text-white hover:bg-white/10'
                            : 'text-white/20 cursor-not-allowed'
                        }`}
                        title="Next document (→)"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="w-px h-6 bg-white/10 mx-1" />
                    </>
                  )}

                  <button
                    onClick={handleClose}
                    className="p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                    title="Close (Esc)"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content - Split View */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Image */}
                <div className="w-1/2 bg-gradient-to-br from-purple-900/10 to-blue-900/10 flex items-center justify-center p-8">
                  {document.image_url ? (
                    <img
                      src={document.image_url}
                      alt={document.document_name}
                      className="max-w-full max-h-full object-contain rounded-xl"
                      style={{
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <Calendar className="w-24 h-24 text-white/10 mx-auto mb-4" />
                      <p className="text-white/40">No image available</p>
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="w-1/2 overflow-y-auto p-8">
                  {/* Document Name */}
                  <h3 className="text-3xl font-bold text-white mb-6">
                    {document.document_name}
                  </h3>

                  {/* Urgency Status */}
                  <div
                    className="p-4 rounded-xl mb-6"
                    style={{
                      background: `linear-gradient(135deg, ${urgencyColor}20, ${urgencyColor}10)`,
                      border: `1px solid ${urgencyColor}40`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <AlertCircle className="w-6 h-6" style={{ color: urgencyColor }} />
                      <span className="text-xl font-semibold" style={{ color: urgencyColor }}>
                        {urgencyLabel}
                      </span>
                    </div>
                    <p className="text-white/60 text-sm">
                      {daysLeft < 0 ? 'This document has expired' : `${daysLeft} days until expiration`}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4 mb-6">
                    {document.document_number && (
                      <div>
                        <p className="text-white/50 text-sm mb-1">Document Number</p>
                        <p className="text-white font-medium text-lg">{document.document_number}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-white/50 text-sm mb-1">Issue Date</p>
                      <p className="text-white font-medium">{formatDate(document.issue_date)}</p>
                    </div>

                    <div>
                      <p className="text-white/50 text-sm mb-1">Expiry Date</p>
                      <p className="text-white font-medium">{formatDate(document.expiration_date)}</p>
                    </div>

                    <div>
                      <p className="text-white/50 text-sm mb-1">Date Added</p>
                      <p className="text-white font-medium">{formatDate(document.created_at)}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  {document.notes && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-white/50" />
                        <p className="text-white/50 text-sm">Notes</p>
                      </div>
                      <p className="text-white/80 leading-relaxed">{document.notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleOpenFullDetail}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold hover:from-purple-500 hover:to-purple-400 transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Open Full Detail
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-xl bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
