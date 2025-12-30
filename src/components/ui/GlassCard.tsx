import React from 'react';

export type GlassCardVariant = 'primary' | 'elevated' | 'subtle';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: GlassCardVariant;
  className?: string;
  onClick?: () => void;
  animate?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  animate = false,
}) => {
  const baseClasses = 'p-6 transition-all duration-300';

  const variantClasses = {
    primary: 'glass-card-primary',
    elevated: 'glass-card-elevated',
    subtle: 'glass-card-subtle',
  };

  const animationClasses = animate ? 'hover:scale-[1.02] active:scale-[0.98]' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface GlassCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const GlassCardHeader: React.FC<GlassCardHeaderProps> = ({
  children,
  className = '',
  icon,
}) => {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className}`}>
      {icon && <div className="text-primary-blue">{icon}</div>}
      <h3 className="text-xl font-semibold text-white">{children}</h3>
    </div>
  );
};

interface GlassCardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardBody: React.FC<GlassCardBodyProps> = ({
  children,
  className = '',
}) => {
  return <div className={`text-text-secondary ${className}`}>{children}</div>;
};

interface GlassCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCardFooter: React.FC<GlassCardFooterProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`mt-4 pt-4 border-t border-glass-border ${className}`}>
      {children}
    </div>
  );
};
