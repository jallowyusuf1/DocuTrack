import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import type { ImportantDate } from '../../types';
import { safeArray, cleanArray } from '../../utils/safeArray';

interface CalendarViewProps {
  dates?: ImportantDate[];
}

export default function CalendarView({ dates = [] }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get important dates for each date - SAFE VERSION
  const datesByDate = useMemo(() => {
    const map = new Map<string, ImportantDate[]>();
    // Use safeArray utility to ensure we always have an array
    const safeDates = cleanArray<ImportantDate>(dates);
    
    safeDates.forEach((importantDate) => {
      if (!importantDate?.date) {
        console.warn('CalendarView: Invalid importantDate (missing date)', importantDate);
        return;
      }
      try {
        const dateKey = format(new Date(importantDate.date), 'yyyy-MM-dd');
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(importantDate);
      } catch (error) {
        console.error('CalendarView: Error processing date', importantDate.date, error);
      }
    });
    return map;
  }, [dates]);

  // Get important dates for selected date
  const selectedDateItems = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return datesByDate.get(dateKey) || [];
  }, [selectedDate, datesByDate]);

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
          className="w-10 h-10 rounded-full glass-card-subtle flex items-center justify-center hover:bg-purple-500/20 active:scale-95 transition-all duration-200"
        >
          <ChevronLeft className="w-5 h-5 text-glass-primary" />
        </button>
        <h3 className="text-base font-bold text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={goToNextMonth}
          className="w-10 h-10 rounded-full glass-card-subtle flex items-center justify-center hover:bg-purple-500/20 active:scale-95 transition-all duration-200"
        >
          <ChevronRight className="w-5 h-5 text-glass-primary" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-glass">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-glass-secondary py-2"
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
            const dateItems = datesByDate.get(dateKey) || [];

            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                disabled={!isCurrentMonth}
                className={`
                  calendar-day
                  ${!isCurrentMonth ? 'text-glass-disabled cursor-not-allowed opacity-40' : ''}
                  ${isSelected ? 'selected' : ''}
                  ${isTodayDate ? 'today' : ''}
                  ${!isCurrentMonth ? '' : 'cursor-pointer'}
                  flex flex-col items-center justify-center
                  relative
                `}
              >
                <span>{format(day, 'd')}</span>
                {isCurrentMonth && dateItems.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dateItems.slice(0, 3).map((_, index) => (
                      <div
                        key={index}
                        className="w-1 h-1 rounded-full bg-purple-500"
                      />
                    ))}
                    {dateItems.length > 3 && (
                      <div className="w-1 h-1 rounded-full bg-purple-400" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Date Important Dates */}
      {selectedDate && (
        <div className="space-y-3">
          <h4 className="text-base font-bold text-white">
            Important dates on {format(selectedDate, 'MMM d, yyyy')}
          </h4>
          {selectedDateItems.length === 0 ? (
            <p className="text-sm text-glass-secondary text-center py-4">
              No important dates on this date
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl"
                  style={{
                    background: 'rgba(55, 48, 70, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-white mb-1">{item.title}</h5>
                      {item.description && (
                        <p className="text-sm text-white/70 mb-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span className="px-2 py-1 rounded-lg bg-purple-500/20 text-purple-300">
                          {item.category}
                        </span>
                        {item.reminder_days && (
                          <span>Reminder: {item.reminder_days} days before</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

