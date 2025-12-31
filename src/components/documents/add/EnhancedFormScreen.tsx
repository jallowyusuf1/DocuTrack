import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import type { DocumentType, DocumentFormData } from '../../../types';
import { DynamicDocumentForm } from '../DynamicDocumentForm';
import { DocumentTypeSelector } from '../DocumentTypeSelector';
import { compressImage, needsCompression, formatFileSize } from '../../../utils/imageCompression';
import { validateAllFields } from '../../../utils/fieldValidation';
import { documentTypesService } from '../../../services/documentTypes';

interface EnhancedFormScreenProps {
  imageFile: File;
  onSubmit: (data: DocumentFormData & { fieldValues?: Record<string, any> }) => Promise<void>;
  onBack: () => void;
  isDesktop?: boolean;
}

export default function EnhancedFormScreen({ 
  imageFile, 
  onSubmit, 
  onBack, 
  isDesktop = false 
}: EnhancedFormScreenProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('passport');
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save draft (desktop only, every 30s)
  useEffect(() => {
    if (isDesktop && hasChanges) {
      autoSaveIntervalRef.current = setInterval(() => {
        localStorage.setItem('documentDraft', JSON.stringify({
          documentType,
          fieldValues,
          imageFileName: imageFile.name,
          timestamp: Date.now(),
        }));
      }, 30000);
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [isDesktop, hasChanges, documentType, fieldValues, imageFile.name]);

  // Track form changes
  useEffect(() => {
    setHasChanges(true);
  }, [documentType, fieldValues]);

  // Handle form submission
  const handleSubmit = async () => {
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

    // Extract key fields for document record
    const documentName = fieldValues.document_name || 
                        fieldValues.full_name || 
                        fieldValues.given_names && fieldValues.surname
                          ? `${fieldValues.given_names} ${fieldValues.surname}`
                          : `${template.name} - ${new Date().toLocaleDateString()}`;

    const expirationDate = fieldValues.expiry_date || fieldValues.expiration_date;
    if (!expirationDate) {
      setErrors({ expiry_date: 'Expiry date is required' });
      return;
    }

    setIsSubmitting(true);
    setIsCompressing(true);

    try {
      // Compress image if needed
      let fileToUpload = imageFile;
      if (needsCompression(imageFile, 2)) {
        const originalSize = formatFileSize(imageFile.size);
        fileToUpload = await compressImage(imageFile, 1920, 1920, 0.85);
        const newSize = formatFileSize(fileToUpload.size);
        console.log(`Image compressed: ${originalSize} → ${newSize}`);
      }

      // Prepare form data
      const formData: DocumentFormData & { fieldValues?: Record<string, any> } = {
        document_type: documentType,
        document_name: documentName,
        document_number: fieldValues.document_number || fieldValues.passport_number || fieldValues.license_number || undefined,
        issue_date: fieldValues.issue_date || undefined,
        expiration_date: expirationDate,
        category: template.category || documentType,
        notes: fieldValues.notes || undefined,
        image: fileToUpload,
        fieldValues, // Include all field values
      };

      await onSubmit(formData);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setErrors({ submit: error.message || 'Failed to save document' });
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
          disabled={isSubmitting}
          className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
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

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Document Type Selector */}
          <div className="bg-[rgba(26,22,37,0.6)] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <DocumentTypeSelector
              value={documentType}
              onChange={(type) => {
                setDocumentType(type);
                // Clear field values when type changes
                setFieldValues({});
                setErrors({});
              }}
              error={errors.document_type}
            />
          </div>

          {/* Dynamic Form */}
          <DynamicDocumentForm
            documentType={documentType}
            values={fieldValues}
            onChange={(values) => {
              setFieldValues(values);
              // Clear errors when values change
              setErrors({});
            }}
            errors={errors}
            disabled={isSubmitting}
          />

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          type="button"
          onClick={handleSubmit}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting || isCompressing}
          className="w-full py-4 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #2563EB, #1E40AF)',
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
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
    </div>
  );
}




