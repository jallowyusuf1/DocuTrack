import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Calendar, Bell, Link2, Repeat, Check, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { dateService } from '../../services/dateService';
import { useToast } from '../../hooks/useToast';
import type { DateFormData } from '../../types';
import GlassModal from '../ui/glass/GlassModal';
import GlassTile from '../ui/glass/GlassTile';
import GlassInput from '../ui/glass/GlassInput';
import GlassButton from '../ui/glass/GlassButton';
import { prefersReducedMotion } from '../../utils/animations';
import DatePickerModal from '../ui/DatePickerModal';

const CATEGORIES = [
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💑' },
  { value: 'appointment', label: 'Appointment', emoji: '🗓️' },
  { value: 'deadline', label: 'Deadline', emoji: '⏰' },
  { value: 'holiday', label: 'Holiday', emoji: '🎉' },
  { value: 'meeting', label: 'Meeting', emoji: '👥' },
  { value: 'custom', label: 'Custom', emoji: '✏️' },
];

const PRIORITY_OPTIONS = [
  { value: 'high', label: 'High', emoji: '🔴', color: 'rgba(239, 68, 68, 0.3)' },
  { value: 'medium', label: 'Medium', emoji: '🟠', color: 'rgba(249, 115, 22, 0.3)' },
  { value: 'low', label: 'Low', emoji: '🟢', color: 'rgba(16, 185, 129, 0.3)' },
];

interface AddImportantDateModalGlassProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: string;
}

