import React from 'react';
import type { FieldDefinition } from '../../../types';

interface VINFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const VINField: React.FC<VINFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const isRequired = field.validation_rules?.required;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();
    // Remove invalid characters (only allow A-Z and 0-9, excluding I, O, Q)
    val = val.replace(/[^A-HJ-NPR-Z0-9]/g, '');
    // Limit to 17 characters
    if (val.length <= 17) {
      onChange(val);
    }
  };

  const isValidLength = value.length === 17;
  const displayValue = value
    .split('')
    .map((char, index) => (index > 0 && index % 3 === 0 ? ' ' + char : char))
    .join('')
    .trim();

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
      <input
        id={field.field_key}
        type="text"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder="1HGBH41JXMN109186"
        maxLength={17}
        className={`w-full h-12 px-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all font-mono ${
          error
            ? 'border-red-500'
            : isValidLength
            ? 'border-green-500/50'
            : 'border-white/10 focus:border-blue-600/50'
        } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      <div className="flex justify-between items-center">
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <p className="text-xs text-gray-400">
            {value.length} / 17 characters
          </p>
        )}
        {isValidLength && !error && (
          <p className="text-xs text-green-400">Valid VIN format</p>
        )}
      </div>
      {field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};


