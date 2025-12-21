import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import Skeleton from '../../components/ui/Skeleton';
import { useImageUrl } from '../../hooks/useImageUrl';
import { motion } from 'framer-motion';

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

export default function EditDocument() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [datePickerField, setDatePickerField] = useState<'issue_date' | 'expiration_date' | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Use hook to get signed URL for document image
  const { signedUrl: documentImageUrl, loading: imageUrlLoading } = useImageUrl(document?.image_url);
  
  // Use local preview if new image selected, otherwise use signed URL
  const imagePreview = selectedImage ? localImagePreview : documentImageUrl;

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
      document_type: 'passport',
      category: 'passport',
    },
  });

  const watchedDocumentType = watch('document_type');
  const watchedIssueDate = watch('issue_date');
  const watchedExpirationDate = watch('expiration_date');

  // Load document
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id || !user?.id) return;
      
      setLoading(true);
      try {
        const doc = await documentService.getDocumentById(id, user.id);
        if (doc) {
          setDocument(doc);
          reset({
            document_type: doc.document_type,
            document_name: doc.document_name,
            document_number: doc.document_number || '',
            issue_date: doc.issue_date || '',
            expiration_date: doc.expiration_date,
            category: doc.category,
            notes: doc.notes || '',
          });
        }
      } catch (err: any) {
        console.error('Failed to fetch document:', err);
        showToast('Failed to load document. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, user, reset, showToast]);

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
      if (file.size > 50 * 1024 * 1024) {
        showToast('Image size must be less than 50MB', 'error');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalImagePreview(reader.result as string);
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
  const onSubmit = async (data: any) => {
    if (!user?.id || !id) {
      showToast('Please log in to edit documents', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updateData: any = {
        document_type: data.document_type,
        document_name: data.document_name,
        document_number: data.document_number || null,
        issue_date: data.issue_date || null,
        expiration_date: data.expiration_date,
        category: data.category || data.document_type,
        notes: data.notes || null,
      };

      // Only include image if a new one was selected
      if (selectedImage) {
        updateData.image = selectedImage;
      }

      // Start the update (this will compress and upload image, then update DB)
      const startTime = Date.now();
      await documentService.updateDocument(id, user.id, updateData);
      const elapsed = Date.now() - startTime;
      
      // If it took less than 500ms, wait a bit to show the success state
      if (elapsed < 500) {
        await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
      }
      
      showToast('Document updated successfully!', 'success');
      
      // Navigate back after a short delay to show toast
      setTimeout(() => {
        navigate(`/documents/${id}`, { replace: true });
      }, 800);
    } catch (error: any) {
      console.error('Failed to update document:', error);
      const errorMessage = error.message || 'Failed to update document. Please try again.';
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

  if (loading) {
    return (
      <div className="min-h-screen pb-[140px] relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
      }}>
        <div className="px-4 py-6 space-y-6">
          <Skeleton className="w-full h-48 rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen pb-[140px] flex items-center justify-center px-4" style={{
        background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
      }}>
        <div className="text-center">
          <p className="text-white mb-4">Document not found</p>
          <Button variant="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-[140px] relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)',
    }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 border-b border-white/10 h-[70px] flex items-center"
        style={{
          background: 'rgba(35, 29, 51, 0.6)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-4 px-4 w-full">
          <motion.button
            onClick={handleBack}
            className="p-2 rounded-lg transition-colors"
            style={{
              color: '#A78BFA',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          <h1 className="text-xl font-bold text-white flex-1">Edit Document</h1>
        </div>
      </motion.header>

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="px-4 py-6 space-y-5">
        {/* Image Preview */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white mb-3 mt-1">
            Document Image
          </label>
          {imagePreview || imageUrlLoading ? (
            <div className="relative">
              {imageUrlLoading && !selectedImage ? (
                <div className="w-full h-48 rounded-2xl bg-gray-800 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <img
                  src={imagePreview || undefined}
                  alt="Document preview"
                  className="w-full h-48 object-cover rounded-2xl border border-white/15"
                  style={{
                    background: 'rgba(42, 38, 64, 0.6)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              )}
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-sm font-medium transition-colors"
                style={{ color: '#A78BFA' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C4B5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A78BFA';
                }}
                whileTap={{ scale: 0.95 }}
              >
                Change Image
              </motion.button>
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                background: 'rgba(42, 38, 64, 0.3)',
              }}
            >
              <ImageIcon className="w-12 h-12 mb-2" style={{ color: '#A78BFA' }} />
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium transition-colors"
                style={{ color: '#A78BFA' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C4B5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#A78BFA';
                }}
                whileTap={{ scale: 0.95 }}
              >
                Select Image
              </motion.button>
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
          <label className="block text-sm font-semibold text-white mb-3 mt-1">
            Issue Date
          </label>
          <motion.button
            type="button"
            onClick={() => openDatePicker('issue_date')}
            className={`
              w-full h-[52px] px-4 rounded-xl border
              flex items-center gap-3
              text-left text-[15px]
              ${errors.issue_date ? 'border-red-500' : 'border-white/10'}
              focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
            `}
            style={{
              background: 'rgba(35, 29, 51, 0.6)',
              backdropFilter: 'blur(15px)',
              color: watchedIssueDate ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
            }}
            whileTap={{ scale: 0.98 }}
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
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {errors.issue_date.message}
            </p>
          )}
        </div>

        {/* Expiration Date */}
        <div>
          <label className="block text-sm font-semibold text-white mb-3 mt-1">
            Expiration Date <span className="text-red-400">*</span>
          </label>
          <motion.button
            type="button"
            onClick={() => openDatePicker('expiration_date')}
            className={`
              w-full h-[52px] px-4 rounded-xl border
              flex items-center gap-3
              text-left text-[15px]
              ${errors.expiration_date ? 'border-red-500' : 'border-white/10'}
              focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500
            `}
            style={{
              background: 'rgba(35, 29, 51, 0.6)',
              backdropFilter: 'blur(15px)',
              color: watchedExpirationDate ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
            }}
            whileTap={{ scale: 0.98 }}
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
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {errors.expiration_date.message}
            </p>
          )}
        </div>

        {/* Category (Auto-filled, disabled) */}
        <Input
          label="Category"
          value={watchedDocumentType || ''}
          disabled
          className="h-[52px]"
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
        className="fixed bottom-[88px] left-0 right-0 px-4 py-4 safe-area-bottom"
        style={{
          background: 'rgba(35, 29, 51, 0.8)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Button
          type="submit"
          variant="primary"
          fullWidth
          onClick={handleFormSubmit}
          disabled={isSaving}
          className="h-[52px] text-base font-semibold"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 inline animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
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

