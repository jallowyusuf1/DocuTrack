import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Lock,
  Mail,
  Trash2,
  Bell,
  Clock,
  Moon,
  Globe,
  Database,
  Download,
  Info,
  Shield,
  FileText,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../services/notifications';
import { supabase } from '../../config/supabase';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import Toggle from '../../components/ui/Toggle';
import QuietHoursModal from '../../components/profile/QuietHoursModal';
import LanguagePickerModal from '../../components/profile/LanguagePickerModal';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import ExportDataModal from '../../components/profile/ExportDataModal';
import OnboardingTutorial from '../../components/onboarding/OnboardingTutorial';
import { triggerHaptic } from '../../utils/animations';
import Skeleton from '../../components/ui/Skeleton';
import type { NotificationPreferences } from '../../services/notifications';

interface SettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  notificationIntervals: {
    thirtyDays: boolean;
    fourteenDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
    onExpiry: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  language: string;
  theme: 'dark';
}

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language: currentLanguageCode, setLanguage } = useLanguage();
  const { theme } = useTheme();
  const { toasts, showToast, removeToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsState>({
    pushNotifications: true,
    emailNotifications: false,
    notificationIntervals: {
      thirtyDays: true,
      fourteenDays: false,
      sevenDays: true,
      oneDay: true,
      onExpiry: true,
    },
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '08:00',
    },
    language: 'en',
    theme: 'dark',
  });
  const [expandedIntervals, setExpandedIntervals] = useState(false);
  const [storageUsed, setStorageUsed] = useState('0 MB');
  const [storageTotal, setStorageTotal] = useState('100 MB');
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [isQuietHoursOpen, setIsQuietHoursOpen] = useState(false);
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isClearCacheConfirmOpen, setIsClearCacheConfirmOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getLanguageDisplayName = () => {
    const languages: Record<string, string> = {
      en: 'English',
      ar: 'العربية',
      es: 'Español',
      fr: 'Français',
      ur: 'اردو',
    };
    return languages[currentLanguageCode] || 'English';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Load settings from database
  useEffect(() => {
    if (!user?.id) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        const preferences = await getNotificationPreferences(user.id);

        setSettings({
          pushNotifications: preferences.push_enabled ?? true,
          emailNotifications: preferences.email_enabled ?? false,
          notificationIntervals: {
            thirtyDays: preferences.notify_30_days ?? true,
            fourteenDays: preferences.notify_14_days ?? false,
            sevenDays: preferences.notify_7_days ?? true,
            oneDay: preferences.notify_1_day ?? true,
            onExpiry: preferences.notify_expired ?? true,
          },
          quietHours: {
            enabled: true,
            start: preferences.quiet_hours_start || '22:00',
            end: preferences.quiet_hours_end || '08:00',
          },
          language: currentLanguageCode,
          theme: 'dark',
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
        showToast('Failed to load settings', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user, currentLanguageCode, showToast]);

  // Calculate storage used
  useEffect(() => {
    if (!user?.id) return;

    const calculateStorage = async () => {
      try {
        const { data, error } = await supabase.storage
          .from('document-images')
          .list(user.id, {
            limit: 1000,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (error) throw error;

        let totalSize = 0;
        data?.forEach((file) => {
          totalSize += file.metadata?.size || 0;
        });

        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
        setStorageUsed(`${sizeInMB} MB`);
      } catch (error) {
        console.error('Failed to calculate storage:', error);
      }
    };

    calculateStorage();
  }, [user]);

  // Calculate cache size
  useEffect(() => {
    const calculateCacheSize = () => {
      try {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            const value = localStorage.getItem(key);
            if (value) {
              totalSize += new Blob([value]).size;
            }
          }
        }
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
        setCacheSize(`${sizeInMB} MB`);
      } catch (error) {
        console.error('Failed to calculate cache:', error);
      }
    };

    calculateCacheSize();
  }, []);

  // Save settings to database
  const saveSettings = async (updates: Partial<SettingsState>) => {
    if (!user?.id) return;

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    // Debounce saves
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateNotificationPreferences(user.id, {
          push_enabled: newSettings.pushNotifications,
          email_enabled: newSettings.emailNotifications,
          notify_30_days: newSettings.notificationIntervals.thirtyDays,
          notify_14_days: newSettings.notificationIntervals.fourteenDays,
          notify_7_days: newSettings.notificationIntervals.sevenDays,
          notify_1_day: newSettings.notificationIntervals.oneDay,
          notify_expired: newSettings.notificationIntervals.onExpiry,
          quiet_hours_start: newSettings.quietHours.start,
          quiet_hours_end: newSettings.quietHours.end,
        });
      } catch (error) {
        console.error('Failed to save settings:', error);
        showToast('Failed to save settings', 'error');
      }
    }, 500);
  };

  const handleClearCache = async () => {
    triggerHaptic('medium');
    try {
      // Clear localStorage except auth tokens
      const keysToKeep = ['supabase.auth.token', 'app_theme'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach((key) => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear IndexedDB if used
      if ('indexedDB' in window) {
        // Clear any IndexedDB caches if needed
      }

      setCacheSize('0 MB');
      setIsClearCacheConfirmOpen(false);
      showToast('Cache cleared successfully', 'success');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      showToast('Failed to clear cache', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleteAccountOpen(false);
    if (!user?.id) return;

    try {
      // Delete all documents
      const documents = await documentService.getDocuments(user.id);
      for (const doc of documents) {
        await documentService.deleteDocument(doc.id, user.id);
      }

      // Delete user profile
      await supabase.from('user_profiles').delete().eq('user_id', user.id);

      // Sign out
      await supabase.auth.signOut();

      navigate('/login');
    } catch (error) {
      console.error('Failed to delete account:', error);
      showToast('Failed to delete account', 'error');
    }
  };

  const storagePercentage = () => {
    const used = parseFloat(storageUsed);
    const total = parseFloat(storageTotal);
    return total > 0 ? Math.min((used / total) * 100, 100) : 0;
  };

  // Settings Row Component
  const SettingsRow = ({
    icon: Icon,
    label,
    description,
    value,
    onPress,
    rightElement,
    isDanger = false,
  }: {
    icon: typeof Lock;
    label: string;
    description?: string;
    value?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    isDanger?: boolean;
  }) => (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="w-full h-[56px] md:h-[64px] px-4 md:px-5 flex items-center justify-between border-b border-white/5 last:border-b-0"
      style={{
        color: isDanger ? '#F87171' : '#FFFFFF',
      }}
    >
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <div
          className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(167, 139, 250, 0.1)',
            color: isDanger ? '#F87171' : '#A78BFA',
          }}
        >
          <Icon className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[17px] md:text-[19px] font-semibold text-left">{label}</div>
          {description && (
            <div className="text-[13px] md:text-[15px] text-left mt-0.5" style={{ color: '#A78BFA' }}>
              {description}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {value && (
          <span className="text-[15px] md:text-[17px]" style={{ color: '#A78BFA' }}>
            {value}
          </span>
        )}
        {rightElement || (onPress && <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />)}
      </div>
    </motion.button>
  );

  if (loading) {
    return (
      <div className="pb-[72px] min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
            }}
          />
        </div>
        <div className="relative z-10 px-4 py-6 space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[72px] min-h-screen relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header
          className="sticky top-0 z-20 h-[70px] flex items-center gap-4 px-5"
          style={{
            background: 'rgba(35, 29, 51, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('light');
              navigate('/profile');
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(35, 29, 51, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </motion.button>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
        </header>

        {/* Scrollable Content */}
        <div className="px-4 md:px-5 py-6 space-y-6 md:max-w-[700px] md:mx-auto">
          {/* Section 1: Account Settings */}
          <div>
            <h3
              className="text-xs font-bold uppercase mb-3"
              style={{
                color: '#A78BFA',
                letterSpacing: '1px',
                marginTop: '32px',
              }}
            >
              Account Settings
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <SettingsRow
                icon={Lock}
                label="Change Password"
                onPress={() => {
                  triggerHaptic('light');
                  navigate('/profile/change-password');
                }}
              />
              <SettingsRow
                icon={Mail}
                label="Email"
                value={user?.email || ''}
              />
              <SettingsRow
                icon={Trash2}
                label="Delete Account"
                onPress={() => {
                  triggerHaptic('medium');
                  setIsDeleteAccountOpen(true);
                }}
                isDanger
              />
            </div>
          </div>

          {/* Section 2: Notifications */}
          <div>
            <h3
              className="text-xs font-bold uppercase mb-3"
              style={{
                color: '#A78BFA',
                letterSpacing: '1px',
              }}
            >
              Notifications
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div className="w-full h-[56px] md:h-[64px] px-4 md:px-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <div className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                    <Bell className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" style={{ color: '#A78BFA' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] md:text-[19px] font-semibold text-white">Push Notifications</div>
                    <div className="text-[13px] md:text-[15px] mt-0.5" style={{ color: '#A78BFA' }}>
                      Get notified about expiring documents
                    </div>
                  </div>
                </div>
                <Toggle
                  checked={settings.pushNotifications}
                  onChange={(checked) => {
                    triggerHaptic('light');
                    saveSettings({ pushNotifications: checked });
                  }}
                />
              </div>

              <div className="w-full h-[56px] md:h-[64px] px-4 md:px-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <div className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                    <Mail className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" style={{ color: '#A78BFA' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] md:text-[19px] font-semibold text-white">Email Notifications</div>
                    <div className="text-[13px] md:text-[15px] mt-0.5" style={{ color: '#A78BFA' }}>
                      Receive email reminders
                    </div>
                  </div>
                </div>
                <Toggle
                  checked={settings.emailNotifications}
                  onChange={(checked) => {
                    triggerHaptic('light');
                    saveSettings({ emailNotifications: checked });
                  }}
                />
              </div>

              {/* Notification Intervals - Expandable */}
              <div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    triggerHaptic('light');
                    setExpandedIntervals(!expandedIntervals);
                  }}
                  className="w-full h-[56px] md:h-[64px] px-4 md:px-5 flex items-center justify-between border-b border-white/5"
                >
                  <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                      <Clock className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" style={{ color: '#A78BFA' }} />
                    </div>
                    <div className="text-[17px] md:text-[19px] font-semibold text-white">Notification Intervals</div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${expandedIntervals ? 'rotate-180' : ''}`}
                    style={{ color: '#A78BFA' }}
                  />
                </motion.button>

                <AnimatePresence>
                  {expandedIntervals && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="mx-4 my-3 p-4 rounded-xl space-y-3"
                        style={{
                          background: 'rgba(35, 29, 51, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        {[
                          { key: 'thirtyDays', label: '30 days before expiration' },
                          { key: 'fourteenDays', label: '14 days before expiration' },
                          { key: 'sevenDays', label: '7 days before expiration' },
                          { key: 'oneDay', label: '1 day before expiration' },
                          { key: 'onExpiry', label: 'On expiration day' },
                        ].map((interval) => (
                          <motion.button
                            key={interval.key}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              triggerHaptic('light');
                              const newIntervals = {
                                ...settings.notificationIntervals,
                                [interval.key]: !settings.notificationIntervals[interval.key as keyof typeof settings.notificationIntervals],
                              };
                              saveSettings({ notificationIntervals: newIntervals });
                            }}
                            className="w-full flex items-center justify-between py-2"
                          >
                            <span className="text-sm text-white">{interval.label}</span>
                            <div
                              className="w-5 h-5 rounded flex items-center justify-center transition-all"
                              style={{
                                background: settings.notificationIntervals[interval.key as keyof typeof settings.notificationIntervals]
                                  ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                                  : 'rgba(255, 255, 255, 0.1)',
                                border: settings.notificationIntervals[interval.key as keyof typeof settings.notificationIntervals]
                                  ? 'none'
                                  : '1px solid rgba(255, 255, 255, 0.2)',
                              }}
                            >
                              {settings.notificationIntervals[interval.key as keyof typeof settings.notificationIntervals] && (
                                <Check className="w-3 h-3 text-white" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Quiet Hours */}
              <SettingsRow
                icon={Moon}
                label="Quiet Hours"
                value={`${formatTime(settings.quietHours.start)} - ${formatTime(settings.quietHours.end)}`}
                onPress={() => {
                  triggerHaptic('light');
                  setIsQuietHoursOpen(true);
                }}
              />
            </div>
          </div>

          {/* Section 3: Appearance */}
          <div>
            <h3
              className="text-xs font-bold uppercase mb-3"
              style={{
                color: '#A78BFA',
                letterSpacing: '1px',
              }}
            >
              Appearance
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <SettingsRow
                icon={Globe}
                label="Language"
                value={getLanguageDisplayName()}
                onPress={() => {
                  triggerHaptic('light');
                  setIsLanguagePickerOpen(true);
                }}
              />
              <div className="w-full h-[56px] md:h-[64px] px-4 md:px-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <div className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                    <Moon className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" style={{ color: '#A78BFA' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] md:text-[19px] font-semibold text-white">Dark Mode</div>
                    <div className="text-[13px] md:text-[15px] mt-0.5" style={{ color: '#A78BFA' }}>
                      Always dark mode
                    </div>
                  </div>
                </div>
                <Toggle checked={theme === 'dark'} onChange={() => {}} disabled />
              </div>
            </div>
          </div>

          {/* Section 4: Data & Storage */}
          <div>
            <h3
              className="text-xs font-bold uppercase mb-3"
              style={{
                color: '#A78BFA',
                letterSpacing: '1px',
              }}
            >
              Data & Storage
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Storage Used */}
              <div className="px-4 md:px-5 py-4 md:py-5 border-b border-white/5">
                <div className="flex items-center gap-3 md:gap-4 mb-3">
                  <div className="w-[40px] h-[40px] md:w-[44px] md:h-[44px] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167, 139, 250, 0.1)' }}>
                    <Database className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]" style={{ color: '#A78BFA' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[17px] md:text-[19px] font-semibold text-white">Storage Used</div>
                  </div>
                  <span className="text-[15px] md:text-[17px]" style={{ color: '#A78BFA' }}>
                    {storageUsed} / {storageTotal}
                  </span>
                </div>
                {/* Progress Bar */}
                <div
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{
                    background: 'rgba(35, 29, 51, 0.6)',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercentage()}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                    }}
                  />
                </div>
              </div>

              <SettingsRow
                icon={Download}
                label="Export All Documents"
                description="Download as ZIP file"
                onPress={() => {
                  triggerHaptic('light');
                  setIsExportDataOpen(true);
                }}
              />
              <SettingsRow
                icon={Trash2}
                label="Clear Cache"
                value={cacheSize}
                onPress={() => {
                  triggerHaptic('light');
                  setIsClearCacheConfirmOpen(true);
                }}
              />
            </div>
          </div>

          {/* Section 5: About */}
          <div>
            <h3
              className="text-xs font-bold uppercase mb-3"
              style={{
                color: '#A78BFA',
                letterSpacing: '1px',
              }}
            >
              About
            </h3>
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <SettingsRow icon={Info} label="Version" value="1.0.0" />
              <SettingsRow
                icon={Shield}
                label="Privacy Policy"
                onPress={() => {
                  triggerHaptic('light');
                  navigate('/privacy');
                }}
              />
              <SettingsRow
                icon={FileText}
                label="Terms of Service"
                onPress={() => {
                  triggerHaptic('light');
                  navigate('/terms');
                }}
              />
              <SettingsRow
                icon={HelpCircle}
                label="Help & Support"
                onPress={() => {
                  triggerHaptic('light');
                  showToast('Help & Support coming soon', 'info');
                }}
              />
              <SettingsRow
                icon={RefreshCw}
                label="Replay Tutorial"
                onPress={() => {
                  triggerHaptic('light');
                  setIsTutorialOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <OnboardingTutorial
        isOpen={isTutorialOpen}
        onComplete={() => {
          setIsTutorialOpen(false);
          showToast('Tutorial completed!', 'success');
        }}
        onSkip={() => {
          setIsTutorialOpen(false);
        }}
      />
      <QuietHoursModal
        isOpen={isQuietHoursOpen}
        onClose={() => setIsQuietHoursOpen(false)}
        currentStart={settings.quietHours.start}
        currentEnd={settings.quietHours.end}
      />

      <LanguagePickerModal
        isOpen={isLanguagePickerOpen}
        onClose={() => setIsLanguagePickerOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={handleDeleteAccount}
      />

      <ExportDataModal
        isOpen={isExportDataOpen}
        onClose={() => setIsExportDataOpen(false)}
      />

      {/* Clear Cache Confirmation Modal */}
      <AnimatePresence>
        {isClearCacheConfirmOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsClearCacheConfirmOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="rounded-2xl p-6 w-full max-w-sm"
                style={{
                  background: 'rgba(26, 22, 37, 0.95)',
                  backdropFilter: 'blur(30px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                }}
              >
                <h2 className="text-xl font-bold text-white mb-2">Clear Cache?</h2>
                <p className="text-sm mb-6" style={{ color: '#A78BFA' }}>
                  This will free up {cacheSize} of storage
                </p>
                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsClearCacheConfirmOpen(false)}
                    className="flex-1 h-12 rounded-xl font-semibold text-white"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearCache}
                    className="flex-1 h-12 rounded-xl font-semibold text-white"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                    }}
                  >
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
