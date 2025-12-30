import { forwardRef, type InputHTMLAttributes } from 'react';
import { getGlassInputStyle } from '../../utils/glassStyles';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className = '', error, style, ...props }, ref) => {
    const baseStyle = getGlassInputStyle();

    return (
      <input
        ref={ref}
        className={className}
        style={{
          ...baseStyle,
          borderColor: error ? 'rgba(239, 68, 68, 0.5)' : baseStyle.border,
          boxShadow: error
            ? '0 0 0 4px rgba(239, 68, 68, 0.2)'
            : baseStyle.boxShadow,
          ...style,
        }}
        {...props}
      />
    );
  }
);

GlassInput.displayName = 'GlassInput';
