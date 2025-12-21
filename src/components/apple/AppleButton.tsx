import { ButtonHTMLAttributes, forwardRef } from 'react';
import { AppleDesignSystem } from '../../styles/appleDesignSystem';

interface AppleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

/**
 * Apple-style Button Component
 * Follows Apple Human Interface Guidelines exactly
 */
export const AppleButton = forwardRef<HTMLButtonElement, AppleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      icon,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-40 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `;

    const variantStyles = {
      primary: `
        bg-[--system-blue] text-white
        hover:brightness-110 active:brightness-90
        focus:ring-[--system-blue]
        dark:bg-[--system-blue]
      `,
      secondary: `
        bg-[--fill-tertiary] text-[--text-primary]
        hover:bg-[--fill-secondary] active:bg-[--fill-primary]
        focus:ring-[--fill-primary]
      `,
      tertiary: `
        bg-transparent text-[--system-blue]
        hover:bg-[--fill-quaternary] active:bg-[--fill-tertiary]
        focus:ring-[--system-blue]
      `,
      destructive: `
        bg-[--system-red] text-white
        hover:brightness-110 active:brightness-90
        focus:ring-[--system-red]
      `,
    };

    const sizeStyles = {
      small: 'px-3 py-1.5 text-[13px] rounded-lg min-h-[28px]',
      medium: 'px-4 py-2 text-[17px] rounded-xl min-h-[44px]',
      large: 'px-6 py-3 text-[17px] rounded-xl min-h-[50px]',
    };

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
        `}
        disabled={disabled}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </button>
    );
  }
);

AppleButton.displayName = 'AppleButton';
