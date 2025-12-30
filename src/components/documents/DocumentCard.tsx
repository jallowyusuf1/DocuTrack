import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Document } from '../../types';
import { formatDate, getDaysUntil, getUrgencyLevel, getUrgencyTextColor } from '../../utils/dateUtils';
import { FileText, Calendar, CreditCard, Shield, Plane, DollarSign, Receipt, FileCheck, Home, Heart, GraduationCap, Briefcase } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useImageUrl } from '../../hooks/useImageUrl';

interface DocumentCardProps {
  document: Document;
  onMarkRenewed: (document: Document) => void;
}

const DOCUMENT_TYPE_ICONS: Record<string, React.ComponentType<any>> = {
  passport: Plane,
  visa: Plane,
  national_id: CreditCard,
  driver_license: CreditCard,
  id_card: CreditCard,
  insurance: Shield,
  health_insurance: Heart,
  auto_insurance: Shield,
  home_insurance: Home,
  subscription: Receipt,
  receipt: Receipt,
  bill: FileText,
  contract: FileCheck,
  bank_statement: DollarSign,
  credit_card: CreditCard,
  professional_license: Briefcase,
  academic_transcript: GraduationCap,
  other: FileText,
};

// Document type colors matching grid cards
const getDocumentTypeColor = (type: string): { bg: string; border: string; text: string } => {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    passport: { bg: 'rgba(59, 130, 246, 0.25)', border: 'rgba(96, 165, 250, 0.6)', text: '#60A5FA' },
    visa: { bg: 'rgba(16, 185, 129, 0.25)', border: 'rgba(52, 211, 153, 0.6)', text: '#34D399' },
    national_id: { bg: 'rgba(139, 92, 246, 0.25)', border: 'rgba(167, 139, 250, 0.6)', text: '#A78BFA' },
    driver_license: { bg: 'rgba(234, 179, 8, 0.25)', border: 'rgba(251, 191, 36, 0.6)', text: '#FBBF24' },
    id_card: { bg: 'rgba(139, 92, 246, 0.25)', border: 'rgba(167, 139, 250, 0.6)', text: '#A78BFA' },
    insurance: { bg: 'rgba(236, 72, 153, 0.25)', border: 'rgba(244, 114, 182, 0.6)', text: '#F472B6' },
    health_insurance: { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(248, 113, 113, 0.6)', text: '#F87171' },
    auto_insurance: { bg: 'rgba(245, 158, 11, 0.25)', border: 'rgba(251, 191, 36, 0.6)', text: '#FBBF24' },
    home_insurance: { bg: 'rgba(99, 102, 241, 0.25)', border: 'rgba(129, 140, 248, 0.6)', text: '#818CF8' },
    subscription: { bg: 'rgba(168, 85, 247, 0.25)', border: 'rgba(192, 132, 252, 0.6)', text: '#C084FC' },
    receipt: { bg: 'rgba(34, 197, 94, 0.25)', border: 'rgba(74, 222, 128, 0.6)', text: '#4ADE80' },
    bill: { bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(248, 113, 113, 0.6)', text: '#F87171' },
    contract: { bg: 'rgba(99, 102, 241, 0.25)', border: 'rgba(129, 140, 248, 0.6)', text: '#818CF8' },
    bank_statement: { bg: 'rgba(16, 185, 129, 0.25)', border: 'rgba(52, 211, 153, 0.6)', text: '#34D399' },
    credit_card: { bg: 'rgba(234, 88, 12, 0.25)', border: 'rgba(251, 146, 60, 0.6)', text: '#FB923C' },
    professional_license: { bg: 'rgba(14, 165, 233, 0.25)', border: 'rgba(56, 189, 248, 0.6)', text: '#38BDF8' },
    academic_transcript: { bg: 'rgba(168, 85, 247, 0.25)', border: 'rgba(192, 132, 252, 0.6)', text: '#C084FC' },
  };

  return colors[type] || {
    bg: 'rgba(37, 99, 235, 0.25)',
    border: 'rgba(96, 165, 250, 0.6)',
    text: '#60A5FA',
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
  const Icon = DOCUMENT_TYPE_ICONS[document.document_type] || FileText;

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
      className="rounded-[28px] overflow-hidden cursor-pointer"
      style={{
        background: 'var(--glass-bg-primary)',
        border: 'var(--glass-border-subtle)',
        backdropFilter: 'blur(40px) saturate(120%)',
        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
        boxShadow: 'var(--glass-shadow-md), var(--glass-glow-top)',
      }}
    >
      <div className="flex h-[120px]">
        {/* Image Section - Thumbnail on left */}
        <div className="relative flex-shrink-0 w-[80px] h-full overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.02)',
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
              />
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
            background: 'transparent',
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
                <Icon className="w-3.5 h-3.5" style={{ color: typeColors.text }} />
                <span className="text-[11px] font-semibold" style={{ color: typeColors.text }}>
                  {formatDocumentType(document.document_type)}
                </span>
      </div>

              {/* Document name */}
              <h3 className="text-[14px] font-bold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
        {document.document_name}
      </h3>
            </div>

            {/* Right: Days left and Date */}
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
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
                <Calendar className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  {formatDate(document.expiration_date)}
                </span>
              </div>
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
                background: 'var(--glass-bg-secondary)',
                backdropFilter: 'blur(30px)',
                border: 'var(--glass-border-subtle)',
                color: 'var(--color-primary)',
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
                background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
                boxShadow: '0 4px 20px rgba(37, 99, 235, 0.5)',
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
