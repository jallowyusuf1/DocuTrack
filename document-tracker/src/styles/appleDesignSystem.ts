/**
 * Apple Design System for DocuTrackr
 * Following Apple Human Interface Guidelines exactly
 * Makes the app indistinguishable from native Apple software
 */

export const AppleDesignSystem = {
  // COLORS - Exact Apple System Colors
  colors: {
    light: {
      background: {
        primary: '#FFFFFF',
        secondary: '#F5F5F7',
        tertiary: '#EFEFF4',
        elevated: '#FFFFFF',
      },
      text: {
        primary: '#000000',
        secondary: 'rgba(60, 60, 67, 0.6)',
        tertiary: 'rgba(60, 60, 67, 0.3)',
        quaternary: 'rgba(60, 60, 67, 0.18)',
      },
      separator: {
        opaque: 'rgba(60, 60, 67, 0.29)',
        nonOpaque: 'rgba(60, 60, 67, 0.36)',
      },
      fill: {
        primary: 'rgba(120, 120, 128, 0.2)',
        secondary: 'rgba(120, 120, 128, 0.16)',
        tertiary: 'rgba(118, 118, 128, 0.12)',
        quaternary: 'rgba(116, 116, 128, 0.08)',
      },
      system: {
        blue: '#8B5CF6',
        green: '#34C759',
        indigo: '#5856D6',
        orange: '#FF9500',
        pink: '#FF2D55',
        purple: '#AF52DE',
        red: '#FF3B30',
        teal: '#5AC8FA',
        yellow: '#FFCC00',
      },
      gray: {
        1: '#8E8E93',
        2: '#AEAEB2',
        3: '#C7C7CC',
        4: '#D1D1D6',
        5: '#E5E5EA',
        6: '#F2F2F7',
      },
    },
    dark: {
      background: {
        primary: '#000000',
        secondary: '#1C1C1E',
        tertiary: '#2C2C2E',
        elevated: '#1C1C1E',
      },
      text: {
        primary: '#FFFFFF',
        secondary: 'rgba(235, 235, 245, 0.6)',
        tertiary: 'rgba(235, 235, 245, 0.3)',
        quaternary: 'rgba(235, 235, 245, 0.18)',
      },
      separator: {
        opaque: 'rgba(84, 84, 88, 0.65)',
        nonOpaque: 'rgba(84, 84, 88, 0.60)',
      },
      fill: {
        primary: 'rgba(120, 120, 128, 0.36)',
        secondary: 'rgba(120, 120, 128, 0.32)',
        tertiary: 'rgba(118, 118, 128, 0.24)',
        quaternary: 'rgba(118, 118, 128, 0.18)',
      },
      system: {
        blue: '#9D6EFF',
        green: '#30D158',
        indigo: '#5E5CE6',
        orange: '#FF9F0A',
        pink: '#FF375F',
        purple: '#BF5AF2',
        red: '#FF453A',
        teal: '#64D2FF',
        yellow: '#FFD60A',
      },
      gray: {
        1: '#8E8E93',
        2: '#636366',
        3: '#48484A',
        4: '#3A3A3C',
        5: '#2C2C2E',
        6: '#1C1C1E',
      },
    },
    // Brand colors for DocuTrackr
    brand: {
      purple: {
        light: '#8B5CF6',
        dark: '#BF5AF2',
      },
      purpleSecondary: {
        light: '#A78BFA',
        dark: '#C77DFF',
      },
    },
  },

  // TYPOGRAPHY - SF Pro System
  typography: {
    largeTitle: {
      fontSize: '34px',
      lineHeight: '41px',
      fontWeight: '700',
      letterSpacing: '-0.4px',
    },
    title1: {
      fontSize: '28px',
      lineHeight: '34px',
      fontWeight: '700',
      letterSpacing: '0.36px',
    },
    title2: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: '700',
      letterSpacing: '0.35px',
    },
    title3: {
      fontSize: '20px',
      lineHeight: '25px',
      fontWeight: '600',
      letterSpacing: '0.38px',
    },
    headline: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: '600',
      letterSpacing: '-0.43px',
    },
    body: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: '400',
      letterSpacing: '-0.43px',
    },
    callout: {
      fontSize: '16px',
      lineHeight: '21px',
      fontWeight: '400',
      letterSpacing: '-0.32px',
    },
    subheadline: {
      fontSize: '15px',
      lineHeight: '20px',
      fontWeight: '400',
      letterSpacing: '-0.24px',
    },
    footnote: {
      fontSize: '13px',
      lineHeight: '18px',
      fontWeight: '400',
      letterSpacing: '-0.08px',
    },
    caption1: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '400',
      letterSpacing: '0px',
    },
    caption2: {
      fontSize: '11px',
      lineHeight: '13px',
      fontWeight: '400',
      letterSpacing: '0.06px',
    },
  },

  // SPACING - 4px base unit
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '48px',
    '5xl': '64px',
    '6xl': '80px',
  },

  // BORDER RADIUS
  radius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    xlarge: '24px',
    full: '9999px',
  },

  // SHADOWS
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.08)',
    large: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xlarge: '0 16px 48px rgba(0, 0, 0, 0.16)',
  },

  // GLASS/BLUR EFFECTS
  glass: {
    light: {
      background: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'saturate(180%) blur(40px)',
      border: 'rgba(0, 0, 0, 0.06)',
    },
    dark: {
      background: 'rgba(28, 28, 30, 0.7)',
      backdropFilter: 'saturate(180%) blur(40px)',
      border: 'rgba(255, 255, 255, 0.06)',
    },
    card: {
      light: {
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(40px)',
        border: 'rgba(0, 0, 0, 0.04)',
      },
      dark: {
        background: 'rgba(44, 44, 46, 0.8)',
        backdropFilter: 'blur(40px)',
        border: 'rgba(255, 255, 255, 0.04)',
      },
    },
  },

  // ANIMATIONS
  animations: {
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
    smooth: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1], // Apple's easing curve
    },
    snappy: {
      duration: 0.2,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },

  // BREAKPOINTS
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },

  // Z-INDEX LAYERS
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

