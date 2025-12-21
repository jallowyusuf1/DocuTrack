/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
      },
      colors: {
        // Glass morphism color palette
        'primary-bg': '#1A1625',
        'secondary-bg': '#231D33',
        'card-bg': '#2A2640',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        'glass-border-strong': 'rgba(255, 255, 255, 0.2)',

        // Purple accent colors
        'primary-purple': '#8B5CF6',
        'light-purple': '#A78BFA',
        'dark-purple': '#6D28D9',
        'purple-glow': 'rgba(139, 92, 246, 0.3)',

        // Text colors
        'text-primary': '#FFFFFF',
        'text-secondary': '#C7C3D9',
        'text-disabled': '#6B667E',

        // Existing color palettes (kept for compatibility)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        red: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        yellow: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        green: {
          500: '#10B981',
        },
      },
      backdropBlur: {
        'glass': '20px',
        'glass-sm': '15px',
        'glass-lg': '25px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-inner': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-full': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-elevated': '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(139, 92, 246, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.15)',
        'glass-subtle': '0 4px 16px rgba(0, 0, 0, 0.3)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-purple-strong': '0 0 40px rgba(139, 92, 246, 0.7)',
        'button-primary': '0 4px 20px rgba(139, 92, 246, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
        'button-primary-hover': '0 6px 30px rgba(139, 92, 246, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
        'button-secondary': '0 4px 16px rgba(0, 0, 0, 0.3)',
      },
      borderRadius: {
        'glass': '20px',
        'glass-sm': '16px',
        'glass-lg': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(42, 38, 64, 0.7) 0%, rgba(42, 38, 64, 0.5) 100%)',
        'gradient-glass-elevated': 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(42, 38, 64, 0.7) 100%)',
        'gradient-app-bg': 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 15s ease infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.7)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
          },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}

