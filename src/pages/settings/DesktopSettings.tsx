import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Fingerprint,
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
  FileText,
  Eye,
  ChevronRight,
  User,
  Check,
  X,
  Trash2,
  Clock,
  AlertCircle,
  Moon,
  Sun,
  Monitor,
  Laptop,
  Tablet,
  Phone,
  MapPin,
  EyeOff,
  QrCode,
  Download as DownloadIcon,
  Loader2,
  LogOut,
  Camera,
  Save,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { userService, type UserProfile, type UserSettings, type ConnectedDevice } from '../../services/userService';
import { mfaService } from '../../services/mfaService';
import { documentLockService, type DocumentLockSettings } from '../../services/documentLockService';
import { idleSecurityService, type IdleSecuritySettings } from '../../services/idleSecurityService';
import { webauthnService, type WebAuthnCredentialRow } from '../../services/webauthnService';
import { supabase } from '../../config/supabase';
import BackButton from '../../components/ui/BackButton';
import EditProfileModal from '../../components/profile/EditProfileModal';
import DeleteAccountModal from '../../components/profile/DeleteAccountModal';
import MFASetupModal from '../../components/auth/MFASetupModal';
import BackupCodesModal from '../../components/auth/BackupCodesModal';
import SetDocumentLockModal from '../../components/documents/SetDocumentLockModal';
import SetIdleLockPasswordModal from '../../components/security/SetIdleLockPasswordModal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/ui/Toast';
import { format, formatDistanceToNow } from 'date-fns';
import { compressImage, selectImageFromGallery, openCamera } from '../../utils/imageHandler';
import { documentService } from '../../services/documents';

type SettingsSection =
  | 'email-password'
  | 'two-factor'
  | 'connected-devices'
  | 'delete-account'
  | 'document-lock'
  | 'idle-timeout'
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
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { toasts, showToast, removeToast } = useToast();

  const [activeSection, setActiveSection] = useState<SettingsSection>('email-password');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user data on load
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const [profile, settings] = await Promise.all([
          userService.getUserProfile(user.id),
          userService.getUserSettings(user.id),
        ]);

        setUserProfile(profile);
        setUserSettings(settings);

        // Apply theme and language from settings
        if (settings?.theme && settings.theme !== theme) {
          setTheme(settings.theme);
        }
        if (settings?.language && settings.language !== language) {
          setLanguage(settings.language);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, theme, language, setTheme, setLanguage]);

  const navigationGroups: NavGroup[] = [
    {
      title: 'ACCOUNT',
      items: [
        { id: 'email-password', label: 'Email & Password', icon: Mail, hasChevron: true },
        { id: 'two-factor', label: 'Two-Factor Authentication', icon: Shield, hasChevron: true },
        { id: 'document-lock', label: 'Document Lock', icon: Lock, hasChevron: true },
        { id: 'idle-timeout', label: 'Idle Timeout', icon: Clock, hasChevron: true },
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
        { id: 'whats-new', label: "What's New", icon: FileText, hasChevron: true },
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
      case 'document-lock':
        return <DocumentLockContent />;
      case 'idle-timeout':
        return <IdleTimeoutContent />;
      case 'connected-devices':
        return <ConnectedDevicesContent userSettings={userSettings} />;
      case 'delete-account':
        return <DeleteAccountContent onOpenModal={() => setIsDeleteAccountOpen(true)} />;
      case 'notifications':
        return <NotificationsContent userSettings={userSettings} onSettingsChange={setUserSettings} />;
      case 'appearance':
        return <AppearanceContent userSettings={userSettings} onSettingsChange={setUserSettings} />;
      case 'language':
        return <LanguageContent userSettings={userSettings} onSettingsChange={setUserSettings} />;
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
    <div className="min-h-full w-full flex flex-col" style={{
      background: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
    }}>
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
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-purple-500/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {userProfile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <h3 className="text-white font-bold text-xl mb-1">
                {userProfile?.full_name || user?.email?.split('@')[0] || 'User'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{user?.email || 'user@example.com'}</p>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full py-2 px-4 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all"
              >
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

          {/* Sign Out Button */}
          <div className="p-6 border-t border-white/10">
            <button
              type="button"
              onClick={async () => {
                if (confirm('Sign out of DocuTrackr?')) {
                  await logout();
                  navigate('/signin');
                }
              }}
              className="w-full h-12 px-5 rounded-full transition-all flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255, 69, 58, 0.10)',
                border: '1px solid rgba(255, 69, 58, 0.24)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                boxShadow: '0 22px 74px rgba(0,0,0,0.50), 0 0 42px rgba(255,69,58,0.18), inset 0 1px 0 rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1000px] mx-auto p-8">
            {/* Back Button */}
            <div className="mb-6">
              <BackButton to="/dashboard" />
            </div>
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

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={async () => {
          if (user?.id) {
            const profile = await userService.getUserProfile(user.id);
            setUserProfile(profile);
          }
          setIsEditProfileOpen(false);
          showToast('Profile updated successfully', 'success');
        }}
      />

      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        onConfirm={async () => {
          await logout();
          navigate('/signin');
        }}
      />

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

// Content Components
function EmailPasswordContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailPassword || !newEmail) return;

    setIsChangingEmail(true);
    try {
      const result = await userService.changeEmail(newEmail, emailPassword);
      if (result.success) {
        showToast('Verification email sent to new address', 'success');
        setShowEmailForm(false);
        setNewEmail('');
        setEmailPassword('');
      } else {
        showToast(result.error || 'Failed to change email', 'error');
      }
    } catch (error) {
      showToast('Failed to change email', 'error');
    } finally {
      setIsChangingEmail(false);
    }
  };

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
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleChangeEmail}
            className="mt-4 pt-4 border-t border-white/10"
          >
            <Input
              type="email"
              placeholder="New email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              className="mb-3"
            />
            <div className="relative">
              <Input
                type="password"
                placeholder="Verify with password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                required
                className="mb-4"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isChangingEmail}
              disabled={!newEmail || !emailPassword}
            >
              Send Verification Email
            </Button>
          </motion.form>
        )}
      </div>

      {/* Password Card */}
      <div className="p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <h3 className="text-white font-semibold text-lg mb-4">Password</h3>
        <p className="text-gray-400 text-sm mb-4">••••••••</p>
        <button
          onClick={() => navigate('/settings/change-password')}
          className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-all"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

function TwoFactorContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [factors, setFactors] = useState<any[]>([]);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showBackupCodesModal, setShowBackupCodesModal] = useState(false);

  useEffect(() => {
    const checkMFAStatus = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const enabled = await mfaService.hasMFAEnabled();
        setIsEnabled(enabled);
        
        if (enabled) {
          const userFactors = await mfaService.getFactors();
          setFactors(userFactors);
        }
      } catch (error) {
        console.error('Error checking MFA status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkMFAStatus();
  }, [user]);

  const handleDisable = async () => {
    if (!user?.id || !confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    try {
      for (const factor of factors) {
        await mfaService.unenroll(factor.id);
      }
      setIsEnabled(false);
      setFactors([]);
      showToast('Two-factor authentication disabled', 'success');
    } catch (error) {
      showToast('Failed to disable 2FA', 'error');
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!user?.id) return;

    try {
      const codes = mfaService.generateBackupCodes(10);
      await mfaService.saveBackupCodes(user.id, codes);
      setShowBackupCodesModal(true);
      showToast('Backup codes regenerated', 'success');
    } catch (error) {
      showToast('Failed to regenerate backup codes', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

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
            {isEnabled && factors.length > 0 && (
              <p className="text-gray-400 text-sm">
                Enabled since {new Date(factors[0].created_at).toLocaleDateString()}
              </p>
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
          <Button
            variant="primary"
            fullWidth
            onClick={() => setShowSetupModal(true)}
          >
            Enable Two-Factor Auth
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleDisable}
            className="border-red-500/30 text-red-400 hover:bg-red-500/20"
          >
            Disable Two-Factor Auth
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleRegenerateBackupCodes}
          >
            Regenerate Backup Codes
          </Button>
        </div>
      )}

      {/* Setup Modal */}
      <MFASetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSuccess={async () => {
          setShowSetupModal(false);
          const enabled = await mfaService.hasMFAEnabled();
          setIsEnabled(enabled);
          if (enabled) {
            const userFactors = await mfaService.getFactors();
            setFactors(userFactors);
          }
        }}
      />

      {/* Backup Codes Modal */}
      <BackupCodesModal
        isOpen={showBackupCodesModal}
        onClose={() => setShowBackupCodesModal(false)}
        userId={user?.id || ''}
      />
    </div>
  );
}

function ConnectedDevicesContent({ userSettings }: { userSettings: UserSettings | null }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDevices = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const fetchedDevices = await userService.getConnectedDevices(user.id);
        setDevices(fetchedDevices);
      } catch (error) {
        console.error('Error fetching devices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();
  }, [user]);

  const handleRevokeDevice = async (deviceId: string) => {
    try {
      const success = await userService.revokeDevice(deviceId);
      if (success) {
        showToast('Device access revoked', 'success');
        setDevices(devices.filter((d) => d.id !== deviceId));
      } else {
        showToast('Failed to revoke device', 'error');
      }
    } catch (error) {
      showToast('Failed to revoke device', 'error');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    const type = deviceType.toLowerCase();
    if (type.includes('mobile') || type.includes('phone')) return Phone;
    if (type.includes('tablet')) return Tablet;
    if (type.includes('laptop') || type.includes('mac') || type.includes('windows')) return Laptop;
    return Monitor;
  };

  const getCurrentDeviceId = () => {
    // This would need to be stored when session is created
    return devices.find((d) => d.user_agent === navigator.userAgent)?.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Connected Devices</h1>
      <p className="text-gray-400 mb-8">Manage devices that have access to your account</p>

      {devices.length === 0 ? (
        <div className="p-12 rounded-2xl text-center" style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <p className="text-gray-400">No connected devices found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {devices.map((device) => {
            const DeviceIcon = getDeviceIcon(device.device_type || device.user_agent);
            const isCurrent = device.id === getCurrentDeviceId();

            return (
              <div
                key={device.id}
                className="p-6 rounded-2xl"
                style={{
                  background: 'rgba(26, 22, 37, 0.6)',
                  backdropFilter: 'blur(20px)',
                  border: isCurrent
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
                      <h3 className="text-white font-semibold text-lg">{device.device_name || 'Unknown Device'}</h3>
                      {isCurrent && (
                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                          This device
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {device.location && (
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {device.location}
                        </span>
                      )}
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(device.last_active), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  {!isCurrent && (
                    <button
                      onClick={() => handleRevokeDevice(device.id)}
                      className="px-4 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Revoke Access
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DeleteAccountContent({ onOpenModal }: { onOpenModal: () => void }) {
  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Delete Account</h1>
      <p className="text-gray-400 mb-8">Permanently delete your account and all data</p>

      <div className="p-6 rounded-2xl" style={{
        background: 'rgba(220, 38, 38, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(220, 38, 38, 0.3)',
      }}>
        <div className="flex items-start gap-4 mb-4">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-white font-semibold text-lg mb-2">Warning: This action cannot be undone</h3>
            <p className="text-gray-400 text-sm mb-4">
              Deleting your account will permanently remove all your documents, settings, and data from DocuTrackr.
              This includes:
            </p>
            <ul className="list-disc list-inside text-gray-400 text-sm space-y-1 mb-6">
              <li>All your documents and images</li>
              <li>Your profile and settings</li>
              <li>All shared documents and connections</li>
              <li>Your notification preferences</li>
            </ul>
          </div>
        </div>

        <button
          onClick={onOpenModal}
          className="w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
        >
          Delete My Account
        </button>
      </div>
    </div>
  );
}

function NotificationsContent({ userSettings, onSettingsChange }: { userSettings: UserSettings | null; onSettingsChange: (settings: UserSettings | null) => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [masterEnabled, setMasterEnabled] = useState(
    userSettings?.notification_preferences?.master_enabled ?? true
  );
  const [notifications, setNotifications] = useState({
    expiryWarnings: userSettings?.notification_preferences?.expiry_warnings || { push: true, email: true, in_app: true },
    renewalReminders: userSettings?.notification_preferences?.renewal_reminders || { push: true, email: true, in_app: true },
    familyShares: userSettings?.notification_preferences?.family_shares || { push: true, email: true, in_app: true },
    systemUpdates: userSettings?.notification_preferences?.system_updates || { push: true, email: true, in_app: true },
  });
  const [reminderTiming, setReminderTiming] = useState<number[]>(
    userSettings?.notification_preferences?.reminder_timing || [30, 7, 1]
  );
  const [quietHoursStart, setQuietHoursStart] = useState(
    userSettings?.notification_preferences?.quiet_hours_start || '22:00'
  );
  const [quietHoursEnd, setQuietHoursEnd] = useState(
    userSettings?.notification_preferences?.quiet_hours_end || '08:00'
  );
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(
    !!(userSettings?.notification_preferences?.quiet_hours_start && userSettings?.notification_preferences?.quiet_hours_end)
  );

  const handleMasterToggle = (enabled: boolean) => {
    setMasterEnabled(enabled);
    // Update all notification types when master toggle changes
    const updated = {
      expiryWarnings: { push: enabled, email: enabled, in_app: enabled },
      renewalReminders: { push: enabled, email: enabled, in_app: enabled },
      familyShares: { push: enabled, email: enabled, in_app: enabled },
      systemUpdates: { push: enabled, email: enabled, in_app: enabled },
    };
    setNotifications(updated);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const updated = await userService.updateUserSettings(user.id, {
        notification_preferences: {
          master_enabled: masterEnabled,
          expiry_warnings: notifications.expiryWarnings,
          renewal_reminders: notifications.renewalReminders,
          family_shares: notifications.familyShares,
          system_updates: notifications.systemUpdates,
          reminder_timing: reminderTiming,
          quiet_hours_start: quietHoursEnabled ? quietHoursStart : undefined,
          quiet_hours_end: quietHoursEnabled ? quietHoursEnd : undefined,
        },
      });
      onSettingsChange(updated);
      showToast('Notification settings saved', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleReminderTiming = (days: number) => {
    if (reminderTiming.includes(days)) {
      setReminderTiming(reminderTiming.filter((d) => d !== days));
    } else {
      setReminderTiming([...reminderTiming, days].sort((a, b) => b - a));
    }
  };

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
            onClick={() => handleMasterToggle(!masterEnabled)}
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
      <div className="mb-6 p-6 rounded-2xl" style={{
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
              {[
                { key: 'expiryWarnings', label: 'Expiry Warnings' },
                { key: 'renewalReminders', label: 'Renewal Reminders' },
                { key: 'familyShares', label: 'Family Shares' },
                { key: 'systemUpdates', label: 'System Updates' },
              ].map(({ key, label }) => {
                const values = notifications[key as keyof typeof notifications];
                return (
                  <tr key={key} className="border-b border-white/5">
                    <td className="py-4 text-white">{label}</td>
                    <td className="py-4 text-center">
                      <input
                        type="checkbox"
                        checked={values.push}
                        onChange={(e) => {
                          setNotifications({
                            ...notifications,
                            [key]: { ...values, push: e.target.checked },
                          });
                        }}
                        className="w-5 h-5"
                        disabled={!masterEnabled}
                      />
                    </td>
                    <td className="py-4 text-center">
                      <input
                        type="checkbox"
                        checked={values.email}
                        onChange={(e) => {
                          setNotifications({
                            ...notifications,
                            [key]: { ...values, email: e.target.checked },
                          });
                        }}
                        className="w-5 h-5"
                        disabled={!masterEnabled}
                      />
                    </td>
                    <td className="py-4 text-center">
                      <input
                        type="checkbox"
                        checked={values.in_app}
                        onChange={(e) => {
                          setNotifications({
                            ...notifications,
                            [key]: { ...values, in_app: e.target.checked },
                          });
                        }}
                        className="w-5 h-5"
                        disabled={!masterEnabled}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder Timing */}
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <h3 className="text-white font-semibold text-lg mb-4">Reminder Timing</h3>
        <div className="flex gap-4 flex-wrap">
          {[30, 14, 7, 1].map((days) => (
            <button
              key={days}
              onClick={() => toggleReminderTiming(days)}
              className={`px-4 py-2 rounded-lg transition-all ${
                reminderTiming.includes(days)
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Quiet Hours</h3>
            <p className="text-gray-400 text-sm mt-1">No notifications during this time</p>
          </div>
          <button
            onClick={() => setQuietHoursEnabled(!quietHoursEnabled)}
            className={`w-14 h-8 rounded-full transition-all ${
              quietHoursEnabled ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                quietHoursEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        {quietHoursEnabled && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-gray-400 text-sm mb-2 block">From</label>
              <Input
                type="time"
                value={quietHoursStart}
                onChange={(e) => setQuietHoursStart(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-sm mb-2 block">To</label>
              <Input
                type="time"
                value={quietHoursEnd}
                onChange={(e) => setQuietHoursEnd(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <Button
        variant="primary"
        fullWidth
        onClick={handleSave}
        isLoading={loading}
      >
        Save Settings
      </Button>
    </div>
  );
}

function AppearanceContent({ userSettings, onSettingsChange }: { userSettings: UserSettings | null; onSettingsChange: (settings: UserSettings | null) => void }) {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'auto'>(
    (userSettings?.theme as 'light' | 'dark' | 'auto') || theme || 'dark'
  );
  const [textSize, setTextSize] = useState(userSettings?.text_size || 16);
  const [reduceMotion, setReduceMotion] = useState(userSettings?.reduce_motion || false);

  const themes = [
    {
      id: 'light' as const,
      name: 'Light',
      icon: Sun,
      preview: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
    },
    {
      id: 'dark' as const,
      name: 'Dark',
      icon: Moon,
      preview: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
    },
    {
      id: 'auto' as const,
      name: 'Auto',
      icon: Monitor,
      preview: 'linear-gradient(135deg, #1a1625 0%, #FFFFFF 100%)',
    },
  ];

  const handleThemeChange = async (themeId: 'light' | 'dark' | 'auto') => {
    setSelectedTheme(themeId);
    setTheme(themeId);
    
    // Save to DB
    if (user?.id) {
      try {
        const updated = await userService.updateUserSettings(user.id, { theme: themeId });
        onSettingsChange(updated);
        localStorage.setItem('theme', themeId);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const updated = await userService.updateUserSettings(user.id, {
        text_size: textSize,
        reduce_motion: reduceMotion,
      });
      onSettingsChange(updated);
      localStorage.setItem('textSize', textSize.toString());
      localStorage.setItem('reduceMotion', reduceMotion.toString());
      showToast('Appearance settings saved', 'success');
    } catch (error) {
      showToast('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };

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
                onClick={() => handleThemeChange(themeOption.id)}
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
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <h3 className="text-white font-semibold text-lg mb-4">Text Size</h3>
        <input
          type="range"
          min="11"
          max="20"
          value={textSize}
          onChange={(e) => setTextSize(Number(e.target.value))}
          className="w-full mb-4"
        />
        <p className="text-gray-400 mb-2">Preview text at selected size</p>
        <p className="text-white" style={{ fontSize: `${textSize}px` }}>
          This is how your text will look
        </p>
      </div>

      {/* Reduce Motion */}
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">Reduce Motion</h3>
            <p className="text-gray-400 text-sm mt-1">Disable animations for accessibility</p>
          </div>
          <button
            onClick={() => setReduceMotion(!reduceMotion)}
            className={`w-14 h-8 rounded-full transition-all ${
              reduceMotion ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                reduceMotion ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <Button variant="primary" fullWidth onClick={handleSave} isLoading={loading}>
        Save Settings
      </Button>
    </div>
  );
}

function LanguageContent({ userSettings, onSettingsChange }: { userSettings: UserSettings | null; onSettingsChange: (settings: UserSettings | null) => void }) {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { showToast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState(userSettings?.language || language || 'en');
  const [loading, setLoading] = useState(false);

  const languages = [
    { code: 'en', flag: '🇺🇸', name: 'English', nativeName: 'English' },
    { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français' },
    { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español' },
    { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية' },
  ];

  const handleLanguageChange = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const updated = await userService.updateUserSettings(user.id, { language: selectedLanguage });
      onSettingsChange(updated);
      setLanguage(selectedLanguage);
      localStorage.setItem('language', selectedLanguage);
      
      // Show confirmation and reload
      if (confirm('Language changed. The app will reload to apply the changes.')) {
        window.location.reload();
      }
    } catch (error) {
      showToast('Failed to change language', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Language & Region</h1>
      <p className="text-gray-400 mb-8">Choose your preferred language</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
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

      <Button
        variant="primary"
        fullWidth
        onClick={handleLanguageChange}
        isLoading={loading}
        disabled={selectedLanguage === language}
      >
        Change Language & Reload
      </Button>
    </div>
  );
}

function StorageContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [storageData, setStorageData] = useState<{
    totalMB: number;
    usedMB: number;
    breakdown: {
      documents: { count: number; sizeMB: number };
      thumbnails: { count: number; sizeMB: number };
      cache: { sizeMB: number };
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearingCache, setClearingCache] = useState(false);

  useEffect(() => {
    const fetchStorage = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const data = await userService.calculateStorageUsage(user.id);
        setStorageData(data);
      } catch (error) {
        console.error('Error fetching storage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStorage();
  }, [user]);

  const handleClearCache = async () => {
    setClearingCache(true);
    try {
      const success = userService.clearCache();
      if (success) {
        showToast('Cache cleared successfully', 'success');
        // Refresh storage data
        if (user?.id) {
          const data = await userService.calculateStorageUsage(user.id);
          setStorageData(data);
        }
      } else {
        showToast('Failed to clear cache', 'error');
      }
    } catch (error) {
      showToast('Failed to clear cache', 'error');
    } finally {
      setClearingCache(false);
    }
  };

  if (loading || !storageData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const percentage = (storageData.usedMB / storageData.totalMB) * 100;

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
            <span className="text-gray-400 text-sm">{storageData.usedMB.toFixed(1)} MB / {storageData.totalMB} MB</span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="w-full space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Documents</span>
            <span className="text-white">
              {storageData.breakdown.documents.count} • {storageData.breakdown.documents.sizeMB.toFixed(2)} MB
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Thumbnails</span>
            <span className="text-white">
              {storageData.breakdown.thumbnails.count} • {storageData.breakdown.thumbnails.sizeMB.toFixed(2)} MB
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Cache</span>
            <span className="text-white">{storageData.breakdown.cache.sizeMB.toFixed(2)} MB</span>
          </div>
        </div>

        <div className="w-full mt-6 space-y-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleClearCache}
            isLoading={clearingCache}
          >
            Clear Cache
          </Button>
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
  const { user } = useAuth();
  const { showToast } = useToast();
  const [format, setFormat] = useState<'json' | 'csv' | 'zip'>('json');
  const [dateRange, setDateRange] = useState<'all' | 'month' | 'year' | 'custom'>('all');
  const [includeOptions, setIncludeOptions] = useState({
    documents: true,
    notes: true,
    activity: true,
    shared: true,
  });
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = async () => {
    if (!user?.id) return;

    setExporting(true);
    setProgress(0);

    try {
      setProgress(10);
      const documents = await documentService.getAllDocuments(user.id);
      setProgress(40);

      const exportData: any = {};
      
      if (includeOptions.documents) {
        exportData.documents = documents.map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          category: doc.document_type,
          issue_date: doc.issue_date,
          expiration_date: doc.expiration_date,
          document_number: doc.document_number,
          notes: doc.notes,
          created_at: doc.created_at,
        }));
      }

      setProgress(70);

      let blob: Blob;
      let filename: string;
      let mimeType: string;

      if (format === 'json') {
        blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        filename = `docutrack-export-${Date.now()}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        // Convert to CSV
        const headers = Object.keys(exportData.documents[0] || {});
        const rows = exportData.documents.map((doc: any) => headers.map(h => doc[h] || ''));
        const csv = [headers.join(','), ...rows.map((row: any[]) => row.join(','))].join('\n');
        blob = new Blob([csv], { type: 'text/csv' });
        filename = `docutrack-export-${Date.now()}.csv`;
        mimeType = 'text/csv';
      } else {
        // ZIP format (simplified - would need JSZip library)
        showToast('ZIP export coming soon', 'info');
        setExporting(false);
        return;
      }

      setProgress(90);

      // Download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProgress(100);
      showToast('Data exported successfully', 'success');
      
      setTimeout(() => {
        setExporting(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export data', 'error');
      setExporting(false);
      setProgress(0);
    }
  };

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
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as any)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="zip">ZIP (with images)</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="text-white font-semibold mb-3 block">Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
          >
            <option value="all">All time</option>
            <option value="month">Last month</option>
            <option value="year">Last year</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {/* Include Options */}
        <div>
          <label className="text-white font-semibold mb-3 block">Include</label>
          <div className="space-y-2">
            {Object.entries(includeOptions).map(([key, checked]) => (
              <label key={key} className="flex items-center gap-3 text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setIncludeOptions({ ...includeOptions, [key]: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {exporting && (
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <Button
          variant="primary"
          fullWidth
          onClick={handleExport}
          isLoading={exporting}
          disabled={exporting}
        >
          {exporting ? `Exporting... ${progress}%` : 'Export Data'}
        </Button>
      </div>
    </div>
  );
}

function FamilySharingContent() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Family Sharing</h1>
      <p className="text-gray-400 mb-8">Manage your family sharing connections</p>

      <div className="p-12 rounded-2xl text-center" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
        <p className="text-gray-400 mb-6">Manage your family connections and shared documents</p>
        <Button
          variant="primary"
          onClick={() => navigate('/family')}
        >
          Open Family Sharing
        </Button>
      </div>
    </div>
  );
}

function IdleTimeoutContent() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<IdleSecuritySettings | null>(null);
  const [passkeys, setPasskeys] = useState<WebAuthnCredentialRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);

  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const s = await idleSecurityService.getSettings(user.id);
      setSettings(s);
      const keys = await webauthnService.listPasskeys(user.id);
      setPasskeys(keys);
    } catch (e) {
      console.error('Failed to load idle security settings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const save = async (updates: Partial<IdleSecuritySettings>) => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await idleSecurityService.saveSettings(user.id, updates);
      await refresh();
      showToast('Security settings updated', 'success');
    } catch (e) {
      console.error('Failed to save idle security settings:', e);
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEnabled = async () => {
    if (!settings) return;
    if (!settings.idleTimeoutEnabled) {
      if (!settings.idleLockPasswordHash) {
        setShowSetPasswordModal(true);
        return;
      }
      await save({ idleTimeoutEnabled: true });
    } else {
      await save({ idleTimeoutEnabled: false });
    }
  };

  const handleEnrollPasskey = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await webauthnService.enrollPasskey();
      await save({ biometricUnlockEnabled: true });
      showToast('Passkey enrolled', 'success');
    } catch (e) {
      console.error('Passkey enrollment failed:', e);
      showToast('Passkey enrollment failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBiometric = async () => {
    if (!settings) return;
    if (!settings.biometricUnlockEnabled) {
      await handleEnrollPasskey();
    } else {
      await save({ biometricUnlockEnabled: false });
    }
  };

  const handleRemovePasskey = async (id: string) => {
    if (!user?.id) return;
    if (!confirm('Remove this passkey from your account?')) return;
    setSaving(true);
    try {
      await webauthnService.removePasskey(user.id, id);
      await refresh();
      showToast('Passkey removed', 'success');
    } catch (e) {
      console.error('Failed to remove passkey:', e);
      showToast('Failed to remove passkey', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const enabled = settings?.idleTimeoutEnabled ?? false;
  const hasPassword = !!settings?.idleLockPasswordHash;
  const biometricSupported = webauthnService.isSupported();

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Idle Timeout</h1>
      <p className="text-gray-400 mb-8">Automatically lock the app after inactivity</p>

      <SetIdleLockPasswordModal
        isOpen={showSetPasswordModal}
        onClose={() => setShowSetPasswordModal(false)}
        userId={user?.id ?? ''}
        onSaved={() => {
          showToast('Idle lock password saved', 'success');
          refresh();
        }}
      />

      {/* Enable */}
      <div
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Enable Idle Timeout</h3>
            <p className="text-gray-400 text-sm mt-1">
              {hasPassword ? 'Lock the app after inactivity' : 'Set an idle lock password first'}
            </p>
          </div>
          <button
            onClick={handleToggleEnabled}
            disabled={!hasPassword && !enabled}
            className={`w-14 h-8 rounded-full transition-all ${
              enabled ? 'bg-purple-600' : 'bg-gray-600'
            } ${!hasPassword && !enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className={`w-4 h-4 rounded-full ${enabled ? 'bg-green-500' : 'bg-gray-500'}`} />
          <Button variant="secondary" onClick={() => setShowSetPasswordModal(true)} disabled={saving}>
            {hasPassword ? 'Change Password' : 'Set Password'}
          </Button>
        </div>
      </div>

      {/* Timeout Minutes */}
      <div
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <h3 className="text-white font-semibold text-lg mb-4">Lock After</h3>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 5, 10, 15].map((m) => (
            <button
              key={m}
              onClick={() => save({ idleTimeoutMinutes: m as any })}
              disabled={saving}
              className={`py-3 rounded-xl text-sm font-medium transition-all ${
                settings?.idleTimeoutMinutes === m
                  ? 'bg-purple-500/25 border border-purple-400 text-white'
                  : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Max attempts + wipe */}
      <div
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <h3 className="text-white font-semibold text-lg mb-4">Unlock Protection</h3>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-white font-medium">Max unlock attempts</div>
            <div className="text-gray-400 text-sm">After this, we lock out for 15 minutes (or wipe if enabled).</div>
          </div>
          <div className="flex gap-2">
            {[1, 3, 5, 10].map((n) => (
              <button
                key={n}
                onClick={() => save({ maxUnlockAttempts: n as any })}
                disabled={saving}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings?.maxUnlockAttempts === n
                    ? 'bg-red-500/20 border border-red-400 text-white'
                    : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/10'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-medium">Wipe local data on max attempts</div>
            <div className="text-gray-400 text-sm">Clears local device data and signs you out.</div>
          </div>
          <button
            onClick={async () => {
              const next = !(settings?.wipeDataOnMaxAttempts ?? false);
              if (next) {
                const ok = confirm(
                  'This will clear local storage, session storage, caches and sign you out on this device if too many unlock attempts occur. Enable?'
                );
                if (!ok) return;
              }
              await save({ wipeDataOnMaxAttempts: next });
            }}
            disabled={saving}
            className={`w-14 h-8 rounded-full transition-all ${
              settings?.wipeDataOnMaxAttempts ? 'bg-red-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                settings?.wipeDataOnMaxAttempts ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Optional sound */}
      <div
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white font-medium">Sound alerts</div>
            <div className="text-gray-400 text-sm">Play a subtle beep during the countdown warning.</div>
          </div>
          <button
            onClick={() => save({ idleSoundAlertsEnabled: !(settings?.idleSoundAlertsEnabled ?? false) })}
            disabled={saving}
            className={`w-14 h-8 rounded-full transition-all ${
              settings?.idleSoundAlertsEnabled ? 'bg-purple-600' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                settings?.idleSoundAlertsEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Face ID / Passkeys */}
      <div
        className="mb-6 p-6 rounded-2xl"
        style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Face ID / Passkeys</h3>
            <p className="text-gray-400 text-sm mt-1">
              {biometricSupported ? 'Use device biometrics to unlock (where supported).' : 'Not supported on this device/browser.'}
            </p>
          </div>
          <button
            onClick={handleToggleBiometric}
            disabled={!biometricSupported || saving}
            className={`w-14 h-8 rounded-full transition-all ${
              settings?.biometricUnlockEnabled ? 'bg-purple-600' : 'bg-gray-600'
            } ${!biometricSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                settings?.biometricUnlockEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-white/80 text-sm">
            Enrolled passkeys: <span className="text-white font-semibold">{passkeys.length}</span>
          </div>
          <Button variant="secondary" onClick={handleEnrollPasskey} disabled={!biometricSupported || saving}>
            <Fingerprint className="w-4 h-4 mr-2" />
            Add Passkey
          </Button>
        </div>

        {passkeys.length > 0 ? (
          <div className="space-y-2">
            {passkeys.map((k) => (
              <div
                key={k.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <div className="text-white font-medium">{k.device_label || 'Passkey'}</div>
                  <div className="text-gray-400 text-xs">{new Date(k.created_at).toLocaleString()}</div>
                </div>
                <Button variant="danger" onClick={() => handleRemovePasskey(k.id)} disabled={saving}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">No passkeys enrolled yet.</div>
        )}
      </div>

      {saving ? <div className="text-white/55 text-xs">Saving…</div> : null}
    </div>
  );
}

function DocumentLockContent() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [lockSettings, setLockSettings] = useState<DocumentLockSettings | null>(null);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    const fetchLockSettings = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const settings = await documentLockService.getLockSettings(user.id);
        setLockSettings(settings);
      } catch (error) {
        console.error('Error fetching lock settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLockSettings();
  }, [user]);

  const handleEnableLock = async () => {
    if (!user?.id) return;

    if (!lockSettings?.lockPasswordHash) {
      // No password set, show modal to set password
      setShowSetPasswordModal(true);
    } else {
      // Password already set, just enable
      try {
        await documentLockService.enableLock(user.id);
        const updated = await documentLockService.getLockSettings(user.id);
        setLockSettings(updated);
        showToast('Document lock enabled', 'success');
      } catch (error) {
        console.error('Error enabling lock:', error);
        showToast('Failed to enable lock', 'error');
      }
    }
  };

  const handleDisableLock = async () => {
    if (!user?.id) return;

    if (!confirm('Are you sure you want to disable document lock?')) {
      return;
    }

    try {
      await documentLockService.disableLock(user.id);
      const updated = await documentLockService.getLockSettings(user.id);
      setLockSettings(updated);
      showToast('Document lock disabled', 'success');
    } catch (error) {
      console.error('Error disabling lock:', error);
      showToast('Failed to disable lock', 'error');
    }
  };

  const handleUpdateTrigger = async (trigger: 'always' | 'idle' | 'manual') => {
    if (!user?.id) return;

    try {
      await documentLockService.saveLockSettings({
        userId: user.id,
        lockTrigger: trigger,
      });
      const updated = await documentLockService.getLockSettings(user.id);
      setLockSettings(updated);
      showToast('Lock trigger updated', 'success');
    } catch (error) {
      console.error('Error updating trigger:', error);
      showToast('Failed to update trigger', 'error');
    }
  };

  const handleUpdateMaxAttempts = async (attempts: number) => {
    if (!user?.id) return;

    try {
      await documentLockService.saveLockSettings({
        userId: user.id,
        maxAttempts: attempts,
      });
      const updated = await documentLockService.getLockSettings(user.id);
      setLockSettings(updated);
      showToast('Max attempts updated', 'success');
    } catch (error) {
      console.error('Error updating max attempts:', error);
      showToast('Failed to update settings', 'error');
    }
  };

  const handleUpdateLockoutDuration = async (minutes: number) => {
    if (!user?.id) return;

    try {
      await documentLockService.saveLockSettings({
        userId: user.id,
        lockoutDurationMinutes: minutes,
      });
      const updated = await documentLockService.getLockSettings(user.id);
      setLockSettings(updated);
      showToast('Lockout duration updated', 'success');
    } catch (error) {
      console.error('Error updating lockout duration:', error);
      showToast('Failed to update settings', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const hasPassword = !!lockSettings?.lockPasswordHash;
  const isEnabled = lockSettings?.lockEnabled ?? false;

  return (
    <div>
      <h1 className="text-white text-3xl font-bold mb-2">Document Lock</h1>
      <p className="text-gray-400 mb-8">Secure your documents page with a password</p>

      {/* Status Card */}
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Enable Document Lock</h3>
            <p className="text-gray-400 text-sm mt-1">
              {hasPassword ? 'Protect your documents with a password' : 'Set a password first'}
            </p>
          </div>
          <button
            onClick={isEnabled ? handleDisableLock : handleEnableLock}
            disabled={!hasPassword && !isEnabled}
            className={`w-14 h-8 rounded-full transition-all ${
              isEnabled ? 'bg-purple-600' : 'bg-gray-600'
            } ${!hasPassword && !isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform ${
                isEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className={`w-4 h-4 rounded-full ${isEnabled ? 'bg-green-500' : 'bg-gray-500'}`} />
      </div>

      {/* Password Management */}
      <div className="mb-6 p-6 rounded-2xl" style={{
        background: 'rgba(26, 22, 37, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
      }}>
        <h3 className="text-white font-semibold text-lg mb-4">Lock Password</h3>
        <p className="text-gray-400 text-sm mb-4">
          {hasPassword ? 'Password is set and protected' : 'No password set'}
        </p>
        <div className="flex gap-3">
          {!hasPassword ? (
            <Button
              variant="primary"
              onClick={() => setShowSetPasswordModal(true)}
            >
              Set Password
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => setShowChangePasswordModal(true)}
            >
              Change Password
            </Button>
          )}
        </div>
      </div>

      {/* Lock Trigger */}
      {hasPassword && (
        <div className="mb-6 p-6 rounded-2xl" style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <h3 className="text-white font-semibold text-lg mb-4">Lock Trigger</h3>
          <p className="text-gray-400 text-sm mb-4">Choose when to lock the documents page</p>
          <div className="space-y-3">
            {[
              { value: 'always', label: 'Always Locked', desc: 'Lock every time you visit the documents page' },
              { value: 'idle', label: 'After Idle Time', desc: 'Lock after period of inactivity' },
              { value: 'manual', label: 'Manual Only', desc: 'Lock only when you manually lock it' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleUpdateTrigger(option.value as any)}
                className={`w-full p-4 rounded-xl text-left transition-all ${
                  lockSettings?.lockTrigger === option.value
                    ? 'bg-purple-500/20 border-2 border-purple-500'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{option.label}</h4>
                    <p className="text-gray-400 text-sm mt-1">{option.desc}</p>
                  </div>
                  {lockSettings?.lockTrigger === option.value && (
                    <Check className="w-5 h-5 text-purple-400" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Security Settings */}
      {hasPassword && (
        <div className="mb-6 p-6 rounded-2xl" style={{
          background: 'rgba(26, 22, 37, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.2)',
        }}>
          <h3 className="text-white font-semibold text-lg mb-4">Security Settings</h3>

          {/* Max Attempts */}
          <div className="mb-6">
            <label className="text-white text-sm font-medium mb-2 block">
              Maximum Attempts
            </label>
            <select
              value={lockSettings?.maxAttempts ?? 3}
              onChange={(e) => handleUpdateMaxAttempts(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="1">1 attempt</option>
              <option value="3">3 attempts</option>
              <option value="5">5 attempts</option>
              <option value="10">10 attempts</option>
            </select>
            <p className="text-gray-400 text-xs mt-2">
              Number of failed attempts before lockout
            </p>
          </div>

          {/* Lockout Duration */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">
              Lockout Duration
            </label>
            <select
              value={lockSettings?.lockoutDurationMinutes ?? 15}
              onChange={(e) => handleUpdateLockoutDuration(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none"
            >
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
            <p className="text-gray-400 text-xs mt-2">
              How long to lock out after max failed attempts
            </p>
          </div>
        </div>
      )}

      {/* Info Card */}
      <div className="p-6 rounded-2xl" style={{
        background: 'rgba(139, 92, 246, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
      }}>
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white font-semibold mb-2">About Document Lock</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>• Document lock only applies to the Documents page</li>
              <li>• Navigation remains accessible while locked</li>
              <li>• Lock state persists across browser sessions</li>
              <li>• Signing out automatically clears the lock</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SetDocumentLockModal
        isOpen={showSetPasswordModal}
        onClose={() => setShowSetPasswordModal(false)}
        onSuccess={async () => {
          if (user?.id) {
            const updated = await documentLockService.getLockSettings(user.id);
            setLockSettings(updated);
          }
          showToast('Lock password set successfully', 'success');
        }}
        mode="set"
      />

      <SetDocumentLockModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={async () => {
          if (user?.id) {
            const updated = await documentLockService.getLockSettings(user.id);
            setLockSettings(updated);
          }
          showToast('Lock password changed successfully', 'success');
        }}
        mode="change"
      />
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
