import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useToast } from '../../hooks/useToast';
import type { DocumentType, DocumentFormData } from '../../types';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import DatePickerModal from '../ui/DatePickerModal';
import Toast from '../ui/Toast';

const QUICK_ADD_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'license_plate', label: 'License Plate' },
  { value: 'registration', label: 'Registration' },
  { value: 'membership', label: 'Membership' },
  { value: 'food', label: 'Food Item' },
  { value: 'warranty', label: 'Warranty' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'certification', label: 'Certification' },
  { value: 'other', label: 'Other' },
];

// Smart defaults for different document types
const getSmartDefaults = (type: DocumentType) => {
  const today = new Date();
  const defaults: Partial<DocumentFormData> = {
    document_type: type,
    category: type,
  };

  switch (type) {
    case 'license_plate':
      return {
        ...defaults,
        document_name: 'Vehicle License Plate',
        document_number: '',
      };
    case 'registration':
      return {
        ...defaults,
        document_name: 'Vehicle Registration',
        document_number: '',
      };
    case 'membership':
      return {
        ...defaults,
        document_name: 'Membership',
        document_number: '',
      };
    case 'food':
      return {
        ...defaults,
        document_name: 'Food Item',
        // Food typically expires soon, so set expiration to 7 days from now
        expiration_date: format(new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      };
    case 'warranty':
      return {
        ...defaults,
        document_name: 'Product Warranty',
      };
    case 'subscription':
      return {
        ...defaults,
        document_name: 'Subscription Service',
      };
    case 'certification':
      return {
        ...defaults,
        document_name: 'Professional Certification',
      };
    default:
      return defaults;
  }
};

// Get field configuration for different document types
const getFieldConfig = (type: DocumentType) => {
  switch (type) {
    case 'food':
      return {
        showNumberField: false,
        showIssueDate: true,
        issueDateLabel: 'Purchase Date',
        numberFieldLabel: '',
        numberFieldPlaceholder: '',
      };
    case 'license_plate':
      return {
        showNumberField: true,
        showIssueDate: false,
        issueDateLabel: 'Issue Date',
        numberFieldLabel: 'Plate Number',
        numberFieldPlaceholder: 'e.g., ABC-1234',
      };
    case 'registration':
      return {
        showNumberField: true,
        showIssueDate: false,
        issueDateLabel: 'Issue Date',
        numberFieldLabel: 'Registration Number',
        numberFieldPlaceholder: 'e.g., REG-123456',
      };
    case 'membership':
      return {
        showNumberField: true,
        showIssueDate: false,
        issueDateLabel: 'Issue Date',
        numberFieldLabel: 'Membership ID',
        numberFieldPlaceholder: 'e.g., MEM-12345',
      };
    case 'warranty':
      return {
        showNumberField: true,
        showIssueDate: true,
        issueDateLabel: 'Purchase Date',
        numberFieldLabel: 'Serial Number',
        numberFieldPlaceholder: 'e.g., SN-123456789',
      };
    case 'subscription':
      return {
        showNumberField: true,
        showIssueDate: false,
        issueDateLabel: 'Issue Date',
        numberFieldLabel: 'Account Number',
        numberFieldPlaceholder: 'e.g., ACC-12345',
      };
    case 'certification':
      return {
        showNumberField: true,
        showIssueDate: false,
        issueDateLabel: 'Issue Date',
        numberFieldLabel: 'Certification Number',
        numberFieldPlaceholder: 'e.g., CERT-12345',
      };
    default:
      return {
        showNumberField: true,
        showIssueDate: false,
        issueDateLabel: 'Issue Date',
        numberFieldLabel: 'Number/ID',
        numberFieldPlaceholder: 'e.g., ID number',
      };
  }
};

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickAddModal({ isOpen, onClose, onSuccess }: QuickAddModalProps) {
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerField, setDatePickerField] = useState<'issue_date' | 'expiration_date' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<DocumentFormData & { image?: File }>({
    defaultValues: {
      document_type: 'license_plate',
      category: 'license_plate',
    },
  });

  const watchedDocumentType = watch('document_type');
  const watchedExpirationDate = watch('expiration_date');
  const watchedIssueDate = watch('issue_date');
  const fieldConfig = getFieldConfig(watchedDocumentType);

  // Apply smart defaults when document type changes
  useEffect(() => {
    if (watchedDocumentType) {
      const defaults = getSmartDefaults(watchedDocumentType);
      Object.entries(defaults).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof DocumentFormData, value as any);
        }
      });
    }
  }, [watchedDocumentType, setValue]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset({
        document_type: 'license_plate',
        category: 'license_plate',
      });
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [isOpen, reset]);

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
    }
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

  const onSubmit = async (data: any) => {
    if (!user?.id) {
      showToast('Please log in to add items', 'error');
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
      showToast('Item added successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to create document:', error);
      const errorMessage = error.message || 'Failed to add item. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-end bg-black bg-opacity-50">
      <div
        className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto relative z-[91]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Expiring Item</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-4">
          {/* Document Type */}
          <div className="relative z-10">
            <Select
              label={
                <>
                  Item Type <span className="text-red-500">*</span>
                </>
              }
              options={QUICK_ADD_TYPES}
              {...register('document_type', { required: 'Item type is required' })}
              error={errors.document_type?.message}
              className="h-[52px]"
            />
          </div>

          {/* Image Preview */}
          <div className="space-y-2 relative z-0">
            <label className="block text-sm font-medium text-gray-700">
              Image <span className="text-red-500">*</span>
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-sm text-blue-600 font-medium block w-full text-left"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6">
                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
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
          </div>

          {/* Document Name */}
          <Input
            label={
              <>
                Name <span className="text-red-500">*</span>
              </>
            }
            placeholder="e.g., ABC-1234 or Product Name"
            maxLength={100}
            {...register('document_name', {
              required: 'Name is required',
              maxLength: { value: 100, message: 'Name must be less than 100 characters' },
            })}
            error={errors.document_name?.message}
            className="h-[52px]"
          />

          {/* Conditional Number Field */}
          {fieldConfig.showNumberField && (
            <Input
              label={`${fieldConfig.numberFieldLabel} (Optional)`}
              placeholder={fieldConfig.numberFieldPlaceholder}
              maxLength={50}
              {...register('document_number', {
                maxLength: { value: 50, message: 'Must be less than 50 characters' },
              })}
              error={errors.document_number?.message}
              className="h-[52px]"
            />
          )}

          {/* Conditional Issue/Purchase Date */}
          {fieldConfig.showIssueDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {fieldConfig.issueDateLabel} (Optional)
              </label>
              <button
                type="button"
                onClick={() => {
                  setDatePickerField('issue_date');
                  setIsDatePickerOpen(true);
                }}
                className={`
                  w-full h-[52px] px-4 rounded-lg border-2
                  flex items-center gap-3
                  text-left
                  ${errors.issue_date ? 'border-red-500' : 'border-black'}
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                `}
              >
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <span className={watchedIssueDate ? 'text-gray-900' : 'text-gray-400'}>
                  {watchedIssueDate ? formatDateDisplay(watchedIssueDate) : `Select ${fieldConfig.issueDateLabel.toLowerCase()}`}
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
          )}

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setDatePickerField('expiration_date');
                setIsDatePickerOpen(true);
              }}
              className={`
                w-full h-[52px] px-4 rounded-lg border-2
                flex items-center gap-3
                text-left
                ${errors.expiration_date ? 'border-red-500' : 'border-black'}
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              `}
            >
              <AlertCircle className="w-5 h-5 text-gray-400" />
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

          {/* Notes (optional) */}
          <Textarea
            label="Notes (Optional)"
            placeholder="Add any additional notes..."
            maxLength={500}
            {...register('notes', {
              maxLength: { value: 500, message: 'Notes must be less than 500 characters' },
            })}
            error={errors.notes?.message}
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
              disabled={isSaving || !selectedImage}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Item'
              )}
            </Button>
          </div>
        </form>

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
    </div>
  );
}

