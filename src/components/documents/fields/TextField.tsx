import React from 'react';
import type { FieldDefinition } from '../../../types';

interface TextFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const isRequired = field.validation_rules?.required;

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
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={field.placeholder}
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


