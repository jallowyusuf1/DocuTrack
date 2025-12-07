import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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

  // Auto-fill category when document type changes
  useEffect(() => {
    if (watchedDocumentType) {
      setValue('category', watchedDocumentType);
    }
  }, [watchedDocumentType, setValue]);

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
      if (file.size > 10 * 1024 * 1024) {
        showToast('Image size must be less than 10MB', 'error');
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

  // Handle date picker
  const handleDateSelect = (date: string) => {
    if (datePickerField) {
      setValue(datePickerField, date);
      trigger(datePickerField);
      setHasChanges(true);
    }
    setIsDatePickerOpen(false);
    setDatePickerField(null);
  };

  const openDatePicker = (field: 'issue_date' | 'expiration_date') => {
    // Prevent rapid clicking
    if (isDatePickerOpen) return;
    setDatePickerField(field);
    setIsDatePickerOpen(true);
  };

  // Format date for display
  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Get urgency color for expiration date
  const getExpirationDateColor = () => {
    if (!watchedExpirationDate) return '';
    const expirationDate = new Date(watchedExpirationDate);
    const today = new Date();
    const daysUntil = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 7) return 'text-red-600 border-red-500';
    if (daysUntil <= 14) return 'text-orange-600 border-orange-500';
    if (daysUntil <= 30) return 'text-yellow-600 border-yellow-500';
    return '';
  };

  // Handle form submission
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
      
      // Navigate back after a short delay to show toast
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
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
    <div className="min-h-screen bg-gray-50 pb-[140px]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4 px-4 py-3 h-16">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1">Add Document</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="px-4 py-6 space-y-6">
        {/* Image Preview */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Document Image <span className="text-red-500">*</span>
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Document preview"
                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-sm text-blue-600 font-medium"
              >
                Change Image
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 font-medium"
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
            <p className="text-sm text-red-600">Image is required</p>
          )}
        </div>

        {/* Document Type */}
        <Select
          label={
            <>
              Document Type <span className="text-red-500">*</span>
            </>
          }
          options={DOCUMENT_TYPES}
          {...register('document_type', { required: 'Document type is required' })}
          error={errors.document_type?.message}
          className="h-[52px]"
        />

        {/* Document Name */}
        <Input
          label={
            <>
              Document Name <span className="text-red-500">*</span>
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issue Date
          </label>
          <button
            type="button"
            onClick={() => openDatePicker('issue_date')}
            className={`
              w-full h-[52px] px-4 rounded-lg border-2
              flex items-center gap-3
              text-left
              ${errors.issue_date ? 'border-red-500' : 'border-black'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
          >
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className={watchedIssueDate ? 'text-gray-900' : 'text-gray-400'}>
              {watchedIssueDate ? formatDateDisplay(watchedIssueDate) : 'Select issue date'}
            </span>
          </button>
          <input
            type="hidden"
            {...register('issue_date')}
          />
          {errors.issue_date && (
            <p className="mt-1 text-sm text-red-600">{errors.issue_date.message}</p>
          )}
        </div>

        {/* Expiration Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => openDatePicker('expiration_date')}
            className={`
              w-full h-[52px] px-4 rounded-lg border-2
              flex items-center gap-3
              text-left
              ${errors.expiration_date ? 'border-red-500' : watchedExpirationDate ? getExpirationDateColor() : 'border-black'}
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            `}
          >
            <AlertCircle className={`w-5 h-5 ${watchedExpirationDate ? getExpirationDateColor().split(' ')[0] : 'text-gray-400'}`} />
            <span className={watchedExpirationDate ? 'text-gray-900' : 'text-gray-400'}>
              {watchedExpirationDate ? formatDateDisplay(watchedExpirationDate) : 'Select expiration date'}
            </span>
          </button>
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
            <p className="mt-1 text-sm text-red-600">{errors.expiration_date.message}</p>
          )}
        </div>

        {/* Category (Auto-filled, disabled) */}
        <Input
          label="Category"
          value={watchedDocumentType || ''}
          disabled
          className="h-[52px] bg-gray-50"
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
          <p className="mt-1 text-xs text-gray-500 text-right">
            {watch('notes')?.length || 0}/500
          </p>
        </div>
      </form>

      {/* Fixed Save Button */}
      <div className="fixed bottom-[88px] left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 safe-area-bottom">
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

