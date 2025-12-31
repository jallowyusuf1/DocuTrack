import React from 'react';
import { Document } from '../../../types';
import { GlassListItem } from './GlassListItem';
import { StatusBadge, StatusType } from './StatusBadge';
import { GlassActionButton } from './GlassActionButton';
import { ChevronRight, Eye } from 'lucide-react';

interface DocumentListItemProps {
  document: Document;
  onClick?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  showCheckbox?: boolean;
  onCheckboxChange?: (checked: boolean) => void;
  animate?: boolean;
  delay?: number;
}

// Document type icons mapping
const documentTypeIcons: Record<string, string> = {
  passport: '🛂',
  driver_license: '🚗',
  national_id: '🪪',
  visa: '✈️',
  health_insurance: '💳',
  auto_insurance: '🚙',
  home_insurance: '🏠',
  life_insurance: '❤️',
  birth_certificate: '📄',
  marriage_certificate: '💍',
  degree_certificate: '🎓',
  vaccination_card: '💉',
  vehicle_registration: '🚗',
  property_deed: '🏡',
  other: '📄',
};

// Get appropriate icon for document type
const getDocumentIcon = (type: string): string => {
  return documentTypeIcons[type] || '📄';
};

// Calculate days until expiration
const getDaysUntilExpiration = (expirationDate: string): number => {
  const today = new Date();
  const expiry = new Date(expirationDate);
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Get status type based on days remaining
const getStatusType = (days: number): StatusType => {
  if (days < 0) return 'expired';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'expiring';
  return 'valid';
};

// Format status label
const getStatusLabel = (days: number): string => {
  if (days < 0) return '❌ Expired';
  if (days === 0) return '⚠️ Expires Today';
  if (days <= 7) return `⚠️ ${days}d left`;
  if (days <= 30) return `${days} days left`;
  return `✓ ${days}d`;
};

// Format document type for display
const formatDocumentType = (type: string): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Added today';
  if (diffDays === 1) return 'Added yesterday';
  if (diffDays < 7) return `Added ${diffDays} days ago`;

  return `Added ${date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;
};

export const DocumentListItem: React.FC<DocumentListItemProps> = ({
  document,
  onClick,
  onLongPress,
  selected = false,
  showCheckbox = false,
  onCheckboxChange,
  animate = true,
  delay = 0,
}) => {
  const daysUntilExpiration = getDaysUntilExpiration(document.expiration_date);
  const statusType = getStatusType(daysUntilExpiration);
  const statusLabel = getStatusLabel(daysUntilExpiration);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onCheckboxChange?.(e.target.checked);
  };

  return (
    <GlassListItem
      onClick={onClick}
      onLongPress={onLongPress}
      selected={selected}
      animate={animate}
      delay={delay}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Checkbox (if in selection mode) */}
        {showCheckbox && (
          <div className="flex-shrink-0">
            <input
              type="checkbox"
              checked={selected}
              onChange={handleCheckboxChange}
              className="
                w-6 h-6 rounded-md
                border-2 border-black/20 dark:border-white/20
                bg-white/50 dark:bg-zinc-800/50
                checked:bg-blue-500 checked:border-blue-500
                focus:ring-2 focus:ring-blue-500/50
                transition-all cursor-pointer
              "
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {document.image_url ? (
            <img
              src={document.image_url}
              alt={document.document_name}
              className="
                w-[60px] h-[75px] md:w-[80px] md:h-[100px]
                rounded-xl
                border-2 border-black/10 dark:border-white/15
                object-cover
              "
            />
          ) : (
            <div className="
              w-[60px] h-[75px] md:w-[80px] md:h-[100px]
              rounded-xl
              border-2 border-black/10 dark:border-white/15
              bg-gradient-to-br from-blue-500/20 to-purple-500/20
              flex items-center justify-center
              text-3xl md:text-4xl
            ">
              {getDocumentIcon(document.document_type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Document Name */}
          <h3 className="
            text-base md:text-lg lg:text-xl
            font-bold
            text-gray-900 dark:text-white
            truncate
            mb-1
          ">
            {document.document_name}
          </h3>

          {/* Document Type Badge */}
          <div className="inline-flex items-center gap-1.5 mb-1">
            <span className="
              px-3 py-1
              bg-black/5 dark:bg-white/5
              border border-black/10 dark:border-white/10
              rounded-full
              text-xs md:text-sm
              text-gray-600 dark:text-gray-400
              inline-flex items-center gap-1
            ">
              <span>{getDocumentIcon(document.document_type)}</span>
              <span>{formatDocumentType(document.document_type)}</span>
            </span>
          </div>

          {/* Meta Information */}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatDate(document.created_at)}
          </p>
        </div>

        {/* Right side: Status badge and action button */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Status Badge */}
          <StatusBadge
            status={statusType}
            label={statusLabel}
          />

          {/* Action Button */}
          <GlassActionButton
            icon={<Eye className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          />
        </div>
      </div>
    </GlassListItem>
  );
};
