import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { conditionalStorage } from '../utils/sessionStorage';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Validate environment variables
export const validateSupabaseConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!import.meta.env.VITE_SUPABASE_URL) {
    errors.push('VITE_SUPABASE_URL is missing');
  } else if (import.meta.env.VITE_SUPABASE_URL === 'https://placeholder.supabase.co') {
    errors.push('VITE_SUPABASE_URL is using placeholder value');
  }

  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    errors.push('VITE_SUPABASE_ANON_KEY is missing');
  } else if (import.meta.env.VITE_SUPABASE_ANON_KEY === 'placeholder-key') {
    errors.push('VITE_SUPABASE_ANON_KEY is using placeholder value');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Check configuration on load
const configValidation = validateSupabaseConfig();
if (!configValidation.isValid) {
  console.error('❌ Supabase configuration errors:', configValidation.errors);
  console.warn('⚠️ Authentication features will not work until configuration is fixed.');
  console.warn('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

// Singleton pattern to prevent multiple client instances
let supabaseInstance: SupabaseClient | null = null;

export const supabase: SupabaseClient = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Enable session persistence across browser sessions
        persistSession: true,
        // Enable automatic token refresh to maintain sessions
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Use localStorage directly for persistent sessions (fixed logout on refresh)
        storage: window.localStorage,
        storageKey: 'sb-auth-token',
      },
      global: {
        headers: {
          'X-Client-Info': 'docutrack-web',
        },
      },
      db: {
        schema: 'public',
      },
      // Add timeout and retry settings
      realtime: {
        timeout: 30000, // 30 second timeout
        // Suppress non-critical WebSocket errors in production
        logger: import.meta.env.MODE === 'production' ? undefined : console,
      },
    });

    // Suppress console warnings for non-critical errors in production
    if (import.meta.env.MODE === 'production') {
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        const message = args[0];
        // Filter out common non-critical Supabase warnings
        if (
          typeof message === 'string' &&
          (message.includes('WebSocket') ||
           message.includes('realtime') ||
           message.includes('Initial failed to connect') ||
           message.includes('PGRST'))
        ) {
          return; // Suppress these warnings in production
        }
        originalWarn.apply(console, args);
      };
    }
  }
  return supabaseInstance;
})();

