import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { supabase } from '../config/supabase';

export type WebAuthnCredentialRow = {
  id: string;
  credential_id: string;
  device_label: string | null;
  created_at: string;
};

function getDeviceLabel() {
  if (typeof navigator === 'undefined') return 'This device';
  const ua = navigator.userAgent || '';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/Android/i.test(ua)) return 'Android device';
  if (/Mac/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  return 'This device';
}

class WebauthnService {
  isSupported() {
    return typeof window !== 'undefined' && !!window.PublicKeyCredential;
  }

  async listPasskeys(userId: string): Promise<WebAuthnCredentialRow[]> {
    const { data, error } = await supabase
      .from('user_webauthn_credentials')
      .select('id, credential_id, device_label, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as any;
  }

  async removePasskey(userId: string, id: string) {
    const { error } = await supabase
      .from('user_webauthn_credentials')
      .delete()
      .eq('user_id', userId)
      .eq('id', id);
    if (error) throw error;
  }

  async enrollPasskey() {
    const deviceLabel = getDeviceLabel();
    const { data, error } = await supabase.functions.invoke('webauthn-register-options', {
      body: { deviceLabel },
    });
    if (error) throw error;
    const options = data?.options;
    if (!options) throw new Error('Missing registration options');

    const attestationResponse = await startRegistration(options);

    const { error: verifyErr } = await supabase.functions.invoke('webauthn-register-verify', {
      body: { attestationResponse, deviceLabel },
    });
    if (verifyErr) throw verifyErr;
  }

  async authenticate() {
    const { data, error } = await supabase.functions.invoke('webauthn-auth-options', {
      body: {},
    });
    if (error) throw error;
    const options = data?.options;
    if (!options) throw new Error('Missing authentication options');

    const assertionResponse = await startAuthentication(options);

    const { error: verifyErr } = await supabase.functions.invoke('webauthn-auth-verify', {
      body: { assertionResponse },
    });
    if (verifyErr) throw verifyErr;
  }
}

export const webauthnService = new WebauthnService();

