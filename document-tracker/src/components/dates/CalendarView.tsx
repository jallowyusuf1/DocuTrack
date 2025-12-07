import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import DocumentCard from '../documents/DocumentCard';

interface CalendarViewProps {
  documents: Document[];
  onDocumentClick?: (documentId: string) => void;
  onMarkRenewed: (document: Document) => void;
}

const getUrgencyColor = (daysLeft: number): string => {
  if (daysLeft < 0) return 'bg-red-500';
  if (daysLeft <= 7) return 'bg-red-500';
  if (daysLeft <= 14) return 'bg-orange-500';
  if (daysLeft <= 30) return 'bg-yellow-500';
  return 'bg-green-500';
};

export default function CalendarView({ documents, onDocumentClick, onMarkRenewed }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get documents for each date
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

  // Get documents for selected date
  const selectedDateDocuments = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return documentsByDate.get(dateKey) || [];
  }, [selectedDate, documentsByDate]);

  // Get most urgent color for a date
  const getDateUrgencyColor = (date: Date): string | null => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const docs = documentsByDate.get(dateKey);
    if (!docs || docs.length === 0) return null;
    
    // Find most urgent document
    let mostUrgentDays = Infinity;
    docs.forEach((doc) => {
      const days = getDaysUntil(doc.expiration_date);
      if (days < mostUrgentDays) {
        mostUrgentDays = days;
      }
    });
    
    return getUrgencyColor(mostUrgentDays);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;
    setSelectedDate(date);
  };

  return (
    <div className="space-y-5">
      {/* Month Selector */}
      <div className="flex items-center justify-between h-12">
        <button
          onClick={goToPreviousMonth}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h3 className="text-base font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={goToNextMonth}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const dateKey = format(day, 'yyyy-MM-dd');
            const dateDocs = documentsByDate.get(dateKey) || [];
            const urgencyColor = getDateUrgencyColor(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={!isCurrentMonth}
                className={`
                  aspect-square rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${!isCurrentMonth ? 'text-gray-300 cursor-not-allowed' : ''}
                  ${isSelected
                    ? 'bg-blue-100 text-blue-600 font-bold'
                    : isTodayDate
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-gray-900 hover:bg-gray-50'
                  }
                  ${isCurrentMonth ? 'active:scale-95' : ''}
                  flex flex-col items-center justify-center
                  relative
                `}
              >
                <span>{format(day, 'd')}</span>
                {isCurrentMonth && dateDocs.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dateDocs.slice(0, 3).map((_, index) => (
                      <div
                        key={index}
                        className={`w-1 h-1 rounded-full ${urgencyColor || 'bg-gray-400'}`}
                      />
                    ))}
                    {dateDocs.length > 3 && (
                      <div className="w-1 h-1 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Documents */}
      {selectedDate && (
        <div className="space-y-3">
          <h4 className="text-base font-bold text-gray-900">
            Documents expiring on {format(selectedDate, 'MMM d')}
          </h4>
          {selectedDateDocuments.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No documents expiring on this date
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateDocuments.map((document) => (
                <div
                  key={document.id}
                  onClick={() => onDocumentClick?.(document.id)}
                  className="cursor-pointer"
                >
                  <DocumentCard
                    document={document}
                    onMarkRenewed={onMarkRenewed}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

