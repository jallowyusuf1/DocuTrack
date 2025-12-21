import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
        // Use localStorage for persistent sessions across browser restarts
        storage: window.localStorage,
        storageKey: 'supabase.auth.token',
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
      },
    });
  }
  return supabaseInstance;
})();

