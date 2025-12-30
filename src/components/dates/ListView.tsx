import { useMemo, useState } from 'react';
import { format, isWithinInterval, addDays, startOfMonth, endOfMonth, addMonths, isPast, isToday, differenceInDays } from 'date-fns';
import { Calendar, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImportantDate } from '../../types';

interface ListViewProps {
  dates: ImportantDate[];
}

type FilterType = 'all' | 'this_week' | 'this_month' | 'next_3_months' | 'past';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All Dates' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'next_3_months', label: 'Next 3 Months' },
  { value: 'past', label: 'Past' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Personal': '#60A5FA',
  'Work': '#FB923C',
  'Medical': '#F87171',
  'Legal': '#34D399',
  'Financial': '#60A5FA',
  'Travel': '#FB923C',
  'Education': '#34D399',
  'Other': '#9CA3AF',
};

export default function ListView({ dates }: ListViewProps) {
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Filter important dates
  const filteredDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (selectedFilter) {
      case 'this_week':
        const weekEnd = addDays(today, 7);
        return dates.filter((date) => {
          const itemDate = new Date(date.date);
          return isWithinInterval(itemDate, { start: today, end: weekEnd });
        });
      case 'this_month':
        const monthStart = startOfMonth(today);
        const monthEnd = endOfMonth(today);
        return dates.filter((date) => {
          const itemDate = new Date(date.date);
          return isWithinInterval(itemDate, { start: monthStart, end: monthEnd });
        });
      case 'next_3_months':
        const threeMonthsEnd = addMonths(today, 3);
        return dates.filter((date) => {
          const itemDate = new Date(date.date);
          return isWithinInterval(itemDate, { start: today, end: threeMonthsEnd });
        });
      case 'past':
        return dates.filter((date) => {
          const itemDate = new Date(date.date);
          return isPast(itemDate) && !isToday(itemDate);
        });
      default:
        return dates;
    }
  }, [dates, selectedFilter]);

  // Group important dates by month
  const groupedDates = useMemo(() => {
    const groups = new Map<string, ImportantDate[]>();

    filteredDates.forEach((date) => {
      const monthKey = format(new Date(date.date), 'MMMM yyyy');
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(date);
    });

    // Sort dates within each group by date
    groups.forEach((items) => {
      items.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateA - dateB;
      });
    });

    // Convert to array and sort by month
    return Array.from(groups.entries()).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredDates]);

  if (filteredDates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-16 px-4 rounded-2xl"
        style={{
          background: 'rgba(26, 26, 26, 0.6)',
          backdropFilter: 'blur(40px)',
        }}
      >
        <CalendarIcon className="w-16 h-16 mb-4" style={{ color: '#60A5FA' }} />
        <h3 className="text-xl font-bold text-white mb-2">No Important Dates</h3>
        <p className="text-sm text-white/60 text-center">
          {selectedFilter === 'all'
            ? 'Add important dates to track reminders'
            : 'No dates found for this filter'
          }
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {FILTERS.map((filter, index) => {
          const isActive = selectedFilter === filter.value;
          return (
            <motion.button
              key={filter.value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedFilter(filter.value)}
              className={`
                h-9 px-4 rounded-full whitespace-nowrap
                text-sm font-medium
                transition-all duration-300
                ${isActive ? 'text-white' : 'text-white/70'}
              `}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)'
                  : 'rgba(26, 26, 26, 0.8)',
                backdropFilter: 'blur(40px)',
                border: isActive
                  ? '1px solid rgba(96, 165, 250, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isActive
                  ? '0 4px 16px rgba(96, 165, 250, 0.3)'
                  : 'none',
                minHeight: '44px', // Touch target
              }}
            >
              {filter.label}
            </motion.button>
          );
        })}
      </div>

      {/* Grouped List */}
      <div className="space-y-6">
        {groupedDates.map(([month, monthItems], groupIndex) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
            className="space-y-3"
          >
            {/* Month Header */}
            <motion.div
              whileHover={{ scale: 1.01, x: 4 }}
              className="rounded-xl px-4 py-3"
              style={{
                background: 'rgba(26, 26, 26, 0.8)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 className="text-lg font-bold text-white">{month}</h3>
              <p className="text-xs text-white/50 mt-0.5">
                {monthItems.length} event{monthItems.length !== 1 ? 's' : ''}
              </p>
            </motion.div>

            {/* Important Dates in Month */}
            <div className="space-y-3">
              {monthItems.map((item, itemIndex) => {
                const itemDate = new Date(item.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysUntil = differenceInDays(itemDate, today);
                const isPastDate = itemDate < today;
                const isTodayDate = isToday(itemDate);

                // Determine status color
                let statusColor = '#60A5FA';
                let statusBg = 'rgba(96, 165, 250, 0.2)';
                if (isPastDate) {
                  statusColor = '#9CA3AF';
                  statusBg = 'rgba(156, 163, 175, 0.2)';
                } else if (isTodayDate) {
                  statusColor = '#34D399';
                  statusBg = 'rgba(52, 211, 153, 0.2)';
                } else if (daysUntil <= 7) {
                  statusColor = '#F87171';
                  statusBg = 'rgba(248, 113, 113, 0.2)';
                } else if (daysUntil <= 30) {
                  statusColor = '#FB923C';
                  statusBg = 'rgba(251, 146, 60, 0.2)';
                }

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: itemIndex * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-4 rounded-2xl transition-all duration-200 cursor-pointer"
                    style={{
                      background: 'rgba(26, 26, 26, 0.8)',
                      backdropFilter: 'blur(40px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      minHeight: '44px', // Touch target
                    }}
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="px-2 py-1 rounded-lg text-xs font-medium"
                        style={{
                          background: `${CATEGORY_COLORS[item.category] || '#60A5FA'}20`,
                          color: CATEGORY_COLORS[item.category] || '#60A5FA',
                        }}
                      >
                        {item.category}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-lg"
                        style={{
                          background: statusBg,
                          color: statusColor,
                        }}
                      >
                        {isPastDate
                          ? `${Math.abs(daysUntil)}d ago`
                          : isTodayDate
                          ? 'Today'
                          : `in ${daysUntil}d`
                        }
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-base font-semibold text-white mb-2">
                      {item.title}
                    </h4>

                    {/* Description */}
                    {item.description && (
                      <p className="text-sm text-white/70 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {/* Date & Reminder */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Calendar className="w-4 h-4" />
                        <span>{format(itemDate, 'MMM d, yyyy')}</span>
                      </div>

                      {item.reminder_days && !isPastDate && (
                        <div className="flex items-center gap-1 text-xs" style={{ color: '#60A5FA' }}>
                          <div className="w-1 h-1 rounded-full" style={{ background: '#60A5FA' }} />
                          <span>Reminder: {item.reminder_days}d before</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
