import { supabase } from '../config/supabase';
import { withRetry, isNetworkError, getNetworkErrorMessage, isOnline } from '../utils/networkUtils';
import { documentLockService } from './documentLockService';
import { idleSecurityService } from './idleSecurityService';

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  accountRole?: 'user' | 'parent';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  date_of_birth?: string | null;
  age_years?: number | null;
  account_role?: 'user' | 'parent' | 'child' | null;
  created_at: string;
  updated_at: string;
}

// Helper function to add timeout to promises
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    })
  ]);
}

// Check if user is online before making requests
function ensureOnline(): void {
  if (!isOnline()) {
    throw new Error('You are offline. Please check your internet connection and try again.');
  }
}

export const authService = {
  // Sign up new user
  async signup({ email, password, fullName, dateOfBirth, accountRole = 'user' }: SignupData) {
    // Check online status first
    ensureOnline();

    try {
      // Create auth user with retry logic for network errors
      const { data: authData, error: authError } = await withRetry(
        () => supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              date_of_birth: dateOfBirth,
              account_role: accountRole,
            },
          },
        }),
        {
          maxRetries: 2,
          initialDelay: 1000,
          onRetry: (error, attempt) => {
            console.log(`Signup attempt ${attempt} failed, retrying...`, error);
          },
        }
      );

      if (authError) {
        // If it's a network error, provide helpful message
        if (isNetworkError(authError)) {
          throw new Error(getNetworkErrorMessage(authError));
        }
        throw authError;
      }
      if (!authData.user) throw new Error('Failed to create user');

    // Set the session immediately if we have one to ensure RLS policies work
    if (authData.session) {
      await supabase.auth.setSession(authData.session);
    }

    // Create or update user profile - ensure data is saved to Supabase
    let profileData = null;
    
    if (authData.session) {
      // We have a session, so we can create/update the profile immediately
      // First, check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      
      if (existingProfile) {
        // Profile exists, update it with the signup data
        const { data: updatedProfile, error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            full_name: fullName, 
            date_of_birth: dateOfBirth, 
            account_role: accountRole,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', authData.user.id)
          .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at')
          .single();
        
        if (!updateError && updatedProfile) {
          profileData = updatedProfile;
        } else {
          // Update failed, use existing profile
          profileData = existingProfile;
        }
      } else {
        // Profile doesn't exist, create it
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            full_name: fullName,
            date_of_birth: dateOfBirth,
            account_role: accountRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at')
          .single();
        
        if (!createError && newProfile) {
          profileData = newProfile;
        } else {
          // Create failed, return placeholder but log error
          console.error('Failed to create user profile:', createError);
          profileData = {
            id: '',
            user_id: authData.user.id,
            full_name: fullName,
            date_of_birth: dateOfBirth,
            age_years: null,
            account_role: accountRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      }
    } else {
      // No session (email confirmation required)
      // We can't create the profile yet due to RLS, but store metadata
      // Profile will be created/updated on first login
      profileData = {
        id: '',
        user_id: authData.user.id,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        age_years: null,
        account_role: accountRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

      return {
        user: authData.user,
        session: authData.session,
        profile: profileData,
      };
    } catch (error) {
      // If it's a network error, provide user-friendly message
      if (isNetworkError(error)) {
        throw new Error(getNetworkErrorMessage(error));
      }
      throw error;
    }
  },

  // Sign in existing user
  async login({ email, password }: LoginData) {
    // Check online status first
    ensureOnline();

    try {
      // Add retry logic with timeout for login
      const { data, error } = await withRetry(
        () => withTimeout(
          supabase.auth.signInWithPassword({
            email,
            password,
          }),
          15000,
          'Login request timed out. Please check your internet connection and try again.'
        ),
        {
          maxRetries: 2,
          initialDelay: 1000,
          onRetry: (error, attempt) => {
            console.log(`Login attempt ${attempt} failed, retrying...`, error);
          },
        }
      );

      if (error) {
        // Check if it's a network error first
        if (isNetworkError(error)) {
          throw new Error(getNetworkErrorMessage(error));
        }

        // Handle specific error cases
        if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
          throw new Error('Please check your email and confirm your account before signing in. If you did not receive an email, please try signing up again.');
        }
        if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid_credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw error;
      }
      if (!data.user) throw new Error('Login failed');

      // Fetch or create user profile - ensure data is saved to Supabase
      let profile = null;
      try {
        // Fetch existing profile
        const { data: existingProfile, error: fetchError } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at')
          .eq('user_id', data.user.id)
          .maybeSingle();
        
        if (existingProfile) {
          profile = existingProfile;
          
          // If profile exists but is missing data from metadata, update it
          const metadata = data.user.user_metadata as any;
          const needsUpdate = 
            (metadata?.full_name && !profile.full_name) ||
            (metadata?.date_of_birth && !profile.date_of_birth) ||
            (metadata?.account_role && !profile.account_role);
          
          if (needsUpdate) {
            const updateData: any = { updated_at: new Date().toISOString() };
            if (metadata?.full_name && !profile.full_name) updateData.full_name = metadata.full_name;
            if (metadata?.date_of_birth && !profile.date_of_birth) updateData.date_of_birth = metadata.date_of_birth;
            if (metadata?.account_role && !profile.account_role) updateData.account_role = metadata.account_role;
            
            const { data: updatedProfile } = await supabase
              .from('user_profiles')
              .update(updateData)
              .eq('user_id', data.user.id)
              .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at')
              .single();
            
            if (updatedProfile) {
              profile = updatedProfile;
            }
          }
        } else if (fetchError?.code === 'PGRST116' || !existingProfile) {
          // Profile doesn't exist - create it from auth metadata
          const metadata = data.user.user_metadata as any;
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.user.id,
              full_name: metadata?.full_name || data.user.email?.split('@')[0] || null,
              date_of_birth: metadata?.date_of_birth || null,
              account_role: metadata?.account_role || 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at')
            .single();
          
          if (!createError && newProfile) {
            profile = newProfile;
          } else {
            console.error('Failed to create user profile during login:', createError);
          }
        } else if (fetchError && import.meta.env.MODE === 'development') {
          console.debug('[Profile] Fetch error (non-critical):', fetchError.message);
        }
      } catch (error) {
        // Profile fetch/create failed, but login should still succeed
        if (import.meta.env.MODE === 'development') {
          console.debug('[Profile] Exception during login (non-critical):', error instanceof Error ? error.message : error);
        }
        profile = null;
      }

      return {
        user: data.user,
        session: data.session,
        profile: profile,
      };
    } catch (error) {
      // If it's a network error, provide user-friendly message
      if (isNetworkError(error)) {
        throw new Error(getNetworkErrorMessage(error));
      }
      // Re-throw timeout and other errors
      throw error;
    }
  },

  // Sign out
  async logout() {
    // Clear document lock state before signing out
    documentLockService.clearOnSignout();
    // Clear idle unlock attempt state before signing out
    idleSecurityService.clearAttemptState();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  // Get current user
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when not found

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST116') {
          return null; // Not found - this is okay
        }
        // Only log errors in development mode to reduce console noise
        if (import.meta.env.MODE === 'development') {
          console.debug('[Profile] Fetch error (non-critical):', error.message);
        }
        return null;
      }

      return data;
    } catch (error) {
      // Only log errors in development mode to reduce console noise
      if (import.meta.env.MODE === 'development') {
        console.debug('[Profile] Fetch exception (non-critical):', error instanceof Error ? error.message : error);
      }
      return null; // Return null instead of throwing
    }
  },

  // Reset password
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  // Update password
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  // Resend confirmation email
  async resendConfirmationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) throw error;
  },

  // Sign in with OAuth provider
  async signInWithOAuth(provider: 'google' | 'github') {
    ensureOnline();

    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error(getNetworkErrorMessage(error));
      }
      throw error;
    }
  },

  // Handle OAuth callback
  async handleOAuthCallback() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (!data.session) {
        throw new Error('No session found after OAuth callback');
      }

      const user = data.session.user;
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, date_of_birth, age_years, account_role, created_at, updated_at, onboarding_completed, onboarding_stage')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch error:', profileError);
      }

      // If no profile exists, create one from OAuth metadata
      if (!profile) {
        const fullName = user.user_metadata?.full_name || 
                        user.user_metadata?.name || 
                        user.user_metadata?.preferred_username ||
                        user.email?.split('@')[0] || 
                        null;
        
        const avatarUrl = user.user_metadata?.avatar_url || 
                         user.user_metadata?.picture || 
                         null;

        // Create profile
        const { error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            account_role: 'user',
            onboarding_completed: false,
            onboarding_stage: 3, // Start at profile completion
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (createError) {
          console.warn('Profile creation error:', createError);
        }
      }

      return {
        user,
        session: data.session,
        profile: profile || null,
        isNewUser: !profile,
      };
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error(getNetworkErrorMessage(error));
      }
      throw error;
    }
  },

  // Check if email is already registered
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // We can't directly check if email exists in Supabase Auth
      // This would need to be handled via a backend function or
      // we check after OAuth callback
      return false;
    } catch {
      return false;
    }
  },
};

