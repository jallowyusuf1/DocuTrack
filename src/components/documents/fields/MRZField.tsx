import React, { useState } from 'react';
import { Scan } from 'lucide-react';
import type { FieldDefinition } from '../../../types';
import { parseMRZ } from '../../../utils/fieldCalculations';

interface MRZFieldProps {
  field: FieldDefinition;
  value: string;
  onChange: (value: string) => void;
  onParse?: (parsedData: Record<string, string>) => void;
  error?: string;
  disabled?: boolean;
}

export const MRZField: React.FC<MRZFieldProps> = ({
  field,
  value,
  onChange,
  onParse,
  error,
  disabled = false,
}) => {
  const [showParseButton, setShowParseButton] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    setShowParseButton(val.length >= 44);
  };

  const handleParse = () => {
    if (!value || value.length < 44) return;

    const parsed = parseMRZ(value);
    if (parsed && onParse) {
      onParse(parsed);
      setShowParseButton(false);
    }
  };

  const lines = value.split('\n').filter(l => l.trim());
  const lineCount = lines.length;

  return (
    <div className="space-y-2">
      <label
        htmlFor={field.field_key}
        className="block text-sm font-medium text-white"
      >
        {field.label}
        {field.validation_rules?.required && (
          <span className="text-red-400 ml-1">*</span>
        )}
      </label>
      {field.description && (
        <p className="text-xs text-gray-400">{field.description}</p>
      )}
      <div className="relative">
        <textarea
          id={field.field_key}
          value={value || ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Paste MRZ code here (3 lines, 44 characters each)"
          rows={3}
          className={`w-full px-4 py-3 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all resize-none font-mono text-sm ${
            error
              ? 'border-red-500'
              : 'border-white/10 focus:border-blue-600/50'
          } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        />
        {showParseButton && (
          <button
            type="button"
            onClick={handleParse}
            className="absolute top-2 right-2 p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 transition-colors"
            title="Parse MRZ and auto-fill fields"
          >
            <Scan className="w-4 h-4 text-blue-400" />
          </button>
        )}
      </div>
      <div className="flex justify-between items-center">
        {error ? (
          <p className="text-red-400 text-sm">{error}</p>
        ) : (
          <p className="text-xs text-gray-400">
            {lineCount} line{lineCount !== 1 ? 's' : ''} entered
          </p>
        )}
        {value && value.length >= 44 && !error && (
          <p className="text-xs text-green-400">Ready to parse</p>
        )}
      </div>
      {field.help_text && !error && (
        <p className="text-xs text-gray-400">{field.help_text}</p>
      )}
    </div>
  );
};





