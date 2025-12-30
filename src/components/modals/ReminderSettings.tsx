import React, { useState } from 'react';
import { Bell, Clock, Moon } from 'lucide-react';
import { DesktopModal } from './DesktopModal';

interface ReminderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ReminderConfig) => void;
  initialSettings?: ReminderConfig;
}

export interface ReminderConfig {
  enabled: boolean;
  reminders: {
    thirtyDays: boolean;
    sevenDays: boolean;
    oneDay: boolean;
    custom: {
      enabled: boolean;
      value: number;
      unit: 'days' | 'hours';
      time: string;
    };
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const defaultSettings: ReminderConfig = {
  enabled: true,
  reminders: {
    thirtyDays: true,
    sevenDays: true,
    oneDay: true,
    custom: {
      enabled: false,
      value: 3,
      unit: 'days',
      time: '09:00',
    },
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSettings = defaultSettings,
}) => {
  const [settings, setSettings] = useState<ReminderConfig>(initialSettings);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const applyTemplate = (template: 'conservative' | 'standard' | 'minimal') => {
    const templates: Record<string, Partial<ReminderConfig>> = {
      conservative: {
        enabled: true,
        reminders: {
          thirtyDays: true,
          sevenDays: true,
          oneDay: true,
          custom: {
            enabled: true,
            value: 60,
            unit: 'days',
            time: '09:00',
          },
        },
      },
      standard: {
        enabled: true,
        reminders: {
          thirtyDays: true,
          sevenDays: true,
          oneDay: true,
          custom: {
            enabled: false,
            value: 3,
            unit: 'days',
            time: '09:00',
          },
        },
      },
      minimal: {
        enabled: true,
        reminders: {
          thirtyDays: false,
          sevenDays: true,
          oneDay: false,
          custom: {
            enabled: false,
            value: 3,
            unit: 'days',
            time: '09:00',
          },
        },
      },
    };

    setSettings((prev) => ({ ...prev, ...templates[template] }));
  };

  const getTimelinePoints = () => {
    const points: Array<{ days: number; label: string; enabled: boolean }> = [];

    if (settings.reminders.thirtyDays) {
      points.push({ days: 30, label: '30 days', enabled: true });
    }
    if (settings.reminders.sevenDays) {
      points.push({ days: 7, label: '7 days', enabled: true });
    }
    if (settings.reminders.oneDay) {
      points.push({ days: 1, label: '1 day', enabled: true });
    }
    if (settings.reminders.custom.enabled) {
      const days = settings.reminders.custom.unit === 'days'
        ? settings.reminders.custom.value
        : settings.reminders.custom.value / 24;
      points.push({
        days,
        label: `${settings.reminders.custom.value} ${settings.reminders.custom.unit}`,
        enabled: true
      });
    }

    return points.sort((a, b) => b.days - a.days);
  };

  const timelinePoints = getTimelinePoints();

  return (
    <DesktopModal isOpen={isOpen} onClose={onClose}>
      <div
        className="bg-white dark:bg-gray-800"
        style={{
          width: '900px',
          height: '700px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Reminder Settings
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Settings */}
          <div className="w-[500px] p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            {/* Master Toggle */}
            <div className="mb-8">
              <label className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 cursor-pointer group hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <div className="flex items-center gap-3">
                  <Bell size={24} className="text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Enable Reminders
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified before documents expire
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div
                    className={`w-14 h-8 rounded-full transition-colors ${
                      settings.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                        settings.enabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                </div>
              </label>
            </div>

            {/* Reminder Checkboxes */}
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Reminder Schedule
              </h3>

              {[
                { key: 'thirtyDays', label: '30 days before expiry', value: settings.reminders.thirtyDays },
                { key: 'sevenDays', label: '7 days before expiry', value: settings.reminders.sevenDays },
                { key: 'oneDay', label: '1 day before expiry', value: settings.reminders.oneDay },
              ].map(({ key, label, value }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminders: { ...settings.reminders, [key]: e.target.checked },
                      })
                    }
                    disabled={!settings.enabled}
                    className="w-7 h-7 rounded border-gray-300 text-blue-600 focus:ring-blue-600 disabled:opacity-50 cursor-pointer"
                  />
                  <span className="text-base text-gray-700 dark:text-gray-300">{label}</span>
                </label>
              ))}

              {/* Custom Reminder */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <label className="flex items-center gap-3 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors mb-3">
                  <input
                    type="checkbox"
                    checked={settings.reminders.custom.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        reminders: {
                          ...settings.reminders,
                          custom: { ...settings.reminders.custom, enabled: e.target.checked },
                        },
                      })
                    }
                    disabled={!settings.enabled}
                    className="w-7 h-7 rounded border-gray-300 text-blue-600 focus:ring-blue-600 disabled:opacity-50 cursor-pointer"
                  />
                  <span className="text-base text-gray-700 dark:text-gray-300">Custom reminder</span>
                </label>

                {settings.reminders.custom.enabled && (
                  <div className="ml-10 space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="1"
                        value={settings.reminders.custom.value}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            reminders: {
                              ...settings.reminders,
                              custom: { ...settings.reminders.custom, value: parseInt(e.target.value) || 1 },
                            },
                          })
                        }
                        className="w-24 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <select
                        value={settings.reminders.custom.unit}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            reminders: {
                              ...settings.reminders,
                              custom: { ...settings.reminders.custom, unit: e.target.value as 'days' | 'hours' },
                            },
                          })
                        }
                        className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="days">Days</option>
                        <option value="hours">Hours</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notification Time
                      </label>
                      <input
                        type="time"
                        value={settings.reminders.custom.time}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            reminders: {
                              ...settings.reminders,
                              custom: { ...settings.reminders.custom, time: e.target.value },
                            },
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-4">
                <div className="flex items-center gap-3">
                  <Moon size={20} className="text-blue-600" />
                  <span className="text-base font-semibold text-gray-900 dark:text-white">Quiet Hours</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.quietHours.enabled}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        quietHours: { ...settings.quietHours, enabled: e.target.checked },
                      })
                    }
                    disabled={!settings.enabled}
                    className="sr-only"
                  />
                  <div
                    className={`w-12 h-7 rounded-full transition-colors ${
                      settings.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ease-in-out ${
                        settings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                      style={{ marginTop: '4px' }}
                    />
                  </div>
                </div>
              </label>

              {settings.quietHours.enabled && (
                <div className="flex gap-3 ml-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From
                    </label>
                    <input
                      type="time"
                      value={settings.quietHours.start}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          quietHours: { ...settings.quietHours, start: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      To
                    </label>
                    <input
                      type="time"
                      value={settings.quietHours.end}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          quietHours: { ...settings.quietHours, end: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Preview</h3>

            {/* Timeline */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                Reminder Timeline
              </h4>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-red-500" />

                {timelinePoints.map((point, index) => (
                  <div key={index} className="relative pl-12 pb-8 last:pb-0 group">
                    <div
                      className="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      <Bell size={16} className="text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                      <p className="font-semibold text-gray-900 dark:text-white">{point.label} before</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(Date.now() + point.days * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="relative pl-12">
                  <div className="absolute left-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <Clock size={16} className="text-white" />
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border-2 border-red-200 dark:border-red-800">
                    <p className="font-semibold text-red-700 dark:text-red-400">Expiry Date</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preview */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-4">
                Notification Preview
              </h4>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell size={24} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Document Expiring Soon
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your passport will expire in 30 days
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {settings.reminders.custom.enabled
                        ? `At ${settings.reminders.custom.time}`
                        : 'At 09:00 AM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          {/* Templates */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => applyTemplate('conservative')}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Conservative
            </button>
            <button
              onClick={() => applyTemplate('standard')}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Standard
            </button>
            <button
              onClick={() => applyTemplate('minimal')}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Minimal
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-800 transition-colors font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </DesktopModal>
  );
};
