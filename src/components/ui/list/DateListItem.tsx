import React from 'react';
import { ImportantDate } from '../../../types';
import { GlassListItem } from './GlassListItem';
import { GlassActionButton } from './GlassActionButton';
import { ChevronRight, Bell } from 'lucide-react';

interface DateListItemProps {
  date: ImportantDate & {
    linkedDocuments?: Array<{ id: string; image_url?: string; document_name: string }>;
  };
  onClick?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  animate?: boolean;
  delay?: number;
}

// Category icons
const categoryIcons: Record<string, string> = {
  birthday: '🎂',
  anniversary: '💍',
  appointment: '🗓️',
  deadline: '⏰',
  holiday: '🎉',
  vacation: '✈️',
  meeting: '👥',
  event: '📅',
  reminder: '🔔',
  other: '📌',
};

// Category colors for date box
const categoryColors: Record<string, { bg: string; text: string }> = {
  birthday: { bg: 'bg-pink-500/20', text: 'text-pink-700 dark:text-pink-300' },
  anniversary: { bg: 'bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300' },
  appointment: { bg: 'bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300' },
  deadline: { bg: 'bg-orange-500/20', text: 'text-orange-700 dark:text-orange-300' },
  holiday: { bg: 'bg-green-500/20', text: 'text-green-700 dark:text-green-300' },
  vacation: { bg: 'bg-teal-500/20', text: 'text-teal-700 dark:text-teal-300' },
  meeting: { bg: 'bg-indigo-500/20', text: 'text-indigo-700 dark:text-indigo-300' },
  event: { bg: 'bg-violet-500/20', text: 'text-violet-700 dark:text-violet-300' },
  reminder: { bg: 'bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300' },
  other: { bg: 'bg-gray-500/20', text: 'text-gray-700 dark:text-gray-300' },
};

// Get icon for category
const getCategoryIcon = (category: string): string => {
  const normalizedCategory = category.toLowerCase();
  return categoryIcons[normalizedCategory] || categoryIcons.other;
};

// Get color for category
const getCategoryColor = (category: string): { bg: string; text: string } => {
  const normalizedCategory = category.toLowerCase();
  return categoryColors[normalizedCategory] || categoryColors.other;
};

// Format date parts
const getDateParts = (dateString: string): { month: string; day: string; year?: string } => {
  const date = new Date(dateString);
  const now = new Date();

  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate().toString();
  const year = date.getFullYear() !== now.getFullYear() ? date.getFullYear().toString() : undefined;

  return { month, day, year };
};

// Calculate countdown
const getCountdown = (dateString: string): { label: string; color: string } => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { label: 'Today', color: 'text-green-600 dark:text-green-400' };
  } else if (diffDays === 1) {
    return { label: 'Tomorrow', color: 'text-orange-600 dark:text-orange-400' };
  } else if (diffDays > 0) {
    return { label: `In ${diffDays} days`, color: 'text-orange-600 dark:text-orange-400' };
  } else if (diffDays === -1) {
    return { label: 'Yesterday', color: 'text-gray-500 dark:text-gray-500' };
  } else {
    return { label: `${Math.abs(diffDays)} days ago`, color: 'text-gray-500 dark:text-gray-500' };
  }
};

// Format category for display
const formatCategory = (category: string): string => {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const DateListItem: React.FC<DateListItemProps> = ({
  date,
  onClick,
  onLongPress,
  selected = false,
  animate = true,
  delay = 0,
}) => {
  const { month, day, year } = getDateParts(date.date);
  const countdown = getCountdown(date.date);
  const categoryColor = getCategoryColor(date.category);
  const categoryIcon = getCategoryIcon(date.category);

  return (
    <GlassListItem
      onClick={onClick}
      onLongPress={onLongPress}
      selected={selected}
      animate={animate}
      delay={delay}
    >
      <div className="flex items-center gap-3 md:gap-4">
        {/* Date Box */}
        <div className={`
          flex-shrink-0
          w-16 h-16 md:w-[72px] md:h-[72px]
          rounded-2xl
          ${categoryColor.bg}
          border border-black/10 dark:border-white/10
          backdrop-blur-sm
          flex flex-col items-center justify-center
          ${categoryColor.text}
        `}>
          <span className="text-xs md:text-sm uppercase font-medium opacity-70">
            {month}
          </span>
          <span className="text-2xl md:text-3xl font-bold leading-none">
            {day}
          </span>
          {year && (
            <span className="text-[10px] md:text-xs opacity-60">
              {year}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Event Name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{categoryIcon}</span>
            <h3 className="
              text-base md:text-lg lg:text-xl
              font-bold
              text-gray-900 dark:text-white
              truncate
            ">
              {date.title}
            </h3>
          </div>

          {/* Category Badge */}
          <div className="inline-flex items-center gap-1.5 mb-1">
            <span className="
              px-3 py-0.5
              bg-black/5 dark:bg-white/5
              border border-black/10 dark:border-white/10
              rounded-full
              text-xs md:text-sm
              text-gray-600 dark:text-gray-400
            ">
              {formatCategory(date.category)}
            </span>

            {/* Reminder indicator */}
            {date.reminder_days !== undefined && date.reminder_days > 0 && (
              <span className="
                px-2 py-0.5
                bg-blue-500/10
                border border-blue-500/20
                rounded-full
                text-xs
                text-blue-600 dark:text-blue-400
                inline-flex items-center gap-1
              ">
                <Bell className="w-3 h-3" />
                <span>{date.reminder_days}d</span>
              </span>
            )}
          </div>

          {/* Countdown/Time */}
          <p className={`text-sm md:text-base font-medium ${countdown.color}`}>
            {countdown.label}
          </p>
        </div>

        {/* Linked Documents (if any) */}
        {date.linkedDocuments && date.linkedDocuments.length > 0 && (
          <div className="flex-shrink-0 flex items-center gap-1">
            {date.linkedDocuments.slice(0, 3).map((doc, idx) => (
              <div
                key={doc.id}
                className="
                  w-8 h-10
                  rounded
                  border border-black/20 dark:border-white/20
                  overflow-hidden
                  bg-white/50 dark:bg-zinc-800/50
                "
                style={{ marginLeft: idx > 0 ? '-8px' : '0' }}
              >
                {doc.image_url ? (
                  <img
                    src={doc.image_url}
                    alt={doc.document_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">
                    📄
                  </div>
                )}
              </div>
            ))}
            {date.linkedDocuments.length > 3 && (
              <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                +{date.linkedDocuments.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="flex-shrink-0">
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
