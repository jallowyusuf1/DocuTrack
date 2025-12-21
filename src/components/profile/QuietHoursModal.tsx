import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateNotificationPreferences } from '../../services/notifications';
import { useToast } from '../../hooks/useToast';
import { triggerHaptic } from '../../utils/animations';
import Button from '../ui/Button';

interface QuietHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStart?: string;
  currentEnd?: string;
}

export default function QuietHoursModal({
  isOpen,
  onClose,
  currentStart = '22:00',
  currentEnd = '08:00',
}: QuietHoursModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [startTime, setStartTime] = useState(currentStart);
  const [endTime, setEndTime] = useState(currentEnd);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStartTime(currentStart);
      setEndTime(currentEnd);
    }
  }, [isOpen, currentStart, currentEnd]);

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    triggerHaptic('medium');

    try {
      await updateNotificationPreferences(user.id, {
        quiet_hours_start: startTime,
        quiet_hours_end: endTime,
      });
      showToast('Quiet hours updated', 'success');
      onClose();
    } catch (error) {
      console.error('Failed to save quiet hours:', error);
      showToast('Failed to save quiet hours', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const display = formatTime(time);
        options.push({ value: time, display });
      }
    }
    return options;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const timeOptions = generateTimeOptions();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] max-h-[80vh] overflow-hidden"
            style={{
              background: 'rgba(42, 38, 64, 0.85)',
              backdropFilter: 'blur(25px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div
                className="w-10 h-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6" style={{ color: '#A78BFA' }} />
                  <h2 className="text-xl font-bold text-white">Quiet Hours</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  className="p-2 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
              <p className="text-sm mt-2" style={{ color: '#A78BFA' }}>
                No notifications during these hours
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">Start Time</label>
                <div className="relative">
                  <select
                    value={startTime}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setStartTime(e.target.value);
                    }}
                    className="w-full h-14 px-4 rounded-2xl text-white appearance-none cursor-pointer transition-all"
                    style={{
                      background: 'rgba(35, 29, 51, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {timeOptions.map((option) => (
                      <option key={option.value} value={option.value} style={{ background: '#231D33' }}>
                        {option.display}
                      </option>
                    ))}
                  </select>
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#A78BFA' }} />
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">End Time</label>
                <div className="relative">
                  <select
                    value={endTime}
                    onChange={(e) => {
                      triggerHaptic('light');
                      setEndTime(e.target.value);
                    }}
                    className="w-full h-14 px-4 rounded-2xl text-white appearance-none cursor-pointer transition-all"
                    style={{
                      background: 'rgba(35, 29, 51, 0.6)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {timeOptions.map((option) => (
                      <option key={option.value} value={option.value} style={{ background: '#231D33' }}>
                        {option.display}
                      </option>
                    ))}
                  </select>
                  <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#A78BFA' }} />
                </div>
              </div>

              {/* Save Button */}
              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                style={{
                  background: isSaving
                    ? 'rgba(139, 92, 246, 0.5)'
                    : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.5)',
                }}
                whileHover={!isSaving ? { scale: 1.02 } : {}}
                whileTap={!isSaving ? { scale: 0.98 } : {}}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
