import React, { useState } from 'react';
import { ImportantDate } from '../../types';
import {
  DateListItem,
  EmptyState,
  SkeletonLoader,
  GlassListControls,
  SwipeableListItem,
} from '../ui/list';
import { Edit, Trash2, Bell, BellOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface DatesListViewProps {
  dates: ImportantDate[];
  loading?: boolean;
  searchQuery?: string;
  onDateClick: (date: ImportantDate) => void;
  onDateEdit?: (date: ImportantDate) => void;
  onDateDelete?: (date: ImportantDate) => void;
  onToggleReminder?: (date: ImportantDate) => void;
  onSortChange: (sort: string) => void;
  currentSort: string;
  onFilterClick?: () => void;
  filterCount?: number;
}

const sortOptions = [
  { value: 'date_asc', label: 'Date (Upcoming)' },
  { value: 'date_desc', label: 'Date (Past)' },
  { value: 'title_asc', label: 'Title A-Z' },
  { value: 'title_desc', label: 'Title Z-A' },
  { value: 'category', label: 'Category' },
];

// Group dates by month
const groupDatesByMonth = (dates: ImportantDate[]): Map<string, ImportantDate[]> => {
  const grouped = new Map<string, ImportantDate[]>();

  dates.forEach((date) => {
    const dateObj = new Date(date.date);
    const monthKey = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });

    if (!grouped.has(monthKey)) {
      grouped.set(monthKey, []);
    }
    grouped.get(monthKey)!.push(date);
  });

  return grouped;
};

export const DatesListView: React.FC<DatesListViewProps> = ({
  dates,
  loading = false,
  searchQuery = '',
  onDateClick,
  onDateEdit,
  onDateDelete,
  onToggleReminder,
  onSortChange,
  currentSort,
  onFilterClick,
  filterCount = 0,
}) => {
  // Group dates by month
  const groupedDates = groupDatesByMonth(dates);
  const monthKeys = Array.from(groupedDates.keys());

  // Render loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <SkeletonLoader count={5} type="date" />
      </div>
    );
  }

  // Render empty state
  if (dates.length === 0 && !loading) {
    const emptyTitle = searchQuery
      ? 'No dates found'
      : 'No important dates yet';
    const emptyDescription = searchQuery
      ? `No dates match "${searchQuery}". Try a different search term.`
      : 'Add your first important date to get started';

    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <EmptyState
          icon={searchQuery ? '🔍' : '📅'}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={searchQuery ? undefined : '+ Add Date'}
          onAction={searchQuery ? undefined : () => {
            // Navigate to add date
            window.location.href = '/dates/add';
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

      {/* Dates list grouped by month */}
      {monthKeys.map((monthKey, monthIndex) => {
        const monthDates = groupedDates.get(monthKey) || [];

        return (
          <div key={monthKey} className="mb-8">
            {/* Month header */}
            <div className="
              mb-4 px-4
              flex items-center justify-between
            ">
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                {monthKey}
              </h3>
              <span className="
                px-3 py-1
                bg-black/5 dark:bg-white/5
                border border-black/10 dark:border-white/10
                rounded-full
                text-xs md:text-sm
                text-gray-600 dark:text-gray-400
                font-medium
              ">
                {monthDates.length} {monthDates.length === 1 ? 'event' : 'events'}
              </span>
            </div>

            {/* Dates in this month */}
            <div className="space-y-0">
              {monthDates.map((date, index) => {
                // Define swipe actions
                const rightActions = [
                  {
                    icon: <Edit className="w-5 h-5" />,
                    label: 'Edit',
                    color: 'gray' as const,
                    onClick: () => onDateEdit?.(date),
                  },
                  {
                    icon: <Trash2 className="w-5 h-5" />,
                    label: 'Delete',
                    color: 'red' as const,
                    onClick: () => onDateDelete?.(date),
                  },
                ];

                const leftActions = [
                  {
                    icon: date.reminder_days ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />,
                    label: date.reminder_days ? 'Disable' : 'Remind',
                    color: 'blue' as const,
                    onClick: () => onToggleReminder?.(date),
                  },
                ];

                return (
                  <SwipeableListItem
                    key={date.id}
                    rightActions={rightActions}
                    leftActions={leftActions}
                    onSwipeRight={() => onDateClick(date)}
                  >
                    <DateListItem
                      date={date}
                      onClick={() => onDateClick(date)}
                      animate={true}
                      delay={index * 0.05}
                    />
                  </SwipeableListItem>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
