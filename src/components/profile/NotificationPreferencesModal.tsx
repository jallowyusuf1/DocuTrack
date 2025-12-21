import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  requestNotificationPermission,
  type NotificationPreferences,
} from '../../services/notifications';
import Modal from '../ui/Modal';
import Toggle from '../ui/Toggle';
import Button from '../ui/Button';
import { useToast } from '../../hooks/useToast';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPreferencesModal({
  isOpen,
  onClose,
}: NotificationPreferencesModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    push_enabled: true,
    email_enabled: false,
    notify_30_days: true,
    notify_14_days: false,
    notify_7_days: true,
    notify_1_day: true,
    notify_expired: true,
  });

  useEffect(() => {
    if (isOpen && user?.id) {
      loadPreferences();
    }
  }, [isOpen, user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const prefs = await getNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await updateNotificationPreferences(user.id, preferences);
      showToast('Notification preferences saved', 'success');
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save preferences', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePushToggle = async (enabled: boolean) => {
    setPreferences((prev) => ({ ...prev, push_enabled: enabled }));

    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        showToast('Notification permission denied. Please enable in browser settings.', 'warning');
        setPreferences((prev) => ({ ...prev, push_enabled: false }));
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      type="center"
      size="large"
      title="Notification Preferences"
    >
      <div className="p-5 md:p-6 space-y-6" style={{ padding: '20px' }} data-tablet-notif-padding="true">
        <style>{`
          @media (min-width: 768px) {
            [data-tablet-notif-padding="true"] {
              padding: 24px !important;
            }
          }
        `}</style>
        {/* Push Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-[19px] font-semibold text-gray-900">Push Notifications</h3>
              <p className="text-sm md:text-[19px] text-gray-600">Receive browser notifications</p>
            </div>
            <Toggle
              checked={preferences.push_enabled}
              onChange={handlePushToggle}
            />
          </div>

          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base md:text-[19px] font-semibold text-gray-900">Email Notifications</h3>
              <p className="text-sm md:text-[19px] text-gray-600">Receive email alerts</p>
            </div>
            <Toggle
              checked={preferences.email_enabled}
              onChange={(enabled) =>
                setPreferences((prev) => ({ ...prev, email_enabled: enabled }))
              }
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">
            Notification Timing
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-[19px] text-gray-700">30 days before expiration</span>
              <Toggle
                checked={preferences.notify_30_days}
                onChange={(enabled) =>
                  setPreferences((prev) => ({ ...prev, notify_30_days: enabled }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-[19px] text-gray-700">14 days before expiration</span>
              <Toggle
                checked={preferences.notify_14_days}
                onChange={(enabled) =>
                  setPreferences((prev) => ({ ...prev, notify_14_days: enabled }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-[19px] text-gray-700">7 days before expiration</span>
              <Toggle
                checked={preferences.notify_7_days}
                onChange={(enabled) =>
                  setPreferences((prev) => ({ ...prev, notify_7_days: enabled }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-[19px] text-gray-700">1 day before expiration</span>
              <Toggle
                checked={preferences.notify_1_day}
                onChange={(enabled) =>
                  setPreferences((prev) => ({ ...prev, notify_1_day: enabled }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm md:text-[19px] text-gray-700">On expiration day</span>
              <Toggle
                checked={preferences.notify_expired}
                onChange={(enabled) =>
                  setPreferences((prev) => ({ ...prev, notify_expired: enabled }))
                }
              />
            </div>
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">Quiet Hours</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 flex-1">Start time</label>
              <input
                type="time"
                value={preferences.quiet_hours_start || '22:00'}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, quiet_hours_start: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 flex-1">End time</label>
              <input
                type="time"
                value={preferences.quiet_hours_end || '08:00'}
                onChange={(e) =>
                  setPreferences((prev) => ({ ...prev, quiet_hours_end: e.target.value }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={handleSave} loading={loading}>
            Save Preferences
          </Button>
        </div>
      </div>
    </Modal>
  );
}

