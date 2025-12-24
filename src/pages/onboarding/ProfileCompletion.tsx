import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Camera, User as UserIcon, X } from 'lucide-react';
import { GlassBackground } from '../../components/ui/glass/GlassBackground';
import { GlassButton, GlassCard, GlassPill } from '../../components/ui/glass/Glass';
import { prefersReducedMotion, triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../config/supabase';
import { useTranslation } from 'react-i18next';

type CountryOption = {
  code: string;
  name: string;
  flag: string;
  dial: string;
  currency: string;
};

const COUNTRIES: CountryOption[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', dial: '1', currency: 'USD' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', dial: '966', currency: 'SAR' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dial: '34', currency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dial: '33', currency: 'EUR' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', dial: '92', currency: 'PKR' },
];

const isValidE164 = (s: string) => /^\+[1-9]\d{1,14}$/.test(s);

function guessCountryFromLocale(): CountryOption {
  try {
    const lang = navigator.language || '';
    const region = lang.split('-')[1]?.toUpperCase() || '';
    const found = COUNTRIES.find((c) => c.code === region);
    return found ?? COUNTRIES[0];
  } catch {
    return COUNTRIES[0];
  }
}

export default function ProfileCompletion() {
  const reduced = prefersReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarPreviewUrl = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : null), [avatarFile]);
  const [phoneCountry, setPhoneCountry] = useState<string>('US');
  const [phoneNational, setPhoneNational] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countryCode, setCountryCode] = useState<string>('US');
  const [currency, setCurrency] = useState('USD');
  const [currencyTouched, setCurrencyTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Best-effort defaults from locale
  useEffect(() => {
    const guess = guessCountryFromLocale();
    setCountryCode(guess.code);
    setPhoneCountry(guess.code);
    setCurrency(guess.currency);
  }, []);

  // Cleanup blob URL
  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  const onPickAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setAvatarFile(f);
  };

  const selectedPhoneCountry = useMemo(
    () => COUNTRIES.find((c) => c.code === phoneCountry) ?? COUNTRIES[0],
    [phoneCountry],
  );

  const computedPhoneE164 = useMemo(() => {
    const digits = phoneNational.replace(/\D/g, '');
    if (!digits) return '';
    return `+${selectedPhoneCountry.dial}${digits}`;
  }, [phoneNational, selectedPhoneCountry.dial]);

  const uploadAvatarIfNeeded = async (): Promise<string | null> => {
    if (!user?.id || !avatarFile) return null;
    const ext = avatarFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/avatar.${ext}`;
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, avatarFile, {
      upsert: true,
      contentType: avatarFile.type || 'image/jpeg',
    });
    if (upErr) throw upErr;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const saveAndContinue = async () => {
    triggerHaptic('light');
    if (!user?.id) {
      navigate('/login', { replace: true });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (phoneNational.trim()) {
        if (!isValidE164(computedPhoneE164)) {
          throw new Error('Phone number must be a valid international number (E.164).');
        }
      }

      const avatarUrl = await uploadAvatarIfNeeded();

      const profileUpdates: any = {
        phone_number: phoneNational.trim() ? computedPhoneE164 : null,
        date_of_birth: dateOfBirth || null,
        country_code: countryCode,
        onboarding_stage: 4,
        updated_at: new Date().toISOString(),
      };
      if (avatarUrl) profileUpdates.avatar_url = avatarUrl;

      // Update profile
      const { error: pErr } = await supabase.from('user_profiles').update(profileUpdates).eq('user_id', user.id);
      if (pErr) throw pErr;

      // Update settings (currency)
      const { error: sErr } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, currency }, { onConflict: 'user_id' });
      if (sErr) throw sErr;

      navigate('/onboarding/security', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const skipStep = async () => {
    triggerHaptic('light');
    if (!user?.id) {
      navigate('/login', { replace: true });
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: pErr } = await supabase
        .from('user_profiles')
        .update({ onboarding_stage: 4, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (pErr) throw pErr;
      navigate('/onboarding/security', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to skip.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden flex flex-col"
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? undefined : { opacity: 1 }}
      exit={reduced ? undefined : { opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <GlassBackground />
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          <GlassCard
            elevated
            className="p-6 md:p-8"
            style={{
              borderRadius: 30,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 55%, rgba(139,92,246,0.10) 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          >
            <div className="flex items-center gap-4">
              <GlassPill className="text-white/85">{t('onboarding.stage3.step')}</GlassPill>
            </div>

            <h1 className="mt-4 text-white font-semibold tracking-tight text-[32px] leading-tight">
              {t('onboarding.stage3.title')}
            </h1>
            <p className="mt-2 text-white/65 text-[17px] leading-relaxed">{t('onboarding.stage3.subtitle')}</p>

            {/* Avatar */}
            <div className="mt-8">
              <div className="text-white/70 text-sm mb-2">{t('onboarding.stage3.photoLabel')}</div>
              <div className="flex items-center gap-4">
                <div
                  className="w-[120px] h-[120px] rounded-full overflow-hidden flex items-center justify-center"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {avatarPreviewUrl ? (
                    <img src={avatarPreviewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-white/70" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <label className="inline-flex">
                    <input type="file" accept="image/*" onChange={onPickAvatar} className="hidden" />
                    <span
                      className="inline-flex items-center gap-2 px-4 h-11 rounded-2xl cursor-pointer"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      <Camera className="w-4 h-4" />
                      {t('onboarding.stage3.uploadPhoto')}
                    </span>
                  </label>

                  {avatarFile ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 h-11 rounded-2xl"
                      style={{
                        background: 'rgba(239,68,68,0.10)',
                        border: '1px solid rgba(239,68,68,0.20)',
                        color: 'rgba(255,255,255,0.9)',
                      }}
                      onClick={() => setAvatarFile(null)}
                    >
                      <X className="w-4 h-4" />
                      {t('onboarding.stage3.remove')}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Placeholder fields (wired in later todo) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-white/70 text-sm mb-2">{t('onboarding.stage3.phoneLabel')}</div>
                <div className="flex gap-2">
                  <select
                    className="glass-input h-12 px-3 text-white bg-transparent w-[140px]"
                    value={phoneCountry}
                    onChange={(e) => setPhoneCountry(e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} +{c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    className="glass-input flex-1 h-12 px-4 text-white placeholder:text-white/45"
                    placeholder="Phone number"
                    inputMode="tel"
                    value={phoneNational}
                    onChange={(e) => setPhoneNational(e.target.value)}
                  />
                </div>
                <div className="mt-1 text-xs text-white/45">{t('onboarding.stage3.phoneHint')}</div>
                {phoneNational.trim() ? (
                  <div className="mt-1 text-xs" style={{ color: isValidE164(computedPhoneE164) ? '#34D399' : '#FCA5A5' }}>
                    {computedPhoneE164} {isValidE164(computedPhoneE164) ? '✓' : '(invalid)'}
                  </div>
                ) : null}
              </div>
              <div>
                <div className="text-white/70 text-sm mb-2">{t('onboarding.stage3.dobLabel')}</div>
                <input
                  className="glass-input w-full h-12 px-4 text-white"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
                <div className="mt-1 text-xs text-white/45">{t('onboarding.stage3.dobHint')}</div>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-2">{t('onboarding.stage3.countryLabel')}</div>
                <select
                  className="glass-input w-full h-12 px-4 text-white bg-transparent"
                  value={countryCode}
                  onChange={(e) => {
                    const next = e.target.value;
                    setCountryCode(next);
                    if (!currencyTouched) {
                      const c = COUNTRIES.find((x) => x.code === next);
                      if (c) setCurrency(c.currency);
                    }
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-white/70 text-sm mb-2">{t('onboarding.stage3.currencyLabel')}</div>
                <select
                  className="glass-input w-full h-12 px-4 text-white bg-transparent"
                  value={currency}
                  onChange={(e) => {
                    setCurrencyTouched(true);
                    setCurrency(e.target.value);
                  }}
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="SAR">SAR</option>
                  <option value="PKR">PKR</option>
                </select>
              </div>
            </div>

            {error ? <div className="mt-4 text-sm text-red-200/90">{error}</div> : null}

            <div className="mt-10 flex items-center justify-between gap-3">
              <GlassButton
                variant="secondary"
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/onboarding/email');
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('onboarding.stage3.back')}
              </GlassButton>
              <GlassButton
                onClick={saveAndContinue}
                disabled={saving}
              >
                {t('onboarding.stage3.continue')} <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
}


