import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../config/supabase';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import LanguagePickerModal from '../../components/profile/LanguagePickerModal';
import QuietHoursModal from '../../components/settings/QuietHoursModal';
import ExportDataModal from '../../components/profile/ExportDataModal';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import { triggerHaptic } from '../../utils/animations';
import { useTranslation } from 'react-i18next';
import Skeleton from '../../components/ui/Skeleton';

interface NotificationIntervals {
  thirtyDays: boolean;
  fourteenDays: boolean;
  sevenDays: boolean;
  oneDay: boolean;
  onExpiry: boolean;
}

interface QuietHours {
  enabled: boolean;
  start: string;
  end: string;
}

interface SettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  notificationIntervals: NotificationIntervals;
  quietHours: QuietHours;
  language: string;
  theme: 'dark';
}

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { toasts, showToast, removeToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SettingsState>({
    pushNotifications: true,
    emailNotifications: true,
    notificationIntervals: {
      thirtyDays: true,
      fourteenDays: true,
      sevenDays: true,
      oneDay: true,
      onExpiry: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    language: 'en',
    theme: 'dark',
  });

  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isQuietHoursOpen, setIsQuietHoursOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isIntervalsExpanded, setIsIntervalsExpanded] = useState(false);
  const [storageUsed, setStorageUsed] = useState({ used: 0, total: 100 * 1024 * 1024 }); // 100 MB default
  const [cacheSize, setCacheSize] = useState(0);

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to handle case where profile doesn't exist

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Failed to load settings:', error);
        }

        if (profile) {
          setSettings({
            pushNotifications: profile.notification_preferences?.push_enabled ?? true,
            emailNotifications: profile.notification_preferences?.email_enabled ?? true,
            notificationIntervals: profile.notification_preferences?.intervals ?? {
              thirtyDays: true,
              fourteenDays: true,
              sevenDays: true,
              oneDay: true,
              onExpiry: true,
            },
            quietHours: profile.notification_preferences?.quiet_hours ?? {
              enabled: false,
              start: '22:00',
              end: '08:00',
            },
            language: profile.language || language || 'en', // Use context language as fallback
            theme: 'dark',
          });
        } else {
          // No profile exists, use defaults
          setSettings(prev => ({
            ...prev,
            language: language || 'en',
          }));
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Set defaults on error
        setSettings(prev => ({
          ...prev,
          language: language || 'en',
        }));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
    calculateStorage();
    calculateCacheSize();
  }, [user?.id, language]);

  // Calculate storage used
  const calculateStorage = async () => {
    if (!user?.id) return;

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

      setStorageUsed({
        used: totalSize,
        total: 100 * 1024 * 1024, // 100 MB limit
      });
    } catch (error) {
      console.error('Failed to calculate storage:', error);
    }
  };

  // Calculate cache size
  const calculateCacheSize = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const cacheSize = estimate.usage || 0;
        setCacheSize(cacheSize);
      }
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
    }
  };

  // Save settings to database
  const saveSettings = async (updates: Partial<SettingsState>) => {
    if (!user?.id) return;

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          notification_preferences: {
            push_enabled: newSettings.pushNotifications,
            email_enabled: newSettings.emailNotifications,
            intervals: newSettings.notificationIntervals,
            quiet_hours: newSettings.quietHours,
          },
          language: newSettings.language,
        })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings', 'error');
    }
  };

  // Format bytes to MB
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Format storage display
  const formatStorage = (): string => {
    const usedMB = formatBytes(storageUsed.used);
    const totalMB = formatBytes(storageUsed.total);
    return `${usedMB} / ${totalMB}`;
  };

  // Storage percentage
  const storagePercentage = (storageUsed.used / storageUsed.total) * 100;

  // Toggle component
  const ToggleSwitch = ({ 
    enabled, 
    onToggle 
  }: { 
    enabled: boolean; 
    onToggle: (enabled: boolean) => void;
  }) => {
    return (
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          triggerHaptic('light');
          onToggle(!enabled);
        }}
        className="relative w-[52px] h-[32px] rounded-full transition-all duration-300"
        style={{
          background: enabled
            ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
            : 'rgba(107, 102, 126, 0.3)',
          boxShadow: enabled
            ? '0 0 16px rgba(139, 92, 246, 0.6)'
            : 'none',
        }}
      >
        <motion.div
          animate={{
            x: enabled ? 20 : 2,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-[2px] w-[28px] h-[28px] rounded-full bg-white shadow-lg"
        />
      </motion.button>
    );
  };

  // Settings Row Component
  const SettingsRow = ({
    icon: Icon,
    label,
    description,
    value,
    rightElement,
    onPress,
    isDestructive = false,
  }: {
    icon: any;
    label: string;
    description?: string;
    value?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    isDestructive?: boolean;
  }) => {
    const content = (
      <motion.div
        whileTap={onPress ? { scale: 0.98 } : {}}
        className={`
          flex items-center justify-between px-4 py-4 h-[60px]
          ${onPress ? 'cursor-pointer' : ''}
          border-b border-white/5
          last:border-b-0
        `}
        onClick={onPress}
      >
        <div className="flex items-center flex-1 min-w-0">
          <div
            className="flex-shrink-0 mr-4"
            style={{
              background: isDestructive
                ? 'rgba(239, 68, 68, 0.2)'
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
              borderRadius: '12px',
              padding: '8px',
            }}
          >
            <Icon
              className="w-6 h-6"
              style={{
                color: isDestructive ? '#EF4444' : '#A78BFA',
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-base font-medium truncate"
              style={{
                color: isDestructive ? '#EF4444' : '#FFFFFF',
              }}
            >
              {label}
            </div>
            {description && (
              <div className="text-[13px] mt-0.5 truncate" style={{ color: '#A78BFA' }}>
                {description}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {value && (
            <span className="text-sm" style={{ color: '#A78BFA' }}>
              {value}
            </span>
          )}
          {rightElement}
          {onPress && !rightElement && (
            <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
          )}
        </div>
      </motion.div>
    );

    return content;
  };

  // Section Header
  const SectionHeader = ({ title }: { title: string }) => (
    <div className="px-4 mt-8 mb-3">
      <h3
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: '#A78BFA' }}
      >
        {title}
      </h3>
    </div>
  );

  // Glass Card Container
  const GlassCard = ({ children }: { children: React.ReactNode }) => (
    <div
      className="mx-4 mb-3 rounded-[20px] overflow-hidden"
      style={{
        background: 'rgba(42, 38, 64, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      }}
    >
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen pb-24" style={{ background: 'transparent' }}>
        <div className="fixed top-0 left-0 right-0 z-20 h-[70px] flex items-center px-4 border-b border-white/10"
          style={{
            background: 'rgba(35, 29, 51, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="ml-4 h-6 w-24" />
        </div>
        <div className="pt-[86px] px-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-3">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-20 rounded-[20px]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: 'transparent' }}>
      {/* Header */}
      <div
        className="fixed top-0 left-0 right-0 z-20 h-[70px] flex items-center px-4 border-b border-white/10"
        style={{
          background: 'rgba(35, 29, 51, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
          style={{
            background: 'rgba(42, 38, 64, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
      </div>

      {/* Content */}
      <div className="pt-[86px]">
        {/* SECTION 1: ACCOUNT SETTINGS */}
        <SectionHeader title="Account Settings" />
        <GlassCard>
          <SettingsRow
            icon={Lock}
            label="Change Password"
            onPress={() => navigate('/settings/change-password')}
          />
          <SettingsRow
            icon={Mail}
            label="Email"
            value={user?.email || ''}
          />
          <SettingsRow
            icon={Trash2}
            label="Delete Account"
            onPress={() => setIsDeleteAccountOpen(true)}
            isDestructive
          />
        </GlassCard>

        {/* SECTION 2: NOTIFICATIONS */}
        <SectionHeader title="Notifications" />
        <GlassCard>
          <SettingsRow
            icon={Bell}
            label="Push Notifications"
            description="Get notified about expiring documents"
            rightElement={
              <ToggleSwitch
                enabled={settings.pushNotifications}
                onToggle={(enabled) => {
                  saveSettings({ pushNotifications: enabled });
                  showToast(
                    enabled ? 'Push notifications enabled' : 'Push notifications disabled',
                    'success'
                  );
                }}
              />
            }
          />
          <SettingsRow
            icon={Mail}
            label="Email Notifications"
            description="Receive email reminders"
            rightElement={
              <ToggleSwitch
                enabled={settings.emailNotifications}
                onToggle={(enabled) => {
                  saveSettings({ emailNotifications: enabled });
                  showToast(
                    enabled ? 'Email notifications enabled' : 'Email notifications disabled',
                    'success'
                  );
                }}
              />
            }
          />
          <div>
            <SettingsRow
              icon={Clock}
              label="Notification Intervals"
              rightElement={
                <motion.div
                  animate={{ rotate: isIntervalsExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5" style={{ color: '#A78BFA' }} />
                </motion.div>
              }
              onPress={() => {
                triggerHaptic('light');
                setIsIntervalsExpanded(!isIntervalsExpanded);
              }}
            />
            {isIntervalsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-3"
                style={{
                  background: 'rgba(35, 29, 51, 0.4)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
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
                        [interval.key]: !settings.notificationIntervals[interval.key as keyof NotificationIntervals],
                      };
                      saveSettings({ notificationIntervals: newIntervals });
                    }}
                    className="w-full flex items-center justify-between py-3 border-b border-white/5 last:border-b-0"
                  >
                    <span className="text-sm text-white">{interval.label}</span>
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center transition-all"
                      style={{
                        background: settings.notificationIntervals[interval.key as keyof NotificationIntervals]
                          ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(109, 40, 217, 0.4))'
                          : 'rgba(35, 29, 51, 0.5)',
                        border: settings.notificationIntervals[interval.key as keyof NotificationIntervals]
                          ? '1px solid rgba(139, 92, 246, 0.5)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      {settings.notificationIntervals[interval.key as keyof NotificationIntervals] && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
          <SettingsRow
            icon={Moon}
            label="Quiet Hours"
            value={settings.quietHours.enabled ? `${settings.quietHours.start} - ${settings.quietHours.end}` : 'Disabled'}
            onPress={() => setIsQuietHoursOpen(true)}
          />
        </GlassCard>

        {/* SECTION 3: APPEARANCE */}
        <SectionHeader title="Appearance" />
        <GlassCard>
          <SettingsRow
            icon={Globe}
            label="Language"
            value={language === 'en' ? 'English' : language === 'ar' ? 'العربية' : language === 'es' ? 'Español' : language === 'fr' ? 'Français' : language === 'ur' ? 'اردو' : 'English'}
            onPress={() => setIsLanguagePickerOpen(true)}
          />
          <SettingsRow
            icon={Moon}
            label="Dark Mode"
            description="Always dark mode"
            rightElement={
              <ToggleSwitch
                enabled={true}
                onToggle={() => {
                  showToast('Dark mode is always enabled', 'info');
                }}
              />
            }
          />
        </GlassCard>

        {/* SECTION 4: DATA & STORAGE */}
        <SectionHeader title="Data & Storage" />
        <GlassCard>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center flex-1 min-w-0">
                <div
                  className="flex-shrink-0 mr-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
                    borderRadius: '12px',
                    padding: '8px',
                  }}
                >
                  <Database className="w-6 h-6" style={{ color: '#A78BFA' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-white">Storage Used</div>
                </div>
              </div>
              <span className="text-sm flex-shrink-0" style={{ color: '#A78BFA' }}>
                {formatStorage()}
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{
                background: 'rgba(35, 29, 51, 0.5)',
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(storagePercentage, 100)}%` }}
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
            onPress={() => setIsExportDataOpen(true)}
          />
          <SettingsRow
            icon={Trash2}
            label="Clear Cache"
            value={formatBytes(cacheSize)}
            onPress={async () => {
              if (confirm('Clear cache? This will free up storage.')) {
                try {
                  if ('caches' in window) {
                    const cacheNames = await caches.keys();
                    await Promise.all(cacheNames.map(name => caches.delete(name)));
                  }
                  await calculateCacheSize();
                  showToast('Cache cleared successfully', 'success');
                } catch (error) {
                  showToast('Failed to clear cache', 'error');
                }
              }
            }}
          />
        </GlassCard>

        {/* SECTION 5: ABOUT */}
        <SectionHeader title="About" />
        <GlassCard>
          <SettingsRow
            icon={Info}
            label="Version"
            value="1.0.0"
          />
          <SettingsRow
            icon={Shield}
            label="Privacy Policy"
            onPress={() => {
              window.open('https://example.com/privacy', '_blank');
            }}
          />
          <SettingsRow
            icon={FileText}
            label="Terms of Service"
            onPress={() => {
              window.open('https://example.com/terms', '_blank');
            }}
          />
          <SettingsRow
            icon={HelpCircle}
            label="Help & Support"
            onPress={() => {
              window.open('https://example.com/help', '_blank');
            }}
          />
        </GlassCard>
      </div>

      {/* Modals */}
      {isLanguagePickerOpen && (
        <LanguagePickerModal
          isOpen={isLanguagePickerOpen}
          onClose={async () => {
            setIsLanguagePickerOpen(false);
            // Sync language from context (LanguagePickerModal already saves to DB)
            // Wait a bit for the language change to complete
            setTimeout(() => {
              setSettings(prev => ({ ...prev, language: language || 'en' }));
            }, 300);
          }}
        />
      )}

      {isQuietHoursOpen && (
        <QuietHoursModal
          isOpen={isQuietHoursOpen}
          onClose={() => setIsQuietHoursOpen(false)}
          quietHours={settings.quietHours}
          onSave={(quietHours) => {
            saveSettings({ quietHours });
            setIsQuietHoursOpen(false);
            showToast('Quiet hours updated', 'success');
          }}
        />
      )}

      {isExportDataOpen && (
        <ExportDataModal
          isOpen={isExportDataOpen}
          onClose={() => setIsExportDataOpen(false)}
        />
      )}

      {isDeleteAccountOpen && (
        <DeleteAccountModal
          isOpen={isDeleteAccountOpen}
          onClose={() => setIsDeleteAccountOpen(false)}
          onConfirm={async () => {
            const { error } = await supabase.auth.signOut();
            if (!error) {
              navigate('/login');
            }
          }}
        />
      )}

      {/* Toasts */}
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

