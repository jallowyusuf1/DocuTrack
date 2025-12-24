import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, ChevronDown, Globe, Lock, Shield, Bell, Eye } from 'lucide-react';
import { GlassBackground } from '../../components/ui/glass/GlassBackground';
import { GlassButton, GlassCard, GlassPill } from '../../components/ui/glass/Glass';
import { prefersReducedMotion, triggerHaptic } from '../../utils/animations';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { supabase } from '../../config/supabase';
import { idleSecurityService } from '../../services/idleSecurityService';
import { documentLockService } from '../../services/documentLockService';
import SetDocumentLockModal from '../../components/documents/SetDocumentLockModal';
import MFASetupModal from '../../components/auth/MFASetupModal';
import { mfaService } from '../../services/mfaService';
import { useTranslation } from 'react-i18next';

export default function SecuritySetup() {
  const reduced = prefersReducedMotion();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const [selectedLanguage, setSelectedLanguage] = useState(language || 'en');
  const [idleEnabled, setIdleEnabled] = useState(false);
  const [idleMinutes, setIdleMinutes] = useState<1 | 2 | 5 | 10 | 15>(5);
  const [idleMaxAttempts, setIdleMaxAttempts] = useState<1 | 3 | 5 | 10>(3);
  const [idleWipeLocal, setIdleWipeLocal] = useState(false);
  const [idleBiometric, setIdleBiometric] = useState(false);
  const [idleSoundAlerts, setIdleSoundAlerts] = useState(false);

  const [docLockEnabled, setDocLockEnabled] = useState(false);
  const [docLockTrigger, setDocLockTrigger] = useState<'always' | 'idle' | 'manual'>('always');
  const [docLockHasPassword, setDocLockHasPassword] = useState(false);
  const [showDocLockModal, setShowDocLockModal] = useState(false);
  const [docLockModalMode, setDocLockModalMode] = useState<'set' | 'change'>('set');

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showMFAModal, setShowMFAModal] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationsPush, setNotificationsPush] = useState(true);
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsSms, setNotificationsSms] = useState(false);

  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [faceDetectionEnabled, setFaceDetectionEnabled] = useState(false);
  const [cloudOcrSyncEnabled, setCloudOcrSyncEnabled] = useState(false);

  const [openSection, setOpenSection] = useState<
    'language' | 'idle' | 'doclock' | '2fa' | 'notifications' | 'privacy'
  >('language');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languages = useMemo(
    () => [
      { code: 'en', flag: '🇬🇧', name: 'English', native: 'English', rtl: false },
      { code: 'ar', flag: '🇸🇦', name: 'Arabic', native: 'العربية', rtl: true },
      { code: 'es', flag: '🇪🇸', name: 'Spanish', native: 'Español', rtl: false },
      { code: 'fr', flag: '🇫🇷', name: 'French', native: 'Français', rtl: false },
      { code: 'ur', flag: '🇵🇰', name: 'Urdu', native: 'اردو', rtl: true },
    ],
    []
  );

  useEffect(() => {
    const run = async () => {
      if (!user?.id) return;
      try {
        const idle = await idleSecurityService.getSettings(user.id);
        setIdleEnabled(!!idle.idleTimeoutEnabled);
        setIdleMinutes(idle.idleTimeoutMinutes);
        setIdleMaxAttempts(idle.maxUnlockAttempts);
        setIdleWipeLocal(idle.wipeDataOnMaxAttempts);
        setIdleBiometric(idle.biometricUnlockEnabled);
        setIdleSoundAlerts(idle.idleSoundAlertsEnabled);
      } catch {}
      try {
        const lock = await documentLockService.getLockSettings(user.id);
        setDocLockEnabled(!!lock?.lockEnabled);
        setDocLockTrigger(lock?.lockTrigger ?? 'always');
        setDocLockHasPassword(!!lock?.lockPasswordHash);
      } catch {}
      try {
        const { data } = await supabase
          .from('user_settings')
          .select(
            'notifications_enabled, notifications_push, notifications_email, notifications_sms, analytics_enabled, face_detection_enabled, cloud_ocr_sync_enabled'
          )
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setNotificationsEnabled(!!data.notifications_enabled);
          setNotificationsPush(!!data.notifications_push);
          setNotificationsEmail(!!data.notifications_email);
          setNotificationsSms(!!data.notifications_sms);
          setAnalyticsEnabled(!!data.analytics_enabled);
          setFaceDetectionEnabled(!!data.face_detection_enabled);
          setCloudOcrSyncEnabled(!!data.cloud_ocr_sync_enabled);
        }
      } catch {}
      try {
        const enabled = await mfaService.hasMFAEnabled();
        setTwoFactorEnabled(enabled);
      } catch {}
    };
    run();
  }, [user?.id]);

  const preview = useMemo(() => {
    const sampleName = 'Yusuf';
    const sample = {
      en: {
        greeting: `Good morning, ${sampleName}`,
        cta: 'Add Document',
        nav: ['Expiring Soon', 'Documents', 'Dates', 'Family', 'Profile'],
      },
      ar: {
        greeting: `صباح الخير، ${sampleName}`,
        cta: 'إضافة مستند',
        nav: ['قريب الانتهاء', 'المستندات', 'التواريخ', 'العائلة', 'الملف الشخصي'],
      },
      es: {
        greeting: `Buenos días, ${sampleName}`,
        cta: 'Añadir documento',
        nav: ['Pronto vence', 'Documentos', 'Fechas', 'Familia', 'Perfil'],
      },
      fr: {
        greeting: `Bonjour, ${sampleName}`,
        cta: 'Ajouter un document',
        nav: ['Bientôt expiré', 'Documents', 'Dates', 'Famille', 'Profil'],
      },
      ur: {
        greeting: `صبح بخیر، ${sampleName}`,
        cta: 'دستاویز شامل کریں',
        nav: ['جلد ختم', 'دستاویزات', 'تاریخیں', 'خاندان', 'پروفائل'],
      },
    } as const;

    const now = new Date();
    const locale = selectedLanguage === 'ar' ? 'ar-SA' : selectedLanguage === 'ur' ? 'ur-PK' : selectedLanguage;
    const dateLabel = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(now);
    const numLabel = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(1234.56);

    const entry = (sample as any)[selectedLanguage] ?? sample.en;
    return { ...entry, dateLabel, numLabel };
  }, [selectedLanguage]);

  const Section = ({
    id,
    title,
    icon,
    children,
    subtitle,
  }: {
    id: typeof openSection;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const open = openSection === id;
    return (
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setOpenSection(open ? 'language' : id);
          }}
          className="w-full px-5 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.30)' }}>
              {icon}
            </div>
            <div>
              <div className="text-white font-semibold">{title}</div>
              {subtitle ? <div className="text-white/55 text-sm">{subtitle}</div> : null}
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-white/70" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 180ms ease' }} />
        </button>
        {open ? <div className="px-5 pb-5">{children}</div> : null}
      </div>
    );
  };

  const saveAll = async () => {
    triggerHaptic('medium');
    if (!user?.id) {
      navigate('/login', { replace: true });
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Persist language to user_settings (and keep user_profiles.language for compatibility)
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        language: selectedLanguage,
        notifications_enabled: notificationsEnabled,
        notifications_push: notificationsPush,
        notifications_email: notificationsEmail,
        notifications_sms: notificationsSms,
        analytics_enabled: analyticsEnabled,
        face_detection_enabled: faceDetectionEnabled,
        cloud_ocr_sync_enabled: cloudOcrSyncEnabled,
      }, { onConflict: 'user_id' });
      await supabase.from('user_profiles').update({ language: selectedLanguage }).eq('user_id', user.id);

      // Apply language (may also persist via LanguageContext; we pass saveToDB=false to avoid duplicate writes)
      await changeLanguage(selectedLanguage, false);

      // Persist idle timeout
      await idleSecurityService.saveSettings(user.id, {
        idleTimeoutEnabled: idleEnabled,
        idleTimeoutMinutes: idleMinutes,
        maxUnlockAttempts: idleMaxAttempts,
        wipeDataOnMaxAttempts: idleWipeLocal,
        biometricUnlockEnabled: idleBiometric,
        idleSoundAlertsEnabled: idleSoundAlerts,
      });

      // Persist document lock enabled/disabled (only toggle if already has password set; otherwise keep disabled)
      await documentLockService.saveLockSettings({
        userId: user.id,
        lockEnabled: docLockEnabled,
        lockTrigger: docLockTrigger,
      });
      if (docLockEnabled) {
        const s = await documentLockService.getLockSettings(user.id);
        if (!s?.lockPasswordHash) {
          // Require a password to enable lock
          await documentLockService.disableLock(user.id);
          setDocLockEnabled(false);
          setDocLockHasPassword(false);
          setShowDocLockModal(true);
          setDocLockModalMode('set');
          throw new Error('Set a lock password to enable Document Lock.');
        }
      } else {
        documentLockService.setDocumentsLocked(false);
      }

      // Mark onboarding complete
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString(), onboarding_stage: 4 })
        .eq('user_id', user.id);

      localStorage.removeItem('onboarding.active');
      navigate('/dashboard', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save setup.');
    } finally {
      setSaving(false);
    }
  };

  const setUpLater = async () => {
    triggerHaptic('light');
    if (!user?.id) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true, onboarding_completed_at: new Date().toISOString(), onboarding_stage: 4 })
        .eq('user_id', user.id);
      localStorage.removeItem('onboarding.active');
    } catch {}
    navigate('/dashboard', { replace: true });
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
        <div className="w-full max-w-3xl">
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
            <div className="flex items-center justify-between gap-4">
              <GlassPill className="text-white/85">Step 4 of 4</GlassPill>
              <button
                type="button"
                className="text-white/60 hover:text-white text-sm underline underline-offset-4"
                onClick={() => {
                  setUpLater();
                }}
              >
                {t('onboarding.stage4.setUpLater')}
              </button>
            </div>

            <h1 className="mt-4 text-white font-semibold tracking-tight text-[32px] leading-tight">
              {t('onboarding.stage4.title')}
            </h1>
            <p className="mt-2 text-white/65 text-[17px] leading-relaxed">{t('onboarding.stage4.subtitle')}</p>

            <div className="mt-8 space-y-4">
              <Section
                id="language"
                title="🌍 Language & Region"
                subtitle="Choose your language (RTL supported)"
                icon={<Globe className="w-5 h-5 text-purple-200" />}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {languages.map((l) => {
                      const selected = selectedLanguage === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedLanguage(l.code);
                          }}
                          className="rounded-2xl p-4 text-left relative"
                          style={{
                            background: selected ? 'rgba(139,92,246,0.18)' : 'rgba(255,255,255,0.06)',
                            border: selected ? '2px solid rgba(139,92,246,0.65)' : '1px solid rgba(255,255,255,0.12)',
                          }}
                        >
                          <div className="text-[44px] leading-none">{l.flag}</div>
                          <div className="mt-2 text-white font-semibold">{l.name}</div>
                          <div className="text-white/60 text-sm">{l.native}</div>
                          {selected ? <div className="absolute top-3 right-3 text-purple-200">✓</div> : null}
                        </button>
                      );
                    })}
                  </div>

                  <div
                    className="rounded-2xl p-4"
                    style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
                      <Eye className="w-4 h-4 text-purple-200" />
                      Preview
                    </div>
                    <div className="mt-3 rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                      <div className="text-white font-semibold">{preview.greeting}</div>
                      <div className="text-white/60 text-sm mt-1">{preview.dateLabel} • {preview.numLabel}</div>
                      <div className="mt-4 inline-flex items-center gap-2 px-3 h-9 rounded-xl" style={{ background: 'rgba(139,92,246,0.20)', border: '1px solid rgba(139,92,246,0.28)' }}>
                        <span className="text-white text-sm font-semibold">{preview.cta}</span>
                      </div>
                      <div className="mt-4 grid grid-cols-5 gap-2 text-[11px] text-white/60">
                        {preview.nav.map((n: string) => (
                          <div key={n} className="px-2 py-1 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <GlassButton
                        variant="secondary"
                        className="w-full"
                        onClick={async () => {
                          triggerHaptic('light');
                          if (!user?.id) return;
                          await supabase.from('user_settings').upsert({ user_id: user.id, language: selectedLanguage }, { onConflict: 'user_id' });
                          await supabase.from('user_profiles').update({ language: selectedLanguage }).eq('user_id', user.id);
                          await changeLanguage(selectedLanguage, false);
                          window.location.reload();
                        }}
                        disabled={saving}
                      >
                        Apply Language (reload)
                      </GlassButton>
                    </div>
                  </div>
                </div>
              </Section>

              <Section
                id="idle"
                title="⏱️ Idle Timeout Protection"
                subtitle="Auto-lock the app when inactive"
                icon={<Shield className="w-5 h-5 text-purple-200" />}
              >
                <div className="flex items-center justify-between mt-2">
                  <div className="text-white/75 text-sm">Enable Idle Timeout</div>
                  <button
                    type="button"
                    onClick={() => setIdleEnabled((v) => !v)}
                    className="w-12 h-7 rounded-full relative"
                    style={{ background: idleEnabled ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.18)' }}
                  >
                    <span
                      className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                      style={{ transform: idleEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-white/65 text-xs mb-2">Lock after</div>
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 5, 10, 15].map((m) => (
                      <button
                        key={m}
                        type="button"
                        disabled={!idleEnabled}
                        onClick={() => setIdleMinutes(m as any)}
                        className="py-2 rounded-xl text-sm"
                        style={{
                          opacity: idleEnabled ? 1 : 0.45,
                          background: idleMinutes === m ? 'rgba(139,92,246,0.25)' : 'rgba(0,0,0,0.18)',
                          border: idleMinutes === m ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.10)',
                          color: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-white/65 text-xs mb-2">Max password attempts</div>
                    <select
                      className="glass-input w-full h-11 px-4 text-white bg-transparent"
                      value={idleMaxAttempts}
                      onChange={(e) => setIdleMaxAttempts(Number(e.target.value) as any)}
                      disabled={!idleEnabled}
                      style={{ opacity: idleEnabled ? 1 : 0.5 }}
                    >
                      {[1, 3, 5, 10].map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.10)', opacity: idleEnabled ? 1 : 0.5 }}>
                    <div>
                      <div className="text-white text-sm font-semibold">Wipe local data</div>
                      <div className="text-white/55 text-xs">after max attempts</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIdleWipeLocal((v) => !v)}
                      disabled={!idleEnabled}
                      className="w-12 h-7 rounded-full relative"
                      style={{ background: idleWipeLocal ? 'rgba(248,113,113,0.95)' : 'rgba(255,255,255,0.18)' }}
                    >
                      <span
                        className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                        style={{ transform: idleWipeLocal ? 'translateX(22px)' : 'translateX(2px)' }}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.10)', opacity: idleEnabled ? 1 : 0.5 }}>
                    <div>
                      <div className="text-white text-sm font-semibold">Biometric unlock</div>
                      <div className="text-white/55 text-xs">Face ID / Passkey</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIdleBiometric((v) => !v)}
                      disabled={!idleEnabled}
                      className="w-12 h-7 rounded-full relative"
                      style={{ background: idleBiometric ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.18)' }}
                    >
                      <span
                        className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                        style={{ transform: idleBiometric ? 'translateX(22px)' : 'translateX(2px)' }}
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.10)', opacity: idleEnabled ? 1 : 0.5 }}>
                  <div className="text-white text-sm font-semibold">Sound alerts</div>
                  <button
                    type="button"
                    onClick={() => setIdleSoundAlerts((v) => !v)}
                    disabled={!idleEnabled}
                    className="w-12 h-7 rounded-full relative"
                    style={{ background: idleSoundAlerts ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.18)' }}
                  >
                    <span
                      className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                      style={{ transform: idleSoundAlerts ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
              </Section>

              <Section
                id="doclock"
                title="🔒 Document Page Lock"
                subtitle="Require a password to view documents"
                icon={<Lock className="w-5 h-5 text-purple-200" />}
              >
                <div className="flex items-center justify-between mt-2">
                  <div className="text-white/75 text-sm">Lock Documents Page</div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !docLockEnabled;
                      setDocLockEnabled(next);
                      if (next && !docLockHasPassword) {
                        setShowDocLockModal(true);
                        setDocLockModalMode('set');
                      }
                    }}
                    className="w-12 h-7 rounded-full relative"
                    style={{ background: docLockEnabled ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.18)' }}
                  >
                    <span
                      className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                      style={{ transform: docLockEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="text-white/65 text-xs mb-2">Lock trigger</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'always', label: 'Always' },
                      { key: 'idle', label: 'After Idle' },
                      { key: 'manual', label: 'Manual' },
                    ].map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setDocLockTrigger(o.key as any)}
                        className="py-2 rounded-xl text-sm"
                        style={{
                          background: docLockTrigger === o.key ? 'rgba(139,92,246,0.25)' : 'rgba(0,0,0,0.18)',
                          border: docLockTrigger === o.key ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.10)',
                          color: 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <div>
                    <div className="text-white text-sm font-semibold">Lock password</div>
                    <div className="text-white/55 text-xs">{docLockHasPassword ? 'Password set' : 'Not set yet'}</div>
                  </div>
                  <GlassButton
                    variant="secondary"
                    onClick={() => {
                      setShowDocLockModal(true);
                      setDocLockModalMode(docLockHasPassword ? 'change' : 'set');
                    }}
                  >
                    {docLockHasPassword ? 'Change' : 'Set'}
                  </GlassButton>
                </div>

                <div className="mt-3 text-xs text-white/55">
                  Tip: choose a password different from your account password.
                </div>
              </Section>

              <Section
                id="2fa"
                title="🔐 Two-Factor Authentication (2FA)"
                subtitle="Highly recommended"
                icon={<Shield className="w-5 h-5 text-purple-200" />}
              >
                <div className="flex items-center justify-between mt-2">
                  <div className="text-white/75 text-sm">Enable 2FA (Authenticator App)</div>
                  <button
                    type="button"
                    onClick={async () => {
                      triggerHaptic('light');
                      if (!user?.id) return;
                      if (twoFactorEnabled) {
                        // Disabling requires picking a factor; we keep this for Settings (avoid breaking onboarding)
                        setTwoFactorEnabled(true);
                        setError('Disable 2FA from Settings (Desktop) for now.');
                        return;
                      }
                      setShowMFAModal(true);
                    }}
                    className="w-12 h-7 rounded-full relative"
                    style={{ background: twoFactorEnabled ? 'rgba(34,197,94,0.95)' : 'rgba(255,255,255,0.18)' }}
                  >
                    <span
                      className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                      style={{ transform: twoFactorEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
                <div className="mt-3 text-xs text-white/55">
                  Uses TOTP (Google Authenticator, 1Password, Authy). Backup codes will be generated during setup.
                </div>
              </Section>

              <Section
                id="notifications"
                title="🔔 Notifications"
                subtitle="Control channels (push/email/sms)"
                icon={<Bell className="w-5 h-5 text-purple-200" />}
              >
                <div className="flex items-center justify-between mt-2">
                  <div className="text-white/75 text-sm">Enable Notifications</div>
                  <button
                    type="button"
                    onClick={() => setNotificationsEnabled((v) => !v)}
                    className="w-12 h-7 rounded-full relative"
                    style={{ background: notificationsEnabled ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.18)' }}
                  >
                    <span
                      className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                      style={{ transform: notificationsEnabled ? 'translateX(22px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3" style={{ opacity: notificationsEnabled ? 1 : 0.5 }}>
                  {[
                    { label: 'Push', value: notificationsPush, set: setNotificationsPush },
                    { label: 'Email', value: notificationsEmail, set: setNotificationsEmail },
                    { label: 'SMS', value: notificationsSms, set: setNotificationsSms },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.10)' }}>
                      <div className="text-white text-sm font-semibold">{c.label}</div>
                      <button
                        type="button"
                        onClick={() => c.set((v: boolean) => !v)}
                        disabled={!notificationsEnabled}
                        className="w-12 h-7 rounded-full relative"
                        style={{ background: c.value ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.18)' }}
                      >
                        <span
                          className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                          style={{ transform: c.value ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Section>

              <Section
                id="privacy"
                title="🔒 Privacy & Data"
                subtitle="Control analytics + features"
                icon={<Eye className="w-5 h-5 text-purple-200" />}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {[
                    { label: 'Analytics', sub: 'Anonymous usage', value: analyticsEnabled, set: setAnalyticsEnabled },
                    { label: 'Face detection', sub: 'On-device only', value: faceDetectionEnabled, set: setFaceDetectionEnabled },
                    { label: 'Cloud OCR sync', sub: 'Encrypted transfer', value: cloudOcrSyncEnabled, set: setCloudOcrSyncEnabled },
                  ].map((c) => (
                    <div key={c.label} className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.10)' }}>
                      <div>
                        <div className="text-white text-sm font-semibold">{c.label}</div>
                        <div className="text-white/55 text-xs">{c.sub}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => c.set((v: boolean) => !v)}
                        className="w-12 h-7 rounded-full relative"
                        style={{ background: c.value ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.18)' }}
                      >
                        <span
                          className="absolute top-[2px] w-6 h-6 rounded-full bg-white transition-transform"
                          style={{ transform: c.value ? 'translateX(22px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </Section>
            </div>

            <div
              className="mt-8 rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              <div className="text-white font-semibold">{t('onboarding.stage4.summaryTitle')}</div>
              <div className="mt-2 text-white/65 text-sm">
                Language: {languages.find((l) => l.code === selectedLanguage)?.name || 'English'} • Idle timeout:{' '}
                {idleEnabled ? `${idleMinutes} minutes` : 'Off'} • Document lock: {docLockEnabled ? 'On' : 'Off'} • 2FA:{' '}
                {twoFactorEnabled ? 'On' : 'Off'} • Notifications: {notificationsEnabled ? 'On' : 'Off'}
              </div>
            </div>

            {error ? <div className="mt-4 text-sm text-red-200/90">{error}</div> : null}

            <div className="mt-10 flex items-center justify-between gap-3">
              <GlassButton
                variant="secondary"
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/onboarding/profile');
                }}
              >
                <ArrowLeft className="w-4 h-4" />
                {t('onboarding.stage4.backToProfile')}
              </GlassButton>
              <GlassButton
                onClick={saveAll}
                disabled={saving}
              >
                {t('onboarding.stage4.completeSetup')} <CheckCircle2 className="w-4 h-4" />
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>

      <SetDocumentLockModal
        isOpen={showDocLockModal}
        onClose={() => setShowDocLockModal(false)}
        mode={docLockModalMode}
        onSuccess={async () => {
          if (!user?.id) return;
          try {
            const s = await documentLockService.getLockSettings(user.id);
            setDocLockHasPassword(!!s?.lockPasswordHash);
            if (docLockEnabled) {
              await documentLockService.enableLock(user.id);
            }
          } catch {}
        }}
      />

      <MFASetupModal
        isOpen={showMFAModal}
        onClose={() => setShowMFAModal(false)}
        onSuccess={async () => {
          try {
            const enabled = await mfaService.hasMFAEnabled();
            setTwoFactorEnabled(enabled);
          } catch {
            setTwoFactorEnabled(true);
          }
        }}
      />
    </motion.div>
  );
}


