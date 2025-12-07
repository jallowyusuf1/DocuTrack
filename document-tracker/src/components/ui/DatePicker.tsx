import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import DatePickerModal from './DatePickerModal';
import { AlertCircle } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date | string;
  maxDate?: Date | string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export default function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  error,
  placeholder = 'Select date',
  required,
  disabled,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'MMM dd, yyyy');
  };

  const handleDateSelect = (dateString: string) => {
    if (dateString) {
      onChange(new Date(dateString));
    } else {
      onChange(null);
    }
    setIsOpen(false);
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`
          w-full h-[52px] px-4 rounded-xl
          flex items-center gap-3
          text-left text-[15px]
          transition-all duration-200
          ${error 
            ? 'border-2 border-red-500 focus:border-red-500' 
            : 'border border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
          }
          ${disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'bg-white text-gray-900'}
          ${value ? '' : 'text-gray-400'}
        `}
        aria-label={label || 'Select date'}
      >
        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span className="flex-1 truncate">
          {value ? formatDate(value) : placeholder}
        </span>
      </button>
      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-600 animate-slide-down-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isOpen && (
        <DatePickerModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelect={handleDateSelect}
          selectedDate={value ? format(value, 'yyyy-MM-dd') : undefined}
          minDate={minDate ? (typeof minDate === 'string' ? minDate : format(minDate, 'yyyy-MM-dd')) : undefined}
          maxDate={maxDate ? (typeof maxDate === 'string' ? maxDate : format(maxDate, 'yyyy-MM-dd')) : undefined}
        />
      )}
    </div>
  );
}

