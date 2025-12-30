import { forwardRef, useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectProps {
  label?: ReactNode;
  options: SelectOption[];
  value?: string;
  onChange?: any; // Accept any to support react-hook-form's ChangeHandler
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  searchable?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  onBlur?: any; // Accept any to support react-hook-form's ChangeHandler
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  ({ label, options, value, onChange, placeholder = 'Select an option', error, disabled, searchable = false, required, className = '', name, onBlur }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const filteredOptions = searchable && searchQuery
      ? options.filter(opt => 
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      setIsOpen(false);
      setSearchQuery('');

      // Handle onChange - support both Controller (value) and register() (event object)
      if (onChange && typeof onChange === 'function') {
        try {
          // Try calling with just the value first (for Controller)
          // This is the most common case and should work
          onChange(optionValue as any);
        } catch (err) {
          // If that fails, try with event object (for register)
          try {
            const syntheticEvent = {
              target: {
                value: optionValue,
                name: name || '',
                type: 'select-one',
              },
              currentTarget: {
                value: optionValue,
                name: name || '',
                type: 'select-one',
              },
            };
            onChange(syntheticEvent as any);
          } catch (eventErr) {
            console.error('Error in Select onChange:', eventErr);
          }
        }
      }

      // Call onBlur if provided
      if (onBlur && typeof onBlur === 'function') {
        try {
          // Try calling without arguments first (for Controller)
          onBlur();
        } catch {
          // If that fails, try with event object (for register)
          try {
            const blurEvent = {
              target: {
                name: name || '',
                value: optionValue,
              },
              currentTarget: {
                name: name || '',
                value: optionValue,
              },
            };
            onBlur(blurEvent as any);
          } catch (blurErr) {
            console.error('Error in Select onBlur:', blurErr);
          }
        }
      }
    };

    if (disabled) {
      return (
        <div className="w-full">
          {label && (
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          <div className="h-[52px] px-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center text-gray-400 cursor-not-allowed">
            {selectedOption?.label || placeholder}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className={`w-full ${className}`}>
          {label && (
            <label className="block text-sm font-semibold text-white mb-3 mt-1">
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </label>
          )}
          <button
            ref={ref}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!disabled) {
                setIsOpen(true);
              }
            }}
            className={`
              w-full h-[52px] px-4 rounded-xl
              flex items-center justify-between
              text-[15px] text-left
              transition-all duration-200
              cursor-pointer
              ${error 
                ? 'border-2 border-red-500' 
                : 'border border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400'}
            `}
            style={error ? {
              background: '#FFFFFF',
              color: '#000000',
            } : {
              background: '#FFFFFF',
              color: selectedOption ? '#000000' : 'rgba(0, 0, 0, 0.6)',
            }}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            disabled={disabled}
          >
            <span className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
              {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
              <span className="truncate" style={{
                color: selectedOption ? '#000000' : 'rgba(0, 0, 0, 0.6)',
              }}>
                {selectedOption?.label || placeholder}
              </span>
            </span>
            <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#2563EB' }} />
          </button>
          {error && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-400 animate-slide-down-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Options Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end bg-black/60 backdrop-blur-md" onClick={() => setIsOpen(false)}>
            <div
              ref={modalRef}
              className="rounded-t-[32px] w-full max-h-[80vh] overflow-hidden flex flex-col relative z-[101]"
              style={{
                background: 'rgba(42, 38, 64, 0.85)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div 
                  className="w-10 h-1 rounded-full"
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                  }}
                />
              </div>

              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">{label || 'Select an option'}</h3>
              </div>

              {/* Search bar */}
              {searchable && (
                <div className="px-6 py-4 border-b border-white/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#60A5FA' }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full h-10 pl-10 pr-10 rounded-lg text-sm text-white placeholder:text-glass-secondary focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      style={{
                        background: 'rgba(35, 29, 51, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                        style={{ color: '#60A5FA' }}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Options list */}
              <div className="flex-1 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="px-6 py-8 text-center" style={{ color: '#60A5FA' }}>
                    No options found
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelect(option.value);
                      }}
                      className={`
                        w-full h-14 px-6 flex items-center justify-between
                        transition-all duration-200
                        ${value === option.value ? '' : 'hover:bg-white/5'}
                      `}
                      style={value === option.value ? {
                        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(30, 64, 175, 0.3))',
                        borderLeft: '3px solid rgba(37, 99, 235, 0.5)',
                      } : {
                        background: 'transparent',
                      }}
                    >
                      <span className="flex items-center gap-3 flex-1 min-w-0">
                        {option.icon && <span className="flex-shrink-0" style={{ color: '#60A5FA' }}>{option.icon}</span>}
                        <span className="text-white truncate">{option.label}</span>
                      </span>
                      {value === option.value && (
                        <Check className="w-5 h-5 flex-shrink-0" style={{ color: '#60A5FA' }} />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

Select.displayName = 'Select';

export default Select;
