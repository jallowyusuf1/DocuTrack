import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import type { FieldDefinition } from '../../../types';

interface DateFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

export const DateField: React.FC<DateFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  minDate,
  maxDate,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const isRequired = field.validation_rules?.required;

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={field.field_key}
        className="block text-sm font-medium text-white"
      >
        {field.label}
        {isRequired && <span className="text-red-400 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-gray-400">{field.description}</p>
      )}
      <div className="relative">
        <input
          id={field.field_key}
          type="date"
          value={formatDateForInput(value)}
          onChange={handleDateChange}
          disabled={disabled}
          min={minDate}
          max={maxDate}
          className={`w-full h-12 px-4 pr-10 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all ${
            error
              ? 'border-red-500'
              : 'border-white/10 focus:border-blue-600/50'
          } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};




