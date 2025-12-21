import { supabase } from '../config/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id?: string;
  user_id: string;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  text_size?: number;
  reduce_motion?: boolean;
  notification_preferences?: {
    master_enabled: boolean;
    expiry_warnings: { push: boolean; email: boolean; in_app: boolean };
    renewal_reminders: { push: boolean; email: boolean; in_app: boolean };
    family_shares: { push: boolean; email: boolean; in_app: boolean };
    system_updates: { push: boolean; email: boolean; in_app: boolean };
    reminder_timing: number[]; // e.g., [30, 7, 1]
    quiet_hours_start?: string;
    quiet_hours_end?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface ConnectedDevice {
  id: string;
  user_id: string;
  device_name: string;
  device_type: string;
  user_agent: string;
  ip_address?: string;
  location?: string;
  last_active: string;
  created_at: string;
}

export const userService = {
  /**
   * Get user profile from profiles table
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Profile doesn't exist yet, create it
        if (error.code === 'PGRST116') {
          return await this.createUserProfile(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },

  /**
   * Create user profile
   */
  async createUserProfile(userId: string, profileData?: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const email = authUser.user?.email || '';
      
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([
          {
            user_id: userId,
            full_name: profileData?.full_name || email.split('@')[0],
            ...profileData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
  },

  /**
   * Update avatar in auth metadata
   */
  async updateAvatarInAuth(avatarUrl: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating avatar in auth:', error);
      return false;
    }
  },

  /**
   * Get user settings
   */
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Settings don't exist, create defaults
        if (error.code === 'PGRST116') {
          return await this.createUserSettings(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  },

  /**
   * Create default user settings
   */
  async createUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const defaultSettings: Omit<UserSettings, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        theme: 'dark',
        language: 'en',
        text_size: 16,
        reduce_motion: false,
        notification_preferences: {
          master_enabled: true,
          expiry_warnings: { push: true, email: true, in_app: true },
          renewal_reminders: { push: true, email: true, in_app: true },
          family_shares: { push: true, email: true, in_app: true },
          system_updates: { push: true, email: true, in_app: true },
          reminder_timing: [30, 7, 1],
        },
      };

      const { data, error } = await supabase
        .from('user_settings')
        .insert([defaultSettings])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating user settings:', error);
      return null;
    }
  },

  /**
   * Update user settings
   */
  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings | null> {
    try {
      // Check if settings exist
      const existing = await this.getUserSettings(userId);
      
      if (!existing) {
        // Create new settings with updates
        return await this.createUserSettings(userId);
      }

      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      return null;
    }
  },

  /**
   * Get connected devices/sessions
   */
  async getConnectedDevices(userId: string): Promise<ConnectedDevice[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false });

      if (error) {
        // Table might not exist
        if (error.code === 'PGRST116' || error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching connected devices:', error);
      return [];
    }
  },

  /**
   * Revoke device session
   */
  async revokeDevice(deviceId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error revoking device:', error);
      return false;
    }
  },

  /**
   * Delete user account and all data
   */
  async deleteUserAccount(userId: string): Promise<boolean> {
    try {
      // Delete user's data from all tables
      const tables = [
        'documents',
        'notifications',
        'user_profiles',
        'user_settings',
        'user_sessions',
        'family_members',
        'family_invitations',
        'shared_documents',
        'important_dates',
      ];

      for (const table of tables) {
        try {
          await supabase.from(table).delete().eq('user_id', userId);
        } catch (err) {
          console.warn(`Error deleting from ${table}:`, err);
        }
      }

      // Delete user from auth (requires admin API, handled server-side)
      // Client-side: just sign out
      await supabase.auth.signOut();

      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      return false;
    }
  },

  /**
   * Change user email (requires verification)
   */
  async changeEmail(newEmail: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { success: false, error: 'User not found' };
      }

      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (signInError) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Update email (will send verification email)
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to change email',
      };
    }
  },

  /**
   * Calculate storage usage
   */
  async calculateStorageUsage(userId: string): Promise<{
    totalMB: number;
    usedMB: number;
    breakdown: {
      documents: { count: number; sizeMB: number };
      thumbnails: { count: number; sizeMB: number };
      cache: { sizeMB: number };
    };
  }> {
    try {
      // Get documents and their sizes
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('image_url')
        .eq('user_id', userId);

      if (docsError) throw docsError;

      // Estimate sizes (actual calculation would require listing storage files)
      const docCount = documents?.length || 0;
      const estimatedDocSizeMB = docCount * 0.05; // ~50KB per document on average
      const estimatedThumbnailSizeMB = docCount * 0.01; // ~10KB per thumbnail

      // Get cache size from localStorage (rough estimate)
      let cacheSizeMB = 0;
      try {
        const cacheKeys = Object.keys(localStorage);
        let totalCacheBytes = 0;
        cacheKeys.forEach((key) => {
          if (key.startsWith('docutrack_') || key.startsWith('image_cache_')) {
            const value = localStorage.getItem(key);
            if (value) {
              totalCacheBytes += new Blob([value]).size;
            }
          }
        });
        cacheSizeMB = totalCacheBytes / (1024 * 1024);
      } catch (e) {
        console.warn('Error calculating cache size:', e);
      }

      const usedMB = estimatedDocSizeMB + estimatedThumbnailSizeMB + cacheSizeMB;
      const totalMB = 100; // Default storage limit

      return {
        totalMB,
        usedMB,
        breakdown: {
          documents: { count: docCount, sizeMB: estimatedDocSizeMB },
          thumbnails: { count: docCount, sizeMB: estimatedThumbnailSizeMB },
          cache: { sizeMB: cacheSizeMB },
        },
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return {
        totalMB: 100,
        usedMB: 0,
        breakdown: {
          documents: { count: 0, sizeMB: 0 },
          thumbnails: { count: 0, sizeMB: 0 },
          cache: { sizeMB: 0 },
        },
      };
    }
  },

  /**
   * Clear cache
   */
  clearCache(): boolean {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('docutrack_') || key.startsWith('image_cache_')) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  },
};
