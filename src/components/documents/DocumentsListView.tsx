import React, { useState } from 'react';
import { Document } from '../../types';
import {
  DocumentListItem,
  EmptyState,
  SkeletonLoader,
  GlassListControls,
  SwipeableListItem,
} from '../ui/list';
import { Share, Edit, Trash2, Eye, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentsListViewProps {
  documents: Document[];
  loading?: boolean;
  searchQuery?: string;
  onDocumentClick: (document: Document) => void;
  onDocumentEdit?: (document: Document) => void;
  onDocumentShare?: (document: Document) => void;
  onDocumentDelete?: (document: Document) => void;
  onSortChange: (sort: string) => void;
  currentSort: string;
  onFilterClick?: () => void;
  filterCount?: number;
  showBulkActions?: boolean;
  selectedDocuments?: Set<string>;
  onToggleSelection?: (documentId: string) => void;
  onClearSelection?: () => void;
}

const sortOptions = [
  { value: 'newest', label: 'Recent' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' },
  { value: 'expiring_soon', label: 'Expiry Date' },
  { value: 'oldest', label: 'Date Added (Oldest)' },
];

export const DocumentsListView: React.FC<DocumentsListViewProps> = ({
  documents,
  loading = false,
  searchQuery = '',
  onDocumentClick,
  onDocumentEdit,
  onDocumentShare,
  onDocumentDelete,
  onSortChange,
  currentSort,
  onFilterClick,
  filterCount = 0,
  showBulkActions = false,
  selectedDocuments = new Set(),
  onToggleSelection,
  onClearSelection,
}) => {
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  // Handle document long press for selection mode
  const handleLongPress = (documentId: string) => {
    onToggleSelection?.(documentId);
  };

  // Check if any documents are selected
  const hasSelection = selectedDocuments.size > 0;

  // Render loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <SkeletonLoader count={7} type="document" />
      </div>
    );
  }

  // Render empty state
  if (documents.length === 0 && !loading) {
    const emptyTitle = searchQuery
      ? 'No documents found'
      : 'No documents yet';
    const emptyDescription = searchQuery
      ? `No documents match "${searchQuery}". Try a different search term.`
      : 'Add your first document to get started';

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <EmptyState
          icon={searchQuery ? '🔍' : '📄'}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={searchQuery ? undefined : '+ Add Document'}
          onAction={searchQuery ? undefined : () => {
            // Navigate to add document
            window.location.href = '/documents/add';
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Bulk selection bar */}
      <AnimatePresence>
        {hasSelection && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="
              fixed top-16 left-0 right-0 z-30
              bg-blue-500
              text-white
              px-4 py-3
              shadow-lg
              flex items-center justify-between
            "
          >
            <span className="font-medium">
              {selectedDocuments.size} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Handle bulk share
                  console.log('Bulk share', selectedDocuments);
                }}
                className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Share
              </button>
              <button
                onClick={() => {
                  // Handle bulk delete
                  console.log('Bulk delete', selectedDocuments);
                }}
                className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={onClearSelection}
                className="px-3 py-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <GlassListControls
        sortOptions={sortOptions}
        currentSort={currentSort}
        onSortChange={onSortChange}
        showFilter={true}
        onFilterClick={onFilterClick}
        filterCount={filterCount}
      />

      {/* Documents list */}
      <div className="space-y-0">
        {documents.map((document, index) => {
          const isSelected = selectedDocuments.has(document.id);

          // Define swipe actions
          const rightActions = [
            {
              icon: <Share className="w-5 h-5" />,
              label: 'Share',
              color: 'blue' as const,
              onClick: () => onDocumentShare?.(document),
            },
            {
              icon: <Edit className="w-5 h-5" />,
              label: 'Edit',
              color: 'gray' as const,
              onClick: () => onDocumentEdit?.(document),
            },
            {
              icon: <Trash2 className="w-5 h-5" />,
              label: 'Delete',
              color: 'red' as const,
              onClick: () => onDocumentDelete?.(document),
            },
          ];

          const leftActions = [
            {
              icon: <Star className="w-5 h-5" />,
              label: 'Favorite',
              color: 'blue' as const,
              onClick: () => {
                console.log('Toggle favorite', document.id);
              },
            },
          ];

          return (
            <SwipeableListItem
              key={document.id}
              rightActions={rightActions}
              leftActions={leftActions}
              onSwipeLeft={() => console.log('Swiped left on', document.id)}
              onSwipeRight={() => {
                // Quick view on swipe right
                onDocumentClick(document);
              }}
              disabled={hasSelection}
            >
              <DocumentListItem
                document={document}
                onClick={() => onDocumentClick(document)}
                onLongPress={() => handleLongPress(document.id)}
                selected={isSelected}
                showCheckbox={hasSelection}
                onCheckboxChange={(checked) => {
                  if (checked) {
                    onToggleSelection?.(document.id);
                  } else {
                    onToggleSelection?.(document.id);
                  }
                }}
                animate={true}
                delay={index * 0.05}
              />
            </SwipeableListItem>
          );
        })}
      </div>

      {/* Load more button (if needed for pagination) */}
      {documents.length >= 50 && (
        <div className="mt-6">
          <button
            onClick={() => {
              // Load more documents
              console.log('Load more');
            }}
            className="
              w-full
              h-13
              bg-white/80 dark:bg-zinc-900/80
              backdrop-blur-[40px] backdrop-saturate-[130%]
              border border-black/8 dark:border-white/12
              rounded-2xl
              shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6)]
              text-base font-medium
              text-gray-700 dark:text-gray-300
              hover:bg-black/5 dark:hover:bg-white/5
              transition-all
              flex items-center justify-center gap-2
            "
          >
            <span>Load More Documents</span>
            <span className="text-xl">↓</span>
          </button>
        </div>
      )}
    </div>
  );
};
