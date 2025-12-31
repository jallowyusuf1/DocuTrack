import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { FieldDefinition } from '../../../types';

interface DropdownFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
}

export const DropdownField: React.FC<DropdownFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  searchable = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const isRequired = field.validation_rules?.required;
  const options = field.default_options || [];

  const filteredOptions = searchable && searchQuery
    ? options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const selectedOption = options.find(opt => opt.value === value);

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
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full h-12 px-4 pr-10 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all text-left flex items-center justify-between ${
            error
              ? 'border-red-500'
              : 'border-white/10 focus:border-blue-600/50'
          } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className={selectedOption ? '' : 'text-gray-400'}>
            {selectedOption ? (
              <span className="flex items-center gap-2">
                {selectedOption.flag && <span>{selectedOption.flag}</span>}
                {selectedOption.label}
              </span>
            ) : (
              field.placeholder || 'Select...'
            )}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-[rgba(35,29,51,0.95)] backdrop-blur-xl border border-white/10 rounded-xl shadow-xl max-h-60 overflow-hidden">
              {searchable && options.length > 5 && (
                <div className="p-2 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full h-10 pl-10 pr-4 rounded-lg text-white bg-[rgba(26,22,37,0.6)] border border-white/10 focus:border-blue-600/50 focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
              <div className="overflow-y-auto max-h-48">
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${
                        value === option.value ? 'bg-blue-600/20' : ''
                      }`}
                    >
                      {option.flag && <span>{option.flag}</span>}
                      {option.icon && <span>{option.icon}</span>}
                      <span>{option.label}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      {field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};





