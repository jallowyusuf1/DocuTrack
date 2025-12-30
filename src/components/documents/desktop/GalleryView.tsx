import { useState } from 'react';
import { Eye, Share2, MoreVertical, Calendar, AlertCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Document } from '../../../types';
import { getDaysUntil, getUrgencyLevel, formatDate } from '../../../utils/dateUtils';
import { triggerHaptic } from '../../../utils/animations';

interface GalleryViewProps {
  documents: Document[];
  selectedIds: string[];
  onSelectDocument: (id: string) => void;
  onQuickView: (document: Document) => void;
  onShare: (document: Document) => void;
  onNavigateToDetail: (id: string) => void;
  selectionMode: boolean;
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
      return '#2563EB';
  }
};

const getUrgencyLabel = (expiryDate: string) => {
  const days = getDaysUntil(expiryDate);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires Today';
  if (days === 1) return 'Expires Tomorrow';
  if (days < 7) return `${days} days left`;
  if (days < 30) return `${days} days left`;
  return `${Math.floor(days / 30)} months left`;
};

// Staggered heights for masonry effect
const cardHeights = [550, 500, 600, 550, 520, 580];

export default function GalleryView({
  documents,
  selectedIds,
  onSelectDocument,
  onQuickView,
  onShare,
  onNavigateToDetail,
  selectionMode,
}: GalleryViewProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleCardClick = (document: Document, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;

    if (selectionMode) {
      onSelectDocument(document.id);
    } else {
      onNavigateToDetail(document.id);
    }
  };

  const handleCheckboxChange = (id: string) => {
    triggerHaptic('light');
    onSelectDocument(id);
  };

  const handleQuickView = (document: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onQuickView(document);
  };

  const handleShare = (document: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('medium');
    onShare(document);
  };

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div
      className="p-6"
      style={{
        columnCount: 3,
        columnGap: '24px',
      }}
    >
      {documents.map((document, index) => {
        const isSelected = selectedIds.includes(document.id);
        const isHovered = hoveredCard === document.id;
        const urgencyColor = getUrgencyColor(document.expiration_date);
        const urgencyLabel = getUrgencyLabel(document.expiration_date);
        const cardHeight = cardHeights[index % cardHeights.length];

        return (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            onMouseEnter={() => setHoveredCard(document.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={(e) => handleCardClick(document, e)}
            className={`relative bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 mb-6 ${
              isSelected ? 'ring-2 ring-blue-600 border-blue-600/50' : 'border-white/10 hover:border-white/20'
            }`}
            style={{
              width: '400px',
              height: `${cardHeight}px`,
              breakInside: 'avoid',
              boxShadow: isSelected
                ? '0 0 30px rgba(37, 99, 235, 0.4)'
                : isHovered
                ? '0 15px 50px rgba(0, 0, 0, 0.4)'
                : '0 6px 20px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Selection Checkbox */}
            <AnimatePresence>
              {(selectionMode || isSelected) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-4 left-4 z-20"
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(document.id)}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-[rgba(26,22,37,0.8)] checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover Actions */}
            <AnimatePresence>
              {isHovered && !selectionMode && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-4 right-4 z-20 flex items-center gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleQuickView(document, e)}
                    className="w-10 h-10 rounded-lg bg-[rgba(26,22,37,0.9)] backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-blue-600/20 hover:border-blue-600/50 transition-colors"
                    title="Quick View"
                  >
                    <Eye className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleShare(document, e)}
                    className="w-10 h-10 rounded-lg bg-[rgba(26,22,37,0.9)] backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleMenu(document.id, e)}
                      className="w-10 h-10 rounded-lg bg-[rgba(26,22,37,0.9)] backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                      title="More"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </motion.button>
                    {openMenuId === document.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-[rgba(26,22,37,0.95)] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl z-30"
                      >
                        <button className="w-full px-4 py-3 text-left text-white text-sm hover:bg-white/10 transition-colors">
                          Edit
                        </button>
                        <button className="w-full px-4 py-3 text-left text-white text-sm hover:bg-white/10 transition-colors">
                          Download
                        </button>
                        <button className="w-full px-4 py-3 text-left text-white text-sm hover:bg-white/10 transition-colors">
                          Mark as Renewed
                        </button>
                        <button className="w-full px-4 py-3 text-left text-red-400 text-sm hover:bg-red-500/10 transition-colors border-t border-white/10">
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Document Image - Takes 60% of card height */}
            <div
              className="relative w-full overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20"
              style={{ height: `${cardHeight * 0.6}px` }}
            >
              {document.image_url ? (
                <img
                  src={document.image_url}
                  alt={document.document_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="w-20 h-20 text-white/20" />
                </div>
              )}

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)',
                }}
              />
            </div>

            {/* Urgency Bar */}
            <div
              className="h-2 w-full"
              style={{
                background: urgencyColor,
                boxShadow: `0 0 20px ${urgencyColor}80`,
              }}
            />

            {/* Card Content - Takes 40% of card height */}
            <div
              className="p-5 flex flex-col"
              style={{ height: `${cardHeight * 0.4 - 8}px` }}
            >
              {/* Document Name */}
              <h3 className="text-white font-bold text-xl line-clamp-2 mb-3">
                {document.document_name}
              </h3>

              {/* Category & Number */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-300 text-sm font-medium">
                  {document.document_type}
                </span>
                {document.document_number && (
                  <span className="text-white/50 text-sm line-clamp-1">
                    #{document.document_number}
                  </span>
                )}
              </div>

              {/* Notes */}
              {document.notes && (
                <div className="mb-4 flex items-start gap-2">
                  <FileText className="w-4 h-4 text-white/40 mt-0.5 flex-shrink-0" />
                  <p className="text-white/60 text-sm line-clamp-3">{document.notes}</p>
                </div>
              )}

              {/* Expiry Info */}
              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" style={{ color: urgencyColor }} />
                  <span className="text-base font-semibold" style={{ color: urgencyColor }}>
                    {urgencyLabel}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-white/50 text-sm">
                    Expires: {formatDate(document.expiration_date)}
                  </div>
                  <div className="text-white/30 text-xs">
                    Added {formatDate(document.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
