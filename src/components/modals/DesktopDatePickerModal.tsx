import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, RotateCcw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, addDays, addMonths as addMonthsFn, addYears } from 'date-fns';
import DesktopModal from '../ui/DesktopModal';
import { triggerHaptic } from '../../utils/animations';

interface DesktopDatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate?: string;
  minDate?: string;
  maxDate?: string;
  allowRange?: boolean;
}

type ViewMode = 'calendar' | 'wheel';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export default function DesktopDatePickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  minDate,
  maxDate,
  allowRange = false,
}: DesktopDatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(selectedDate ? new Date(selectedDate) : null);
  const [rangeStart, setRangeStart] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [wheelMonth, setWheelMonth] = useState(new Date().getMonth());
  const [wheelDay, setWheelDay] = useState(new Date().getDate());
  const [wheelYear, setWheelYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (isOpen && selectedDate) {
      const date = new Date(selectedDate);
      setSelected(date);
      setCurrentMonth(date);
      setWheelMonth(date.getMonth());
      setWheelDay(date.getDate());
      setWheelYear(date.getFullYear());
    }
  }, [selectedDate, isOpen]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const handleDateClick = (date: Date) => {
    if (allowRange && rangeStart === null) {
      setRangeStart(date);
      setSelected(date);
    } else if (allowRange && rangeStart) {
      if (date < rangeStart) {
        setSelected(date);
        setRangeStart(null);
      } else {
        setSelected(date);
        setRangeStart(null);
      }
    } else {
      setSelected(date);
    }
    triggerHaptic('light');
  };

  const handlePreset = (preset: string) => {
    const today = new Date();
    let date: Date;
    
    switch (preset) {
      case 'today':
        date = today;
        break;
      case '1month':
        date = addMonthsFn(today, 1);
        break;
      case '3months':
        date = addMonthsFn(today, 3);
        break;
      case '6months':
        date = addMonthsFn(today, 6);
        break;
      case '1year':
        date = addYears(today, 1);
        break;
      default:
        date = today;
    }
    
    setSelected(date);
    setCurrentMonth(date);
    triggerHaptic('light');
  };

  const handleDone = () => {
    if (selected) {
      onSelect(format(selected, 'yyyy-MM-dd'));
      onClose();
    }
  };

  const handleToday = () => {
    const today = new Date();
    setSelected(today);
    setCurrentMonth(today);
    triggerHaptic('light');
  };

  const isInRange = (date: Date) => {
    if (!allowRange || !rangeStart || !selected) return false;
    return date >= rangeStart && date <= selected;
  };

  const isDateDisabled = (date: Date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const getDaysInMonth = (month: number, year: number) => {
    if (month === 1 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
      return 29;
    }
    return DAYS_IN_MONTH[month];
  };

  const wheelDays = Array.from({ length: getDaysInMonth(wheelMonth, wheelYear) }, (_, i) => i + 1);
  const wheelYears = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 50 + i);

  return (
    <DesktopModal
      isOpen={isOpen}
      onClose={onClose}
      width={700}
      height={600}
      title="Select Date"
    >
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-purple-500/20 text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('wheel')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'wheel'
                  ? 'bg-purple-500/20 text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <RotateCcw className="w-4 h-4 inline mr-2" />
              Wheel
            </button>
          </div>

          {viewMode === 'calendar' ? (
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    setCurrentMonth(subMonths(currentMonth, 1));
                    triggerHaptic('light');
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-white text-xl">‹</span>
                </button>
                <h3 className="text-2xl font-bold text-white">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button
                  onClick={() => {
                    setCurrentMonth(addMonths(currentMonth, 1));
                    triggerHaptic('light');
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <span className="text-white text-xl">›</span>
                </button>
              </div>

              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-white/60 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {emptyDays.map((_, i) => (
                  <div key={`empty-${i}`} className="h-20" />
                ))}
                {daysInMonth.map((date) => {
                  const isSelected = selected && isSameDay(date, selected);
                  const isTodayDate = isToday(date);
                  const inRange = isInRange(date);
                  const disabled = isDateDisabled(date);

                  return (
                    <motion.button
                      key={date.toISOString()}
                      whileHover={!disabled ? { scale: 1.05 } : {}}
                      whileTap={!disabled ? { scale: 0.95 } : {}}
                      onClick={() => !disabled && handleDateClick(date)}
                      disabled={disabled}
                      className={`h-20 rounded-xl font-medium transition-all ${
                        disabled
                          ? 'text-white/20 cursor-not-allowed'
                          : isSelected
                          ? 'bg-purple-500 text-white'
                          : inRange
                          ? 'bg-purple-500/30 text-white'
                          : isTodayDate
                          ? 'bg-blue-500/20 text-blue-300 border-2 border-blue-500/50'
                          : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {format(date, 'd')}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-8 h-full">
              {/* Month Wheel */}
              <div className="flex flex-col items-center">
                <label className="text-sm text-white/60 mb-2">Month</label>
                <div className="w-32 h-64 overflow-y-auto scrollbar-hide" style={{ scrollSnapType: 'y mandatory' }}>
                  {MONTHS.map((month, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => {
                        setWheelMonth(idx);
                        triggerHaptic('light');
                      }}
                      className={`text-center py-4 cursor-pointer scroll-snap-align-center ${
                        wheelMonth === idx
                          ? 'text-3xl font-bold text-purple-400'
                          : 'text-xl text-white/60'
                      }`}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {month}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Day Wheel */}
              <div className="flex flex-col items-center">
                <label className="text-sm text-white/60 mb-2">Day</label>
                <div className="w-24 h-64 overflow-y-auto scrollbar-hide" style={{ scrollSnapType: 'y mandatory' }}>
                  {wheelDays.map((day) => (
                    <motion.div
                      key={day}
                      onClick={() => {
                        setWheelDay(day);
                        triggerHaptic('light');
                      }}
                      className={`text-center py-4 cursor-pointer scroll-snap-align-center ${
                        wheelDay === day
                          ? 'text-3xl font-bold text-purple-400'
                          : 'text-xl text-white/60'
                      }`}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {day}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Year Wheel */}
              <div className="flex flex-col items-center">
                <label className="text-sm text-white/60 mb-2">Year</label>
                <div className="w-32 h-64 overflow-y-auto scrollbar-hide" style={{ scrollSnapType: 'y mandatory' }}>
                  {wheelYears.map((year) => (
                    <motion.div
                      key={year}
                      onClick={() => {
                        setWheelYear(year);
                        triggerHaptic('light');
                      }}
                      className={`text-center py-4 cursor-pointer scroll-snap-align-center ${
                        wheelYear === year
                          ? 'text-3xl font-bold text-purple-400'
                          : 'text-xl text-white/60'
                      }`}
                      style={{ scrollSnapAlign: 'center' }}
                    >
                      {year}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-48 border-l border-white/10 p-6 flex flex-col gap-4">
          <h4 className="text-sm font-semibold text-white/80 mb-2">Quick Select</h4>
          {['today', '1month', '3months', '6months', '1year'].map((preset) => (
            <button
              key={preset}
              onClick={() => handlePreset(preset)}
              className="text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              {preset === 'today' && 'Today'}
              {preset === '1month' && '1 month from now'}
              {preset === '3months' && '3 months from now'}
              {preset === '6months' && '6 months from now'}
              {preset === '1year' && '1 year from now'}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
        <button
          onClick={handleToday}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          Today
        </button>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={!selected}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </DesktopModal>
  );
}

