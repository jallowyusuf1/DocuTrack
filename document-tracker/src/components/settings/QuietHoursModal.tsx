import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';
import TimePickerModal from '../profile/TimePickerModal';

interface QuietHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  onSave: (quietHours: { enabled: boolean; start: string; end: string }) => void;
}

export default function QuietHoursModal({
  isOpen,
  onClose,
  quietHours,
  onSave,
}: QuietHoursModalProps) {
  const [localQuietHours, setLocalQuietHours] = useState(quietHours);
  const [isStartTimePickerOpen, setIsStartTimePickerOpen] = useState(false);
  const [isEndTimePickerOpen, setIsEndTimePickerOpen] = useState(false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleSave = () => {
    triggerHaptic('light');
    onSave(localQuietHours);
  };

  return (
    <>
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
              transition={getTransition(transitions.spring)}
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[80vh] overflow-y-auto"
              style={{
                background: 'rgba(42, 38, 64, 0.85)',
                backdropFilter: 'blur(25px)',
                WebkitBackdropFilter: 'blur(30px)',
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
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white">Quiet Hours</h2>
                  <p className="text-sm mt-1" style={{ color: '#A78BFA' }}>
                    No notifications during these hours
                  </p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    triggerHaptic('light');
                    onClose();
                  }}
                  className="p-2 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-6 py-6 space-y-6">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-base font-medium text-white">Enable Quiet Hours</div>
                    <div className="text-sm mt-1" style={{ color: '#A78BFA' }}>
                      Silence notifications during selected hours
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      triggerHaptic('light');
                      setLocalQuietHours({ ...localQuietHours, enabled: !localQuietHours.enabled });
                    }}
                    className="relative w-[52px] h-[32px] rounded-full transition-all duration-300"
                    style={{
                      background: localQuietHours.enabled
                        ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                        : 'rgba(107, 102, 126, 0.3)',
                      boxShadow: localQuietHours.enabled
                        ? '0 0 16px rgba(139, 92, 246, 0.6)'
                        : 'none',
                    }}
                  >
                    <motion.div
                      animate={{
                        x: localQuietHours.enabled ? 20 : 2,
                      }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-[2px] w-[28px] h-[28px] rounded-full bg-white shadow-lg"
                    />
                  </motion.button>
                </div>

                {/* Time Pickers */}
                {localQuietHours.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Start Time */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Start Time</label>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setIsStartTimePickerOpen(true);
                        }}
                        className="w-full h-[52px] px-4 rounded-xl flex items-center gap-3"
                        style={{
                          background: 'rgba(35, 29, 51, 0.6)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                        }}
                      >
                        <Clock className="w-5 h-5" style={{ color: '#A78BFA' }} />
                        <span className="flex-1 text-left">{formatTime(localQuietHours.start)}</span>
                      </motion.button>
                    </div>

                    {/* End Time */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">End Time</label>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setIsEndTimePickerOpen(true);
                        }}
                        className="w-full h-[52px] px-4 rounded-xl flex items-center gap-3"
                        style={{
                          background: 'rgba(35, 29, 51, 0.6)',
                          backdropFilter: 'blur(15px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#FFFFFF',
                        }}
                      >
                        <Clock className="w-5 h-5" style={{ color: '#A78BFA' }} />
                        <span className="flex-1 text-left">{formatTime(localQuietHours.end)}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 h-[52px] rounded-xl font-semibold transition-all"
                    style={{
                      background: 'rgba(42, 38, 64, 0.6)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFFFFF',
                    }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="flex-1 h-[52px] rounded-xl font-semibold transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
                      color: '#FFFFFF',
                    }}
                  >
                    Save
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Time Pickers */}
      {isStartTimePickerOpen && (
        <TimePickerModal
          isOpen={isStartTimePickerOpen}
          selectedTime={formatTime(localQuietHours.start)}
          onClose={() => setIsStartTimePickerOpen(false)}
          onSelect={(time) => {
            // Convert 12-hour format to 24-hour format
            const [timePart, ampm] = time.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;
            const time24 = `${hour24.toString().padStart(2, '0')}:${minutes}`;
            setLocalQuietHours({ ...localQuietHours, start: time24 });
            setIsStartTimePickerOpen(false);
          }}
        />
      )}

      {isEndTimePickerOpen && (
        <TimePickerModal
          isOpen={isEndTimePickerOpen}
          selectedTime={formatTime(localQuietHours.end)}
          onClose={() => setIsEndTimePickerOpen(false)}
          onSelect={(time) => {
            // Convert 12-hour format to 24-hour format
            const [timePart, ampm] = time.split(' ');
            const [hours, minutes] = timePart.split(':');
            let hour24 = parseInt(hours);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;
            const time24 = `${hour24.toString().padStart(2, '0')}:${minutes}`;
            setLocalQuietHours({ ...localQuietHours, end: time24 });
            setIsEndTimePickerOpen(false);
          }}
        />
      )}
    </>
  );
}





