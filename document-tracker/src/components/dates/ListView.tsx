import { useMemo, useState } from 'react';
import { format, isWithinInterval, addDays, startOfMonth, endOfMonth, addMonths, isPast, isToday, differenceInDays } from 'date-fns';
import { Calendar, Calendar as CalendarIcon } from 'lucide-react';
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
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <CalendarIcon className="w-16 h-16 text-purple-400 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Important Dates</h3>
        <p className="text-sm text-white/60 text-center">
          Add important dates to track reminders
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => setSelectedFilter(filter.value)}
              className={`
                h-9 px-4 rounded-full whitespace-nowrap
                text-sm font-medium
                transition-all duration-300
                ${isActive
                  ? 'text-white shadow-sm'
                  : 'text-white/70'
                }
                active:scale-95
              `}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                  : 'rgba(55, 48, 70, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Grouped List */}
      <div className="space-y-6">
        {groupedDates.map(([month, monthItems]) => (
          <div key={month} className="space-y-3">
            {/* Month Header */}
            <div
              className="rounded-lg px-4 py-3"
              style={{
                background: 'rgba(55, 48, 70, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 className="text-lg font-bold text-white">{month}</h3>
            </div>

            {/* Important Dates in Month */}
            <div className="space-y-3">
              {monthItems.map((item) => {
                const itemDate = new Date(item.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const daysUntil = differenceInDays(itemDate, today);
                const isPastDate = itemDate < today;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl transition-all duration-200 active:scale-98"
                    style={{
                      background: 'rgba(55, 48, 70, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300 text-xs font-medium">
                        {item.category}
                      </span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        isPastDate
                          ? 'bg-gray-500/20 text-gray-400'
                          : daysUntil === 0
                          ? 'bg-green-500/20 text-green-400'
                          : daysUntil <= 7
                          ? 'bg-red-500/20 text-red-400'
                          : daysUntil <= 30
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {isPastDate
                          ? `${Math.abs(daysUntil)}d ago`
                          : daysUntil === 0
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
                      <p className="text-sm text-white/70 mb-2">
                        {item.description}
                      </p>
                    )}

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span>{format(itemDate, 'MMM d, yyyy')}</span>
                    </div>

                    {/* Reminder Info */}
                    {item.reminder_days && !isPastDate && (
                      <div className="mt-2 text-xs text-purple-300">
                        Reminder set for {item.reminder_days} days before
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

