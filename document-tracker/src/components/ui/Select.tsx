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

      if (onChange) {
        // Create a proper event-like object for react-hook-form
        // React-hook-form's register() returns onChange that expects { target: { value, name } }
        const syntheticEvent = {
          target: {
            value: optionValue,
            name: name || '',
            type: 'select-one',
          } as HTMLSelectElement,
          currentTarget: {
            value: optionValue,
            name: name || '',
            type: 'select-one',
          } as HTMLSelectElement,
          type: 'change',
          preventDefault: () => {},
          stopPropagation: () => {},
          nativeEvent: new Event('change'),
          bubbles: true,
          cancelable: true,
          defaultPrevented: false,
          eventPhase: 0,
          isTrusted: true,
          timeStamp: Date.now(),
        };

        // Call onChange synchronously - react-hook-form handles it properly
        try {
          (onChange as any)(syntheticEvent);
        } catch (err) {
          console.error('Error calling onChange:', err);
        }
      }

      onBlur?.();
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
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
              w-full h-[52px] px-4 bg-white border rounded-xl
              flex items-center justify-between
              text-[15px] text-left
              transition-all duration-200
              cursor-pointer
              ${error 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20'
              }
              ${selectedOption ? 'text-gray-900' : 'text-gray-400'}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300 active:border-blue-600'}
            `}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            disabled={disabled}
          >
            <span className="flex items-center gap-2 flex-1 min-w-0 pointer-events-none">
              {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
              <span className="truncate">{selectedOption?.label || placeholder}</span>
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform pointer-events-none ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {error && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-red-600 animate-slide-down-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Options Modal */}
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
            <div
              ref={modalRef}
              className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-hidden flex flex-col animate-slide-up relative z-[101]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">{label || 'Select an option'}</h3>
              </div>

              {/* Search bar */}
              {searchable && (
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full h-10 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  <div className="px-6 py-8 text-center text-gray-500">
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
                        hover:bg-gray-50 active:bg-gray-100
                        transition-colors
                        ${value === option.value ? 'bg-blue-50' : ''}
                      `}
                    >
                      <span className="flex items-center gap-3 flex-1 min-w-0">
                        {option.icon && <span className="flex-shrink-0 text-gray-600">{option.icon}</span>}
                        <span className="text-gray-900 truncate">{option.label}</span>
                      </span>
                      {value === option.value && (
                        <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
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
