import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, FileText } from 'lucide-react';
import type { Document } from '../../types';
import { formatDate, getDaysUntil, getUrgencyLevel, type UrgencyLevel } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import { triggerHaptic } from '../../utils/animations';

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
  if (daysLeft < 0) return 'bg-red-500';
  switch (urgency) {
    case 'urgent':
      return 'bg-red-500';
    case 'soon':
      return 'bg-orange-500';
    case 'upcoming':
      return 'bg-yellow-500';
    default:
      return 'bg-green-500';
  }
};

const getUrgencyTextColor = (urgency: UrgencyLevel, daysLeft: number): string => {
  if (daysLeft < 0) return 'text-red-600';
  switch (urgency) {
    case 'urgent':
      return 'text-red-600';
    case 'soon':
      return 'text-orange-600';
    case 'upcoming':
      return 'text-yellow-600';
    default:
      return 'text-gray-600';
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
  const urgencyTextColor = getUrgencyTextColor(urgency, daysLeft);
  const isUrgent = urgency === 'urgent';
  const isExpired = daysLeft < 0;

  const Icon = DOCUMENT_TYPE_ICONS[document.document_type] || FileText;
  const typeLabel = formatDocumentType(document.document_type);
  
  // Get signed URL for image
  const { signedUrl: imageUrl } = useImageUrl(document.image_url);

  const handleClick = () => {
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="
        bg-white rounded-2xl shadow-sm
        overflow-hidden
        aspect-[3/4]
        flex flex-col
        cursor-pointer
        touch-manipulation
      "
    >
      {/* Image Section (50% of card) */}
      <div className="relative flex-1 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={document.document_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Document type badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Icon className="w-3 h-3 text-gray-700" />
          <span className="text-[10px] font-medium text-gray-700">{typeLabel}</span>
        </div>

        {/* Expiry indicator */}
        <div className="absolute top-2 right-2">
          {isUrgent ? (
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [1, 0.7, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`w-3 h-3 rounded-full ${urgencyColor}`}
              title={isExpired ? 'Expired' : `${daysLeft} days left`}
            />
          ) : (
            <div
              className={`w-3 h-3 rounded-full ${urgencyColor}`}
              title={isExpired ? 'Expired' : `${daysLeft} days left`}
            />
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col justify-between flex-1 min-h-0">
        {/* Document name */}
        <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
          {document.document_name}
        </h3>

        {/* Expiration date */}
        <div className={`flex items-center gap-1 ${urgencyTextColor}`}>
          <Calendar className="w-3 h-3" />
          <span className="text-xs font-medium">
            {isExpired
              ? 'Expired'
              : `Expires ${formatDate(document.expiration_date).split(' ')[0]} ${formatDate(document.expiration_date).split(' ')[1]}`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

