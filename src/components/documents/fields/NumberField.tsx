import React from 'react';
import type { FieldDefinition } from '../../../types';

interface NumberFieldProps {
  field: FieldDefinition;
  value: number | string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  unit?: string;
  onUnitChange?: (unit: string) => void;
  unitOptions?: Array<{ value: string; label: string }>;
}

export const NumberField: React.FC<NumberFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  unit,
  onUnitChange,
  unitOptions,
}) => {
  const isRequired = field.validation_rules?.required;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow empty or valid number
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      onChange(val);
    }
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
      <div className="flex gap-2">
        <input
          id={field.field_key}
          type="text"
          inputMode="decimal"
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={field.placeholder}
          className={`flex-1 h-12 px-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all ${
            error
              ? 'border-red-500'
              : 'border-white/10 focus:border-blue-600/50'
          } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {unitOptions && onUnitChange && (
          <select
            value={unit || unitOptions[0]?.value}
            onChange={(e) => onUnitChange(e.target.value)}
            disabled={disabled}
            className="h-12 px-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border border-white/10 focus:border-blue-600/50 focus:outline-none disabled:opacity-50"
          >
            {unitOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};





