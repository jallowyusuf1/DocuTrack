import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { documentFieldsService } from '../../services/documentFields';
import { useToast } from '../../hooks/useToast';
import type { DocumentType, DocumentFormData } from '../../types';
import { DynamicDocumentForm } from '../../components/documents/DynamicDocumentForm';
import { DocumentTypeSelector } from '../../components/documents/DocumentTypeSelector';
import { validateAllFields } from '../../utils/fieldValidation';
import { documentTypesService } from '../../services/documentTypes';
import Toast from '../../components/ui/Toast';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
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
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Use hook to get signed URL for document image
  const { signedUrl: documentImageUrl, loading: imageUrlLoading } = useImageUrl(document?.image_url);
  
  // Use local preview if new image selected, otherwise use signed URL
  const imagePreview = selectedImage ? localImagePreview : documentImageUrl;

  // Load document and field values
  useEffect(() => {
    const fetchDocument = async () => {
      if (!id || !user?.id) return;
      
      setLoading(true);
      try {
        const doc = await documentService.getDocumentById(id, user.id);
        if (doc) {
          setDocument(doc);
          setDocumentType(doc.document_type);
          
          // Load field values
          try {
            const fieldVals = await documentFieldsService.getDocumentFields(id);
            // Merge with legacy fields for backward compatibility
            const mergedValues: Record<string, any> = {
              ...fieldVals,
              document_name: doc.document_name,
              document_number: doc.document_number,
              issue_date: doc.issue_date,
              expiry_date: doc.expiration_date,
              expiration_date: doc.expiration_date,
              notes: doc.notes,
            };
            setFieldValues(mergedValues);
          } catch (fieldError) {
            console.warn('Failed to load field values, using legacy fields:', fieldError);
            // Fallback to legacy fields
            setFieldValues({
              document_name: doc.document_name,
              document_number: doc.document_number,
              issue_date: doc.issue_date,
              expiry_date: doc.expiration_date,
              expiration_date: doc.expiration_date,
              notes: doc.notes,
            });
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch document:', err);
        showToast('Failed to load document. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id, user, showToast]);

  // Track form changes
  useEffect(() => {
    setHasChanges(true);
  }, [documentType, fieldValues, selectedImage]);

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


  // Handle form submission
  const handleSubmit = async () => {
    if (!user?.id || !id) {
      showToast('Please log in to edit documents', 'error');
      return;
    }

    // Get template to validate required fields
    const template = await documentTypesService.getTemplateByType(documentType);
    if (!template) {
      setErrors({ document_type: 'Invalid document type' });
      return;
    }

    // Validate all required fields
    const requiredFields = template.fields
      .filter(f => f.is_required)
      .map(f => f.field_definition);

    const validationErrors = validateAllFields(requiredFields, fieldValues);
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      return;
    }

    setIsSaving(true);
    try {
      // Extract key fields for document record
      const documentName = fieldValues.document_name || 
                          fieldValues.full_name || 
                          (fieldValues.given_names && fieldValues.surname
                            ? `${fieldValues.given_names} ${fieldValues.surname}`
                            : document?.document_name || 'Document');

      const expirationDate = fieldValues.expiry_date || fieldValues.expiration_date;
      if (!expirationDate) {
        setErrors({ expiry_date: 'Expiry date is required' });
        setIsSaving(false);
        return;
      }

      const updateData: any = {
        document_type: documentType,
        document_name: documentName,
        document_number: fieldValues.document_number || fieldValues.passport_number || fieldValues.license_number || null,
        issue_date: fieldValues.issue_date || null,
        expiration_date: expirationDate,
        category: template.category || documentType,
        notes: fieldValues.notes || null,
        fieldValues, // Include all field values
      };

      // Only include image if a new one was selected
      if (selectedImage) {
        updateData.image = selectedImage;
      }

      // Start the update
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
              color: '#60A5FA',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(37, 99, 235, 0.2)';
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
      <div className="px-4 py-6 space-y-5">
        {/* Image Preview */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white mb-3 mt-1">
            Document Image
          </label>
          {imagePreview || imageUrlLoading ? (
            <div className="relative">
              {imageUrlLoading && !selectedImage ? (
                <div className="w-full h-48 rounded-2xl bg-gray-800 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
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
                style={{ color: '#60A5FA' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C4B5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#60A5FA';
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
              <ImageIcon className="w-12 h-12 mb-2" style={{ color: '#60A5FA' }} />
              <motion.button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm font-medium transition-colors"
                style={{ color: '#60A5FA' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#C4B5FD';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#60A5FA';
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

        {/* Document Type Selector */}
        <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <DocumentTypeSelector
            value={documentType}
            onChange={(type) => {
              setDocumentType(type);
              setFieldValues({});
              setErrors({});
            }}
            error={errors.document_type}
            disabled={isSaving}
          />
        </div>

        {/* Dynamic Form */}
        <DynamicDocumentForm
          documentType={documentType}
          values={fieldValues}
          onChange={(values) => {
            setFieldValues(values);
            setErrors({});
          }}
          errors={errors}
          disabled={isSaving}
        />
      </div>

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
          type="button"
          variant="primary"
          fullWidth
          onClick={handleSubmit}
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

