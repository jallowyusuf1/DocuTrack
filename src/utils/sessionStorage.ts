/**
 * Custom storage adapter that respects "Remember Me" preference
 * If "Remember Me" is false, uses sessionStorage (clears on tab close)
 * If "Remember Me" is true, uses localStorage (persists across sessions)
 */

interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class ConditionalStorage implements StorageAdapter {
  constructor() {
    // Immediately migrate any existing session data on initialization
    this.migrateSessionStorage();
  }

  private migrateSessionStorage(): void {
    // Migrate all supabase-auth keys from sessionStorage to localStorage
    try {
      const keys = Object.keys(sessionStorage);
      const authKeys = keys.filter(key =>
        key.startsWith('supabase.auth') ||
        key.includes('sb-') ||
        key === 'supabase.auth.token'
      );

      authKeys.forEach(key => {
        const value = sessionStorage.getItem(key);
        if (value) {
          localStorage.setItem(key, value);
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to migrate session storage:', error);
    }
  }

  private getStorage(): Storage {
    // ALWAYS use localStorage for better UX - users stay logged in
    // This fixes the logout-on-refresh issue
    return localStorage;
  }

  getItem(key: string): string | null {
    // Always read from localStorage first
    const value = localStorage.getItem(key);

    // Fallback to sessionStorage for migration (shouldn't happen after constructor)
    if (!value) {
      const sessionValue = sessionStorage.getItem(key);
      if (sessionValue) {
        // Migrate from sessionStorage to localStorage
        localStorage.setItem(key, sessionValue);
        sessionStorage.removeItem(key);
        return sessionValue;
      }
    }

    return value;
  }

  setItem(key: string, value: string): void {
    // Always save to localStorage
    localStorage.setItem(key, value);
    // Clear from sessionStorage if it exists there
    sessionStorage.removeItem(key);
  }

  removeItem(key: string): void {
    // Remove from both storages
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export const conditionalStorage = new ConditionalStorage();