// Helper function to get theme-specific color
export const getThemedColor = (
  theme: 'light' | 'dark',
  path: string
): string => {
  const keys = path.split('.');
  let value: any = AppleDesignSystem.colors[theme];

  for (const key of keys) {
    value = value?.[key];
  }

  return value || '';
};

// CSS Variables generator for use in global styles
export const generateCSSVariables = (theme: 'light' | 'dark') => {
  const colors = AppleDesignSystem.colors[theme];

  return {
    // Background colors
    '--bg-primary': colors.background.primary,
    '--bg-secondary': colors.background.secondary,
    '--bg-tertiary': colors.background.tertiary,
    '--bg-elevated': colors.background.elevated,

    // Text colors
    '--text-primary': colors.text.primary,
    '--text-secondary': colors.text.secondary,
    '--text-tertiary': colors.text.tertiary,
    '--text-quaternary': colors.text.quaternary,

    // Separator colors
    '--separator-opaque': colors.separator.opaque,
    '--separator-non-opaque': colors.separator.nonOpaque,

    // Fill colors
    '--fill-primary': colors.fill.primary,
    '--fill-secondary': colors.fill.secondary,
    '--fill-tertiary': colors.fill.tertiary,
    '--fill-quaternary': colors.fill.quaternary,

    // System colors
    '--system-blue': colors.system.blue,
    '--system-green': colors.system.green,
    '--system-indigo': colors.system.indigo,
    '--system-orange': colors.system.orange,
    '--system-pink': colors.system.pink,
    '--system-purple': colors.system.purple,
    '--system-red': colors.system.red,
    '--system-teal': colors.system.teal,
    '--system-yellow': colors.system.yellow,

    // Gray scale
    '--gray-1': colors.gray[1],
    '--gray-2': colors.gray[2],
    '--gray-3': colors.gray[3],
    '--gray-4': colors.gray[4],
    '--gray-5': colors.gray[5],
    '--gray-6': colors.gray[6],
  };
};
