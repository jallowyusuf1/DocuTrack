import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { DesktopModal } from './DesktopModal';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
  allowRange?: boolean;
}

type ViewMode = 'calendar' | 'wheel';

export const DatePicker: React.FC<DatePickerProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  selectedDate,
  allowRange = false,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(selectedDate || null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);

  // Wheel mode states
  const [wheelMonth, setWheelMonth] = useState((selectedDate || new Date()).getMonth());
  const [wheelDay, setWheelDay] = useState((selectedDate || new Date()).getDate());
  const [wheelYear, setWheelYear] = useState((selectedDate || new Date()).getFullYear());

  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDayClick = (date: Date) => {
    if (allowRange) {
      if (!rangeStart || (rangeStart && rangeEnd)) {
        setRangeStart(date);
        setRangeEnd(null);
      } else {
        if (date < rangeStart) {
          setRangeEnd(rangeStart);
          setRangeStart(date);
        } else {
          setRangeEnd(date);
        }
      }
    } else {
      setSelectedDay(date);
    }
  };

  const handlePresetClick = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    setSelectedDay(date);
    setCurrentMonth(date);
  };

  const handleDone = () => {
    if (viewMode === 'wheel') {
      const date = new Date(wheelYear, wheelMonth, wheelDay);
      onSelectDate(date);
    } else {
      if (selectedDay) {
        onSelectDate(selectedDay);
      }
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDay(today);
    setCurrentMonth(today);
    setWheelMonth(today.getMonth());
    setWheelDay(today.getDate());
    setWheelYear(today.getFullYear());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDay && date.toDateString() === selectedDay.toDateString();
  };

  const isInRange = (date: Date) => {
    if (!allowRange || !rangeStart) return false;
    if (!rangeEnd) return date.toDateString() === rangeStart.toDateString();
    return date >= rangeStart && date <= rangeEnd;
  };

  const WheelPicker = ({ items, value, onChange, itemHeight = 60 }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (containerRef.current) {
        const index = items.indexOf(value);
        containerRef.current.scrollTop = index * itemHeight - itemHeight * 4;
      }
    }, [value, items, itemHeight]);

    return (
      <div
        ref={containerRef}
        className="relative overflow-y-auto hide-scrollbar"
        style={{
          height: '540px',
          scrollSnapType: 'y mandatory',
        }}
      >
        <div style={{ height: `${itemHeight * 4}px` }} />
        {items.map((item: any, index: number) => (
          <div
            key={index}
            onClick={() => onChange(item)}
            className="flex items-center justify-center cursor-pointer transition-all duration-200"
            style={{
              height: `${itemHeight}px`,
              scrollSnapAlign: 'center',
              fontSize: value === item ? '28px' : '20px',
              fontWeight: value === item ? 600 : 400,
              color: value === item ? '#8b5cf6' : '#9ca3af',
              opacity: value === item ? 1 : 0.5,
            }}
          >
            {typeof item === 'number' ? item : item}
          </div>
        ))}
        <div style={{ height: `${itemHeight * 4}px` }} />
      </div>
    );
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <DesktopModal isOpen={isOpen} onClose={onClose}>
      <div
        className="bg-white dark:bg-gray-800"
        style={{
          width: '700px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Select Date
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'calendar'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Calendar size={20} />
            </button>
            <button
              onClick={() => setViewMode('wheel')}
              className={`p-3 rounded-xl transition-all ${
                viewMode === 'wheel'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Clock size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Main Area */}
          <div className="flex-1 p-6">
            {viewMode === 'calendar' ? (
              <div>
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <ChevronLeft size={24} className="text-gray-600 dark:text-gray-400" />
                  </button>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                  >
                    <ChevronRight size={24} className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>

                {/* Week Headers */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((date, index) => (
                    <button
                      key={index}
                      onClick={() => date && handleDayClick(date)}
                      disabled={!date}
                      className={`
                        relative rounded-xl transition-all duration-200
                        ${!date ? 'invisible' : ''}
                        ${date && isToday(date) ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : ''}
                        ${date && isSelected(date) ? 'bg-blue-600 text-white' : ''}
                        ${date && isInRange(date) && !isSelected(date) ? 'bg-blue-100 dark:bg-blue-900' : ''}
                        ${date && !isToday(date) && !isSelected(date) && !isInRange(date) ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : ''}
                      `}
                      style={{
                        width: '80px',
                        height: '80px',
                        fontSize: '18px',
                        fontWeight: date && isSelected(date) ? 600 : 400,
                      }}
                    >
                      {date && date.getDate()}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex gap-4 h-full items-center justify-center">
                <div className="flex-1">
                  <h4 className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Month</h4>
                  <WheelPicker
                    items={months}
                    value={months[wheelMonth]}
                    onChange={(month: string) => setWheelMonth(months.indexOf(month))}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Day</h4>
                  <WheelPicker
                    items={Array.from({ length: 31 }, (_, i) => i + 1)}
                    value={wheelDay}
                    onChange={setWheelDay}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Year</h4>
                  <WheelPicker
                    items={Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i)}
                    value={wheelYear}
                    onChange={setWheelYear}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-48 border-l border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">Quick Select</h3>
            <div className="space-y-2">
              <button
                onClick={handleToday}
                className="w-full px-4 py-3 text-left rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => handlePresetClick(30)}
                className="w-full px-4 py-3 text-left rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                1 month
              </button>
              <button
                onClick={() => handlePresetClick(90)}
                className="w-full px-4 py-3 text-left rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                3 months
              </button>
              <button
                onClick={() => handlePresetClick(180)}
                className="w-full px-4 py-3 text-left rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                6 months
              </button>
              <button
                onClick={() => handlePresetClick(365)}
                className="w-full px-4 py-3 text-left rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
              >
                1 year
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleToday}
              className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Today
            </button>
            <button
              onClick={handleDone}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-800 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </DesktopModal>
  );
};
