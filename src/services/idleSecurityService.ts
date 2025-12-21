import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase';

export type IdleTimeoutMinutes = 1 | 2 | 5 | 10 | 15;
export type MaxAttempts = 1 | 3 | 5 | 10;

export interface IdleSecuritySettings {
  userId: string;
  idleTimeoutEnabled: boolean;
  idleTimeoutMinutes: IdleTimeoutMinutes;
  idleLockPasswordHash?: string | null;
  maxUnlockAttempts: MaxAttempts;
  wipeDataOnMaxAttempts: boolean;
  biometricUnlockEnabled: boolean;
  idleSoundAlertsEnabled: boolean;
}

export interface IdleAttemptState {
  failedAttempts: number;
  lastAttemptTime: number;
  lockoutUntil: number | null;
}

const ATTEMPT_STATE_KEY = 'idle_unlock_attempt_state';

function clampEnum<T extends number>(value: number, allowed: readonly T[], fallback: T): T {
  return (allowed.includes(value as T) ? (value as T) : fallback);
}

class IdleSecurityService {
  async getSettings(userId: string): Promise<IdleSecuritySettings> {
    const { data, error } = await supabase
      .from('user_security_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    // Defaults per spec
    const defaults: IdleSecuritySettings = {
      userId,
      idleTimeoutEnabled: false,
      idleTimeoutMinutes: 5,
      idleLockPasswordHash: null,
      maxUnlockAttempts: 3,
      wipeDataOnMaxAttempts: false,
      biometricUnlockEnabled: false,
      idleSoundAlertsEnabled: false,
    };

    if (!data) return defaults;

    return {
      userId,
      idleTimeoutEnabled: !!data.idle_timeout_enabled,
      idleTimeoutMinutes: clampEnum<IdleTimeoutMinutes>(
        Number(data.idle_timeout_minutes ?? 5),
        [1, 2, 5, 10, 15] as const,
        5
      ),
      idleLockPasswordHash: data.idle_lock_password_hash,
      maxUnlockAttempts: clampEnum<MaxAttempts>(
        Number(data.max_unlock_attempts ?? 3),
        [1, 3, 5, 10] as const,
        3
      ),
      wipeDataOnMaxAttempts: !!data.wipe_data_on_max_attempts,
      biometricUnlockEnabled: !!data.biometric_unlock_enabled,
      idleSoundAlertsEnabled: !!data.idle_sound_alerts_enabled,
    };
  }

  async saveSettings(userId: string, updates: Partial<IdleSecuritySettings>): Promise<void> {
    const payload: any = {
      user_id: userId,
    };

    if (typeof updates.idleTimeoutEnabled === 'boolean') payload.idle_timeout_enabled = updates.idleTimeoutEnabled;
    if (typeof updates.idleTimeoutMinutes === 'number') payload.idle_timeout_minutes = updates.idleTimeoutMinutes;
    if (typeof updates.maxUnlockAttempts === 'number') payload.max_unlock_attempts = updates.maxUnlockAttempts;
    if (typeof updates.wipeDataOnMaxAttempts === 'boolean')
      payload.wipe_data_on_max_attempts = updates.wipeDataOnMaxAttempts;
    if (typeof updates.biometricUnlockEnabled === 'boolean')
      payload.biometric_unlock_enabled = updates.biometricUnlockEnabled;
    if (typeof updates.idleSoundAlertsEnabled === 'boolean')
      payload.idle_sound_alerts_enabled = updates.idleSoundAlertsEnabled;
    if ('idleLockPasswordHash' in updates) payload.idle_lock_password_hash = updates.idleLockPasswordHash;

    const { error } = await supabase
      .from('user_security_settings')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) throw error;
  }

  async setIdleLockPassword(userId: string, password: string): Promise<void> {
    const hash = await bcrypt.hash(password, 10);
    await this.saveSettings(userId, { idleLockPasswordHash: hash, idleTimeoutEnabled: true });
  }

  async verifyIdlePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  getAttemptState(): IdleAttemptState {
    const raw = sessionStorage.getItem(ATTEMPT_STATE_KEY);
    if (!raw) return { failedAttempts: 0, lastAttemptTime: 0, lockoutUntil: null };
    try {
      return JSON.parse(raw);
    } catch {
      return { failedAttempts: 0, lastAttemptTime: 0, lockoutUntil: null };
    }
  }

  private saveAttemptState(state: IdleAttemptState) {
    sessionStorage.setItem(ATTEMPT_STATE_KEY, JSON.stringify(state));
  }

  clearAttemptState() {
    sessionStorage.removeItem(ATTEMPT_STATE_KEY);
  }

  isLockedOut(): boolean {
    const s = this.getAttemptState();
    if (!s.lockoutUntil) return false;
    if (Date.now() < s.lockoutUntil) return true;
    this.clearAttemptState();
    return false;
  }

  getRemainingLockoutSeconds(): number {
    const s = this.getAttemptState();
    if (!s.lockoutUntil) return 0;
    return Math.max(0, Math.ceil((s.lockoutUntil - Date.now()) / 1000));
  }

  recordFailedAttempt(maxUnlockAttempts: number, lockoutMinutes: number) {
    const prev = this.getAttemptState();
    const next: IdleAttemptState = {
      failedAttempts: prev.failedAttempts + 1,
      lastAttemptTime: Date.now(),
      lockoutUntil: prev.lockoutUntil,
    };

    if (next.failedAttempts >= maxUnlockAttempts) {
      next.lockoutUntil = Date.now() + lockoutMinutes * 60 * 1000;
    }

    this.saveAttemptState(next);
  }

  async logEvent(userId: string, eventType: string, metadata: Record<string, unknown> = {}) {
    await supabase.from('security_audit_events').insert({
      user_id: userId,
      event_type: eventType,
      metadata,
    });
  }
}

export const idleSecurityService = new IdleSecurityService();

