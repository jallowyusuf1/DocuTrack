import { HTMLAttributes, forwardRef } from 'react';

interface AppleCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
}

/**
 * Apple-style Card Component
 * Follows Apple's card design with proper shadows and borders
 */
export const AppleCard = forwardRef<HTMLDivElement, AppleCardProps>(
  (
    {
      variant = 'elevated',
      padding = 'medium',
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      rounded-2xl transition-all duration-300
      ${hoverable ? 'cursor-pointer hover:-translate-y-1 active:translate-y-0' : ''}
      ${className}
    `;

    const variantStyles = {
      elevated: `
        bg-white dark:bg-[#1C1C1E]
        shadow-[0_2px_8px_rgba(0,0,0,0.08)]
        hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)]
        border border-black/[0.04] dark:border-white/[0.04]
      `,
      filled: `
        bg-[#F5F5F7] dark:bg-[#2C2C2E]
        border border-transparent
      `,
      glass: `
        bg-white/70 dark:bg-[rgba(28,28,30,0.7)]
        backdrop-blur-[40px] backdrop-saturate-[180%]
        border border-black/[0.06] dark:border-white/[0.06]
        shadow-[0_4px_16px_rgba(0,0,0,0.08)]
      `,
    };

    const paddingStyles = {
      none: '',
      small: 'p-3',
      medium: 'p-4 md:p-6',
      large: 'p-6 md:p-8',
    };

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AppleCard.displayName = 'AppleCard';
