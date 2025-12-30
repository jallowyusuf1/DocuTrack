import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfYear, endOfYear, eachMonthOfInterval, getYear, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import type { Document } from '../../types';

interface DesktopYearViewProps {
  currentYear: Date;
  documents: Document[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DesktopYearView({
  currentYear,
  documents,
  selectedDate,
  onDateSelect,
}: DesktopYearViewProps) {
  const yearStart = startOfYear(currentYear);
  const yearEnd = endOfYear(currentYear);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  // Get documents grouped by date
  const documentsByDate = useMemo(() => {
    const map = new Map<string, Document[]>();
    documents.forEach((doc) => {
      const dateKey = format(new Date(doc.expiration_date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(doc);
    });
    return map;
  }, [documents]);

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="grid grid-cols-3 gap-6">
      {months.map((month) => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);
        const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

        return (
          <motion.div
            key={month.toISOString()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl p-4"
            style={{
              background: 'rgba(42, 38, 64, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '240px',
              height: '200px',
            }}
          >
            {/* Month Header */}
            <div className="text-center mb-2">
              <h3 className="text-sm font-semibold text-white">
                {format(month, 'MMMM')}
              </h3>
            </div>

            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-[8px] text-center text-white/40 py-0.5"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0.5">
              {daysInMonth.map((day) => {
                const isCurrentMonth = isSameMonth(day, month);
                const isSelected = isSameDay(day, selectedDate);
                const dateKey = format(day, 'yyyy-MM-dd');
                const hasDocuments = documentsByDate.has(dateKey);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => onDateSelect(day)}
                    className={`text-[10px] aspect-square rounded flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isCurrentMonth
                        ? 'text-white hover:bg-white/10'
                        : 'text-white/30'
                    }`}
                  >
                    {format(day, 'd')}
                    {hasDocuments && (
                      <div
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: '#2563EB' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

