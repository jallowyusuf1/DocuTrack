import { forwardRef, InputHTMLAttributes } from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, success, icon, className = '', ...props }, ref) => {
    const isDark = true;

    return (
      <div className="w-full">
        {label && (
          <label
            className="block mb-2 text-sm font-medium"
            style={{
              color: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
            }}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{
                color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
              }}
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-xl px-4 py-3.5 text-base transition-all ${
              icon ? 'pl-12' : ''
            } ${error ? 'border-red-500' : ''} ${success ? 'border-green-500' : ''} ${className}`}
            style={{
              background: isDark
                ? 'rgba(40, 40, 40, 0.6)'
                : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: error
                ? '1px solid rgba(239, 68, 68, 0.5)'
                : success
                  ? '1px solid rgba(16, 185, 129, 0.5)'
                  : isDark
                    ? '1px solid rgba(255, 255, 255, 0.15)'
                    : '1px solid rgba(0, 0, 0, 0.1)',
              color: isDark ? '#FFFFFF' : '#000000',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3B82F6';
              e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = error
                ? 'rgba(239, 68, 68, 0.5)'
                : success
                  ? 'rgba(16, 185, 129, 0.5)'
                  : isDark
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(0, 0, 0, 0.1)';
              e.target.style.boxShadow = 'none';
            }}
            {...props}
          />
          {success && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Check className="w-5 h-5 text-green-500" />
            </div>
          )}
          {error && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export default GlassInput;

