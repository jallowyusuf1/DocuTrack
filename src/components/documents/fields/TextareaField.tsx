import React from 'react';
import type { FieldDefinition } from '../../../types';

interface TextareaFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  maxLength?: number;
}

export const TextareaField: React.FC<TextareaFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  maxLength,
}) => {
  const isRequired = field.validation_rules?.required;
  const length = maxLength || field.validation_rules?.maxLength || 500;
  const currentLength = (value || '').length;

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
      <textarea
        id={field.field_key}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={field.placeholder}
        maxLength={length}
        rows={4}
        className={`w-full px-4 py-3 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all resize-none ${
          error
            ? 'border-red-500'
            : 'border-white/10 focus:border-blue-600/50'
        } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {length && (
        <div className="flex justify-between items-center">
          {error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : field.help_text ? (
            <p className="text-xs text-gray-400">{field.help_text}</p>
          ) : (
            <span />
          )}
          <p className={`text-xs ${currentLength >= length ? 'text-red-400' : 'text-gray-400'}`}>
            {currentLength} / {length}
          </p>
        </div>
      )}
      {!length && error && <p className="text-red-400 text-sm">{error}</p>}
      {!length && field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};


