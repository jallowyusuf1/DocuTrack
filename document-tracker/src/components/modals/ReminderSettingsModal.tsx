import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock, Moon } from 'lucide-react';
import DesktopModal from '../ui/DesktopModal';
import { triggerHaptic } from '../../utils/animations';
import { addDays, format } from 'date-fns';

interface ReminderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ReminderSettings) => void;
  initialSettings?: ReminderSettings;
  documentExpiryDate?: string;
}

export interface ReminderSettings {
  enabled: boolean;
  reminders: {
    days30: boolean;
    days7: boolean;
    days1: boolean;
    custom: boolean;
    customDays?: number;
    customUnit?: 'days' | 'weeks' | 'months';
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  reminders: {
    days30: true,
    days7: true,
    days1: true,
    custom: false,
    customDays: 14,
    customUnit: 'days',
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

const TEMPLATES = {
  conservative: {
    days30: true,
    days7: true,
    days1: true,
    custom: true,
    customDays: 60,
    customUnit: 'days' as const,
  },
  standard: {
    days30: true,
    days7: true,
    days1: true,
    custom: false,
  },
  minimal: {
    days30: false,
    days7: true,
    days1: true,
    custom: false,
  },
};

export default function ReminderSettingsModal({
  isOpen,
  onClose,
  onSave,
  initialSettings = DEFAULT_SETTINGS,
  documentExpiryDate,
}: ReminderSettingsModalProps) {
  const [settings, setSettings] = useState<ReminderSettings>(initialSettings);

  const handleSave = () => {
    triggerHaptic('medium');
    onSave(settings);
    onClose();
  };

  const applyTemplate = (template: keyof typeof TEMPLATES) => {
    setSettings((prev) => ({
      ...prev,
      reminders: { ...prev.reminders, ...TEMPLATES[template] },
    }));
    triggerHaptic('light');
  };

  const calculateReminderDates = () => {
    if (!documentExpiryDate) return [];
    const expiry = new Date(documentExpiryDate);
    const dates: Array<{ label: string; date: Date; enabled: boolean }> = [];

    if (settings.reminders.days30) {
      dates.push({ label: '30 days', date: addDays(expiry, -30), enabled: true });
    }
    if (settings.reminders.days7) {
      dates.push({ label: '7 days', date: addDays(expiry, -7), enabled: true });
    }
    if (settings.reminders.days1) {
      dates.push({ label: '1 day', date: addDays(expiry, -1), enabled: true });
    }
    if (settings.reminders.custom && settings.reminders.customDays) {
      const days = settings.reminders.customUnit === 'weeks'
        ? settings.reminders.customDays * 7
        : settings.reminders.customUnit === 'months'
        ? settings.reminders.customDays * 30
        : settings.reminders.customDays;
      dates.push({ label: `Custom (${settings.reminders.customDays} ${settings.reminders.customUnit})`, date: addDays(expiry, -days), enabled: true });
    }

    return dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const reminderDates = calculateReminderDates();

  return (
    <DesktopModal
      isOpen={isOpen}
      onClose={onClose}
      width={900}
      height={700}
      title="Reminder Settings"
    >
      <div className="flex h-full">
        {/* Left Panel - Settings */}
        <div className="w-[500px] p-6 border-r border-white/10 overflow-y-auto">
          {/* Master Toggle */}
          <div className="mb-8">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3">
                <Bell className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-semibold text-white">Enable Reminders</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                className="w-12 h-6 rounded-full bg-white/10 border-2 border-white/20 appearance-none checked:bg-purple-500 checked:border-purple-500 relative transition-colors"
                style={{
                  background: settings.enabled ? '#8B5CF6' : 'rgba(255, 255, 255, 0.1)',
                }}
              />
            </label>
          </div>

          {settings.enabled && (
            <>
              {/* Reminder Checkboxes */}
              <div className="space-y-4 mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminders.days30}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        reminders: { ...prev.reminders, days30: e.target.checked },
                      }))
                    }
                    className="w-7 h-7 rounded border-white/20 bg-white/10 text-purple-500"
                  />
                  <span className="text-[28px] text-white">30 days before</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminders.days7}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        reminders: { ...prev.reminders, days7: e.target.checked },
                      }))
                    }
                    className="w-7 h-7 rounded border-white/20 bg-white/10 text-purple-500"
                  />
                  <span className="text-[28px] text-white">7 days before</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminders.days1}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        reminders: { ...prev.reminders, days1: e.target.checked },
                      }))
                    }
                    className="w-7 h-7 rounded border-white/20 bg-white/10 text-purple-500"
                  />
                  <span className="text-[28px] text-white">1 day before</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.reminders.custom}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        reminders: { ...prev.reminders, custom: e.target.checked },
                      }))
                    }
                    className="w-7 h-7 rounded border-white/20 bg-white/10 text-purple-500"
                  />
                  <span className="text-[28px] text-white">Custom</span>
                </label>
              </div>

              {/* Custom Fields */}
              {settings.reminders.custom && (
                <div className="mb-6 p-4 rounded-xl bg-white/5 space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={settings.reminders.customDays || 14}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          reminders: {
                            ...prev.reminders,
                            customDays: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                      min="1"
                    />
                    <select
                      value={settings.reminders.customUnit || 'days'}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          reminders: {
                            ...prev.reminders,
                            customUnit: e.target.value as 'days' | 'weeks' | 'months',
                          },
                        }))
                      }
                      className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-2">Time</label>
                    <input
                      type="time"
                      value="09:00"
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                </div>
              )}

              {/* Quiet Hours */}
              <div className="mb-6">
                <label className="flex items-center justify-between mb-4 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-purple-400" />
                    <span className="text-lg font-semibold text-white">Quiet Hours</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.quietHours.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        quietHours: { ...prev.quietHours, enabled: e.target.checked },
                      }))
                    }
                    className="w-10 h-5 rounded-full bg-white/10 border-2 border-white/20 appearance-none checked:bg-purple-500 checked:border-purple-500 relative transition-colors"
                  />
                </label>
                {settings.quietHours.enabled && (
                  <div className="flex gap-4">
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, start: e.target.value },
                        }))
                      }
                      className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    />
                    <span className="text-white/60 self-center">to</span>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          quietHours: { ...prev.quietHours, end: e.target.value },
                        }))
                      }
                      className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                )}
              </div>

              {/* Templates */}
              <div className="flex gap-3">
                <button
                  onClick={() => applyTemplate('conservative')}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-sm"
                >
                  Conservative
                </button>
                <button
                  onClick={() => applyTemplate('standard')}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-sm"
                >
                  Standard
                </button>
                <button
                  onClick={() => applyTemplate('minimal')}
                  className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors text-sm"
                >
                  Minimal
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
          
          {/* Timeline */}
          {documentExpiryDate && (
            <div className="mb-6">
              <div className="relative h-2 bg-white/10 rounded-full mb-4">
                {reminderDates.map((reminder, idx) => {
                  const expiry = new Date(documentExpiryDate);
                  const now = new Date();
                  const totalDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                  const reminderDays = (expiry.getTime() - reminder.date.getTime()) / (1000 * 60 * 60 * 24);
                  const position = totalDays > 0 ? (reminderDays / totalDays) * 100 : 0;
                  
                  return (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-purple-500 border-2 border-white"
                      style={{ left: `${Math.max(0, Math.min(100, position))}%` }}
                      title={`${reminder.label}: ${format(reminder.date, 'MMM d, yyyy')}`}
                    />
                  );
                })}
              </div>
              <div className="text-sm text-white/60">
                <div className="flex justify-between">
                  <span>Now</span>
                  <span>Expiry: {format(new Date(documentExpiryDate), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notification Preview Cards */}
          <div className="space-y-3">
            {reminderDates.map((reminder, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-semibold text-white">{reminder.label} Reminder</span>
                </div>
                <p className="text-xs text-white/60">
                  {format(reminder.date, 'MMM d, yyyy')} at 9:00 AM
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 transition-colors"
        >
          Save
        </button>
      </div>
    </DesktopModal>
  );
}

