import { supabase } from '../config/supabase';

export type PageType = 'dashboard' | 'documents' | 'profile' | 'family' | 'dates' | 'notifications' | 'settings';
export type LockType = 'pin' | 'password';

export interface PageLockSettings {
  id?: string;
  user_id: string;
  page: PageType;
  lock_type: LockType;
  lock_value: string; // Hashed PIN or password
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

// Simple hash function for PIN/password (in production, use bcrypt or similar)
async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

class PageLockService {
  private sessionUnlocks: Map<string, Set<PageType>> = new Map();

  /**
   * Get lock settings for a specific page
   */
  async getPageLock(userId: string, page: PageType): Promise<PageLockSettings | null> {
    const { data, error } = await supabase
      .from('page_locks')
      .select('*')
      .eq('user_id', userId)
      .eq('page', page)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching page lock:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all page locks for a user
   */
  async getAllPageLocks(userId: string): Promise<PageLockSettings[]> {
    const { data, error } = await supabase
      .from('page_locks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching page locks:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Set or update a page lock
   */
  async setPageLock(
    userId: string,
    page: PageType,
    lockType: LockType,
    lockValue: string,
    isEnabled: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate lock value
      if (lockType === 'pin') {
        if (!/^\d{6}$/.test(lockValue)) {
          return { success: false, error: 'PIN must be exactly 6 digits' };
        }
      } else {
        if (lockValue.length < 8) {
          return { success: false, error: 'Password must be at least 8 characters' };
        }
      }

      const hashedValue = await hashValue(lockValue);

      // Check if lock already exists
      const existing = await this.getPageLock(userId, page);

      if (existing) {
        // Update existing lock
        const { error } = await supabase
          .from('page_locks')
          .update({
            lock_type: lockType,
            lock_value: hashedValue,
            is_enabled: isEnabled,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          console.error('Error updating page lock:', error);
          return { success: false, error: error.message };
        }
      } else {
        // Create new lock
        const { error } = await supabase
          .from('page_locks')
          .insert({
            user_id: userId,
            page,
            lock_type: lockType,
            lock_value: hashedValue,
            is_enabled: isEnabled,
          });

        if (error) {
          console.error('Error creating page lock:', error);
          return { success: false, error: error.message };
        }
      }

      // Clear session unlock for this page
      const userUnlocks = this.sessionUnlocks.get(userId);
      if (userUnlocks) {
        userUnlocks.delete(page);
      }

      return { success: true };
    } catch (err) {
      console.error('Error setting page lock:', err);
      return { success: false, error: 'Failed to set page lock' };
    }
  }

  /**
   * Remove a page lock
   */
  async removePageLock(userId: string, page: PageType): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('page_locks')
        .delete()
        .eq('user_id', userId)
        .eq('page', page);

      if (error) {
        console.error('Error removing page lock:', error);
        return { success: false, error: error.message };
      }

      // Clear session unlock
      const userUnlocks = this.sessionUnlocks.get(userId);
      if (userUnlocks) {
        userUnlocks.delete(page);
      }

      return { success: true };
    } catch (err) {
      console.error('Error removing page lock:', err);
      return { success: false, error: 'Failed to remove page lock' };
    }
  }

  /**
   * Toggle page lock enabled state
   */
  async togglePageLock(userId: string, page: PageType): Promise<{ success: boolean; error?: string }> {
    try {
      const lock = await this.getPageLock(userId, page);

      if (!lock) {
        return { success: false, error: 'Page lock not found' };
      }

      const { error } = await supabase
        .from('page_locks')
        .update({
          is_enabled: !lock.is_enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', lock.id);

      if (error) {
        console.error('Error toggling page lock:', error);
        return { success: false, error: error.message };
      }

      // Clear session unlock if disabling
      if (lock.is_enabled) {
        const userUnlocks = this.sessionUnlocks.get(userId);
        if (userUnlocks) {
          userUnlocks.delete(page);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Error toggling page lock:', err);
      return { success: false, error: 'Failed to toggle page lock' };
    }
  }

  /**
   * Verify unlock attempt
   */
  async verifyUnlock(userId: string, page: PageType, inputValue: string): Promise<boolean> {
    try {
      const lock = await this.getPageLock(userId, page);

      if (!lock || !lock.is_enabled) {
        return true; // No lock or disabled
      }

      const hashedInput = await hashValue(inputValue);

      if (hashedInput === lock.lock_value) {
        // Store unlock in session
        if (!this.sessionUnlocks.has(userId)) {
          this.sessionUnlocks.set(userId, new Set());
        }
        this.sessionUnlocks.get(userId)!.add(page);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Error verifying unlock:', err);
      return false;
    }
  }

  /**
   * Check if a page is locked for the user
   */
  async isPageLocked(userId: string, page: PageType): Promise<boolean> {
    // Check session unlocks first
    const userUnlocks = this.sessionUnlocks.get(userId);
    if (userUnlocks?.has(page)) {
      return false;
    }

    const lock = await this.getPageLock(userId, page);
    return lock?.is_enabled ?? false;
  }

  /**
   * Clear session unlocks (call on logout)
   */
  clearSessionUnlocks(userId: string) {
    this.sessionUnlocks.delete(userId);
  }

  /**
   * Clear all session unlocks
   */
  clearAllSessionUnlocks() {
    this.sessionUnlocks.clear();
  }

  /**
   * Lock a specific page (remove from session unlocks)
   */
  lockPage(userId: string, page: PageType) {
    const userUnlocks = this.sessionUnlocks.get(userId);
    if (userUnlocks) {
      userUnlocks.delete(page);
    }
  }
}

export const pageLockService = new PageLockService();
