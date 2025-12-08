import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText } from 'lucide-react';
import type { Document } from '../../types';
import { formatDate, getDaysUntil, getUrgencyLevel, type UrgencyLevel } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import { triggerHaptic } from '../../utils/animations';
import { useState } from 'react';

interface DocumentGridCardProps {
  document: Document;
}

const DOCUMENT_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  passport: FileText,
  visa: FileText,
  id_card: FileText,
  insurance: FileText,
  subscription: FileText,
  receipt: FileText,
  bill: FileText,
  contract: FileText,
  other: FileText,
};

const getUrgencyColor = (urgency: UrgencyLevel, daysLeft: number): string => {
  if (daysLeft < 0) return '#EF4444';
  switch (urgency) {
    case 'urgent':
      return '#EF4444';
    case 'soon':
      return '#F97316';
    case 'upcoming':
      return '#EAB308';
    default:
      return '#10B981';
  }
};

const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function DocumentGridCard({ document }: DocumentGridCardProps) {
  const navigate = useNavigate();
  const daysLeft = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);
  const urgencyColor = getUrgencyColor(urgency, daysLeft);
  const isUrgent = urgency === 'urgent' || daysLeft < 0;

  const Icon = DOCUMENT_TYPE_ICONS[document.document_type] || FileText;
  const typeLabel = formatDocumentType(document.document_type);
  
  // Get signed URL for image
  const { signedUrl: imageUrl, loading: imageLoading } = useImageUrl(document.image_url);
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="overflow-hidden aspect-[3/4] flex flex-col cursor-pointer touch-manipulation rounded-3xl"
      style={{
        background: 'rgba(42, 38, 64, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Image Section (top 80% - bigger thumbnail) */}
      <div className="relative flex-[0.8] overflow-hidden">
        {imageLoading && !imageError ? (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center animate-pulse">
            <FileText className="w-12 h-12 text-gray-600" />
          </div>
        ) : imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={document.document_name}
            className="w-full h-full object-cover transition-all duration-300"
            loading="lazy"
            decoding="async"
            onLoad={(e) => {
              setImageError(false);
              // Remove blur effect when loaded
              e.currentTarget.classList.remove('blur-sm');
            }}
            onError={() => {
              setImageError(true);
            }}
            style={{ filter: imageLoading ? 'blur(4px)' : 'none' }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-600" />
          </div>
        )}
        
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Urgency indicator (top-right) */}
        <div className="absolute top-3 right-3">
          {isUrgent ? (
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-2 h-2 rounded-full"
              style={{
                background: urgencyColor,
                boxShadow: `0 0 12px ${urgencyColor}80`,
              }}
              title={daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
            />
          ) : (
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: urgencyColor,
                boxShadow: `0 0 8px ${urgencyColor}80`,
              }}
              title={daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
            />
          )}
        </div>
      </div>

      {/* Content Section (bottom 20%) */}
      <div 
        className="flex-1 px-4 py-3 flex flex-col justify-between"
        style={{
          background: 'linear-gradient(180deg, rgba(42, 38, 64, 0.95) 0%, rgba(35, 29, 51, 1) 100%)',
        }}
      >
        {/* Top: Passport tag and Date */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Document type badge */}
          <div 
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: 'rgba(35, 29, 51, 0.9)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Icon className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-medium text-white">{typeLabel}</span>
          </div>
          
          {/* Date - more visible */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" style={{ color: '#FFFFFF' }} />
            <span className="text-[13px] font-semibold text-white">
              {formatDate(document.expiration_date)}
            </span>
          </div>
        </div>

        {/* Middle: Days left */}
        <div className="mb-2">
          <div 
            className="text-[13px] font-bold"
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
        </div>

        {/* Bottom: Document name */}
        <div className="mt-auto">
          <h3 className="text-[14px] font-bold text-white line-clamp-2 leading-tight">
            {document.document_name}
          </h3>
        </div>
      </div>
    </motion.div>
  );
}
