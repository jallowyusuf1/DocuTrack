import React from 'react';
import type { FieldDefinition } from '../../../types';

interface CheckboxFieldProps {
  field: FieldDefinition;
  value: string[] | boolean;
  onChange: (value: string[] | boolean) => void;
  error?: string;
  disabled?: boolean;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
}) => {
  const options = field.default_options || [];
  const isMultiSelect = options.length > 0;
  const isRequired = field.validation_rules?.required;

  // Handle single checkbox (boolean)
  if (!isMultiSelect) {
    const boolValue = typeof value === 'boolean' ? value : false;
    return (
      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={boolValue}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="w-5 h-5 rounded border-white/20 bg-[rgba(35,29,51,0.6)] text-blue-600 focus:ring-blue-600 focus:ring-offset-0 disabled:opacity-50"
          />
          <span className="text-sm font-medium text-white">
            {field.label}
            {isRequired && <span className="text-red-400 ml-1">*</span>}
          </span>
        </label>
        {field.description && (
          <p className="text-xs text-gray-400 ml-8">{field.description}</p>
        )}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {field.help_text && !error && (
          <p className="text-xs text-gray-400 ml-8">{field.help_text}</p>
        )}
      </div>
    );
  }

  // Handle multi-select checkboxes
  const arrayValue = Array.isArray(value) ? value : [];
  const handleToggle = (optionValue: string) => {
    if (disabled) return;
    const newValue = arrayValue.includes(optionValue)
      ? arrayValue.filter(v => v !== optionValue)
      : [...arrayValue, optionValue];
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        {field.label}
        {isRequired && <span className="text-red-400 ml-1">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-gray-400">{field.description}</p>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={arrayValue.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              disabled={disabled}
              className="w-5 h-5 rounded border-white/20 bg-[rgba(35,29,51,0.6)] text-blue-600 focus:ring-blue-600 focus:ring-offset-0 disabled:opacity-50"
            />
            <span className="text-sm text-white">{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};




