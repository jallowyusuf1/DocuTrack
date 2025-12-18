import { supabase } from '../config/supabase';

/**
 * Get user's IP address (client-side approximation)
 */
async function getUserIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return null;
  }
}

/**
 * Log terms acceptance to database
 */
export async function logTermsAcceptance(userId: string): Promise<void> {
  try {
    const ipAddress = await getUserIP();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

    const { error } = await supabase
      .from('terms_acceptance')
      .insert({
        user_id: userId,
        terms_version: '1.0',
        privacy_version: '1.0',
        accepted_at: new Date().toISOString(),
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) {
      console.error('Failed to log terms acceptance:', error);
      // Don't throw - this is logging, not critical for signup
    }
  } catch (error) {
    console.error('Error logging terms acceptance:', error);
    // Don't throw - this is logging, not critical for signup
  }
}
