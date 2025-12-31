import React from 'react';
import { Connection, RelationshipType } from '../../../types';
import { GlassListItem } from './GlassListItem';
import { StatusBadge, StatusType } from './StatusBadge';
import { GlassActionButton } from './GlassActionButton';
import { ChevronRight } from 'lucide-react';

interface FamilyMemberListItemProps {
  connection: Connection & {
    documentCount?: number;
    validCount?: number;
    expiringCount?: number;
    expiredCount?: number;
  };
  onClick?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  animate?: boolean;
  delay?: number;
}

// Relationship display names
const relationshipLabels: Record<RelationshipType, string> = {
  spouse: 'Spouse',
  parent: 'Parent',
  child: 'Child',
  sibling: 'Sibling',
  friend: 'Friend',
  other: 'Family Member',
};

// Get initials from name
const getInitials = (name?: string): string => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Get status for family member based on their documents
const getFamilyMemberStatus = (
  expiringCount: number = 0,
  expiredCount: number = 0
): { type: StatusType; label: string } => {
  if (expiredCount > 0) {
    return {
      type: 'expired',
      label: `${expiredCount} Expired`,
    };
  }
  if (expiringCount > 0) {
    return {
      type: 'expiring',
      label: `${expiringCount} Expiring`,
    };
  }
  return {
    type: 'valid',
    label: 'All Valid ✓',
  };
};

export const FamilyMemberListItem: React.FC<FamilyMemberListItemProps> = ({
  connection,
  onClick,
  onLongPress,
  selected = false,
  animate = true,
  delay = 0,
}) => {
  const status = getFamilyMemberStatus(
    connection.expiringCount,
    connection.expiredCount
  );

  const userName = connection.connected_user?.full_name || connection.connected_user?.email || 'Unknown';
  const userEmail = connection.connected_user?.email;
  const avatarUrl = connection.connected_user?.avatar_url;
  const relationship = relationshipLabels[connection.relationship];

  return (
    <GlassListItem
      onClick={onClick}
      onLongPress={onLongPress}
      selected={selected}
      animate={animate}
      delay={delay}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="
                w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]
                rounded-full
                border-3 border-blue-500/30
                object-cover
              "
            />
          ) : (
            <div className="
              w-14 h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px]
              rounded-full
              border-3 border-blue-500/30
              bg-gradient-to-br from-blue-500/20 to-purple-500/20
              backdrop-blur-sm
              flex items-center justify-center
              text-lg md:text-xl lg:text-2xl
              font-bold
              text-gray-700 dark:text-gray-300
            ">
              {getInitials(userName)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="
            text-lg md:text-xl lg:text-2xl
            font-bold
            text-gray-900 dark:text-white
            truncate
            mb-0.5
          ">
            {userName}
          </h3>

          {/* Relationship */}
          <p className="
            text-sm
            text-gray-600 dark:text-gray-400
            mb-1
          ">
            {relationship}
          </p>

          {/* Document Count */}
          {connection.documentCount !== undefined && (
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {connection.documentCount} {connection.documentCount === 1 ? 'document' : 'documents'}
            </p>
          )}
        </div>

        {/* Right side: Status badge and action button */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Status Badge */}
          {(connection.expiringCount || connection.expiredCount || connection.validCount) && (
            <StatusBadge
              status={status.type}
              label={status.label}
            />
          )}

          {/* Action Button */}
          <GlassActionButton
            icon={<ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />}
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
