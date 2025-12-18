import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
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

