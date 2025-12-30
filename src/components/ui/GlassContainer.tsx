import { forwardRef, type ReactNode, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { getGlassCardStyle, getGlassBackground, type GlassStyleOptions } from '../../utils/glassStyles';
import { prefersReducedMotion } from '../../utils/animations';

interface GlassContainerProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  intensity?: GlassStyleOptions['intensity'];
  blur?: number;
  opacity?: number;
  border?: boolean;
  elevated?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'small' | 'medium' | 'large';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const paddingMap = {
  none: '0',
  small: '12px',
  medium: '20px',
  large: '32px',
};

const roundedMap = {
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  full: '9999px',
};

export const GlassContainer = forwardRef<HTMLDivElement, GlassContainerProps>(
  (
    {
      children,
      className = '',
      style,
      intensity = 'medium',
      blur,
      opacity,
      border = true,
      elevated = false,
      interactive = false,
      onClick,
      padding = 'medium',
      rounded = 'lg',
    },
    ref
  ) => {
    const reduced = prefersReducedMotion();
    const glassStyle = getGlassCardStyle({
      intensity,
      blur,
      opacity,
      border,
      elevated,
      interactive,
    });

    const containerStyle: CSSProperties = {
      ...glassStyle,
      padding: paddingMap[padding],
      borderRadius: roundedMap[rounded],
      cursor: interactive || onClick ? 'pointer' : 'default',
      ...style,
    };

    if (interactive || onClick) {
      return (
        <motion.div
          ref={ref}
          className={className}
          style={containerStyle}
          onClick={onClick}
          whileHover={!reduced ? { y: -2, scale: 1.01 } : undefined}
          whileTap={!reduced ? { scale: 0.98 } : undefined}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={className} style={containerStyle}>
        {children}
      </div>
    );
  }
);

GlassContainer.displayName = 'GlassContainer';

/**
 * Glass Card - Standard card with glass effect
 */
export const GlassCard = forwardRef<HTMLDivElement, Omit<GlassContainerProps, 'rounded'>>(
  (props, ref) => {
    return <GlassContainer {...props} ref={ref} rounded="xl" elevated />;
  }
);

GlassCard.displayName = 'GlassCard';

/**
 * Glass Tile - Subtle glass effect for grid items
 */
export const GlassTile = forwardRef<HTMLDivElement, Omit<GlassContainerProps, 'intensity'>>(
  (props, ref) => {
    return <GlassContainer {...props} ref={ref} intensity="subtle" interactive />;
  }
);

GlassTile.displayName = 'GlassTile';

/**
 * Glass Panel - Elevated glass panel for modals, sidebars
 */
export const GlassPanel = forwardRef<HTMLDivElement, Omit<GlassContainerProps, 'intensity'>>(
  (props, ref) => {
    return <GlassContainer {...props} ref={ref} intensity="extreme" elevated />;
  }
);

GlassPanel.displayName = 'GlassPanel';


