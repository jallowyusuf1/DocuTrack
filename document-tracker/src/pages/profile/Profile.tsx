import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { supabase } from '../../config/supabase';
import EditProfileModal from '../../components/profile/EditProfileModal';
import LanguagePickerModal from '../../components/profile/LanguagePickerModal';
import TimePickerModal from '../../components/profile/TimePickerModal';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import LogoutConfirmationModal from '../../components/profile/LogoutConfirmationModal';
import ExportDataModal from '../../components/profile/ExportDataModal';
import Skeleton from '../../components/ui/Skeleton';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import { getDaysUntil } from '../../utils/dateUtils';

interface Statistics {
  totalDocuments: number;
  expiringSoon: number;
  expired: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [statistics, setStatistics] = useState<Statistics>({
    totalDocuments: 0,
    expiringSoon: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [reminderTime, setReminderTime] = useState('9:00 AM');
  const [storageUsed, setStorageUsed] = useState('0 MB');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isLanguagePickerOpen, setIsLanguagePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isExportDataOpen, setIsExportDataOpen] = useState(false);

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
    }
  }, [user]);

  const handleToggle = async (
    setting: 'email' | 'push' | 'darkMode',
    value: boolean
  ) => {
    // Update local state immediately for responsive UI
    if (setting === 'email') {
      setEmailNotifications(value);
    } else if (setting === 'push') {
      setPushNotifications(value);
    } else if (setting === 'darkMode') {
      setDarkMode(value);
      // Apply dark mode class to document
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Save to database (you'll need to create a user_preferences table)
    try {
      // TODO: Save preference to database
      showToast(`${setting} ${value ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Failed to save preference:', error);
      showToast('Failed to save preference', 'error');
    }
  };

  const handleClearCache = () => {
    // Clear localStorage and cache
    localStorage.clear();
    showToast('Cache cleared successfully', 'success');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    // This will be handled by DeleteAccountModal
    setIsDeleteAccountOpen(false);
    await logout();
    navigate('/login');
  };

  if (loading && statistics.totalDocuments === 0) {
    return (
      <div className="pb-[72px] min-h-screen">
        <div className="px-5 py-4">
          <Skeleton className="h-8 w-32 mb-4" />
        </div>
        <div className="px-4 mb-5">
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="px-4 mb-6">
          <div className="flex gap-3">
            <Skeleton className="h-20 flex-1 rounded-xl" />
            <Skeleton className="h-20 flex-1 rounded-xl" />
            <Skeleton className="h-20 flex-1 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[72px] min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-5 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <button
          onClick={() => setIsLogoutOpen(true)}
          className="text-red-600 text-sm font-medium flex items-center gap-1"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* User Profile Card */}
      <div className="px-4 pt-5">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col items-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {getUserInitials()}
              </span>
            </div>

            {/* Name */}
            <h2 className="text-xl font-bold text-gray-900 mt-4">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
            </h2>

            {/* Email */}
            <p className="text-sm text-gray-600 mt-1">{user?.email}</p>

            {/* Edit Profile Button */}
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="mt-4 h-10 px-6 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 flex items-center gap-2 hover:bg-gray-50 active:bg-gray-100"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="px-4 mt-5 mb-6">
        <div className="flex gap-3">
          {/* Total Documents */}
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 flex flex-col items-center justify-center h-20">
            <Folder className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-2xl font-bold text-gray-900">
              {statistics.totalDocuments}
            </span>
            <span className="text-xs text-gray-600">Documents</span>
          </div>

          {/* Expiring Soon */}
          <div className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 flex flex-col items-center justify-center h-20">
            <Clock className="w-5 h-5 text-orange-600 mb-1" />
            <span
              className={`text-2xl font-bold ${
                statistics.expiringSoon > 0 ? 'text-orange-600' : 'text-gray-900'
              }`}
            >
              {statistics.expiringSoon}
            </span>
            <span className="text-xs text-gray-600">Expiring</span>
          </div>

          {/* Expired */}
          <div className="flex-1 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 flex flex-col items-center justify-center h-20">
            <AlertCircle className="w-5 h-5 text-red-600 mb-1" />
            <span
              className={`text-2xl font-bold ${
                statistics.expired > 0 ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {statistics.expired}
            </span>
            <span className="text-xs text-gray-600">Expired</span>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-4 space-y-6">
        {/* Account Settings */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
            Account Settings
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => navigate('/profile/change-password')}
              className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Change Password</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <div className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Email Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => handleToggle('email', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="w-full h-14 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Push Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => handleToggle('push', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* App Settings */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
            App Settings
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Dark Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => handleToggle('darkMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <button
              onClick={() => setIsLanguagePickerOpen(true)}
              className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Language</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{language}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
            <button
              onClick={() => setIsTimePickerOpen(true)}
              className="w-full h-14 px-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Default Reminder Time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{reminderTime}</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </button>
          </div>
        </div>

        {/* Data & Storage */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
            Data & Storage
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setIsExportDataOpen(true)}
              className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Export All Documents</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <div className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Storage Used</span>
              </div>
              <span className="text-sm text-gray-500">{storageUsed}</span>
            </div>
            <button
              onClick={handleClearCache}
              className="w-full h-14 px-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Clear Cache</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* About */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
            About
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button className="w-full h-14 px-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Terms of Service</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <div className="w-full h-14 px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Version</span>
              </div>
              <span className="text-sm text-gray-500">1.0.0</span>
            </div>
          </div>
        </div>

        {/* Account */}
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">
            Account
          </h3>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => setIsDeleteAccountOpen(true)}
              className="w-full h-14 px-4 flex items-center justify-between text-red-600"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete Account</span>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-6 pb-24">
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="w-full h-[52px] border-2 border-red-600 text-red-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-50 active:bg-red-100"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Modals */}
      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSuccess={() => {
            setIsEditProfileOpen(false);
            window.location.reload(); // Refresh to show updated profile
          }}
        />
      )}

      {isLanguagePickerOpen && (
        <LanguagePickerModal
          isOpen={isLanguagePickerOpen}
          selectedLanguage={language}
          onClose={() => setIsLanguagePickerOpen(false)}
          onSelect={(lang) => {
            setLanguage(lang);
            setIsLanguagePickerOpen(false);
            showToast('Language updated', 'success');
          }}
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

