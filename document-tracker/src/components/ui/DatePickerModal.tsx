import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import Button from './Button';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: string) => void;
  selectedDate?: string;
  minDate?: string;
  maxDate?: string;
}

export default function DatePickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedDate,
  minDate,
  maxDate,
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selected, setSelected] = useState<Date | null>(
    selectedDate ? new Date(selectedDate) : null
  );
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (isOpen) {
      isProcessingRef.current = false;
      
      if (selectedDate) {
        const date = new Date(selectedDate);
        setSelected(date);
        setCurrentMonth(date);
      } else {
        setCurrentMonth(new Date());
        setSelected(null);
      }
    }
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const handleDateSelect = (date: Date) => {
    if (isProcessingRef.current) return;
    
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (minDate) {
      const minDateOnly = new Date(minDate);
      minDateOnly.setHours(0, 0, 0, 0);
      if (dateOnly < minDateOnly) return;
    }
    
    if (maxDate) {
      const maxDateOnly = new Date(maxDate);
      maxDateOnly.setHours(23, 59, 59, 999);
      if (dateOnly > maxDateOnly) return;
    }
    
    isProcessingRef.current = true;
    triggerHaptic('light');
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    onSelect(formattedDate);
    onClose();
    
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  };

  const handleConfirm = () => {
    if (isProcessingRef.current || !selected) return;
    
    isProcessingRef.current = true;
    triggerHaptic('light');
    onSelect(format(selected, 'yyyy-MM-dd'));
    onClose();
    
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  };

  const handleClear = () => {
    triggerHaptic('light');
    setSelected(null);
  };

  const goToPreviousMonth = () => {
    triggerHaptic('light');
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    triggerHaptic('light');
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={getTransition(transitions.spring)}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[90vh] overflow-hidden"
            style={{
              background: 'rgba(42, 38, 64, 0.85)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-2 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
              <h2 className="text-lg font-semibold text-white">Select Date</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClear}
                className="text-sm font-medium px-3 py-1 rounded-lg hover:bg-purple-500/20 transition-colors"
                style={{ color: '#A78BFA' }}
              >
                Clear
              </motion.button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between px-6 py-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </motion.button>
              <h3 className="text-lg font-semibold text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Calendar Grid */}
            <div className="px-6 pb-4">
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium py-2"
                    style={{ color: '#A78BFA' }}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}
                {daysInMonth.map((day) => {
                  const isSelected = selected && isSameDay(day, selected);
                  const isTodayDate = isToday(day);
                  
                  const dayOnly = new Date(day.getFullYear(), day.getMonth(), day.getDate());
                  let isDisabled = false;
                  
                  if (minDate) {
                    const minDateOnly = new Date(minDate);
                    minDateOnly.setHours(0, 0, 0, 0);
                    if (dayOnly < minDateOnly) isDisabled = true;
                  }
                  
                  if (maxDate) {
                    const maxDateOnly = new Date(maxDate);
                    maxDateOnly.setHours(23, 59, 59, 999);
                    if (dayOnly > maxDateOnly) isDisabled = true;
                  }

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileTap={isDisabled ? {} : { scale: 0.9 }}
                      onClick={() => handleDateSelect(day)}
                      disabled={isDisabled}
                      className={`
                        aspect-square rounded-xl text-sm font-medium
                        transition-all duration-200
                        ${isDisabled ? 'opacity-30 cursor-not-allowed' : ''}
                      `}
                      style={isSelected
                        ? {
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            color: '#FFFFFF',
                            boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
                          }
                        : isTodayDate
                        ? {
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#93C5FD',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                          }
                        : {
                            background: 'rgba(35, 29, 51, 0.3)',
                            color: '#FFFFFF',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                          }}
                    >
                      {format(day, 'd')}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 safe-area-bottom">
              <Button
                variant="primary"
                fullWidth
                onClick={handleConfirm}
                disabled={!selected}
              >
                Done
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
