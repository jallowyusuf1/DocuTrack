import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { dateService } from '../../services/dateService';
import { useToast } from '../../hooks/useToast';
import type { DateFormData } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import DatePickerModal from '../ui/DatePickerModal';
import Toast from '../ui/Toast';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

const CATEGORIES = [
  'Personal',
  'Work',
  'Medical',
  'Legal',
  'Financial',
  'Travel',
  'Education',
  'Other',
];

interface AddImportantDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddImportantDateModal({
  isOpen,
  onClose,
  onSuccess,
}: AddImportantDateModalProps) {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<DateFormData>({
    defaultValues: {
      title: '',
      description: '',
      date: '',
      category: 'Personal',
      reminder_days: 7,
    },
  });

  const watchedDate = watch('date');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        date: '',
        category: 'Personal',
        reminder_days: 7,
      });
    }
  }, [isOpen, reset]);

  const handleDateSelect = (date: string) => {
    triggerHaptic('light');
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

  const onSubmit = async (data: DateFormData) => {
    if (!user?.id) {
      showToast('Please log in to add dates', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await dateService.createDate({
        ...data,
        user_id: user.id,
      } as any);
      showToast('Important date added successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create date:', error);
      const errorMessage = error.message || 'Failed to add date. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[90vh] overflow-y-auto"
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
              <h2 className="text-xl font-bold text-white">Add Important Date</h2>
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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
              {/* Title */}
              <Input
                label={
                  <>
                    Title <span className="text-red-400">*</span>
                  </>
                }
                placeholder="e.g., Doctor Appointment, Meeting"
                maxLength={100}
                {...register('title', {
                  required: 'Title is required',
                  maxLength: { value: 100, message: 'Title must be less than 100 characters' },
                })}
                error={errors.title?.message}
                className="h-[52px]"
              />

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Date <span className="text-red-400">*</span>
                </label>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsDatePickerOpen(true);
                  }}
                  className={`
                    w-full h-[52px] px-4 rounded-xl
                    flex items-center gap-3
                    text-left transition-all
                    ${errors.date ? 'border-2 border-red-500' : 'border border-white/10'}
                  `}
                  style={{
                    background: errors.date
                      ? 'rgba(239, 68, 68, 0.1)'
                      : 'rgba(35, 29, 51, 0.6)',
                    backdropFilter: 'blur(15px)',
                    color: watchedDate ? '#FFFFFF' : '#A78BFA',
                  }}
                >
                  <Calendar className="w-5 h-5" style={{ color: '#A78BFA' }} />
                  <span>
                    {watchedDate ? formatDateDisplay(watchedDate) : 'Select date'}
                  </span>
                </motion.button>
                <input
                  type="hidden"
                  {...register('date', {
                    required: 'Date is required',
                  })}
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
                )}
              </div>

              {/* Category */}
              <Select
                label={
                  <>
                    Category <span className="text-red-400">*</span>
                  </>
                }
                options={CATEGORIES.map((category) => ({
                  value: category,
                  label: category,
                }))}
                {...register('category', { required: 'Category is required' })}
                error={errors.category?.message}
                className="h-[52px]"
              />

              {/* Reminder Days */}
              <Input
                label="Remind me (days before)"
                type="number"
                placeholder="e.g., 7"
                min={0}
                max={365}
                {...register('reminder_days', {
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be 0 or greater' },
                  max: { value: 365, message: 'Must be 365 or less' },
                })}
                error={errors.reminder_days?.message}
                className="h-[52px]"
              />

              {/* Description */}
              <Textarea
                label="Description (Optional)"
                placeholder="Add any additional notes..."
                maxLength={500}
                {...register('description', {
                  maxLength: { value: 500, message: 'Description must be less than 500 characters' },
                })}
                error={errors.description?.message}
                className="min-h-[80px]"
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Add Date'
                  )}
                </Button>
              </div>
            </form>

            {/* Date Picker Modal */}
            <DatePickerModal
              isOpen={isDatePickerOpen}
              onClose={() => setIsDatePickerOpen(false)}
              onSelect={handleDateSelect}
              selectedDate={watchedDate}
              minDate="2010-01-01"
              maxDate="2040-12-31"
            />

            {/* Toast Notifications */}
            {toasts.map((toast) => (
              <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
