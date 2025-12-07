import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, FileText, Calendar } from 'lucide-react';
import type { Document } from '../../types';
import { formatDate, getDaysUntil, getUrgencyLevel } from '../../utils/dateUtils';
import { triggerHaptic } from '../../utils/animations';

interface DashboardDocumentCardProps {
  document: Document;
}

const getUrgencyColor = (urgency: string, daysLeft: number) => {
  if (daysLeft < 0 || urgency === 'urgent') return '#EF4444';
  if (urgency === 'soon') return '#F59E0B';
  if (urgency === 'upcoming') return '#EAB308';
  return '#10B981';
};

const getUrgencyGlow = (urgency: string, daysLeft: number) => {
  if (daysLeft < 0 || urgency === 'urgent') return 'shadow-[0_0_20px_rgba(239,68,68,0.3)]';
  if (urgency === 'soon') return 'shadow-[0_0_20px_rgba(249,115,22,0.3)]';
  if (urgency === 'upcoming') return 'shadow-[0_0_20px_rgba(234,179,8,0.3)]';
  return '';
};

export default function DashboardDocumentCard({ document }: DashboardDocumentCardProps) {
  const navigate = useNavigate();
  const daysUntil = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);
  const urgencyColor = getUrgencyColor(urgency, daysUntil);
  const urgencyGlow = getUrgencyGlow(urgency, daysUntil);

  const handleClick = () => {
    triggerHaptic('light');
    navigate(`/documents/${document.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)' }}
      whileTap={{ scale: 0.98 }}
      onClick={handleClick}
      className={`
        glass-card rounded-2xl p-4 mb-3 cursor-pointer
        border-l-4 transition-all duration-200
        ${urgencyGlow}
      `}
      style={{ borderLeftColor: urgencyColor }}
    >
      <div className="flex items-center gap-4">
        {/* Document Type Icon */}
        <div
          className="w-10 h-10 rounded-full glass-card-subtle flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(42, 38, 64, 0.6)' }}
        >
          <FileText className="w-5 h-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white mb-1 truncate">
            {document.document_name}
          </h3>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3 text-glass-secondary" />
            <p className="text-sm text-glass-secondary">
              {formatDate(document.expiration_date)}
            </p>
          </div>
          <div
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${urgencyColor}20`,
              color: urgencyColor,
            }}
          >
            {daysUntil === 0
              ? 'Expires today'
              : daysUntil === 1
              ? '1 day left'
              : daysUntil < 0
              ? `${Math.abs(daysUntil)} days overdue`
              : `${daysUntil} days left`}
          </div>
        </div>

        {/* Action Button */}
        <button
          className="w-8 h-8 rounded-full glass-card-subtle flex items-center justify-center flex-shrink-0 hover:bg-white/10 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          <ChevronRight className="w-5 h-5 text-glass-primary" />
        </button>
      </div>
    </motion.div>
  );
}

