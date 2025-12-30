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
    const [needsScroll, setNeedsScroll] = useState(false);

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
      if (textareaRef.current) {
        setNeedsScroll(textareaRef.current.scrollHeight > 300);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const text = e.target.value;
      setCharacterCount(text.length);
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-white mb-3 mt-1">
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
              w-full min-h-[100px] max-h-[300px] px-4 py-3 rounded-xl
              text-[15px] text-white resize-none
              transition-all duration-200
              ${error
                ? 'border-2 border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                : 'border border-white/10 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
              }
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
              placeholder:text-glass-secondary
              ${className}
            `}
            style={{
              background: error 
                ? 'rgba(239, 68, 68, 0.1)' 
                : 'rgba(35, 29, 51, 0.6)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              overflowY: needsScroll ? 'auto' : 'hidden',
            }}
            {...props}
          />
          {showCounter && maxLength && (
            <div className="absolute bottom-3 right-3 text-xs text-glass-secondary">
              {characterCount}/{maxLength}
            </div>
          )}
        </div>
        {error && (
          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-400 animate-slide-down-fade-in">
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
