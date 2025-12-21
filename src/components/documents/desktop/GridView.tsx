import { useState } from 'react';
import { Eye, Share2, MoreVertical, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Document } from '../../../types';
import { getDaysUntil, getUrgencyLevel, formatDate } from '../../../utils/dateUtils';
import { triggerHaptic } from '../../../utils/animations';

interface GridViewProps {
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
      return '#8B5CF6';
  }
};

const getUrgencyLabel = (expiryDate: string) => {
  const days = getDaysUntil(expiryDate);
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires Today';
  if (days === 1) return 'Expires Tomorrow';
  if (days < 7) return `${days} days left`;
  if (days < 30) return `${days} days left`;
  return `${days} days left`;
};

export default function GridView({
  documents,
  selectedIds,
  onSelectDocument,
  onQuickView,
  onShare,
  onNavigateToDetail,
  selectionMode,
}: GridViewProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleCardClick = (document: Document, e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or in selection mode
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
      className="p-3 sm:p-4 lg:p-6"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
        justifyContent: 'center',
      }}
    >
      {documents.map((document) => {
        const isSelected = selectedIds.includes(document.id);
        const isHovered = hoveredCard === document.id;
        const urgencyColor = getUrgencyColor(document.expiration_date);
        const urgencyLabel = getUrgencyLabel(document.expiration_date);

        return (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -4 }}
            onMouseEnter={() => setHoveredCard(document.id)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={(e) => handleCardClick(document, e)}
            className={`relative backdrop-blur-xl border rounded-xl lg:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
              isSelected ? 'ring-2 ring-purple-500 border-purple-500/50' : 'border-white/10 hover:border-white/20'
            }`}
            style={{
              width: '100%',
              minHeight: '320px',
              background: 'rgba(26, 22, 37, 0.6)',
              boxShadow: isSelected
                ? '0 0 30px rgba(139, 92, 246, 0.4)'
                : isHovered
                ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                : '0 4px 15px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Selection Checkbox */}
            <AnimatePresence>
              {(selectionMode || isSelected) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute top-3 left-3 z-20"
                >
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxChange(document.id)}
                      className="w-5 h-5 rounded border-2 border-white/30 bg-[rgba(26,22,37,0.8)] checked:bg-purple-500 checked:border-purple-500 cursor-pointer"
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
                  className="absolute top-3 right-3 z-20 flex items-center gap-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleQuickView(document, e)}
                    className="w-9 h-9 rounded-lg bg-[rgba(26,22,37,0.9)] backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors"
                    title="Quick View"
                  >
                    <Eye className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleShare(document, e)}
                    className="w-9 h-9 rounded-lg bg-[rgba(26,22,37,0.9)] backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => toggleMenu(document.id, e)}
                      className="w-9 h-9 rounded-lg bg-[rgba(26,22,37,0.9)] backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                      title="More"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>
                    {openMenuId === document.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-[rgba(26,22,37,0.95)] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-xl z-30"
                      >
                        <button className="w-full px-4 py-2.5 text-left text-white text-sm hover:bg-white/10 transition-colors">
                          Edit
                        </button>
                        <button className="w-full px-4 py-2.5 text-left text-white text-sm hover:bg-white/10 transition-colors">
                          Download
                        </button>
                        <button className="w-full px-4 py-2.5 text-left text-red-400 text-sm hover:bg-red-500/10 transition-colors">
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Document Image */}
            <div className="relative w-full h-[160px] sm:h-[180px] lg:h-[200px] overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
              {document.image_url ? (
                <>
                  <img
                    src={document.image_url}
                    alt={document.document_name}
                    className="w-full h-full object-cover absolute inset-0"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {/* Fallback icon - always present but behind the image */}
                  <Calendar className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white/20" />
                </>
              ) : (
                <Calendar className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-white/20" />
              )}
            </div>

            {/* Urgency Bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: urgencyColor,
                boxShadow: `0 0 15px ${urgencyColor}80`,
              }}
            />

            {/* Card Content */}
            <div className="p-3 sm:p-4 flex flex-col min-h-[140px]">
              {/* Document Name */}
              <h3 className="text-white font-semibold text-sm sm:text-base lg:text-lg line-clamp-2 mb-2">
                {document.document_name}
              </h3>

              {/* Category & Number */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 flex-wrap">
                <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] sm:text-xs font-medium">
                  {document.document_type}
                </span>
                {document.document_number && (
                  <span className="text-white/50 text-[10px] sm:text-xs line-clamp-1">
                    #{document.document_number}
                  </span>
                )}
              </div>

              {/* Expiry Info */}
              <div className="mt-auto space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: urgencyColor }} />
                  <span className="text-xs sm:text-sm font-medium" style={{ color: urgencyColor }}>
                    {urgencyLabel}
                  </span>
                </div>
                <div className="text-white/50 text-[10px] sm:text-xs">
                  Expires: {formatDate(document.expiration_date)}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
