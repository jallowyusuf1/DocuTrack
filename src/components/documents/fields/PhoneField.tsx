import React from 'react';
import type { FieldDefinition } from '../../../types';

interface PhoneFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const isRequired = field.validation_rules?.required;

  const formatPhone = (val: string): string => {
    // Remove all non-digits
    const digits = val.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 10) {
      onChange(formatPhone(val));
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
      <input
        id={field.field_key}
        type="tel"
        value={value || ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder="(555) 123-4567"
        maxLength={14}
        className={`w-full h-12 px-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all ${
          error
            ? 'border-red-500'
            : 'border-white/10 focus:border-blue-600/50'
        } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};





