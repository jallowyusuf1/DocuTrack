import React from 'react';
import { Connection } from '../../types';
import {
  FamilyMemberListItem,
  EmptyState,
  SkeletonLoader,
  GlassListControls,
  SwipeableListItem,
} from '../ui/list';
import { MessageCircle, UserMinus, Edit } from 'lucide-react';

interface FamilyListViewProps {
  connections: Array<Connection & {
    documentCount?: number;
    validCount?: number;
    expiringCount?: number;
    expiredCount?: number;
  }>;
  loading?: boolean;
  searchQuery?: string;
  onMemberClick: (connection: Connection) => void;
  onMemberEdit?: (connection: Connection) => void;
  onMemberMessage?: (connection: Connection) => void;
  onMemberRemove?: (connection: Connection) => void;
  onSortChange: (sort: string) => void;
  currentSort: string;
  onFilterClick?: () => void;
  filterCount?: number;
}

const sortOptions = [
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'documents', label: 'Document Count' },
];

export const FamilyListView: React.FC<FamilyListViewProps> = ({
  connections,
  loading = false,
  searchQuery = '',
  onMemberClick,
  onMemberEdit,
  onMemberMessage,
  onMemberRemove,
  onSortChange,
  currentSort,
  onFilterClick,
  filterCount = 0,
}) => {
  // Render loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <SkeletonLoader count={5} type="family" />
      </div>
    );
  }

  // Render empty state
  if (connections.length === 0 && !loading) {
    const emptyTitle = searchQuery
      ? 'No family members found'
      : 'No family connections yet';
    const emptyDescription = searchQuery
      ? `No family members match "${searchQuery}". Try a different search term.`
      : 'Invite family members to share and manage documents together';

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <EmptyState
          icon={searchQuery ? '🔍' : '👥'}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={searchQuery ? undefined : '+ Invite Family Member'}
          onAction={searchQuery ? undefined : () => {
            // Navigate to invite family member
            window.location.href = '/family/invite';
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Controls */}
      <GlassListControls
        sortOptions={sortOptions}
        currentSort={currentSort}
        onSortChange={onSortChange}
        showFilter={true}
        onFilterClick={onFilterClick}
        filterCount={filterCount}
      />

      {/* Family members list */}
      <div className="space-y-0">
        {connections.map((connection, index) => {
          // Define swipe actions
          const rightActions = [
            {
              icon: <MessageCircle className="w-5 h-5" />,
              label: 'Message',
              color: 'blue' as const,
              onClick: () => onMemberMessage?.(connection),
            },
            {
              icon: <Edit className="w-5 h-5" />,
              label: 'Edit',
              color: 'gray' as const,
              onClick: () => onMemberEdit?.(connection),
            },
            {
              icon: <UserMinus className="w-5 h-5" />,
              label: 'Remove',
              color: 'red' as const,
              onClick: () => onMemberRemove?.(connection),
            },
          ];

          return (
            <SwipeableListItem
              key={connection.id}
              rightActions={rightActions}
              onSwipeRight={() => onMemberClick(connection)}
            >
              <FamilyMemberListItem
                connection={connection}
                onClick={() => onMemberClick(connection)}
                animate={true}
                delay={index * 0.05}
              />
            </SwipeableListItem>
          );
        })}
      </div>
    </div>
  );
};
