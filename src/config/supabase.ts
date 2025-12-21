import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Missing Supabase environment variables. Please add them to your .env file.');
  console.warn('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required for full functionality.');
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
    });
  }
  return supabaseInstance;
})();

