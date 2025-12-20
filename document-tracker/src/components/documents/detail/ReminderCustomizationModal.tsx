import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Bell, Check } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../config/supabase';
import { useToast } from '../../../hooks/useToast';

interface ReminderCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

export default function ReminderCustomizationModal({
  isOpen,
  onClose,
  documentId,
}: ReminderCustomizationModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reminderDays, setReminderDays] = useState<number[]>([30, 7, 1]);
  const [customReminderValue, setCustomReminderValue] = useState('');
  const [customReminderUnit, setCustomReminderUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchReminderSettings();
    }
  }, [isOpen, user?.id, documentId]);

  const fetchReminderSettings = async () => {
    // TODO: Fetch document-specific reminder settings from database
    // For now, use default values
    setReminderDays([30, 7, 1]);
  };

  const handleToggleReminder = (days: number) => {
    if (reminderDays.includes(days)) {
      setReminderDays(reminderDays.filter(d => d !== days));
    } else {
      setReminderDays([...reminderDays, days].sort((a, b) => b - a));
    }
  };

  const handleAddCustomReminder = () => {
    if (!customReminderValue) return;

    const value = parseInt(customReminderValue);
    if (isNaN(value) || value <= 0) return;

    let days = value;
    if (customReminderUnit === 'weeks') {
      days = value * 7;
    } else if (customReminderUnit === 'months') {
      days = value * 30;
    }

    if (!reminderDays.includes(days)) {
      setReminderDays([...reminderDays, days].sort((a, b) => b - a));
      setCustomReminderValue('');
    }
  };

  const handleRemoveReminder = (days: number) => {
    setReminderDays(reminderDays.filter(d => d !== days));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      // TODO: Save reminder settings to database
      // This would update the document's reminder preferences
      showToast('Reminder settings saved', 'success');
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to save reminder settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[rgba(42,38,64,0.95)] rounded-2xl p-6 max-w-md w-full border border-white/10"
        style={{
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Customize Reminders</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="text-white/60 text-sm">
            Choose when you want to be reminded before this document expires.
          </p>

          {/* Standard Reminders */}
          <div className="space-y-2">
            {[30, 14, 7, 1].map((days) => (
              <label
                key={days}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="text-white">{days} days before</span>
                <input
                  type="checkbox"
                  checked={reminderDays.includes(days)}
                  onChange={() => handleToggleReminder(days)}
                  className="w-5 h-5 rounded border-white/20"
                />
              </label>
            ))}
          </div>

          {/* Custom Reminder */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-sm font-medium text-white mb-3">Custom Reminder</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={customReminderValue}
                onChange={(e) => setCustomReminderValue(e.target.value)}
                placeholder="Number"
                className="flex-1 h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-purple-500"
              />
              <select
                value={customReminderUnit}
                onChange={(e) => setCustomReminderUnit(e.target.value as 'days' | 'weeks' | 'months')}
                className="h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
              <button
                onClick={handleAddCustomReminder}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Custom Reminders List */}
          {reminderDays.filter(d => ![30, 14, 7, 1].includes(d)).length > 0 && (
            <div className="pt-4 border-t border-white/10">
              <p className="text-sm font-medium text-white mb-3">Custom Reminders</p>
              <div className="space-y-2">
                {reminderDays
                  .filter(d => ![30, 14, 7, 1].includes(d))
                  .map((days) => (
                    <div
                      key={days}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                    >
                      <span className="text-white">{days} days before</span>
                      <button
                        onClick={() => handleRemoveReminder(days)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || reminderDays.length === 0}
            className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
