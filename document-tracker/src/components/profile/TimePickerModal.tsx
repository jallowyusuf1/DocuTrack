import { useState } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

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
  // Parse selected time
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
    const timeString = `${hour}:${minute} ${period}`;
    onSelect(timeString);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50">
      <div
        className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Select Time</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Time Picker */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            {/* Hour */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Hour
              </label>
              <div className="bg-gray-50 rounded-lg p-2 max-h-48 overflow-y-auto">
                {HOURS.map((h) => (
                  <button
                    key={h}
                    onClick={() => setHour(h)}
                    className={`w-full py-2 rounded text-center transition-colors ${
                      hour === h
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Minute
              </label>
              <div className="bg-gray-50 rounded-lg p-2 max-h-48 overflow-y-auto">
                {MINUTES.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMinute(m)}
                    className={`w-full py-2 rounded text-center transition-colors ${
                      minute === m
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Period */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Period
              </label>
              <div className="bg-gray-50 rounded-lg p-2">
                {PERIODS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`w-full py-2 rounded text-center transition-colors ${
                      period === p
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Time Display */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900">
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
      </div>
    </div>
  );
}

