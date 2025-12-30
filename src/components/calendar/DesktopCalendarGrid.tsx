import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, startOfWeek, endOfWeek } from 'date-fns';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';
import { useNavigate } from 'react-router-dom';

interface DesktopCalendarGridProps {
  currentMonth: Date;
  documents: Document[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DesktopCalendarGrid({
  currentMonth,
  documents,
  selectedDate,
  onDateSelect,
}: DesktopCalendarGridProps) {
  const navigate = useNavigate();

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-white/60 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayDocuments = documentsByDate.get(dateKey) || [];
          const visibleDocs = dayDocuments.slice(0, 3);
          const moreCount = dayDocuments.length - 3;

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-xl p-3 text-left transition-all"
              style={{
                width: '120px',
                height: '100px',
                background: isSelected
                  ? 'rgba(37, 99, 235, 0.2)'
                  : isCurrentMonth
                  ? 'rgba(42, 38, 64, 0.4)'
                  : 'rgba(35, 29, 51, 0.2)',
                border: isSelected
                  ? '2px solid #2563EB'
                  : isTodayDate
                  ? '2px solid #3B82F6'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                opacity: isCurrentMonth ? 1 : 0.4,
              }}
            >
              {/* Day Number */}
              <div
                className="text-[20px] font-bold mb-1"
                style={{ color: isCurrentMonth ? '#FFFFFF' : '#60A5FA' }}
              >
                {format(day, 'd')}
              </div>

              {/* Document Indicators */}
              <div className="space-y-1">
                {visibleDocs.map((doc, idx) => {
                  const daysUntil = getDaysUntil(doc.expiration_date);
                  let urgencyColor = '#2563EB'; // Default purple
                  if (daysUntil <= 7) urgencyColor = '#EF4444'; // Red
                  else if (daysUntil <= 30) urgencyColor = '#F59E0B'; // Orange
                  else urgencyColor = '#10B981'; // Green
                  
                  return (
                    <motion.div
                      key={doc.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/documents/${doc.id}`);
                      }}
                      className="flex items-center gap-1.5 px-1.5 py-0.5 rounded text-xs truncate cursor-pointer hover:bg-white/10 transition-colors"
                      style={{
                        borderLeft: `3px solid ${urgencyColor}`,
                        background: 'rgba(35, 29, 51, 0.6)',
                      }}
                    >
                      <span className="text-white truncate flex-1">{doc.document_name}</span>
                    </motion.div>
                  );
                })}
                {moreCount > 0 && (
                  <div className="text-xs text-blue-400 font-medium px-1.5">
                    +{moreCount} more
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

