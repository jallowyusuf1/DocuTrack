import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

interface TimePickerModalProps {
  isOpen: boolean;
  selectedTime: string;
  onClose: () => void;
  onSelect: (time: string) => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];
const PERIODS = ['AM', 'PM'];

export default function TimePickerModal({
  isOpen,
  selectedTime,
  onClose,
  onSelect,
}: TimePickerModalProps) {
  const parseTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
      return {
        hour: parseInt(match[1]),
        minute: match[2],
        period: match[3].toUpperCase(),
      };
    }
    return { hour: 9, minute: '00', period: 'AM' };
  };

  const initialTime = parseTime(selectedTime);
  const [hour, setHour] = useState(initialTime.hour);
  const [minute, setMinute] = useState(initialTime.minute);
  const [period, setPeriod] = useState(initialTime.period);

  const handleSave = () => {
    triggerHaptic('light');
    const timeString = `${hour}:${minute} ${period}`;
    onSelect(timeString);
  };

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
            transition={getTransition(transitions.spring)}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[80vh] overflow-y-auto"
            style={{
              background: 'rgba(26, 22, 37, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
              <h2 className="text-xl font-bold text-white">Select Time</h2>
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

            {/* Time Picker */}
            <div className="px-6 py-6">
              <div className="flex items-center justify-center gap-4 mb-6">
                {/* Hour */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white mb-2 text-center">
                    Hour
                  </label>
                  <div 
                    className="rounded-xl p-2 max-h-48 overflow-y-auto"
                    style={{
                      background: 'rgba(35, 29, 51, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {HOURS.map((h) => (
                      <motion.button
                        key={h}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          triggerHaptic('light');
                          setHour(h);
                        }}
                        className={`w-full py-2 rounded-lg text-center transition-all ${
                          hour === h
                            ? 'font-bold'
                            : 'hover:bg-white/5'
                        }`}
                        style={hour === h
                          ? {
                              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                              color: '#FFFFFF',
                              boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
                            }
                          : {
                              color: '#A78BFA',
                            }}
                      >
                        {h}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Minute */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white mb-2 text-center">
                    Minute
                  </label>
                  <div 
                    className="rounded-xl p-2 max-h-48 overflow-y-auto"
                    style={{
                      background: 'rgba(35, 29, 51, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {MINUTES.map((m) => (
                      <motion.button
                        key={m}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          triggerHaptic('light');
                          setMinute(m);
                        }}
                        className={`w-full py-2 rounded-lg text-center transition-all ${
                          minute === m
                            ? 'font-bold'
                            : 'hover:bg-white/5'
                        }`}
                        style={minute === m
                          ? {
                              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                              color: '#FFFFFF',
                              boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
                            }
                          : {
                              color: '#A78BFA',
                            }}
                      >
                        {m}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Period */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white mb-2 text-center">
                    Period
                  </label>
                  <div 
                    className="rounded-xl p-2"
                    style={{
                      background: 'rgba(35, 29, 51, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {PERIODS.map((p) => (
                      <motion.button
                        key={p}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          triggerHaptic('light');
                          setPeriod(p);
                        }}
                        className={`w-full py-2 rounded-lg text-center transition-all ${
                          period === p
                            ? 'font-bold'
                            : 'hover:bg-white/5'
                        }`}
                        style={period === p
                          ? {
                              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                              color: '#FFFFFF',
                              boxShadow: '0 0 15px rgba(139, 92, 246, 0.4)',
                            }
                          : {
                              color: '#A78BFA',
                            }}
                      >
                        {p}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Time Display */}
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-white">
                  {hour}:{minute} {period}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSave}
                >
                  Save
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
