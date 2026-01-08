import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ContextualHelp from './ContextualHelp';
import { useHelp } from './HelpProvider';

export default function ContextualHelpProvider() {
  const location = useLocation();
  const { user } = useAuth();
  const { openHelp } = useHelp();

  // Only show contextual help to authenticated users
  if (!user) return null;

  // Check if user has seen onboarding (skip contextual help if they have)
  const hasSeenOnboarding = localStorage.getItem('onboarding.completed') === 'true';
  const hasSeenDashboardHelp = localStorage.getItem('help.dashboard_seen') === 'true';
  const hasSeenDocumentsHelp = localStorage.getItem('help.documents_seen') === 'true';
  const hasSeenSettingsHelp = localStorage.getItem('help.settings_seen') === 'true';

  // Dashboard - Show for new users who haven't seen onboarding
  if (location.pathname === '/dashboard' && !hasSeenOnboarding && !hasSeenDashboardHelp) {
    return (
      <ContextualHelp
        message="New to DocuTrackr? Watch this 2-min tutorial to get started."
        actionLabel="Watch tutorial"
        onAction={() => {
          openHelp();
          localStorage.setItem('help.dashboard_seen', 'true');
        }}
        type="tutorial"
        location="top"
      />
    );
  }

  // Documents page - Show tip about tags
  if (location.pathname.startsWith('/documents') && !hasSeenDocumentsHelp) {
    return (
      <ContextualHelp
        message="Tip: Use tags to organize your documents better and find them faster."
        actionLabel="Learn more"
        onAction={() => {
          openHelp();
          localStorage.setItem('help.documents_seen', 'true');
        }}
        type="tip"
        location="bottom"
      />
    );
  }

  // Settings/Profile pages - Show 2FA reminder
  if ((location.pathname.startsWith('/settings') || location.pathname.startsWith('/profile')) && !hasSeenSettingsHelp) {
    return (
      <ContextualHelp
        message="Enable two-factor authentication for extra security on your account."
        actionLabel="Enable 2FA"
        onAction={() => {
          // Navigate to 2FA settings if available
          if (location.pathname.includes('settings')) {
            // Already on settings, just scroll or show 2FA section
          } else {
            // Navigate to settings
            window.location.href = '/settings';
          }
          localStorage.setItem('help.settings_seen', 'true');
        }}
        type="info"
        location="top"
      />
    );
  }

  return null;
}

