import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import type { Document } from '../../types';
import Button from '../ui/Button';
import DatePickerModal from '../ui/DatePickerModal';

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onConfirm: (documentId: string, newExpirationDate: string) => Promise<void>;
}

interface RenewForm {
  newExpirationDate: string;
}

export default function RenewalModal({
  isOpen,
  onClose,
  document,
  onConfirm,
}: RenewalModalProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RenewForm>();

  const watchedDate = watch('newExpirationDate');

  useEffect(() => {
    if (isOpen && document) {
      // Set default new expiration date to 1 year from current expiration
      const currentExpiry = new Date(document.expiration_date);
      currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
      reset({
        newExpirationDate: format(currentExpiry, 'yyyy-MM-dd'),
      });
      setError(null);
    }
  }, [isOpen, document, reset]);

  const handleDateSelect = (date: string) => {
    setValue('newExpirationDate', date);
    setIsDatePickerOpen(false);
  };

  const onSubmit = async (data: RenewForm) => {
    if (!document) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      await onConfirm(document.id, data.newExpirationDate);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50">
      <div
        className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mark as Renewed</h2>
          <p className="text-gray-600 mb-6">Set new expiration date for "{document?.document_name}"</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Expiration Date <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className={`
                  w-full h-[52px] px-4 rounded-lg border-2
                  flex items-center gap-3
                  text-left
                  ${errors.newExpirationDate ? 'border-red-500' : 'border-black'}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                `}
              >
                <span className={watchedDate ? 'text-gray-900' : 'text-gray-400'}>
                  {watchedDate ? format(new Date(watchedDate), 'MMM dd, yyyy') : 'Select new expiration date'}
                </span>
              </button>
              <input
                type="hidden"
                {...register('newExpirationDate', {
                  required: 'New expiration date is required',
                  validate: (value) => {
                    if (document && new Date(value) <= new Date(document.expiration_date)) {
                      return 'New expiration date must be after the current one.';
                    }
                    return true;
                  },
                })}
              />
              {errors.newExpirationDate && (
                <p className="mt-1 text-sm text-red-600">{errors.newExpirationDate.message}</p>
              )}
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

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
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleDateSelect}
        selectedDate={watchedDate}
        minDate={document ? new Date(document.expiration_date).toISOString().split('T')[0] : undefined}
        maxDate="2040-12-31"
      />
    </div>
  );
}

