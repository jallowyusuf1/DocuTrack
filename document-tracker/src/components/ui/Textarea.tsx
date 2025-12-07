import { forwardRef, useState, useEffect, useRef } from 'react';
import type { TextareaHTMLAttributes, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  error?: string;
  maxLength?: number;
  showCounter?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, maxLength, showCounter = true, className = '', value, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [characterCount, setCharacterCount] = useState(0);

    // Combine refs
    const combinedRef = (node: HTMLTextAreaElement) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
      }
      textareaRef.current = node;
    };

    useEffect(() => {
      const text = typeof value === 'string' ? value : '';
      setCharacterCount(text.length);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setCharacterCount(text.length);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <textarea
            ref={combinedRef}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            className={`
              w-full min-h-[100px] max-h-[300px] px-4 py-3 bg-white border rounded-xl
              text-[15px] text-gray-900 resize-none
              transition-all duration-200
              ${error 
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
              }
              ${props.disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
              placeholder:text-gray-400
              ${className}
            `}
            style={{
              overflowY: textareaRef.current && textareaRef.current.scrollHeight > 300 ? 'auto' : 'hidden',
            }}
            {...props}
          />
          {showCounter && maxLength && (
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {characterCount}/{maxLength}
            </div>
          )}
        </div>
        {error && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-600 animate-slide-down-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Textarea;
