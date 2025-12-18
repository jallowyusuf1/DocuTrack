import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme safely
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem('app_theme') as Theme;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
  } catch (e) {
    // If localStorage fails, just return default
  }
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Use hooks directly - React should always be ready in a proper component
  // If this fails, it indicates a build/cache issue that needs fixing
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      // Apply theme to document
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('app_theme', theme);
      }
    } catch (e) {
      console.error('Failed to apply theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

