import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium';
  icon?: ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  icon,
  className = '',
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold text-white rounded-full';
  
  const variantStyles = {
    default: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-orange-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const sizeStyles = {
    small: 'px-2 py-0.5 text-[10px] gap-1',
    medium: 'px-3 py-1.5 text-xs gap-1.5',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}

