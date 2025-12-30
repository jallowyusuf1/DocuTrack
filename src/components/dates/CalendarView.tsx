import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Repeat } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImportantDate } from '../../types';
import { safeArray, cleanArray } from '../../utils/safeArray';

interface CalendarViewProps {
  dates?: ImportantDate[];
}

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

export default function CalendarView({ dates = [] }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // Get important dates for each date
  const datesByDate = useMemo(() => {
    const map = new Map<string, ImportantDate[]>();
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
    setDirection('left');
    setCurrentMonth(subMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setDirection('right');
    setCurrentMonth(addMonths(currentMonth, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date: Date) => {
    if (!isSameMonth(date, currentMonth)) return;
    setSelectedDate(isSameDay(date, selectedDate || new Date('1900-01-01')) ? null : date);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousMonth();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextMonth();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentMonth]);

  return (
    <div className="space-y-5">
      {/* Month Selector */}
      <div className="flex items-center justify-between h-12">
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToPreviousMonth}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </motion.button>

        <motion.h3
          key={currentMonth.toISOString()}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base font-bold text-white"
        >
          {format(currentMonth, 'MMMM yyyy')}
        </motion.h3>

        <motion.button
          whileHover={{ scale: 1.1, x: 2 }}
          whileTap={{ scale: 0.9 }}
          onClick={goToNextMonth}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(26, 26, 26, 0.8)',
          backdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-bold text-white/60 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Date Cells */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const dateKey = format(day, 'yyyy-MM-dd');
            const dateItems = datesByDate.get(dateKey) || [];
            const hasEvents = dateItems.length > 0;

            return (
              <motion.button
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={isCurrentMonth ? { scale: 1.1 } : {}}
                whileTap={isCurrentMonth ? { scale: 0.95 } : {}}
                onClick={() => handleDateClick(day)}
                disabled={!isCurrentMonth}
                className={`
                  relative h-12 rounded-xl flex flex-col items-center justify-center
                  transition-all duration-200
                  ${!isCurrentMonth ? 'text-white/20 cursor-not-allowed' : 'text-white cursor-pointer'}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                `}
                style={{
                  background: isSelected
                    ? 'rgba(96, 165, 250, 0.3)'
                    : isTodayDate
                    ? 'rgba(96, 165, 250, 0.15)'
                    : hasEvents && isCurrentMonth
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'transparent',
                  minHeight: '44px', // Touch target
                  minWidth: '44px',
                }}
              >
                <span className={`text-sm font-medium ${isTodayDate ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>

                {/* Event Indicators */}
                {isCurrentMonth && hasEvents && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dateItems.slice(0, 3).map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: CATEGORY_COLORS[item.category] || '#60A5FA',
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Selected Date Events */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-base font-bold text-white px-1">
              {selectedDateItems.length > 0
                ? `${selectedDateItems.length} event${selectedDateItems.length !== 1 ? 's' : ''} on ${format(selectedDate, 'MMM d, yyyy')}`
                : `No events on ${format(selectedDate, 'MMM d, yyyy')}`
              }
            </h4>

            {selectedDateItems.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-white/40 text-center py-4 px-4 rounded-xl"
                style={{
                  background: 'rgba(26, 26, 26, 0.6)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                No important dates on this day
              </motion.p>
            ) : (
              <div className="space-y-3">
                {selectedDateItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    className="p-4 rounded-2xl transition-all duration-200"
                    style={{
                      background: 'rgba(26, 26, 26, 0.8)',
                      backdropFilter: 'blur(40px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${CATEGORY_COLORS[item.category] || '#60A5FA'}, ${CATEGORY_COLORS[item.category] || '#3B82F6'})`,
                        }}
                      >
                        <CalendarIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-white mb-1">{item.title}</h5>
                        {item.description && (
                          <p className="text-sm text-white/70 mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span
                            className="px-2 py-1 rounded-lg font-medium"
                            style={{
                              background: `${CATEGORY_COLORS[item.category] || '#60A5FA'}20`,
                              color: CATEGORY_COLORS[item.category] || '#60A5FA',
                            }}
                          >
                            {item.category}
                          </span>
                          {item.reminder_days && (
                            <span className="text-white/50">
                              Reminder: {item.reminder_days}d before
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
