import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Calendar, AlertCircle, Check, X, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import type { DocumentType, DocumentFormData } from '../../../types';
import DatePickerModal from '../../ui/DatePickerModal';
import { getDaysUntil } from '../../../utils/dateUtils';
import { compressImage, needsCompression, formatFileSize } from '../../../utils/imageCompression';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'bill', label: 'Bill' },
  { value: 'contract', label: 'Contract' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'license_plate', label: 'License Plate' },
  { value: 'registration', label: 'Registration' },
  { value: 'membership', label: 'Membership' },
  { value: 'certification', label: 'Certification' },
  { value: 'food', label: 'Food Item' },
  { value: 'other', label: 'Other' },
];

interface FormScreenProps {
  imageFile: File;
  onSubmit: (data: DocumentFormData) => Promise<void>;
  onBack: () => void;
  isDesktop?: boolean;
}

export default function FormScreen({ imageFile, onSubmit, onBack, isDesktop = false }: FormScreenProps) {
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [enableReminders, setEnableReminders] = useState(true);
  const [reminderDays, setReminderDays] = useState<number[]>([30, 7, 1]);
  const [customReminderValue, setCustomReminderValue] = useState('');
  const [customReminderUnit, setCustomReminderUnit] = useState<'days' | 'weeks' | 'months'>('days');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<DocumentFormData>({
    defaultValues: {
      document_type: 'passport',
      category: 'passport',
    },
  });

  const watchedDocumentType = watch('document_type');
  const watchedDocumentName = watch('document_name');
  const watchedIssueDate = watch('issue_date');
  const watchedExpirationDate = watch('expiration_date');
  const watchedNotes = watch('notes');

  // Calculate days remaining
  const daysRemaining = watchedExpirationDate
    ? getDaysUntil(watchedExpirationDate)
    : null;

  const getDaysColor = (days: number | null) => {
    if (days === null) return '#6B7280';
    if (days < 0) return '#EF4444';
    if (days < 7) return '#EF4444';
    if (days < 30) return '#F59E0B';
    return '#10B981';
  };

  // Auto-save draft (desktop only, every 30s)
  useEffect(() => {
    if (isDesktop && hasChanges) {
      autoSaveIntervalRef.current = setInterval(() => {
        const formData = watch();
        // Save to localStorage
        localStorage.setItem('documentDraft', JSON.stringify({
          ...formData,
          imageFileName: imageFile.name,
          timestamp: Date.now(),
        }));
      }, 30000); // 30 seconds
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isDesktop, hasChanges, watch, imageFile.name]);

  // Track form changes
  useEffect(() => {
    const subscription = watch(() => setHasChanges(true));
    return () => subscription.unsubscribe();
  }, [watch]);

  // Handle custom reminder
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

  // Format date display
  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Submit handler
  const onFormSubmit = async (data: DocumentFormData) => {
    setIsSubmitting(true);
    setIsCompressing(true);

    try {
      // Compress image if needed (max 2MB)
      let fileToUpload = imageFile;
      if (needsCompression(imageFile, 2)) {
        const originalSize = formatFileSize(imageFile.size);
        fileToUpload = await compressImage(imageFile, 1920, 1920, 0.85);
        const newSize = formatFileSize(fileToUpload.size);
        console.log(`Image compressed: ${originalSize} → ${newSize}`);
      }

      const formData: DocumentFormData = {
        ...data,
        image: fileToUpload,
        category: data.category || data.document_type,
      };

      // Store reminder days in a custom property (will be handled by notifications service)
      (formData as any).reminder_days = enableReminders ? reminderDays : undefined;

      await onSubmit(formData);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
      setIsCompressing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#2d1b4e] to-[#1a1625] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(42, 38, 64, 0.6)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
        <h2 className="text-lg font-semibold text-white">Document Details</h2>
        <div className="w-10" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Document Name */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Document Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              {...register('document_name', {
                required: 'Document name is required',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
              placeholder="e.g., US Passport"
              className={`w-full h-12 px-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all ${
                errors.document_name ? 'border-red-500' : 'border-white/10 focus:border-purple-500/50'
              } focus:outline-none`}
            />
            {errors.document_name && (
              <p className="text-red-400 text-sm mt-1">{errors.document_name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Category <span className="text-red-400">*</span>
            </label>
            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <select
                  {...field}
                  className={`w-full h-12 px-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all ${
                    errors.category ? 'border-red-500' : 'border-white/10 focus:border-purple-500/50'
                  } focus:outline-none`}
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.category && (
              <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          {/* Document Number */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Document Number
            </label>
            <input
              type="text"
              {...register('document_number', {
                maxLength: { value: 50, message: 'Max 50 characters' },
              })}
              placeholder="Optional"
              className="w-full h-12 px-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border border-white/10 focus:border-purple-500/50 focus:outline-none"
            />
            {errors.document_number && (
              <p className="text-red-400 text-sm mt-1">{errors.document_number.message}</p>
            )}
          </div>

          {/* Issue Date */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Issue Date
            </label>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowIssueDatePicker(true)}
              className={`w-full h-12 px-4 rounded-xl flex items-center justify-between text-left bg-[rgba(35,29,51,0.6)] border transition-all ${
                errors.issueDate ? 'border-red-500' : 'border-white/10 hover:border-purple-500/30'
              }`}
            >
              <span className={watchedIssueDate ? 'text-white' : 'text-white/40'}>
                {watchedIssueDate ? formatDateDisplay(watchedIssueDate) : 'Select date'}
              </span>
              <Calendar className="w-5 h-5 text-purple-400" />
            </motion.button>
            <input
              type="hidden"
              {...register('issue_date')}
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Expiry Date <span className="text-red-400">*</span>
            </label>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowExpiryDatePicker(true)}
              className={`w-full h-12 px-4 rounded-xl flex items-center justify-between text-left bg-[rgba(35,29,51,0.6)] border transition-all ${
                errors.expiration_date
                  ? 'border-red-500'
                  : watchedExpirationDate
                  ? `border-2`
                  : 'border-white/10 hover:border-purple-500/30'
              }`}
              style={{
                borderColor: errors.expiration_date
                  ? '#EF4444'
                  : watchedExpirationDate && daysRemaining !== null
                  ? getDaysColor(daysRemaining)
                  : undefined,
              }}
            >
              <span className={watchedExpirationDate ? 'text-white' : 'text-white/40'}>
                {watchedExpirationDate ? formatDateDisplay(watchedExpirationDate) : 'Select date'}
              </span>
              <AlertCircle className="w-5 h-5 text-purple-400" />
            </motion.button>
            <input
              type="hidden"
              {...register('expiration_date', {
                required: 'Expiry date is required',
                validate: (value) => {
                  if (!value) return true;
                  const expiry = new Date(value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (expiry <= today) {
                    return 'Expiry date must be in the future';
                  }
                  return true;
                },
              })}
            />
            {errors.expiration_date && (
              <p className="text-red-400 text-sm mt-1">{errors.expiration_date.message}</p>
            )}

            {/* Days Remaining */}
            {daysRemaining !== null && (
              <div className="mt-2 p-3 rounded-xl bg-white/5">
                <p className="text-xs text-white/60 mb-1">Days Remaining</p>
                <p className="text-xl font-bold" style={{ color: getDaysColor(daysRemaining) }}>
                  {daysRemaining < 0 ? 'Expired' : `${daysRemaining} days`}
                </p>
              </div>
            )}
          </div>

          {/* Reminders */}
          <div>
            <label className="flex items-center justify-between p-3 rounded-xl bg-[rgba(35,29,51,0.6)] cursor-pointer mb-3">
              <span className="text-white font-medium">Enable Reminders</span>
              <input
                type="checkbox"
                checked={enableReminders}
                onChange={(e) => setEnableReminders(e.target.checked)}
                className="w-12 h-6 rounded-full"
              />
            </label>

            {enableReminders && (
              <div className="space-y-2 pl-4">
                {[30, 7, 1].map((days) => (
                  <label key={days} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderDays.includes(days)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReminderDays([...reminderDays, days].sort((a, b) => b - a));
                        } else {
                          setReminderDays(reminderDays.filter(d => d !== days));
                        }
                      }}
                      className="w-5 h-5 rounded border-white/20"
                    />
                    <span className="text-white">{days} days before</span>
                  </label>
                ))}

                {/* Custom Reminder */}
                <div className="flex gap-2 mt-3">
                  <input
                    type="number"
                    value={customReminderValue}
                    onChange={(e) => setCustomReminderValue(e.target.value)}
                    placeholder="Custom"
                    className="flex-1 h-10 px-3 rounded-lg text-white bg-[rgba(35,29,51,0.6)] border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  />
                  <select
                    value={customReminderUnit}
                    onChange={(e) => setCustomReminderUnit(e.target.value as 'days' | 'weeks' | 'months')}
                    className="h-10 px-3 rounded-lg text-white bg-[rgba(35,29,51,0.6)] border border-white/10 focus:border-purple-500/50 focus:outline-none"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddCustomReminder}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Custom Reminders List */}
                {reminderDays.filter(d => ![30, 7, 1].includes(d)).length > 0 && (
                  <div className="mt-2 space-y-1">
                    {reminderDays
                      .filter(d => ![30, 7, 1].includes(d))
                      .map((days) => (
                        <div key={days} className="flex items-center justify-between">
                          <span className="text-white text-sm">{days} days before</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveReminder(days)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Notes
            </label>
            <textarea
              {...register('notes', {
                maxLength: { value: 500, message: 'Max 500 characters' },
              })}
              placeholder="Add any additional notes..."
              maxLength={500}
              className="w-full h-32 p-4 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border border-white/10 focus:border-purple-500/50 focus:outline-none resize-none"
            />
            <p className="text-xs text-white/40 mt-1 text-right">
              {(watchedNotes?.length || 0)}/500
            </p>
            {errors.notes && (
              <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-4 border-t border-white/10">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting || isCompressing}
            className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
            }}
          >
            {isSubmitting || isCompressing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isCompressing ? 'Compressing...' : 'Saving...'}
              </>
            ) : (
              'Save Document'
            )}
          </motion.button>
        </div>
      </form>

      {/* Date Pickers */}
      <DatePickerModal
        isOpen={showIssueDatePicker}
        onClose={() => setShowIssueDatePicker(false)}
        onSelect={(date) => {
          setValue('issue_date', date);
          trigger('issue_date');
          setShowIssueDatePicker(false);
        }}
        selectedDate={watchedIssueDate}
        title="Select Issue Date"
      />

      <DatePickerModal
        isOpen={showExpiryDatePicker}
        onClose={() => setShowExpiryDatePicker(false)}
        onSelect={(date) => {
          setValue('expiration_date', date);
          trigger('expiration_date');
          setShowExpiryDatePicker(false);
        }}
        selectedDate={watchedExpirationDate}
        title="Select Expiry Date"
        minDate={new Date().toISOString().split('T')[0]}
      />
    </div>
  );
}
