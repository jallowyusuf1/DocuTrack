import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Edit,
  Folder,
  Clock,
  AlertCircle,
  Lock,
  Mail,
  Bell,
  Moon,
  Globe,
  Download,
  Database,
  Trash2,
  HelpCircle,
  Shield,
  FileText,
  Info,
  ChevronRight,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { documentService } from '../../services/documents';
import { supabase } from '../../config/supabase';
import EditProfileModal from '../../components/profile/EditProfileModal';
import LanguagePickerModal from '../../components/profile/LanguagePickerModal';
import TimePickerModal from '../../components/profile/TimePickerModal';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import LogoutConfirmationModal from '../../components/profile/LogoutConfirmationModal';
import ExportDataModal from '../../components/profile/ExportDataModal';
import NotificationPreferencesModal from '../../components/profile/NotificationPreferencesModal';
import ProfileLockModal from '../../components/profile/ProfileLockModal';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import { getDaysUntil } from '../../utils/dateUtils';
import { triggerHaptic } from '../../utils/animations';

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
  const { t } = useTranslation();
  const { language: currentLanguageCode } = useLanguage();
  const { toasts, showToast, removeToast } = useToast();
  const [statistics, setStatistics] = useState<Statistics>({
    totalDocuments: 0,
    expiringSoon: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
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
  const [reminderTime, setReminderTime] = useState('9:00 AM');
  const [storageUsed, setStorageUsed] = useState('0 MB');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);
  const [isNotificationPreferencesOpen, setIsNotificationPreferencesOpen] = useState(false);
  const [isProfileLocked, setIsProfileLocked] = useState(false);
  const [isProfileLockModalOpen, setIsProfileLockModalOpen] = useState(false);
  const [profileUnlocked, setProfileUnlocked] = useState(false);

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

  // Calculate storage used
  const calculateStorageUsed = async () => {
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

      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(1);
      setStorageUsed(`${sizeInMB} MB`);
    } catch (error) {
      console.error('Failed to calculate storage:', error);
      setStorageUsed('0 MB');
    }
  };

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      Promise.all([fetchStatistics(), calculateStorageUsed()]).finally(() => {
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
          } else {
            setIsProfileLocked(false);
            setProfileUnlocked(true);
          }
        })
        .catch(() => {
          setIsProfileLocked(false);
          setProfileUnlocked(true);
        });
    }
  }, [user]);

  // Door opening animation on mount
  useEffect(() => {
    setIsEntering(true);
    const timer = setTimeout(() => setIsEntering(false), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleToggle = async (
    setting: 'email' | 'push' | 'darkMode',
    value: boolean
  ) => {
    triggerHaptic('light');
    if (setting === 'email') {
      setEmailNotifications(value);
    } else if (setting === 'push') {
      setPushNotifications(value);
    } else if (setting === 'darkMode') {
      toggleTheme();
    }

    try {
      showToast(`${setting} ${value ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Failed to save preference:', error);
      showToast('Failed to save preference', 'error');
    }
  };


  const handleClearCache = () => {
    triggerHaptic('light');
    localStorage.clear();
    showToast('Cache cleared successfully', 'success');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    setIsDeleteAccountOpen(false);
    await logout();
    navigate('/login');
  };

  // Show lock modal if profile is locked and not unlocked
  if (isProfileLocked && !profileUnlocked && isProfileLockModalOpen) {
    return (
      <div className="min-h-screen">
        <ProfileLockModal
          isOpen={true}
          onClose={() => {
            // Don't allow closing - must unlock
            navigate('/dashboard');
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
      <div className="pb-[72px] min-h-screen relative overflow-hidden">
        {/* Background Gradient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="px-5 py-4">
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
    <div className="pb-[72px] min-h-screen relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
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
                background: 'linear-gradient(135deg, #1A1625, #231D33)',
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
                background: 'linear-gradient(135deg, #231D33, #1A1625)',
                transformOrigin: 'right center',
              }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Profile Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isEntering ? 0 : 1, y: isEntering ? 20 : 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="relative z-10"
      >
        {/* Header */}
        <header 
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: 'rgba(35, 29, 51, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              triggerHaptic('light');
              setIsLogoutOpen(true);
            }}
            className="text-red-400 text-sm font-medium flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </header>

        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isEntering ? 0 : 1, scale: isEntering ? 0.9 : 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="px-4 pt-5"
        >
          <div 
            className="rounded-3xl p-6"
            style={{
              background: 'rgba(42, 38, 64, 0.7)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
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
                  background: user?.user_metadata?.avatar_url 
                    ? 'transparent' 
                    : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  boxShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
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
                style={{ color: '#A78BFA' }}
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
                    background: 'rgba(35, 29, 51, 0.6)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                  }}
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </motion.button>
              </div>
            </div>
          </div>
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
            <div 
              className="flex-1 rounded-2xl p-3 flex flex-col items-center justify-center h-20"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.2))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              <Folder className="w-5 h-5 mb-1" style={{ color: '#60A5FA' }} />
              <span className="text-2xl font-bold text-white">
                {statistics.totalDocuments}
              </span>
              <span className="text-xs" style={{ color: '#A78BFA' }}>Documents</span>
            </div>

            {/* Expiring Soon */}
            <div 
              className="flex-1 rounded-2xl p-3 flex flex-col items-center justify-center h-20"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(234, 88, 12, 0.2))',
                backdropFilter: 'blur(10px)',
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
              <span className="text-xs" style={{ color: '#A78BFA' }}>Expiring</span>
            </div>

            {/* Expired */}
            <div 
              className="flex-1 rounded-2xl p-3 flex flex-col items-center justify-center h-20"
              style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                backdropFilter: 'blur(10px)',
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
              <span className="text-xs" style={{ color: '#A78BFA' }}>Expired</span>
            </div>
          </div>
        </motion.div>

        {/* Settings Sections */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isEntering ? 0 : 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="px-4 space-y-6"
        >
          {/* Account Settings */}
          <div>
            <h3 className="text-xs font-bold uppercase mb-3" style={{ color: '#A78BFA' }}>
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
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/settings');
                }}
                className="w-full h-14 px-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Settings</span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
              </motion.button>
              <div className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Email Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => handleToggle('email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
                    style={{
                      background: emailNotifications ? '#8B5CF6' : 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </label>
              </div>
              <div className="w-full h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Push Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => handleToggle('push', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
                    style={{
                      background: pushNotifications ? '#8B5CF6' : 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div>
            <h3 className="text-xs font-bold uppercase mb-3" style={{ color: '#A78BFA' }}>
              App Settings
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
              <div className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  ) : (
                    <Sun className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  )}
                  <span className="text-white">Theme</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === 'dark'}
                    onChange={(e) => handleToggle('darkMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"
                    style={{
                      background: theme === 'dark' ? '#8B5CF6' : 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </label>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  setIsLanguagePickerOpen(true);
                }}
                className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Language</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: '#A78BFA' }}>{getLanguageDisplayName()}</span>
                  <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
                </div>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  setIsTimePickerOpen(true);
                }}
                className="w-full h-14 px-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Reminder Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm" style={{ color: '#A78BFA' }}>{reminderTime}</span>
                  <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
                </div>
              </motion.button>
            </div>
          </div>

          {/* Data & Storage */}
          <div>
            <h3 className="text-xs font-bold uppercase mb-3" style={{ color: '#A78BFA' }}>
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
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  setIsExportDataOpen(true);
                }}
                className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Export Data</span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
              </motion.button>
              <div className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Storage Used</span>
                </div>
                <span className="text-sm" style={{ color: '#A78BFA' }}>{storageUsed}</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleClearCache}
                className="w-full h-14 px-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Clear Cache</span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
              </motion.button>
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-bold uppercase mb-3" style={{ color: '#A78BFA' }}>
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
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Help & Support</span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/privacy');
                }}
                className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Privacy Policy</span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  navigate('/terms');
                }}
                className="w-full h-14 px-4 flex items-center justify-between border-b border-white/5"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Terms of Service</span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#A78BFA' }} />
              </motion.button>
              <div className="w-full h-14 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span className="text-white">Version</span>
                </div>
                <span className="text-sm" style={{ color: '#A78BFA' }}>1.0.0</span>
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-bold uppercase mb-3" style={{ color: '#A78BFA' }}>
              Account
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
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  triggerHaptic('light');
                  setIsDeleteAccountOpen(true);
                }}
                className="w-full h-14 px-4 flex items-center justify-between text-red-400"
              >
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Delete Account</span>
                </div>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>

          {/* Logout Button */}
          <div className="pt-6 pb-24">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic('medium');
                setIsLogoutOpen(true);
              }}
              className="w-full h-[52px] rounded-xl font-medium flex items-center justify-center gap-2"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                color: '#F87171',
              }}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </motion.button>
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

      {isLanguagePickerOpen && (
        <LanguagePickerModal
          isOpen={isLanguagePickerOpen}
          onClose={() => setIsLanguagePickerOpen(false)}
        />
      )}

      {isTimePickerOpen && (
        <TimePickerModal
          isOpen={isTimePickerOpen}
          selectedTime={reminderTime}
          onClose={() => setIsTimePickerOpen(false)}
          onSelect={(time) => {
            setReminderTime(time);
            setIsTimePickerOpen(false);
            showToast('Reminder time updated', 'success');
          }}
        />
      )}

      {isDeleteAccountOpen && (
        <DeleteAccountModal
          isOpen={isDeleteAccountOpen}
          onClose={() => setIsDeleteAccountOpen(false)}
          onConfirm={handleDeleteAccount}
        />
      )}

      {isLogoutOpen && (
        <LogoutConfirmationModal
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
          onConfirm={handleLogout}
        />
      )}

      {isExportDataOpen && (
        <ExportDataModal
          isOpen={isExportDataOpen}
          onClose={() => setIsExportDataOpen(false)}
        />
      )}

      <NotificationPreferencesModal
        isOpen={isNotificationPreferencesOpen}
        onClose={() => setIsNotificationPreferencesOpen(false)}
      />

      <ProfileLockModal
        isOpen={isProfileLockModalOpen && isProfileLocked && !profileUnlocked}
        onClose={() => {
          // Navigate away if user tries to close
          navigate('/dashboard');
        }}
        onUnlock={() => {
          setProfileUnlocked(true);
          setIsProfileLockModalOpen(false);
        }}
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
  );
}
