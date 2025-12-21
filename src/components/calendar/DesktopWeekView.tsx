import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';

interface DesktopWeekViewProps {
  currentWeek: Date;
  documents: Document[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DesktopWeekView({
  currentWeek,
  documents,
  selectedDate,
  onDateSelect,
}: DesktopWeekViewProps) {
  const weekStart = startOfWeek(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

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

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  return (
    <div className="space-y-4">
      {/* Week Day Headers */}
      <div className="grid grid-cols-8 gap-2">
        <div className="text-sm font-semibold text-white/60 py-2">Time</div>
        {weekDays.map((day) => {
          const isTodayDate = isToday(day);
          const isSelected = isSameDay(day, selectedDate);
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              className={`text-center py-2 rounded-lg transition-all ${
                isSelected
                  ? 'bg-purple-500/30 border-2 border-purple-500'
                  : isTodayDate
                  ? 'bg-blue-500/20 border-2 border-blue-500'
                  : 'border border-white/10'
              }`}
            >
              <div className="text-xs text-white/60">{format(day, 'EEE')}</div>
              <div className="text-lg font-bold text-white">{format(day, 'd')}</div>
            </button>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-1">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 gap-2">
            <div className="text-xs text-white/40 py-2 text-right pr-2">
              {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
            </div>
            {weekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayDocuments = documentsByDate.get(dateKey) || [];
              // Filter documents that might appear at this hour (simplified - just show all for now)
              const hourDocuments = dayDocuments;

              return (
                <div
                  key={`${day.toISOString()}-${hour}`}
                  className="min-h-[60px] border-t border-white/5 relative"
                >
                    {hour === 8 &&
                      hourDocuments.map((doc, idx) => {
                        const daysUntil = getDaysUntil(doc.expiration_date);
                        let urgencyColor = '#8B5CF6'; // Default purple
                        if (daysUntil <= 7) urgencyColor = '#EF4444'; // Red
                        else if (daysUntil <= 30) urgencyColor = '#F59E0B'; // Orange
                        else urgencyColor = '#10B981'; // Green

                      return (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-0 left-0 right-0 p-2 rounded-lg text-xs cursor-pointer hover:scale-105 transition-transform"
                          style={{
                            background: urgencyColor,
                            color: '#FFFFFF',
                            zIndex: 10,
                            marginTop: `${idx * 50}px`,
                          }}
                        >
                          <div className="font-medium truncate">{doc.document_name}</div>
                          <div className="text-xs opacity-90">
                            {daysUntil === 0
                              ? 'Expires today'
                              : `${daysUntil} days left`}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

