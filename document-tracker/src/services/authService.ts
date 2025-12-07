import { supabase } from '../config/supabase';

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export const authService = {
  // Sign up new user
  async signup({ email, password, fullName }: SignupData) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('Failed to create user');

    // The trigger will automatically create the profile
    // Wait a moment for the trigger to execute
    await new Promise(resolve => setTimeout(resolve, 300));

    // If we have a session, try to update the profile with full_name
    let profileData = null;
    
    if (authData.session) {
      // Set the session to ensure RLS policies work
      await supabase.auth.setSession(authData.session);
      
      // Try to update the profile with full_name
      // The trigger creates it with NULL, so we update it here
      const { data: updatedProfile, error: updateError } = await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('user_id', authData.user.id)
        .select('id, user_id, full_name, created_at, updated_at')
        .single();
      
      if (!updateError && updatedProfile) {
        profileData = updatedProfile;
      } else {
        // If update fails, try to fetch the profile (created by trigger)
        const { data: fetchedProfile } = await supabase
          .from('user_profiles')
          .select('id, user_id, full_name, created_at, updated_at')
          .eq('user_id', authData.user.id)
          .maybeSingle();
        
        profileData = fetchedProfile || {
          id: '',
          user_id: authData.user.id,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }
    } else {
      // No session (email confirmation required)
      // Profile will be created by trigger, but we can't update it yet
      // Return a placeholder - profile will be updated on first login
      profileData = {
        id: '',
        user_id: authData.user.id,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return {
      user: authData.user,
      session: authData.session,
      profile: profileData,
    };
  },

  // Sign in existing user
  async login({ email, password }: LoginData) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Handle specific error cases
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email_not_confirmed')) {
        // If email confirmation is disabled but user still has unconfirmed status,
        // try to resend confirmation or provide helpful message
        throw new Error('Please check your email and confirm your account before signing in. If you did not receive an email, please try signing up again.');
      }
      throw error;
    }
    if (!data.user) throw new Error('Login failed');

    // Fetch user profile - use explicit columns to avoid 406 errors
    let profile = null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, user_id, full_name, created_at, updated_at')
        .eq('user_id', data.user.id)
        .maybeSingle(); // Use maybeSingle to avoid errors when not found

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist - trigger should have created it, but if not, wait and retry once
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try fetching again once
          const { data: retryProfile } = await supabase
            .from('user_profiles')
            .select('id, user_id, full_name, created_at, updated_at')
            .eq('user_id', data.user.id)
            .maybeSingle();
          
          profile = retryProfile || null;
        } else {
          // Other error - log but don't fail login
          console.warn('Profile fetch error:', profileError);
          profile = null;
        }
      } else {
        profile = profileData;
      }
    } catch (error) {
      // Profile fetch failed, but login should still succeed
      console.warn('Profile fetch exception during login:', error);
      profile = null;
    }

    return {
      user: data.user,
      session: data.session,
      profile: profile,
    };
  },

  // Sign out
  async logout() {
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
        .select('id, user_id, full_name, created_at, updated_at')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when not found

      if (error) {
        if (error.code === 'PGRST116' || error.code === 'PGRST116') {
          return null; // Not found - this is okay
        }
        // Log but don't throw for profile errors - user can still use the app
        console.warn('Profile fetch error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Profile fetch exception:', error);
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
};

