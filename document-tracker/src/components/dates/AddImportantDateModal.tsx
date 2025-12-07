import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
      // Add user_id to the date data (cast to any since DateFormData doesn't include user_id)
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50">
      <div
        className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Important Date</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
          {/* Title */}
          <Input
            label={
              <>
                Title <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(true)}
              className={`
                w-full h-[52px] px-4 rounded-lg border-2
                flex items-center gap-3
                text-left
                ${errors.date ? 'border-red-500' : 'border-black'}
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              `}
            >
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className={watchedDate ? 'text-gray-900' : 'text-gray-400'}>
                {watchedDate ? formatDateDisplay(watchedDate) : 'Select date'}
              </span>
            </button>
            <input
              type="hidden"
              {...register('date', {
                required: 'Date is required',
              })}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          {/* Category */}
          <Select
            label={
              <>
                Category <span className="text-red-500">*</span>
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
      </div>
    </div>
  );
}

