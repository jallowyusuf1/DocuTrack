import React from 'react';
import type { FieldDefinition } from '../../../types';

interface CurrencyFieldProps {
  field: FieldDefinition;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  currency?: string;
}

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  currency = 'USD',
}) => {
  const isRequired = field.validation_rules?.required;

  const formatCurrency = (val: string | number): string => {
    if (!val) return '';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return '';
    return num.toFixed(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit decimal places to 2
    if (parts.length === 2 && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].substring(0, 2);
    }
    onChange(val);
  };

  const displayValue = value ? formatCurrency(value) : '';

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
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
          $
        </span>
        <input
          id={field.field_key}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder="0.00"
          className={`w-full h-12 pl-8 pr-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all ${
            error
              ? 'border-red-500'
              : 'border-white/10 focus:border-blue-600/50'
          } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};





