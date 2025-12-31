import React from 'react';

interface GlassActionButtonProps {
  icon: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-9 h-9',
  md: 'w-10 h-10 md:w-11 md:h-11',
  lg: 'w-12 h-12',
};

export const GlassActionButton: React.FC<GlassActionButtonProps> = ({
  icon,
  onClick,
  className = '',
  size = 'md',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-black/5 dark:bg-white/5
        border border-black/10 dark:border-white/10
        backdrop-blur-sm
        flex items-center justify-center
        transition-all duration-200
        hover:bg-blue-500/10 hover:border-blue-500/30
        active:scale-95
        ${className}
      `}
    >
      {icon}
    </button>
  );
};
