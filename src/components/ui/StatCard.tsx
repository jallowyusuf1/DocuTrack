import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { prefersReducedMotion } from '../../utils/animations';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  status?: 'total' | 'valid' | 'expiring' | 'expired';
  onClick?: () => void;
  className?: string;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  status = 'total',
  onClick,
  className = '',
}: StatCardProps) {
  const { theme } = useTheme();
  const reduced = prefersReducedMotion();
  const isLight = theme === 'light';

  const getStatusStyles = () => {
    switch (status) {
      case 'total':
        return {
          borderColor: isLight ? 'rgba(59, 130, 246, 0.3)' : 'rgba(96, 165, 250, 0.3)',
          iconColor: isLight ? '#3B82F6' : '#60A5FA',
          glowColor: isLight ? 'rgba(59, 130, 246, 0.2)' : 'rgba(96, 165, 250, 0.2)',
        };
      case 'valid':
        return {
          borderColor: isLight ? 'rgba(16, 185, 129, 0.3)' : 'rgba(52, 211, 153, 0.3)',
          iconColor: isLight ? '#10B981' : '#34D399',
          glowColor: isLight ? 'rgba(16, 185, 129, 0.2)' : 'rgba(52, 211, 153, 0.2)',
        };
      case 'expiring':
        return {
          borderColor: isLight ? 'rgba(249, 115, 22, 0.3)' : 'rgba(251, 146, 60, 0.3)',
          iconColor: isLight ? '#F97316' : '#FB923C',
          glowColor: isLight ? 'rgba(249, 115, 22, 0.2)' : 'rgba(251, 146, 60, 0.2)',
        };
      case 'expired':
        return {
          borderColor: isLight ? 'rgba(239, 68, 68, 0.3)' : 'rgba(248, 113, 113, 0.3)',
          iconColor: isLight ? '#EF4444' : '#F87171',
          glowColor: isLight ? 'rgba(239, 68, 68, 0.2)' : 'rgba(248, 113, 113, 0.2)',
        };
    }
  };

  const statusStyles = getStatusStyles();

  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      whileHover={reduced || !onClick ? undefined : { y: -4, scale: 1.02 }}
      whileTap={reduced || !onClick ? undefined : { scale: 0.98 }}
      onClick={onClick}
      className={`glass-card ${className}`}
      style={{
        background: isLight
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(26, 26, 26, 0.8)',
        backdropFilter: 'blur(40px) saturate(120%)',
        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
        border: `2px solid ${statusStyles.borderColor}`,
        borderRadius: '20px',
        padding: '24px',
        boxShadow: isLight
          ? `0 10px 40px rgba(0, 0, 0, 0.1), 0 0 30px ${statusStyles.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.5)`
          : `0 10px 40px rgba(0, 0, 0, 0.8), 0 0 30px ${statusStyles.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 300ms ease',
      }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{
            background: isLight
              ? `${statusStyles.iconColor}15`
              : `${statusStyles.iconColor}20`,
            border: `1px solid ${statusStyles.borderColor}`,
          }}
        >
          <Icon
            className="w-6 h-6"
            style={{ color: statusStyles.iconColor }}
          />
        </div>

        {/* Value */}
        <div
          className="text-6xl font-bold mb-2"
          style={{
            color: isLight ? '#000000' : '#FFFFFF',
            fontWeight: 800,
          }}
        >
          {value}
        </div>

        {/* Label */}
        <div
          className="text-base font-medium"
          style={{
            color: isLight ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {label}
        </div>
      </div>
    </Component>
  );
}