export default function AddImportantDateModalGlass({
  isOpen,
  onClose,
  onSuccess,
  initialDate,
}: AddImportantDateModalGlassProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [linkDocumentEnabled, setLinkDocumentEnabled] = useState(false);
  const [repeatAnnually, setRepeatAnnually] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const reduced = prefersReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DateFormData & { priority?: string }>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      category: 'appointment',
      reminder_days: 7,
      priority: 'medium',
    },
  });

  const watchedDate = watch('date');

  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        date: initialDate || '',
        category: 'appointment',
        reminder_days: 7,
        priority: 'medium',
      });
      setRemindersEnabled(true);
      setLinkDocumentEnabled(false);
      setRepeatAnnually(false);
      setSelectedPriority('medium');
    }
  }, [isOpen, reset, initialDate]);

  const handleDateSelect = (date: string) => {
    setValue('date', date);
    setIsDatePickerOpen(false);
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getDateDifference = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diff = differenceInDays(date, today);
      if (diff > 0) return `In ${diff} days`;
      if (diff < 0) return `${Math.abs(diff)} days ago`;
      return 'Today';
    } catch {
      return null;
    }
  };

  const onSubmit = async (data: any) => {
    if (!user?.id) {
      showToast('Please log in to add dates', 'error');
      return;
    }

    if (!data.title || !data.title.trim()) {
      showToast('Please enter a title for this important date', 'error');
      return;
    }

    if (!data.date) {
      showToast('Please select a date', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await dateService.createDate({
        ...data,
        title: data.title.trim(),
        user_id: user.id,
      } as any);
      showToast('Important date added successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create date:', error);
      showToast(error.message || 'Failed to add date. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <GlassModal
        isOpen={isOpen}
        onClose={onClose}
        title="Add Important Date"
        subtitle="Set a reminder for any important date"
        size="medium"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tile 1 - Date Information */}
          <GlassTile>
            <div className="space-y-4">
              <GlassInput
                label="Date Name"
                placeholder="e.g., Mom's Birthday, Visa Interview"
                maxLength={100}
                required
                icon={<Calendar className="w-5 h-5" />}
                {...register('title', {
                  required: 'Title is required',
                  maxLength: { value: 100, message: 'Title must be less than 100 characters' },
                })}
                error={errors.title?.message}
              />

              <div>
                <label className="block mb-2 text-sm font-medium text-white">
                  Date <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(true)}
                  className="w-full rounded-xl px-4 py-3.5 text-base text-left flex items-center gap-3 transition-all"
                  style={{
                    background: 'rgba(40, 40, 40, 0.6)',
                    backdropFilter: 'blur(30px)',
                    WebkitBackdropFilter: 'blur(30px)',
                    border: errors.date
                      ? '1px solid rgba(239, 68, 68, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    color: watchedDate ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="flex-1">
                    {watchedDate ? formatDateDisplay(watchedDate) : 'Select date'}
                  </span>
                  {watchedDate && (
                    <span className="text-sm text-white/60">
                      {getDateDifference(watchedDate)}
                    </span>
                  )}
                </button>
                <input
                  type="hidden"
                  {...register('date', { required: 'Date is required' })}
                />
                {errors.date && (
                  <p className="mt-2 text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-white">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setValue('category', cat.value)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        watch('category') === cat.value
                          ? 'text-white'
                          : 'text-white/70 hover:text-white'
                      }`}
                      style={{
                        background:
                          watch('category') === cat.value
                            ? 'rgba(59, 130, 246, 0.3)'
                            : 'rgba(255, 255, 255, 0.05)',
                        border:
                          watch('category') === cat.value
                            ? '1px solid rgba(59, 130, 246, 0.5)'
                            : '1px solid transparent',
                      }}
                    >
                      <span className="mr-2">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <GlassInput
                label="Description (Optional)"
                placeholder="Add notes about this date..."
                maxLength={500}
                {...register('description', {
                  maxLength: { value: 500, message: 'Description must be less than 500 characters' },
                })}
                error={errors.description?.message}
              />
            </div>
          </GlassTile>

          {/* Tile 2 - Link to Document */}
          <GlassTile>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-white/70" />
                <span className="font-medium text-white">Link to Document (Optional)</span>
              </div>
              <button
                type="button"
                onClick={() => setLinkDocumentEnabled(!linkDocumentEnabled)}
                className={`w-12 h-6 rounded-full transition-all ${
                  linkDocumentEnabled ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    linkDocumentEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {linkDocumentEnabled && (
              <motion.div
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={reduced ? undefined : { opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full rounded-xl px-4 py-3 text-base"
                  style={{
                    background: 'rgba(40, 40, 40, 0.6)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                  }}
                />
                <p className="text-sm text-white/60">
                  Select documents to link to this date
                </p>
              </motion.div>
            )}
          </GlassTile>

          {/* Tile 3 - Reminder Settings */}
          <GlassTile>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white/70" />
                <span className="font-medium text-white">Set Reminders</span>
              </div>
              <button
                type="button"
                onClick={() => setRemindersEnabled(!remindersEnabled)}
                className={`w-12 h-6 rounded-full transition-all ${
                  remindersEnabled ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    remindersEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {remindersEnabled && (
              <motion.div
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={reduced ? undefined : { opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="space-y-2">
                  {[
                    { label: '30 days before', value: 30 },
                    { label: '7 days before', value: 7 },
                    { label: '1 day before', value: 1 },
                    { label: 'On the day (9:00 AM)', value: 0 },
                  ].map((reminder) => (
                    <label
                      key={reminder.value}
                      className="flex items-center gap-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={reminder.value === 7}
                        className="w-5 h-5 rounded"
                        style={{
                          accentColor: '#3B82F6',
                        }}
                      />
                      <span className="text-white/80">{reminder.label}</span>
                    </label>
                  ))}
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-sm text-white/60 mb-2">Notification Methods:</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded" style={{ accentColor: '#3B82F6' }} />
                      <span className="text-white/80">In-app notification</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded" style={{ accentColor: '#3B82F6' }} />
                      <span className="text-white/80">Push notification</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded" style={{ accentColor: '#3B82F6' }} />
                      <span className="text-white/80">Email</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 rounded" style={{ accentColor: '#3B82F6' }} />
                      <span className="text-white/80">SMS</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </GlassTile>

          {/* Tile 4 - Repeat */}
          <GlassTile>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-white/70" />
                <span className="font-medium text-white">Repeat Annually</span>
              </div>
              <button
                type="button"
                onClick={() => setRepeatAnnually(!repeatAnnually)}
                className={`w-12 h-6 rounded-full transition-all ${
                  repeatAnnually ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    repeatAnnually ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {repeatAnnually && (
              <motion.p
                initial={reduced ? false : { opacity: 0 }}
                animate={reduced ? undefined : { opacity: 1 }}
                className="mt-3 text-sm text-white/60"
              >
                This will create a recurring reminder every year
              </motion.p>
            )}
          </GlassTile>

          {/* Tile 5 - Priority */}
          <GlassTile>
            <label className="block mb-3 text-sm font-medium text-white">Priority</label>
            <div className="flex gap-3">
              {PRIORITY_OPTIONS.map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => {
                    setSelectedPriority(priority.value);
                    setValue('priority', priority.value);
                  }}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedPriority === priority.value
                      ? 'text-white'
                      : 'text-white/70'
                  }`}
                  style={{
                    background:
                      selectedPriority === priority.value
                        ? priority.color
                        : 'rgba(255, 255, 255, 0.05)',
                    border:
                      selectedPriority === priority.value
                        ? '1px solid rgba(255, 255, 255, 0.3)'
                        : '1px solid transparent',
                  }}
                >
                  <span className="mr-2">{priority.emoji}</span>
                  {priority.label}
                </button>
              ))}
            </div>
          </GlassTile>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4">
            <GlassButton
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={isSaving}
              icon={isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : undefined}
            >
              {isSaving ? 'Saving...' : 'Save Important Date'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleDateSelect}
        selectedDate={watchedDate}
        minDate="2010-01-01"
        maxDate="2040-12-31"
      />
    </>
  );
}




