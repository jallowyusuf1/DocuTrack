import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import Button from './Button';

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
      // Reset processing flag when modal opens
      isProcessingRef.current = false;
      
      if (selectedDate) {
        const date = new Date(selectedDate);
        setSelected(date);
        setCurrentMonth(date);
      } else {
        // Reset to current month when opening
        setCurrentMonth(new Date());
        setSelected(null);
      }
    }
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const handleDateSelect = (date: Date) => {
    // Prevent rapid clicking
    if (isProcessingRef.current) return;
    
    // Normalize dates to midnight for comparison
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
    
    // Set processing flag
    isProcessingRef.current = true;
    
    // Automatically close and select the date when clicked
    const formattedDate = format(date, 'yyyy-MM-dd');
    onSelect(formattedDate);
    onClose();
    
    // Reset processing flag after a short delay
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  };

  const handleConfirm = () => {
    if (isProcessingRef.current || !selected) return;
    
    isProcessingRef.current = true;
    onSelect(format(selected, 'yyyy-MM-dd'));
    onClose();
    
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 300);
  };

  const handleClear = () => {
    setSelected(null);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Select Date</h2>
          <button
            onClick={handleClear}
            className="text-sm text-blue-600 font-medium px-3 py-1 rounded-lg hover:bg-blue-50"
          >
            Clear
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-6 py-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-6 pb-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-gray-500 py-2"
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
              
              // Normalize dates for comparison
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
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateSelect(day)}
                  disabled={isDisabled}
                  className={`
                    aspect-square rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isSelected
                      ? 'bg-blue-600 text-white'
                      : isTodayDate
                      ? 'bg-blue-50 text-blue-600 font-semibold'
                      : 'text-gray-900 hover:bg-gray-100'
                    }
                    ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'active:scale-95'}
                  `}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 safe-area-bottom">
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirm}
            disabled={!selected}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

