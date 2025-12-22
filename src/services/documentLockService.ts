import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';

export interface DocumentLockSettings {
  id?: string;
  userId: string;
  lockEnabled: boolean;
  lockPasswordHash?: string;
  lockTrigger: 'always' | 'idle' | 'manual';
  idleTimeoutMinutes: number;
  maxAttempts: number;
  lockoutDurationMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LockAttemptState {
  failedAttempts: number;
  lockedUntil: number | null;
  lastAttemptTime: number;
}

const LOCK_STATE_KEY = 'documents_page_locked';
const ATTEMPT_STATE_KEY = 'document_lock_attempts';

class DocumentLockService {
  /**
   * Get user's document lock settings
   */
  async getLockSettings(userId: string): Promise<DocumentLockSettings | null> {
    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return default
          return null;
        }
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        lockEnabled: data.lock_enabled,
        lockPasswordHash: data.lock_password_hash,
        lockTrigger: data.lock_trigger,
        idleTimeoutMinutes: data.idle_timeout_minutes,
        maxAttempts: data.max_attempts,
        lockoutDurationMinutes: data.lockout_duration_minutes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error fetching lock settings:', error);
      throw error;
    }
  }

  /**
   * Create or update lock settings
   */
  async saveLockSettings(settings: Partial<DocumentLockSettings> & { userId: string }): Promise<DocumentLockSettings> {
    try {
      const { data, error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: settings.userId,
          lock_enabled: settings.lockEnabled ?? false,
          lock_password_hash: settings.lockPasswordHash,
          lock_trigger: settings.lockTrigger ?? 'always',
          idle_timeout_minutes: settings.idleTimeoutMinutes ?? 15,
          max_attempts: settings.maxAttempts ?? 3,
          lockout_duration_minutes: settings.lockoutDurationMinutes ?? 15,
        }, {
          onConflict: 'user_id',
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        lockEnabled: data.lock_enabled,
        lockPasswordHash: data.lock_password_hash,
        lockTrigger: data.lock_trigger,
        idleTimeoutMinutes: data.idle_timeout_minutes,
        maxAttempts: data.max_attempts,
        lockoutDurationMinutes: data.lockout_duration_minutes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error saving lock settings:', error);
      throw error;
    }
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Set a new lock password
   */
  async setLockPassword(userId: string, password: string): Promise<void> {
    const hash = await this.hashPassword(password);
    await this.saveLockSettings({
      userId,
      lockPasswordHash: hash,
      lockEnabled: true,
    });
  }

  /**
   * Update lock password
   */
  async updateLockPassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const settings = await this.getLockSettings(userId);
    if (!settings?.lockPasswordHash) {
      throw new Error('No password set');
    }

    const isValid = await this.verifyPassword(oldPassword, settings.lockPasswordHash);
    if (!isValid) {
      return false;
    }

    const newHash = await this.hashPassword(newPassword);
    await this.saveLockSettings({
      userId,
      lockPasswordHash: newHash,
    });

    return true;
  }

  /**
   * Check if documents page is locked
   */
  isDocumentsLocked(): boolean {
    const lockState = localStorage.getItem(LOCK_STATE_KEY);
    return lockState === 'true';
  }

  /**
   * Set documents page lock state
   */
  setDocumentsLocked(locked: boolean): void {
    if (locked) {
      localStorage.setItem(LOCK_STATE_KEY, 'true');
    } else {
      localStorage.removeItem(LOCK_STATE_KEY);
      // Clear attempt state on successful unlock
      this.clearAttemptState();
    }

    // Notify UI listeners (Documents pages) immediately
    try {
      window.dispatchEvent(new CustomEvent('documents_lock_change', { detail: { locked } }));
    } catch {
      // no-op (SSR / older browsers)
    }
  }

  /**
   * Get current attempt state
   */
  getAttemptState(): LockAttemptState {
    const stateStr = sessionStorage.getItem(ATTEMPT_STATE_KEY);
    if (!stateStr) {
      return {
        failedAttempts: 0,
        lockedUntil: null,
        lastAttemptTime: 0,
      };
    }

    try {
      return JSON.parse(stateStr);
    } catch {
      return {
        failedAttempts: 0,
        lockedUntil: null,
        lastAttemptTime: 0,
      };
    }
  }

  /**
   * Save attempt state
   */
  private saveAttemptState(state: LockAttemptState): void {
    sessionStorage.setItem(ATTEMPT_STATE_KEY, JSON.stringify(state));
  }

  /**
   * Clear attempt state
   */
  clearAttemptState(): void {
    sessionStorage.removeItem(ATTEMPT_STATE_KEY);
  }

  /**
   * Check if currently locked out
   */
  isLockedOut(): boolean {
    const state = this.getAttemptState();
    if (!state.lockedUntil) return false;

    const now = Date.now();
    if (now < state.lockedUntil) {
      return true;
    }

    // Lockout period expired, clear it
    this.clearAttemptState();
    return false;
  }

  /**
   * Get remaining lockout time in seconds
   */
  getRemainingLockoutTime(): number {
    const state = this.getAttemptState();
    if (!state.lockedUntil) return 0;

    const now = Date.now();
    const remaining = Math.max(0, Math.ceil((state.lockedUntil - now) / 1000));
    return remaining;
  }

  /**
   * Record a failed attempt
   */
  recordFailedAttempt(maxAttempts: number, lockoutDurationMinutes: number): void {
    const state = this.getAttemptState();
    const newState: LockAttemptState = {
      failedAttempts: state.failedAttempts + 1,
      lockedUntil: state.lockedUntil,
      lastAttemptTime: Date.now(),
    };

    // Check if max attempts exceeded
    if (newState.failedAttempts >= maxAttempts) {
      newState.lockedUntil = Date.now() + (lockoutDurationMinutes * 60 * 1000);
    }

    this.saveAttemptState(newState);
  }

  /**
   * Attempt to unlock with password
   */
  async attemptUnlock(userId: string, password: string): Promise<{
    success: boolean;
    error?: string;
    attemptsRemaining?: number;
    lockedUntil?: number;
  }> {
    // Check if locked out
    if (this.isLockedOut()) {
      const remaining = this.getRemainingLockoutTime();
      return {
        success: false,
        error: 'locked_out',
        lockedUntil: Date.now() + (remaining * 1000),
      };
    }

    // Get settings
    const settings = await this.getLockSettings(userId);
    if (!settings || !settings.lockPasswordHash) {
      return {
        success: false,
        error: 'no_password_set',
      };
    }

    // Verify password
    const isValid = await this.verifyPassword(password, settings.lockPasswordHash);

    if (isValid) {
      // Success - clear attempts and unlock
      this.clearAttemptState();
      this.setDocumentsLocked(false);
      return { success: true };
    } else {
      // Failed - record attempt
      this.recordFailedAttempt(settings.maxAttempts, settings.lockoutDurationMinutes);
      const state = this.getAttemptState();

      if (state.lockedUntil) {
        return {
          success: false,
          error: 'locked_out',
          lockedUntil: state.lockedUntil,
        };
      }

      const attemptsRemaining = Math.max(0, settings.maxAttempts - state.failedAttempts);
      return {
        success: false,
        error: 'incorrect_password',
        attemptsRemaining,
      };
    }
  }

  /**
   * Enable document lock
   */
  async enableLock(userId: string): Promise<void> {
    const settings = await this.getLockSettings(userId);
    if (!settings?.lockPasswordHash) {
      throw new Error('Password must be set before enabling lock');
    }

    await this.saveLockSettings({
      userId,
      lockEnabled: true,
    });

    // Immediately lock if trigger is 'always'
    if (settings.lockTrigger === 'always') {
      this.setDocumentsLocked(true);
    }
  }

  /**
   * Disable document lock
   */
  async disableLock(userId: string): Promise<void> {
    await this.saveLockSettings({
      userId,
      lockEnabled: false,
    });

    this.setDocumentsLocked(false);
  }

  /**
   * Clear lock state on signout
   */
  clearOnSignout(): void {
    localStorage.removeItem(LOCK_STATE_KEY);
    this.clearAttemptState();
  }
}

export const documentLockService = new DocumentLockService();
