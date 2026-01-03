import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Get initial theme safely - Apply immediately before React renders
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    // Check stored preference first
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') {
      // Apply immediately to prevent flash
      document.documentElement.setAttribute('data-theme', stored);
      return stored as Theme;
    }
    // Check system preference
    if (window.matchMedia) {
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      // Apply immediately
      document.documentElement.setAttribute('data-theme', systemPreference);
      return systemPreference;
    }
  } catch (e) {
    // If localStorage fails, just return default
  }
  // Default to dark and apply immediately
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  return 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      // Apply theme to document immediately
      if (typeof document !== 'undefined') {
        if (document.documentElement) {
          document.documentElement.setAttribute('data-theme', theme);
        }
        if (document.body) {
          document.body.setAttribute('data-theme', theme);
        }
      }
      // Save to localStorage with standard key
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('theme', theme);
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

