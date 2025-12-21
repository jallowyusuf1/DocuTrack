import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Document } from '../../types';
import { formatDate, getDaysUntil, getUrgencyLevel, getUrgencyTextColor } from '../../utils/dateUtils';
import { FileText, Calendar } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useImageUrl } from '../../hooks/useImageUrl';

interface DocumentCardProps {
  document: Document;
  onMarkRenewed: (document: Document) => void;
}

// Document type colors matching grid cards
const getDocumentTypeColor = (type: string): { bg: string; border: string; text: string } => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    passport: {
      bg: 'rgba(59, 130, 246, 0.2)',
      border: 'rgba(59, 130, 246, 0.5)',
      text: '#60A5FA',
    },
    visa: {
      bg: 'rgba(16, 185, 129, 0.2)',
      border: 'rgba(16, 185, 129, 0.5)',
      text: '#34D399',
    },
    id_card: {
      bg: 'rgba(139, 92, 246, 0.2)',
      border: 'rgba(139, 92, 246, 0.5)',
      text: '#A78BFA',
    },
    insurance: {
      bg: 'rgba(236, 72, 153, 0.2)',
      border: 'rgba(236, 72, 153, 0.5)',
      text: '#F472B6',
    },
    subscription: {
      bg: 'rgba(245, 158, 11, 0.2)',
      border: 'rgba(245, 158, 11, 0.5)',
      text: '#FBBF24',
    },
    receipt: {
      bg: 'rgba(34, 197, 94, 0.2)',
      border: 'rgba(34, 197, 94, 0.5)',
      text: '#4ADE80',
    },
    bill: {
      bg: 'rgba(239, 68, 68, 0.2)',
      border: 'rgba(239, 68, 68, 0.5)',
      text: '#F87171',
    },
    contract: {
      bg: 'rgba(99, 102, 241, 0.2)',
      border: 'rgba(99, 102, 241, 0.5)',
      text: '#818CF8',
    },
  };
  
  return colors[type] || {
    bg: 'rgba(139, 92, 246, 0.2)',
    border: 'rgba(139, 92, 246, 0.5)',
    text: '#A78BFA',
  };
};

const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function DocumentCard({ document, onMarkRenewed }: DocumentCardProps) {
  const navigate = useNavigate();
  const daysLeft = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);
  const urgencyColor = getUrgencyTextColor(urgency);
  const { signedUrl: imageUrl, loading: imageLoading } = useImageUrl(document.image_url);
  const [imageError, setImageError] = useState(false);
  const typeColors = getDocumentTypeColor(document.document_type);

  const handleClick = () => {
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="rounded-3xl overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(42, 38, 64, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div className="flex h-[120px]">
        {/* Image Section - Thumbnail on left */}
        <div className="relative flex-shrink-0 w-[80px] h-full overflow-hidden"
          style={{
            background: 'rgba(35, 29, 51, 0.5)',
          }}
        >
          {imageLoading && !imageError ? (
            <div className="w-full h-full flex items-center justify-center animate-pulse">
              <FileText className="w-8 h-8" style={{ color: '#6B7280' }} />
            </div>
          ) : imageUrl && !imageError ? (
            <>
              <img
                src={imageUrl}
                alt={document.document_name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={() => setImageError(true)}
                style={{
                  filter: document.is_locked 
                    ? 'blur(20px) brightness(0.5) contrast(0.8)' 
                    : 'none',
                }}
              />
              {/* Dark overlay for locked documents */}
              {document.is_locked && (
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'rgba(0, 0, 0, 0.4)',
                  }}
                />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-8 h-8" style={{ color: '#6B7280' }} />
            </div>
          )}
        </div>

        {/* Content Section - Matching grid card exactly */}
        <div 
          className="flex-1 px-4 py-3 flex flex-col min-w-0 h-full"
          style={{
            background: 'linear-gradient(180deg, rgba(42, 38, 64, 0.95) 0%, rgba(35, 29, 51, 1) 100%)',
          }}
        >
          {/* Badge and Title Row */}
          <div className="flex items-start gap-3 mb-2">
            {/* Left: Badge and Title */}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              {/* Document type badge */}
              <div
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 w-fit"
                style={{
                  background: typeColors.bg,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `1px solid ${typeColors.border}`,
                }}
              >
                <FileText className="w-3.5 h-3.5" style={{ color: typeColors.text }} />
                <span className="text-[11px] font-medium" style={{ color: typeColors.text }}>
                  {formatDocumentType(document.document_type)}
                </span>
      </div>

              {/* Document name */}
              <h3 className="text-[14px] font-bold text-white leading-tight truncate">
        {document.document_name}
      </h3>
            </div>

            {/* Right: Days left and Date */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              {document.is_locked ? (
                <>
                  <div className="h-4 w-16 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                  <div className="h-3 w-20 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                </>
              ) : (
                <>
                  {/* Days left - Prominent */}
                  <div
                    className="text-[15px] font-bold whitespace-nowrap"
                    style={{
                      color: urgencyColor,
                    }}
                  >
                    {daysLeft < 0
                      ? 'Expired'
                      : daysLeft === 0
            ? 'Expires today'
                      : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                  </div>

                  {/* Date with icon */}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" style={{ color: '#FFFFFF' }} />
                    <span className="text-[13px] font-semibold text-white">
                      {formatDate(document.expiration_date)}
                    </span>
                  </div>
                </>
              )}
            </div>
      </div>

          {/* Action Buttons at bottom */}
          <div className="mt-auto pt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
            {/* View Button - Dark Purple */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl font-semibold text-[13px] transition-all"
              style={{
                background: 'rgba(35, 29, 51, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF',
              }}
            >
              <span>View</span>
            </motion.button>

            {/* Mark Renewed Button - Bright Purple */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
            triggerHaptic('medium');
            onMarkRenewed(document);
          }}
              className="flex-1 flex items-center justify-center py-2.5 px-3 rounded-xl font-semibold text-[13px] transition-all text-white"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
              }}
            >
              <span>Mark Renewed</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
