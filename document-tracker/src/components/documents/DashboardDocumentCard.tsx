import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Document } from '../../types';
import { getDaysUntil, getUrgencyLevel } from '../../utils/dateUtils';
import { triggerHaptic } from '../../utils/animations';

interface DashboardDocumentCardProps {
  document: Document;
}

const getUrgencyColor = (urgency: string, daysLeft: number) => {
  if (daysLeft < 0 || urgency === 'urgent') return '#FF3B30'; // Red for urgent
  if (urgency === 'soon') return '#FF9500'; // Orange for soon
  return '#34C759'; // Green for upcoming
};

export default function DashboardDocumentCard({ document }: DashboardDocumentCardProps) {
  const navigate = useNavigate();
  const daysUntil = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);
  const urgencyColor = getUrgencyColor(urgency, daysUntil);

  const handleClick = () => {
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
  };

  const daysText = daysUntil === 0
    ? 'Expires today'
    : daysUntil === 1
    ? '1 day left'
    : daysUntil < 0
    ? `${Math.abs(daysUntil)} days overdue`
    : `${daysUntil} days left`;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className="w-full text-left mb-3 md:mb-4"
      style={{
        fontFamily: 'SF Pro Text, -apple-system, sans-serif',
      }}
    >
      <div
        className="w-full rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-all active:opacity-80"
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'saturate(180%) blur(60px)',
          WebkitBackdropFilter: 'saturate(180%) blur(60px)',
          border: `1px solid ${urgencyColor}20`,
          borderLeft: `3px solid ${urgencyColor}`,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Purple Document Thumbnail */}
        <div
          className="flex-shrink-0 w-[72px] h-[96px] md:w-[80px] md:h-[107px] rounded bg-gradient-to-br from-purple-500 to-purple-700"
          style={{
            boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Document Name */}
          <h3
            className="text-base md:text-lg font-semibold text-black truncate mb-1 md:mb-1.5"
            style={{
              fontFamily: 'SF Pro Display, -apple-system, sans-serif',
              letterSpacing: '-0.24px',
            }}
          >
            {document.document_name}
          </h3>

          {/* Days Left - Color Coded */}
          <div
            className="text-xs md:text-sm font-semibold"
            style={{
              color: urgencyColor,
              fontFamily: 'SF Pro Text, -apple-system, sans-serif',
              letterSpacing: '-0.08px',
            }}
          >
            {daysText}
          </div>
        </div>

        {/* Urgency Dot Indicator */}
        <div
          className="flex-shrink-0 w-2 h-2 rounded-full"
          style={{
            background: urgencyColor,
            boxShadow: `0 0 8px ${urgencyColor}80`,
          }}
        />
      </div>
    </motion.button>
  );
}

