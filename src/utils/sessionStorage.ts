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
  private getStorage(): Storage {
    // Check if "Remember Me" was checked
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    // If rememberMe is false, use sessionStorage (clears on tab close)
    // If rememberMe is true, use localStorage (persists)
    return rememberMe ? localStorage : sessionStorage;
  }

  getItem(key: string): string | null {
    // Try both storages to handle migration
    const sessionValue = sessionStorage.getItem(key);
    const localValue = localStorage.getItem(key);
    
    // If rememberMe is false, prefer sessionStorage
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (!rememberMe) {
      return sessionValue ?? localValue;
    }
    
    return localValue ?? sessionValue;
  }

  setItem(key: string, value: string): void {
    const storage = this.getStorage();
    storage.setItem(key, value);
    
    // If switching to "don't remember", remove from localStorage
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    if (!rememberMe && key.includes('auth')) {
      localStorage.removeItem(key);
    }
  }

  removeItem(key: string): void {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
}

export const conditionalStorage = new ConditionalStorage();

