import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { DocumentType, DocumentFormData } from '../../types';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/ui/Button';
import DatePickerModal from '../../components/ui/DatePickerModal';
import Toast from '../../components/ui/Toast';
import { triggerHaptic } from '../../utils/animations';
import { getDaysUntil } from '../../utils/dateUtils';

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'id_card', label: 'ID Card' },
  { value: 'insurance', label: 'Insurance Policy' },
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

export default function AddDocument() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(
    location.state?.imageFile || null
  );
  const [imagePreview, setImagePreview] = useState<string | null>(
    location.state?.imagePreview || null
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerField, setDatePickerField] = useState<'issue_date' | 'expiration_date' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
  const watchedIssueDate = watch('issue_date');
  const watchedExpirationDate = watch('expiration_date');

  // Auto-fill category when document type changes (only if category is empty)
  useEffect(() => {
    if (watchedDocumentType && !watch('category')) {
      setValue('category', watchedDocumentType);
    }
  }, [watchedDocumentType, setValue, watch]);

  // Track form changes
  useEffect(() => {
    const subscription = watch(() => setHasChanges(true));
    return () => subscription.unsubscribe();
  }, [watch]);

  // Handle back navigation with confirmation
  const handleBack = () => {
    if (hasChanges || selectedImage) {
      if (window.confirm('Discard changes? Your progress will be lost.')) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showToast('Image size must be less than 50MB', 'error');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setHasChanges(true);
    }
  };

  const openDatePicker = (field: 'issue_date' | 'expiration_date') => {
    triggerHaptic('light');
    setDatePickerField(field);
    setIsDatePickerOpen(true);
  };

  const handleDateSelect = (date: string) => {
    if (datePickerField) {
      setValue(datePickerField, date);
      trigger(datePickerField);
    }
    setIsDatePickerOpen(false);
    setDatePickerField(null);
  };

  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getExpirationDateColor = () => {
    if (!watchedExpirationDate) return 'border-black';
    const daysLeft = getDaysUntil(watchedExpirationDate);
    if (daysLeft < 0) return 'border-red-500';
    if (daysLeft <= 7) return 'border-red-500';
    if (daysLeft <= 14) return 'border-orange-500';
    if (daysLeft <= 30) return 'border-yellow-500';
    return 'border-green-500';
  };

  const onSubmit = async (data: DocumentFormData) => {
    if (!user?.id) {
      showToast('Please log in to add documents', 'error');
      return;
    }

    if (!selectedImage) {
      showToast('Please select an image', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const formData: DocumentFormData = {
        ...data,
        image: selectedImage,
        category: data.category || data.document_type,
      };

      await documentService.createDocument(formData, user.id);
      showToast('Document added successfully!', 'success');
      setTimeout(() => {
        navigate('/documents');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to create document:', error);
      const errorMessage = error.message || 'Failed to add document. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Scroll to first error
  const scrollToFirstError = () => {
    const firstError = document.querySelector('.border-red-500');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit, scrollToFirstError);

  return (
    <div className="min-h-screen pb-[140px] relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
            transform: 'translate(50%, 50%)',
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header 
          className="sticky top-0 z-10"
          style={{
            background: 'rgba(35, 29, 51, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex items-center gap-4 px-4 py-3 h-16">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                triggerHaptic('light');
                handleBack();
              }}
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(35, 29, 51, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </motion.button>
            <h1 className="text-xl font-bold text-white flex-1">Add Document</h1>
          </div>
        </header>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="px-4 py-6 space-y-5">
          {/* Image Preview */}
          <div className="space-y-3">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Document preview"
                  className="w-20 h-20 object-cover rounded-xl border-2"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    fileInputRef.current?.click();
                  }}
                  className="mt-2 text-sm font-medium"
                  style={{ color: '#A78BFA' }}
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  background: 'rgba(35, 29, 51, 0.3)',
                }}
              >
                <ImageIcon className="w-12 h-12 mb-2" style={{ color: '#A78BFA' }} />
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    fileInputRef.current?.click();
                  }}
                  className="text-sm font-medium"
                  style={{ color: '#A78BFA' }}
                >
                  Select Image
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={handleImageChange}
              className="hidden"
            />
            {!selectedImage && (
              <p className="text-sm text-red-400">Image is required</p>
            )}
          </div>

          {/* Document Type */}
          <Controller
            name="document_type"
            control={control}
            rules={{ required: 'Document type is required' }}
            render={({ field }) => (
              <Select
                label={
                  <>
                    Document Type <span className="text-red-400">*</span>
                  </>
                }
                options={DOCUMENT_TYPES}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.document_type?.message}
                className="h-[52px]"
              />
            )}
          />

          {/* Document Name */}
          <Input
            label={
              <>
                Document Name <span className="text-red-400">*</span>
              </>
            }
            placeholder="e.g., US Passport"
            maxLength={100}
            {...register('document_name', {
              required: 'Document name is required',
              maxLength: { value: 100, message: 'Document name must be less than 100 characters' },
            })}
            error={errors.document_name?.message}
            className="h-[52px]"
          />

          {/* Document Number */}
          <Input
            label="Document Number"
            placeholder="e.g., 123456789"
            maxLength={50}
            {...register('document_number', {
              maxLength: { value: 50, message: 'Document number must be less than 50 characters' },
            })}
            error={errors.document_number?.message}
            className="h-[52px]"
          />

          {/* Issue Date */}
          <div className="mt-1">
            <label className="block text-sm font-semibold text-white mb-3 mt-1">
              Issue Date
            </label>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => openDatePicker('issue_date')}
              className={`
                w-full h-[52px] px-4 rounded-xl
                flex items-center gap-3
                text-left transition-all
                ${errors.issue_date ? 'border-2 border-red-500' : 'border border-white/10'}
              `}
              style={{
                background: errors.issue_date
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(35, 29, 51, 0.6)',
                backdropFilter: 'blur(15px)',
                color: watchedIssueDate ? '#FFFFFF' : '#A78BFA',
              }}
            >
              <Calendar className="w-5 h-5" style={{ color: '#A78BFA' }} />
              <span>
                {watchedIssueDate ? formatDateDisplay(watchedIssueDate) : 'Select issue date'}
              </span>
            </motion.button>
            <input
              type="hidden"
              {...register('issue_date')}
            />
            {errors.issue_date && (
              <p className="mt-1 text-sm text-red-400">{errors.issue_date.message}</p>
            )}
          </div>

          {/* Expiration Date */}
          <div className="mt-1">
            <label className="block text-sm font-semibold text-white mb-3 mt-1">
              Expiration Date <span className="text-red-400">*</span>
            </label>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => openDatePicker('expiration_date')}
              className={`
                w-full h-[52px] px-4 rounded-xl
                flex items-center gap-3
                text-left transition-all
                ${errors.expiration_date 
                  ? 'border-2 border-red-500' 
                  : watchedExpirationDate 
                  ? getExpirationDateColor() 
                  : 'border border-white/10'
                }
              `}
              style={{
                background: errors.expiration_date
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(35, 29, 51, 0.6)',
                backdropFilter: 'blur(15px)',
                color: watchedExpirationDate ? '#FFFFFF' : '#A78BFA',
              }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: '#A78BFA' }} />
              <span>
                {watchedExpirationDate ? formatDateDisplay(watchedExpirationDate) : 'Select expiration date'}
              </span>
            </motion.button>
            <input
              type="hidden"
              {...register('expiration_date', {
                required: 'Expiration date is required',
                validate: (value) => {
                  if (!value) return true;
                  const expirationDate = new Date(value);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (expirationDate <= today) {
                    return 'Expiration date must be in the future';
                  }
                  return true;
                },
              })}
            />
            {errors.expiration_date && (
              <p className="mt-1 text-sm text-red-400">{errors.expiration_date.message}</p>
            )}
          </div>

          {/* Category */}
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select
                label="Category"
                options={DOCUMENT_TYPES.map(type => ({
                  value: type.value,
                  label: type.label,
                }))}
                value={field.value || watchedDocumentType || 'passport'}
                onChange={field.onChange}
                onBlur={field.onBlur}
                name={field.name}
                error={errors.category?.message}
                className="h-[52px]"
              />
            )}
          />

          {/* Notes */}
          <div>
            <Textarea
              label="Notes"
              placeholder="Add any additional notes..."
              maxLength={500}
              {...register('notes', {
                maxLength: { value: 500, message: 'Notes must be less than 500 characters' },
              })}
              error={errors.notes?.message}
              className="min-h-[80px]"
            />
            <p className="mt-1 text-xs text-right" style={{ color: '#A78BFA' }}>
              {watch('notes')?.length || 0}/500
            </p>
          </div>
        </form>

        {/* Fixed Save Button */}
        <div 
          className="fixed bottom-[88px] left-0 right-0 px-4 py-4 safe-area-bottom z-20"
          style={{
            background: 'rgba(26, 22, 37, 0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <Button
            type="submit"
            variant="primary"
            fullWidth
            onClick={handleFormSubmit}
            disabled={isSaving || !selectedImage}
            className="h-[52px] text-base font-semibold"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                Saving...
              </>
            ) : (
              'Save Document'
            )}
          </Button>
        </div>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => {
          setIsDatePickerOpen(false);
          setDatePickerField(null);
        }}
        onSelect={handleDateSelect}
        selectedDate={
          datePickerField === 'issue_date'
            ? watchedIssueDate
            : datePickerField === 'expiration_date'
            ? watchedExpirationDate
            : undefined
        }
        minDate={
          datePickerField === 'issue_date'
            ? '2010-01-01'
            : datePickerField === 'expiration_date'
            ? new Date().toISOString().split('T')[0]
            : undefined
        }
        maxDate={
          datePickerField === 'expiration_date'
            ? '2040-12-31'
            : undefined
        }
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
  );
}
