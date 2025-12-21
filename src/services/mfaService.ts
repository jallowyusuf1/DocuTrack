import { supabase } from '../config/supabase';

export interface MFAFactor {
  id: string;
  type: 'totp';
  status: 'verified' | 'unverified';
  friendly_name?: string;
  created_at: string;
}

export interface TOTPEnrollment {
  id: string;
  qr_code: string;
  secret: string;
  uri: string;
}

export interface BackupCode {
  code: string;
  used: boolean;
}

export const mfaService = {
  /**
   * Check if user has MFA enabled
   */
  async hasMFAEnabled(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      return data?.totp?.length > 0 && data.totp.some((factor: MFAFactor) => factor.status === 'verified');
    } catch (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }
  },

  /**
   * Get all MFA factors for the user
   */
  async getFactors(): Promise<MFAFactor[]> {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      
      return data?.totp || [];
    } catch (error) {
      console.error('Error getting MFA factors:', error);
      return [];
    }
  },

  /**
   * Enroll a new TOTP factor
   */
  async enrollTOTP(friendlyName: string = 'DocuTrackr Authenticator'): Promise<TOTPEnrollment | null> {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName,
      });

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        qr_code: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      };
    } catch (error) {
      console.error('Error enrolling TOTP:', error);
      throw error;
    }
  },

  /**
   * Verify TOTP enrollment with a code from the authenticator app
   */
  async verifyEnrollment(factorId: string, code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code,
      });

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error verifying TOTP enrollment:', error);
      throw error;
    }
  },

  /**
   * Unenroll (disable) an MFA factor
   */
  async unenroll(factorId: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unenrolling MFA:', error);
      throw error;
    }
  },

  /**
   * Create an MFA challenge (used during login)
   */
  async createChallenge(factorId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error creating MFA challenge:', error);
      throw error;
    }
  },

  /**
   * Verify MFA code during login
   */
  async verifyChallenge(factorId: string, challengeId: string, code: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error verifying MFA challenge:', error);
      throw error;
    }
  },

  /**
   * Generate backup codes (Supabase doesn't have built-in backup codes, so we'll generate our own)
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (let i = 0; i < count; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // Format as XXXX-XXXX
      codes.push(`${code.substring(0, 4)}-${code.substring(4)}`);
    }
    
    return codes;
  },

  /**
   * Store backup codes in user_settings
   */
  async saveBackupCodes(userId: string, codes: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          mfa_backup_codes: codes.map(code => ({ code, used: false })),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        // If user_settings doesn't exist, create it
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            mfa_backup_codes: codes.map(code => ({ code, used: false })),
          });

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Error saving backup codes:', error);
      return false;
    }
  },

  /**
   * Get backup codes from user_settings
   */
  async getBackupCodes(userId: string): Promise<BackupCode[]> {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('mfa_backup_codes')
        .eq('user_id', userId)
        .single();

      if (error) return [];
      return data?.mfa_backup_codes || [];
    } catch (error) {
      console.error('Error getting backup codes:', error);
      return [];
    }
  },

  /**
   * Verify and mark backup code as used
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const codes = await this.getBackupCodes(userId);
      const normalizedCode = code.replace(/-/g, '').toUpperCase();
      
      const codeIndex = codes.findIndex(
        (bc) => !bc.used && bc.code.replace(/-/g, '').toUpperCase() === normalizedCode
      );

      if (codeIndex === -1) return false;

      // Mark as used
      codes[codeIndex].used = true;

      const { error } = await supabase
        .from('user_settings')
        .update({
          mfa_backup_codes: codes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error verifying backup code:', error);
      return false;
    }
  },
};
