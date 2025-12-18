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
        className="w-full rounded-2xl overflow-hidden flex items-center transition-all active:opacity-80 relative"
        style={{
          background: 'rgba(42, 38, 64, 0.4)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)',
        }}
      >
        {/* Tiled Glass Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Purple Gradient Indicator on Left */}
        <div
          className="flex-shrink-0 w-2 md:w-3 h-full"
          style={{
            background: `linear-gradient(180deg, ${urgencyColor} 0%, ${urgencyColor}CC 100%)`,
            boxShadow: `0 0 20px ${urgencyColor}40`,
          }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0 p-4 md:p-5 relative z-10 flex items-center gap-4">
          {/* Purple Document Thumbnail */}
          <div
            className="flex-shrink-0 w-[72px] h-[96px] md:w-[80px] md:h-[107px] rounded-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4)',
            }}
          />

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            {/* Document Name */}
            <h3
              className="text-base md:text-lg font-bold text-white truncate mb-1 md:mb-1.5"
              style={{
                fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                letterSpacing: '-0.24px',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {document.document_name}
            </h3>

            {/* Days Left - Color Coded */}
            <div
              className="text-sm md:text-base font-semibold"
              style={{
                color: urgencyColor,
                fontFamily: 'SF Pro Text, -apple-system, sans-serif',
                letterSpacing: '-0.08px',
                textShadow: `0 0 12px ${urgencyColor}60`,
              }}
            >
              {daysText}
            </div>
          </div>

          {/* Urgency Dot Indicator */}
          <div
            className="flex-shrink-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full"
            style={{
              background: urgencyColor,
              boxShadow: `0 0 12px ${urgencyColor}80, 0 0 24px ${urgencyColor}40`,
            }}
          />
        </div>
      </div>
    </motion.button>
  );
}

