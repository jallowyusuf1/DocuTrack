import { InputHTMLAttributes, forwardRef } from 'react';

interface AppleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

/**
 * Apple-style Input Component
 * Follows iOS/macOS input design patterns
 */
export const AppleInput = forwardRef<HTMLInputElement, AppleInputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[15px] font-medium text-[--text-primary] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[--text-tertiary]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-3 text-[17px]
              bg-[--fill-tertiary]
              text-[--text-primary]
              border border-transparent
              rounded-xl
              transition-all duration-200
              placeholder:text-[--text-tertiary]
              focus:outline-none
              focus:bg-white dark:focus:bg-[#2C2C2E]
              focus:border-[--system-blue]
              focus:ring-4 focus:ring-[--system-blue]/10
              disabled:opacity-40 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-[--system-red] focus:border-[--system-red] focus:ring-[--system-red]/10' : ''}
              ${className}
            `}
            disabled={disabled}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-[13px] text-[--system-red]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-[13px] text-[--text-secondary]">{helperText}</p>
        )}
      </div>
    );
  }
);

AppleInput.displayName = 'AppleInput';
