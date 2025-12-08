import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import type { Document } from '../../types';
import Button from '../ui/Button';
import DatePickerModal from '../ui/DatePickerModal';
import { getTransition, transitions } from '../../utils/animations';

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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[70vh] overflow-y-auto"
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

            {/* Content */}
            <div className="px-6 pb-6">
              <h2 className="text-xl font-bold text-white mb-2">Mark as Renewed</h2>
              <p className="text-sm text-glass-secondary mb-6">Set new expiration date</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    New Expiration Date <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(true)}
                    className={`
                      w-full h-[52px] px-4 rounded-xl
                      flex items-center gap-3
                      text-left transition-all
                      ${errors.newExpirationDate 
                        ? 'border-2 border-red-500' 
                        : 'border border-white/10'
                      }
                    `}
                    style={{
                      background: errors.newExpirationDate
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(35, 29, 51, 0.6)',
                      backdropFilter: 'blur(15px)',
                      color: watchedDate ? '#FFFFFF' : '#A78BFA',
                    }}
                  >
                    <span>
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
                    <p className="mt-1 text-sm text-red-400">{errors.newExpirationDate.message}</p>
                  )}
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
