import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Shield,
  Smartphone,
  Bell,
  Palette,
  Globe,
  Database,
  Download,
  Upload,
  Users,
  HelpCircle,
  Mail as ContactIcon,
  Sparkles,
  FileText,
  Eye,
  ChevronRight,
  User,
  Check,
  X,
  Trash2,
  Clock,
  Moon,
  Sun,
  Monitor,
  Laptop,
  Tablet,
  Phone,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import DesktopNav from '../../components/layout/DesktopNav';

type SettingsSection =
  | 'email-password'
  | 'two-factor'
  | 'connected-devices'
  | 'delete-account'
  | 'notifications'
  | 'appearance'
  | 'language'
  | 'privacy'
  | 'storage'
  | 'export-data'
  | 'import-documents'
  | 'family-sharing'
  | 'shared-documents'
  | 'invitations'
  | 'help-center'
  | 'contact-support'
  | 'whats-new'
  | 'terms'
  | 'privacy-policy'
  | 'security';

interface NavItem {
  id: SettingsSection;
  label: string;
  icon: any;
  hasChevron?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function DesktopSettings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();

  const [activeSection, setActiveSection] = useState<SettingsSection>('email-password');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const navigationGroups: NavGroup[] = [
    {
      title: 'ACCOUNT',
      items: [
        { id: 'email-password', label: 'Email & Password', icon: Mail, hasChevron: true },
        { id: 'two-factor', label: 'Two-Factor Authentication', icon: Shield, hasChevron: true },
        { id: 'connected-devices', label: 'Connected Devices', icon: Smartphone, hasChevron: true },
        { id: 'delete-account', label: 'Delete Account', icon: Trash2, hasChevron: true },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, hasChevron: true },
        { id: 'appearance', label: 'Appearance', icon: Palette, hasChevron: true },
        { id: 'language', label: 'Language', icon: Globe, hasChevron: true },
        { id: 'privacy', label: 'Privacy', icon: Eye, hasChevron: true },
      ],
    },
    {
      title: 'DATA',
      items: [
        { id: 'storage', label: 'Storage', icon: Database, hasChevron: true },
        { id: 'export-data', label: 'Export Data', icon: Download, hasChevron: true },
        { id: 'import-documents', label: 'Import Documents', icon: Upload, hasChevron: true },
      ],
    },
    {
      title: 'FAMILY',
      items: [
        { id: 'family-sharing', label: 'Family Sharing', icon: Users, hasChevron: true },
        { id: 'shared-documents', label: 'Shared Documents', icon: FileText, hasChevron: true },
        { id: 'invitations', label: 'Invitations', icon: Mail, hasChevron: true },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { id: 'help-center', label: 'Help Center', icon: HelpCircle, hasChevron: true },
        { id: 'contact-support', label: 'Contact Support', icon: ContactIcon, hasChevron: true },
        { id: 'whats-new', label: "What's New", icon: Sparkles, hasChevron: true },
      ],
    },
    {
      title: 'LEGAL',
      items: [
        { id: 'terms', label: 'Terms of Service', icon: FileText, hasChevron: true },
        { id: 'privacy-policy', label: 'Privacy Policy', icon: Shield, hasChevron: true },
        { id: 'security', label: 'Security', icon: Lock, hasChevron: true },
      ],
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'email-password':
        return <EmailPasswordContent />;
      case 'two-factor':
        return <TwoFactorContent />;
      case 'connected-devices':
        return <ConnectedDevicesContent />;
      case 'notifications':
        return <NotificationsContent />;
      case 'appearance':
        return <AppearanceContent />;
      case 'language':
        return <LanguageContent />;
      case 'storage':
        return <StorageContent />;
      case 'export-data':
        return <ExportDataContent />;
      case 'family-sharing':
        return <FamilySharingContent />;
      default:
        return <PlaceholderContent section={activeSection} />;
    }
  };

  return (
    <div className="h-screen w-full flex flex-col" style={{
      background: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
    }}>
      {/* Desktop Nav */}
      <DesktopNav />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[280px] flex-shrink-0 overflow-y-auto" style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          {/* User Profile */}
          <div className="p-6 border-b border-white/10">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h3 className="text-white font-bold text-xl mb-1">
                {user?.email?.split('@')[0] || 'User'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{user?.email || 'user@example.com'}</p>
              <button className="w-full py-2 px-4 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Navigation Groups */}
          <div className="py-4">
            {navigationGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="mb-6">
                <h4 className="px-6 text-xs font-semibold text-gray-500 mb-2">
                  {group.title}
                </h4>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className="w-full px-6 py-3 flex items-center gap-3 transition-all"
                      style={{
                        background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                        borderLeft: isActive ? '3px solid #8B5CF6' : '3px solid transparent',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{
                        color: isActive ? '#A78BFA' : '#9CA3AF',
                      }} />
                      <span className="flex-1 text-left text-sm" style={{
                        color: isActive ? '#FFFFFF' : '#D1D5DB',
                      }}>
                        {item.label}
                      </span>
                      {item.hasChevron && (
                        <ChevronRight className="w-4 h-4" style={{
                          color: isActive ? '#A78BFA' : '#6B7280',
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

// Content Components
function EmailPasswordContent() {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Email & Password</h1>
      <p className="text-gray-400 mb-8">Manage your account credentials</p>

      {/* Email Card */}
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <h3 className="text-white font-semibold text-lg mb-4">Email Address</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-white text-xl">{user?.email || 'user@example.com'}</span>
          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all"
          >
            Change Email
          </button>
        </div>

        {showEmailForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <input
              type="email"
              placeholder="New email address"
              className="w-full mb-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Verify with password"
              className="w-full mb-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all">
              Send Verification Email
            </button>
          </motion.div>
        )}
      </div>

      {/* Password Card */}
      <div className="p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <h3 className="text-white font-semibold text-lg mb-4">Password</h3>
        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all mb-4"
        >
          Change Password
        </button>

        {showPasswordForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <input
              type="password"
              placeholder="Current password"
              className="w-full mb-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="New password"
              className="w-full mb-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              className="w-full mb-4 px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
            />

            {/* Requirements Checklist */}
            <div className="mb-4 p-4 rounded-lg bg-white/5">
              <p className="text-gray-400 text-sm mb-2">Password must contain:</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-gray-300">At least 8 characters</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <X className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">One uppercase letter</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <X className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-500">One number</span>
                </div>
              </div>
            </div>

            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all">
              Update Password
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function TwoFactorContent() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Two-Factor Authentication</h1>
      <p className="text-gray-400 mb-8">Add an extra layer of security to your account</p>

      {/* Status Card */}
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
          <div>
            <h3 className="text-white font-semibold text-lg">
              {isEnabled ? 'Enabled' : 'Disabled'}
            </h3>
            {isEnabled && (
              <p className="text-gray-400 text-sm">Enabled since December 1, 2025</p>
            )}
          </div>
        </div>
      </div>

      {/* Setup/Manage Section */}
      {!isEnabled ? (
        <div className="p-6 rounded-2xl" style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <h3 className="text-white font-semibold text-lg mb-4">Enable Two-Factor Authentication</h3>
          <p className="text-gray-400 mb-6">
            Secure your account with two-factor authentication. You'll need to enter a code from your authenticator app every time you sign in.
          </p>
          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all">
            Enable Two-Factor Auth
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button className="w-full p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all">
            Disable Two-Factor Auth
          </button>
          <button className="w-full p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all">
            Regenerate Backup Codes
          </button>
          <button className="w-full p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all">
            Change Authenticator App
          </button>
        </div>
      )}
    </div>
  );
}

function ConnectedDevicesContent() {
  const devices = [
    {
      id: '1',
      name: 'MacBook Pro',
      icon: Laptop,
      location: 'Jeddah, Saudi Arabia',
      lastActive: '2 minutes ago',
      isCurrent: true,
    },
    {
      id: '2',
      name: 'iPhone 13 Pro',
      icon: Phone,
      location: 'Jeddah, Saudi Arabia',
      lastActive: '5 hours ago',
      isCurrent: false,
    },
    {
      id: '3',
      name: 'iPad Air',
      icon: Tablet,
      location: 'Riyadh, Saudi Arabia',
      lastActive: '2 days ago',
      isCurrent: false,
    },
  ];

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Connected Devices</h1>
      <p className="text-gray-400 mb-8">Manage devices that have access to your account</p>

      <div className="space-y-4">
        {devices.map((device) => {
          const DeviceIcon = device.icon;
          return (
            <div
              key={device.id}
              className="p-6 rounded-2xl"
              style={{
                background: 'rgba(26, 22, 37, 0.6)',
                backdropFilter: 'blur(20px)',
                border: device.isCurrent
                  ? '2px solid rgba(139, 92, 246, 0.5)'
                  : '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <DeviceIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold text-lg">{device.name}</h3>
                    {device.isCurrent && (
                      <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                        This device
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {device.location}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {device.lastActive}
                    </span>
                  </div>
                </div>
                {!device.isCurrent && (
                  <button className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all">
                    Revoke Access
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotificationsContent() {
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [notifications, setNotifications] = useState({
    expiryWarnings: { push: true, email: true, inApp: true },
    renewalReminders: { push: true, email: false, inApp: true },
    familyShares: { push: false, email: true, inApp: true },
    systemUpdates: { push: true, email: true, inApp: true },
    marketing: { push: false, email: false, inApp: false },
  });

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Notification Settings</h1>
      <p className="text-gray-400 mb-8">Control how and when you receive notifications</p>

      {/* Master Toggle */}
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Enable All Notifications</h3>
            <p className="text-gray-400 text-sm mt-1">Master control for all notification types</p>
          </div>
          <button
            onClick={() => setMasterEnabled(!masterEnabled)}
            className={`w-14 h-8 rounded-full transition-all ${
              masterEnabled ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                masterEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Types Table */}
      <div className="p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-gray-400 text-sm font-semibold pb-4">Type</th>
                <th className="text-center text-gray-400 text-sm font-semibold pb-4">Push</th>
                <th className="text-center text-gray-400 text-sm font-semibold pb-4">Email</th>
                <th className="text-center text-gray-400 text-sm font-semibold pb-4">In-App</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(notifications).map(([key, values]) => (
                <tr key={key} className="border-b border-white/5">
                  <td className="py-4 text-white">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </td>
                  <td className="py-4 text-center">
                    <input type="checkbox" checked={values.push} className="w-5 h-5" />
                  </td>
                  <td className="py-4 text-center">
                    <input type="checkbox" checked={values.email} className="w-5 h-5" />
                  </td>
                  <td className="py-4 text-center">
                    <input type="checkbox" checked={values.inApp} className="w-5 h-5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AppearanceContent() {
  const { theme, setTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>('dark');

  const themes = [
    {
      id: 'light',
      name: 'Light',
      icon: Sun,
      preview: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
    },
    {
      id: 'dark',
      name: 'Dark',
      icon: Moon,
      preview: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
    },
    {
      id: 'auto',
      name: 'Auto',
      icon: Monitor,
      preview: 'linear-gradient(135deg, #1a1625 0%, #FFFFFF 100%)',
    },
  ];

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Appearance</h1>
      <p className="text-gray-400 mb-8">Customize how DocuTrack looks</p>

      {/* Theme Selection */}
      <div className="mb-8">
        <h3 className="text-white font-semibold text-lg mb-4">Theme</h3>
        <div className="grid grid-cols-3 gap-4">
          {themes.map((themeOption) => {
            const ThemeIcon = themeOption.icon;
            const isSelected = selectedTheme === themeOption.id;

            return (
              <button
                key={themeOption.id}
                onClick={() => setSelectedTheme(themeOption.id as any)}
                className="p-6 rounded-2xl transition-all"
                style={{
                  background: 'rgba(26, 22, 37, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: isSelected
                    ? '2px solid rgba(139, 92, 246, 0.8)'
                    : '1px solid rgba(139, 92, 246, 0.2)',
                }}
              >
                <div
                  className="w-full h-32 rounded-xl mb-4 flex items-center justify-center"
                  style={{ background: themeOption.preview }}
                >
                  <ThemeIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold">{themeOption.name}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Text Size */}
      <div className="p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <h3 className="text-white font-semibold text-lg mb-4">Text Size</h3>
        <input
          type="range"
          min="11"
          max="20"
          defaultValue="16"
          className="w-full mb-4"
        />
        <p className="text-gray-400">Preview text at selected size</p>
      </div>
    </div>
  );
}

function LanguageContent() {
  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English' },
    { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
    { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState('en');

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Language & Region</h1>
      <p className="text-gray-400 mb-8">Choose your preferred language</p>

      <div className="grid grid-cols-2 gap-4">
        {languages.map((lang) => {
          const isSelected = selectedLanguage === lang.code;

          return (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className="p-6 rounded-2xl transition-all text-left"
              style={{
                background: isSelected
                  ? 'rgba(139, 92, 246, 0.2)'
                  : 'rgba(26, 22, 37, 0.6)',
                backdropFilter: 'blur(20px)',
                border: isSelected
                  ? '2px solid rgba(139, 92, 246, 0.8)'
                  : '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <div className="text-4xl mb-3">{lang.flag}</div>
              <h4 className="text-white font-semibold text-lg">{lang.name}</h4>
              <p className="text-gray-400 text-sm">{lang.nativeName}</p>
            </button>
          );
        })}
      </div>

      <button className="mt-6 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all">
        Change Language & Reload
      </button>
    </div>
  );
}

function StorageContent() {
  const usedMB = 2.4;
  const totalMB = 100;
  const percentage = (usedMB / totalMB) * 100;

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Storage & Data</h1>
      <p className="text-gray-400 mb-8">Manage your storage usage</p>

      {/* Usage Chart */}
      <div className="mb-6 p-8 rounded-2xl flex flex-col items-center" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div className="relative w-48 h-48 mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="rgba(139, 92, 246, 0.1)"
              strokeWidth="16"
            />
            <circle
              cx="96"
              cy="96"
              r="80"
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="16"
              strokeDasharray={`${percentage * 5.03} 502`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-3xl font-bold">{percentage.toFixed(1)}%</span>
            <span className="text-gray-400 text-sm">{usedMB} MB / {totalMB} MB</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="w-full space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Documents</span>
            <span className="text-white">47 • 2.1 MB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Thumbnails</span>
            <span className="text-white">47 • 0.3 MB</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Cache</span>
            <span className="text-white">0.05 MB</span>
          </div>
        </div>

        <div className="w-full mt-6 space-y-3">
          <button className="w-full py-3 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all">
            Clear Cache
          </button>
          <button className="w-full py-3 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all">
            Optimize Storage
          </button>
          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all">
            Upgrade Storage
          </button>
        </div>
      </div>
    </div>
  );
}

function ExportDataContent() {
  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Export Your Data</h1>
      <p className="text-gray-400 mb-8">Download a copy of your data</p>

      <div className="p-6 rounded-2xl space-y-6" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        {/* Format Selection */}
        <div>
          <label className="text-white font-semibold mb-3 block">Format</label>
          <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none">
            <option>JSON</option>
            <option>CSV</option>
            <option>ZIP (with images)</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-white font-semibold mb-3 block">Date Range</label>
          <select className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none">
            <option>All time</option>
            <option>Last month</option>
            <option>Last year</option>
            <option>Custom</option>
          </select>
        </div>

        {/* Include Options */}
        <div>
          <label className="text-white font-semibold mb-3 block">Include</label>
          <div className="space-y-2">
            {['Documents', 'Notes', 'Activity', 'Shared'].map((item) => (
              <label key={item} className="flex items-center gap-3 text-gray-300 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-5 h-5" />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </div>

        <button className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all">
          Export Data
        </button>
      </div>
    </div>
  );
}

function FamilySharingContent() {
  const members = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'SJ',
      relationship: 'Sister',
      documentsShared: 12,
      lastActive: '2 hours ago',
    },
    {
      id: '2',
      name: 'Mohammed Ali',
      avatar: 'MA',
      relationship: 'Brother',
      documentsShared: 5,
      lastActive: '1 day ago',
    },
  ];

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Family & Friends</h1>
      <p className="text-gray-400 mb-8">Manage your family sharing connections</p>

      <button className="mb-6 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-all">
        Add Family Member
      </button>

      <div className="grid grid-cols-3 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="p-6 rounded-2xl"
            style={{
              background: 'rgba(26, 22, 37, 0.6)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
            }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto">
              {member.avatar}
            </div>
            <h4 className="text-white font-semibold text-center mb-1">{member.name}</h4>
            <p className="text-gray-400 text-sm text-center mb-3">{member.relationship}</p>
            <div className="text-center space-y-1 mb-4">
              <p className="text-purple-300 text-sm">{member.documentsShared} documents shared</p>
              <p className="text-gray-500 text-xs">{member.lastActive}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/30 transition-all">
                View
              </button>
              <button className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm hover:bg-red-500/30 transition-all">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlaceholderContent({ section }: { section: string }) {
  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">
        {section.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </h1>
      <p className="text-gray-400 mb-8">This section is coming soon</p>
      <div className="p-12 rounded-2xl flex items-center justify-center" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <p className="text-gray-500 text-lg">Content coming soon...</p>
      </div>
    </div>
  );
}
