import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit,
  Folder,
  Clock,
  AlertCircle,
  Mail,
  Bell,
  Globe,
  Shield,
  Settings as SettingsIcon,
  ChevronRight,
  User,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { documentService } from '../../services/documents';
import { supabase } from '../../config/supabase';
import EditProfileModal from '../../components/profile/EditProfileModal';
import ProfileLockModal from '../../components/profile/ProfileLockModal';
import LanguagePickerModal from '../../components/profile/LanguagePickerModal';
import QuietHoursModal from '../../components/profile/QuietHoursModal';
import SetProfileLockModal from '../../components/profile/SetProfileLockModal';
import { getNotificationPreferences, updateNotificationPreferences } from '../../services/notifications';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import { getDaysUntil } from '../../utils/dateUtils';
import { triggerHaptic } from '../../utils/animations';
import BackButton from '../../components/ui/BackButton';
import { GlassContainer, GlassCard } from '../../components/ui/GlassContainer';
import { getGlassAvatarStyle, getGlassCardStyle, getGlassGradientBackground } from '../../utils/glassStyles';
import Toggle from '../../components/ui/Toggle';
import { usePageLock } from '../../hooks/usePageLock';
import EnhancedPageLockModal from '../../components/lock/EnhancedPageLockModal';

interface Statistics {
  totalDocuments: number;
  expiringSoon: number;
  expired: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isEntering, setIsEntering] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { toasts, showToast, removeToast } = useToast();

  // Page lock
  const { isLocked: isPageLocked, lockType: pageLockType, handleUnlock: handlePageUnlock } = usePageLock('profile');

  const [statistics, setStatistics] = useState<Statistics>({
    totalDocuments: 0,
    expiringSoon: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [isProfileLockModalOpen, setIsProfileLockModalOpen] = useState(false);
  const [profileUnlocked, setProfileUnlocked] = useState(false);
  const [profileLockEnabled, setProfileLockEnabled] = useState(false);
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isQuietHoursOpen, setIsQuietHoursOpen] = useState(false);
  const [isSetProfileLockOpen, setIsSetProfileLockOpen] = useState(false);
  const [quietHours, setQuietHours] = useState({ enabled: false, start: '22:00', end: '08:00' });
  const { language: currentLanguageCode } = useLanguage();

  // Get user initials
  const getUserInitials = () => {
    const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U';
    if (typeof fullName === 'string') {
      const names = fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return fullName[0].toUpperCase();
    }
    return 'U';
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    if (!user?.id) return;

    try {
      const allDocuments = await documentService.getDocuments(user.id);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const total = allDocuments.length;
      let expiringSoon = 0;
      let expired = 0;

      allDocuments.forEach((doc) => {
        const daysLeft = getDaysUntil(doc.expiration_date);
        if (daysLeft < 0) {
          expired++;
        } else if (daysLeft <= 30) {
          expiringSoon++;
        }
      });

      setStatistics({ totalDocuments: total, expiringSoon, expired });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      fetchStatistics().finally(() => {
        setLoading(false);
      });

      // Check if profile is locked
      supabase
        .from('user_profiles')
        .select('profile_lock_enabled')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.profile_lock_enabled) {
            setIsProfileLocked(true);
            setProfileUnlocked(false);
            setIsProfileLockModalOpen(true);
            setProfileLockEnabled(true);
          } else {
            setIsProfileLocked(false);
            setProfileUnlocked(true);
            setProfileLockEnabled(false);
          }
        })
        .catch(() => {
          setIsProfileLocked(false);
          setProfileUnlocked(true);
          setProfileLockEnabled(false);
        });

      // Load notification preferences
      getNotificationPreferences(user.id).then((prefs) => {
        setEmailNotifications(prefs.email_enabled ?? true);
        setPushNotifications(prefs.push_enabled ?? true);
        if (prefs.quiet_hours_start && prefs.quiet_hours_end) {
          setQuietHours({
            enabled: true,
            start: prefs.quiet_hours_start,
            end: prefs.quiet_hours_end,
          });
        }
      }).catch(console.error);
    }
  }, [user]);

  // Door opening animation on mount
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Safety: never keep the entire page hidden if an animation state gets stuck.
  useEffect(() => {
    const failSafe = setTimeout(() => setIsEntering(false), 1600);
    return () => clearTimeout(failSafe);
  }, []);

  const handleToggle = async (
    setting: 'email' | 'push',
    value: boolean
  ) => {
    triggerHaptic('light');
    if (setting === 'email') {
      setEmailNotifications(value);
      if (user?.id) {
        try {
          await updateNotificationPreferences(user.id, { email_enabled: value });
        } catch (error) {
          console.error('Failed to save email preference:', error);
        }
      }
    } else if (setting === 'push') {
      setPushNotifications(value);
      if (user?.id) {
        try {
          await updateNotificationPreferences(user.id, { push_enabled: value });
        } catch (error) {
          console.error('Failed to save push preference:', error);
        }
      }
    }

    try {
      showToast(`${setting} ${value ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Failed to save preference:', error);
      showToast('Failed to save preference', 'error');
    }
  };

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



  // Show lock modal if profile is locked and not unlocked
  if (isProfileLocked && !profileUnlocked && isProfileLockModalOpen) {
    return (
      <div className="min-h-screen">
        <ProfileLockModal
          isOpen={true}
          onClose={() => {
            // Keep the user on /profile. We don't allow dismissing the lock gate without unlocking.
            triggerHaptic('heavy');
            showToast('Profile is locked. Enter your lock password to continue.', 'warning');
          }}
          onExit={() => {
            // Explicit exit action from the lock modal (only via the modal’s “Back to Dashboard” button).
            navigate('/dashboard', { replace: true });
          }}
          onUnlock={() => {
            setProfileUnlocked(true);
            setIsProfileLockModalOpen(false);
          }}
        />
      </div>
    );
  }

  if (loading && statistics.totalDocuments === 0) {
  return (
    <div
      className="pt-4 pb-[72px] min-h-screen relative overflow-hidden"
      style={{ background: '#000000' }}
    >
        {/* Background Gradient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="px-5 pb-4">
            <Skeleton className="h-8 w-32 mb-4 rounded-xl" />
          </div>
          <div className="px-4 mb-5">
            <Skeleton className="h-48 w-full rounded-3xl" />
          </div>
          <div className="px-4 mb-6">
            <div className="flex gap-3">
              <Skeleton className="h-20 flex-1 rounded-2xl" />
              <Skeleton className="h-20 flex-1 rounded-2xl" />
              <Skeleton className="h-20 flex-1 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Lock Modal */}
      <EnhancedPageLockModal
        isOpen={isPageLocked}
        pageName="Profile"
        lockType={pageLockType}
        onUnlock={handlePageUnlock}
      />

      <div
        className="pt-4 pb-[72px] min-h-screen relative overflow-hidden"
        style={{ background: '#000000' }}
      >
        {/* Background Gradient Orbs */}
        <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
            transform: 'translate(50%, 50%)',
          }}
        />
      </div>

      {/* Door Opening Animation */}
      <AnimatePresence>
        {isEntering && (
          <>
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '-100%' }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 w-1/2 z-50 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
                transformOrigin: 'left center',
              }}
            />
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '100%' }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="fixed inset-y-0 right-0 w-1/2 z-50 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
                transformOrigin: 'right center',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        // Keep content visible; the door panels already cover the transition visually.
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative z-10"
      >
        {/* Header */}
        <header
          className="px-5 py-6 flex items-center justify-between border-b"
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderColor: 'rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
              }}
            >
              <User className="w-5 h-5" style={{ color: '#60A5FA' }} />
            </div>
            <h1 className="text-2xl font-bold text-white">Profile</h1>
          </div>
        </header>

        {/* Back Button */}
        <div className="px-4 pt-4 mb-3">
          <BackButton to="/dashboard" />
        </div>

        {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isEntering ? 0 : 1, scale: isEntering ? 0.9 : 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="px-4 pt-5"
            >
              <GlassCard
                style={{
                  borderRadius: '28px',
                  padding: '32px',
                }}
              >
                <div className="flex flex-col items-center">
                  {/* Avatar */}
                  <motion.div
                    initial={{ y: -50, opacity: 0, scale: 0.5 }}
                    animate={{ 
                      y: isEntering ? -50 : 0, 
                      opacity: isEntering ? 0 : 1, 
                      scale: isEntering ? 0.5 : 1 
                    }}
                    transition={{ delay: 0.6, duration: 0.5, type: 'spring', stiffness: 200 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                    style={{
                      ...getGlassAvatarStyle(80),
                      background: user?.user_metadata?.avatar_url
                        ? 'transparent'
                        : 'linear-gradient(135deg, rgba(37, 99, 235, 0.8), rgba(30, 64, 175, 0.8))',
                    }}
                  >
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user?.user_metadata?.full_name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-3xl font-bold">
                        {getUserInitials()}
                      </span>
                    )}
                  </motion.div>

                  {/* Name */}
                  <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isEntering ? 0 : 1 }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                    className="text-xl font-bold text-white mt-4"
                  >
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </motion.h2>

                  {/* Email */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isEntering ? 0 : 1 }}
                    transition={{ delay: 0.8, duration: 0.3 }}
                    className="text-sm mt-1"
                    style={{ color: '#60A5FA' }}
                  >
                    {user?.email}
                  </motion.p>

                  {/* Edit Profile Button */}
                  <div className="mt-4">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: isEntering ? 0 : 1, y: isEntering ? 10 : 0 }}
                      transition={{ delay: 0.9, duration: 0.3 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        triggerHaptic('light');
                        setIsEditProfileOpen(true);
                      }}
                      className="w-full h-10 px-6 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                      style={{
                        ...getGlassCardStyle({ intensity: 'medium', elevated: false }),
                        borderRadius: '16px',
                        padding: '10px 24px',
                        color: '#FFFFFF',
                      }}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isEntering ? 0 : 1, y: isEntering ? 20 : 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="px-4 mt-5 mb-6"
            >
              <div className="flex gap-3">
                {/* Total Documents */}
                <GlassContainer
                  intensity="medium"
                  padding="small"
                  rounded="lg"
                  className="flex-1 flex flex-col items-center justify-center h-20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15))',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  <Folder className="w-5 h-5 mb-1" style={{ color: '#60A5FA' }} />
                  <span className="text-2xl font-bold text-white">
                    {statistics.totalDocuments}
                  </span>
                </GlassContainer>

                {/* Expiring Soon */}
                <GlassContainer
                  intensity="medium"
                  padding="small"
                  rounded="lg"
                  className="flex-1 flex flex-col items-center justify-center h-20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(234, 88, 12, 0.15))',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                  }}
                >
                  <Clock className="w-5 h-5 mb-1" style={{ color: '#FB923C' }} />
                  <span
                    className="text-2xl font-bold"
                    style={{ color: statistics.expiringSoon > 0 ? '#FB923C' : '#FFFFFF' }}
                  >
                    {statistics.expiringSoon}
                  </span>
                </GlassContainer>

                {/* Expired */}
                <GlassContainer
                  intensity="medium"
                  padding="small"
                  rounded="lg"
                  className="flex-1 flex flex-col items-center justify-center h-20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                  }}
                >
                  <AlertCircle className="w-5 h-5 mb-1" style={{ color: '#F87171' }} />
                  <span
                    className="text-2xl font-bold"
                    style={{ color: statistics.expired > 0 ? '#F87171' : '#FFFFFF' }}
                  >
                    {statistics.expired}
                  </span>
                </GlassContainer>
              </div>
            </motion.div>

            {/* Settings Sections */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isEntering ? 0 : 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="px-4 space-y-4"
            >
          {/* Settings */}
          <div>
            <GlassCard
              style={{
                borderRadius: '20px',
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <div className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: '#60A5FA' }} />
                  <span className="text-white">Email</span>
                </div>
                <Toggle
                  checked={emailNotifications}
                  onChange={(checked) => handleToggle('email', checked)}
                />
              </div>
              <div className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" style={{ color: '#60A5FA' }} />
                  <span className="text-white">Push</span>
                </div>
                <Toggle
                  checked={pushNotifications}
                  onChange={(checked) => handleToggle('push', checked)}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  setIsQuietHoursOpen(true);
                }}
                className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: '#60A5FA' }} />
                  <div className="flex flex-col items-start">
                    <span className="text-white">Quiet Hours</span>
                    {quietHours.enabled && (
                      <span className="text-xs" style={{ color: '#60A5FA' }}>
                        {formatTime(quietHours.start)} - {formatTime(quietHours.end)}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#60A5FA' }} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  setIsLanguagePickerOpen(true);
                }}
                className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5" style={{ color: '#60A5FA' }} />
                  <span className="text-white">Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: '#60A5FA' }}>
                    {getLanguageDisplayName()}
                  </span>
                  <ChevronRight className="w-5 h-5" style={{ color: '#60A5FA' }} />
                </div>
              </motion.button>
              <div className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" style={{ color: '#60A5FA' }} />
                  <div className="flex flex-col items-start">
                    <span className="text-white">Profile Lock</span>
                    <span className="text-xs" style={{ color: '#60A5FA' }}>
                      {profileLockEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
                <Toggle
                  checked={profileLockEnabled}
                  onChange={(checked) => {
                    triggerHaptic('light');
                    setIsSetProfileLockOpen(true);
                  }}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/settings');
                }}
                className="w-full h-14 px-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <SettingsIcon className="w-5 h-5" style={{ color: '#60A5FA' }} />
                  <span className="text-white">All Settings</span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#60A5FA' }} />
              </motion.button>
            </GlassCard>
          </div>
            </motion.div>
      </motion.div>

      {/* Modals */}
      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={() => {
            setIsEditProfileOpen(false);
            window.location.reload();
          }}
        />
      )}

      <LanguagePickerModal
        isOpen={isLanguagePickerOpen}
        onClose={() => setIsLanguagePickerOpen(false)}
      />

      <QuietHoursModal
        isOpen={isQuietHoursOpen}
        onClose={async () => {
          setIsQuietHoursOpen(false);
          // Reload quiet hours after closing
          if (user?.id) {
            try {
              const prefs = await getNotificationPreferences(user.id);
              if (prefs.quiet_hours_start && prefs.quiet_hours_end) {
                setQuietHours({
                  enabled: true,
                  start: prefs.quiet_hours_start,
                  end: prefs.quiet_hours_end,
                });
              }
            } catch (error) {
              console.error('Failed to reload quiet hours:', error);
            }
          }
        }}
        currentStart={quietHours.start}
        currentEnd={quietHours.end}
      />

      <SetProfileLockModal
        isOpen={isSetProfileLockOpen}
        onClose={() => setIsSetProfileLockOpen(false)}
        onSuccess={() => {
          if (user?.id) {
            supabase
              .from('user_profiles')
              .select('profile_lock_enabled')
              .eq('user_id', user.id)
              .single()
              .then(({ data }) => {
                setProfileLockEnabled(data?.profile_lock_enabled ?? false);
                showToast(
                  data?.profile_lock_enabled ? 'Profile lock enabled' : 'Profile lock disabled',
                  'success'
                );
              });
          }
        }}
        isEnabled={profileLockEnabled}
      />


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
    </>
  );
}
