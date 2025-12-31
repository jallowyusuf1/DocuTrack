/**
 * Glass Morphism Style Utilities
 * iOS 18 / macOS 15 Style Frosted Glass
 * 
 * Provides consistent glass styling throughout the app
 */

export interface GlassStyleOptions {
  intensity?: 'subtle' | 'medium' | 'strong' | 'extreme';
  blur?: number;
  opacity?: number;
  border?: boolean;
  elevated?: boolean;
  interactive?: boolean;
}

/**
 * Get glass background style
 */
export function getGlassBackground(options: GlassStyleOptions = {}) {
  const {
    intensity = 'medium',
    blur,
    opacity,
    border = true,
    elevated = false,
  } = options;

  const intensityMap = {
    subtle: {
      bg: 'rgba(255, 255, 255, 0.04)',
      blur: blur || 20,
      border: 'rgba(255, 255, 255, 0.08)',
    },
    medium: {
      bg: 'rgba(255, 255, 255, 0.08)',
      blur: blur || 40,
      border: 'rgba(255, 255, 255, 0.12)',
    },
    strong: {
      bg: 'rgba(255, 255, 255, 0.12)',
      blur: blur || 60,
      border: 'rgba(255, 255, 255, 0.16)',
    },
    extreme: {
      bg: 'rgba(255, 255, 255, 0.16)',
      blur: blur || 80,
      border: 'rgba(255, 255, 255, 0.20)',
    },
  };

  const config = intensityMap[intensity];
  const bgOpacity = opacity !== undefined ? opacity : parseFloat(config.bg.match(/[\d.]+/)?.[0] || '0.08');

  return {
    background: config.bg.replace(/[\d.]+/, bgOpacity.toString()),
    backdropFilter: `blur(${config.blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${config.blur}px) saturate(180%)`,
    border: border ? `1px solid ${config.border}` : 'none',
    boxShadow: elevated
      ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      : '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
  };
}

/**
 * Get glass card style (for containers)
 */
export function getGlassCardStyle(options: GlassStyleOptions = {}) {
  const baseStyle = getGlassBackground({
    ...options,
    elevated: options.elevated ?? true,
  });

  return {
    ...baseStyle,
    borderRadius: '24px',
    padding: '20px',
  };
}

/**
 * Get glass button style
 */
export function getGlassButtonStyle(variant: 'primary' | 'secondary' | 'ghost' = 'primary') {
  const base = {
    borderRadius: '16px',
    padding: '12px 24px',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    border: 'none',
    cursor: 'pointer',
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(109, 40, 217, 0.9))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        color: '#FFFFFF',
        boxShadow: '0 4px 16px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
      };
    case 'secondary':
      return {
        ...base,
        ...getGlassBackground({ intensity: 'medium' }),
        color: '#FFFFFF',
      };
    case 'ghost':
      return {
        ...base,
        background: 'rgba(255, 255, 255, 0.06)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#FFFFFF',
      };
    default:
      return base;
  }
}

/**
 * Get glass input style
 */
export function getGlassInputStyle() {
  return {
    ...getGlassBackground({ intensity: 'medium', border: true }),
    borderRadius: '16px',
    padding: '14px 16px',
    fontSize: '16px',
    color: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.2s ease',
  };
}

/**
 * Get glass modal backdrop style
 */
export function getGlassModalBackdropStyle() {
  return {
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };
}

/**
 * Get glass modal style
 */
export function getGlassModalStyle() {
  return {
    ...getGlassBackground({ intensity: 'extreme', elevated: true }),
    borderRadius: '28px',
    padding: '32px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  };
}

/**
 * Get glass navigation style
 */
export function getGlassNavStyle() {
  return {
    ...getGlassBackground({ intensity: 'strong', border: false }),
    borderRadius: '0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '16px 20px',
  };
}

/**
 * Get glass avatar style
 */
export function getGlassAvatarStyle(size: number = 80) {
  return {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
}

/**
 * Get glass icon button style
 */
export function getGlassIconButtonStyle() {
  return {
    ...getGlassBackground({ intensity: 'medium' }),
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };
}

/**
 * Get glass list item style
 */
export function getGlassListItemStyle() {
  return {
    ...getGlassBackground({ intensity: 'subtle', border: false }),
    borderRadius: '16px',
    padding: '16px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
  };
}

/**
 * Get glass badge style
 */
export function getGlassBadgeStyle(variant: 'default' | 'success' | 'warning' | 'error' = 'default') {
  const variants = {
    default: {
      background: 'rgba(255, 255, 255, 0.1)',
      border: 'rgba(255, 255, 255, 0.2)',
      color: '#FFFFFF',
    },
    success: {
      background: 'rgba(34, 197, 94, 0.2)',
      border: 'rgba(34, 197, 94, 0.4)',
      color: '#86EFAC',
    },
    warning: {
      background: 'rgba(251, 191, 36, 0.2)',
      border: 'rgba(251, 191, 36, 0.4)',
      color: '#FDE047',
    },
    error: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: 'rgba(239, 68, 68, 0.4)',
      color: '#FCA5A5',
    },
  };

  const config = variants[variant];

  return {
    ...getGlassBackground({ intensity: 'subtle' }),
    ...config,
    borderRadius: '12px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  };
}

/**
 * Get glass divider style
 */
export function getGlassDividerStyle() {
  return {
    height: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
    margin: '16px 0',
  };
}

/**
 * Get glass hover effect style
 */
export function getGlassHoverStyle() {
  return {
    transition: 'all 0.2s ease',
    ':hover': {
      background: 'rgba(255, 255, 255, 0.12)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
    },
  };
}

/**
 * Get glass active/pressed style
 */
export function getGlassActiveStyle() {
  return {
    transform: 'scale(0.98)',
    background: 'rgba(255, 255, 255, 0.14)',
  };
}

/**
 * Get glass focus ring style
 */
export function getGlassFocusRingStyle() {
  return {
    outline: 'none',
    boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.3)',
  };
}

/**
 * Get glass gradient background (for page backgrounds)
 */
export function getGlassGradientBackground() {
  return {
    background: 'linear-gradient(135deg, #0A0118 0%, #1A0B2E 50%, #2D1B4E 100%)',
    minHeight: '100vh',
    position: 'relative' as const,
  };
}

/**
 * Get glass overlay style (for modals, dropdowns)
 */
export function getGlassOverlayStyle() {
  return {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 50,
  };
}




