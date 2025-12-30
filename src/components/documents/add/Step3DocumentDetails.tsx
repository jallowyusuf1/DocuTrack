import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { triggerHaptic, prefersReducedMotion } from '../../../utils/animations';
import { GlassButton } from '../../ui/glass/Glass';
import { extractTextFromImage } from '../../../utils/ocr';
import { useToast } from '../../../hooks/useToast';
import type { DocumentFormData, DocumentType } from '../../../types';
import { DynamicDocumentForm } from '../DynamicDocumentForm';
import { validateAllFields } from '../../../utils/fieldValidation';
import { documentTypesService } from '../../../services/documentTypes';

interface Step3DocumentDetailsProps {
  documentType: DocumentType;
  documentTypeLabel: string;
  imageFile: File;
  onContinue: (data: Partial<DocumentFormData>) => void;
  onBack: () => void;
}

export default function Step3DocumentDetails({
  documentType,
  documentTypeLabel,
  imageFile,
  onContinue,
  onBack,
}: Step3DocumentDetailsProps) {
  const reduced = prefersReducedMotion();
  const { showToast } = useToast();
  const [isExtractingOCR, setIsExtractingOCR] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-extract fields using OCR when component mounts
  useEffect(() => {
    const extractOCR = async () => {
      setIsExtractingOCR(true);
      try {
        const result = await extractTextFromImage(imageFile);
        
        // Auto-fill fields if found
        if (result.fields) {
          const updates: Record<string, any> = {};
          
          if (result.fields.documentNumber && !fieldValues.document_number) {
            updates.document_number = result.fields.documentNumber;
          }
          if (result.fields.expirationDate && !fieldValues.expiry_date && !fieldValues.expiration_date) {
            updates.expiry_date = result.fields.expirationDate;
            updates.expiration_date = result.fields.expirationDate;
          }
          if (result.fields.issueDate && !fieldValues.issue_date) {
            updates.issue_date = result.fields.issueDate;
          }
          if (result.fields.name && !fieldValues.document_name && !fieldValues.full_name) {
            updates.document_name = result.fields.name;
            updates.full_name = result.fields.name;
          }
          
          if (Object.keys(updates).length > 0) {
            setFieldValues(prev => ({ ...prev, ...updates }));
            showToast(`Extracted ${Object.keys(updates).length} field${Object.keys(updates).length > 1 ? 's' : ''} from document!`, 'success');
          }
        }
      } catch (error: any) {
        console.warn('OCR extraction failed:', error);
        // Don't show error toast - OCR is optional
      } finally {
        setIsExtractingOCR(false);
      }
    };

    extractOCR();
  }, [imageFile, showToast]);

  // Get icon based on document type
  const getDocumentIcon = () => {
    const icons: Record<string, string> = {
      passport: '📘',
      visa: '✈️',
      id_card: '🪪',
      license_plate: '🚗',
      insurance: '🏥',
      certification: '🎓',
      registration: '📋',
      other: '📄',
    };
    return icons[documentType] || '📄';
  };

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
      triggerHaptic('error');
      return;
    }

    // Extract key fields for document record
    const documentName = fieldValues.document_name || 
                        fieldValues.full_name || 
                        (fieldValues.given_names && fieldValues.surname
                          ? `${fieldValues.given_names} ${fieldValues.surname}`
                          : `${documentTypeLabel} - ${new Date().toLocaleDateString()}`);

    const expirationDate = fieldValues.expiry_date || fieldValues.expiration_date;
    if (!expirationDate) {
      setErrors({ expiry_date: 'Expiry date is required' });
      triggerHaptic('error');
      return;
    }

    // Prepare form data
    const data: Partial<DocumentFormData> = {
      document_type: documentType,
      document_name: documentName,
      document_number: fieldValues.document_number || fieldValues.passport_number || fieldValues.license_number || undefined,
      issue_date: fieldValues.issue_date || undefined,
      expiration_date: expirationDate,
      category: template.category || documentType,
      notes: fieldValues.notes || undefined,
    };

    // Include fieldValues in the data
    (data as any).fieldValues = fieldValues;

    triggerHaptic('light');
    onContinue(data);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
      {/* Header */}
      <div className="relative z-10 px-4 pt-4 pb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => {
              triggerHaptic('light');
              onBack();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-white/90 hover:text-white transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-xl">Add Document</h1>
            <p className="text-white/70 text-sm mt-0.5">Step 3 of 4</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="flex-1 h-1 rounded-full"
              style={{
                background: step === 3 ? 'rgba(139, 92, 246, 0.8)' : step < 3 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.15)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-24">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <div
            className="rounded-3xl p-6 md:p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.05) 55%, rgba(139,92,246,0.10) 100%)',
              border: '1px solid rgba(255,255,255,0.14)',
              backdropFilter: 'blur(34px) saturate(180%)',
              WebkitBackdropFilter: 'blur(34px) saturate(180%)',
              boxShadow: '0 26px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getDocumentIcon()}</span>
                <h2 className="text-white font-semibold text-xl">{documentTypeLabel} Details</h2>
              </div>
              {isExtractingOCR && (
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting text...</span>
                </div>
              )}
            </div>

            {/* Dynamic Form */}
            <div className="space-y-6">
              <DynamicDocumentForm
                documentType={documentType}
                values={fieldValues}
                onChange={(values) => {
                  setFieldValues(values);
                  setErrors({});
                }}
                errors={errors}
                disabled={false}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 mt-8">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => {
                  triggerHaptic('light');
                  onBack();
                }}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </GlassButton>
              <GlassButton 
                type="button"
                onClick={handleSubmit}
                className="flex-1"
              >
                Review <ArrowRight className="w-4 h-4" />
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

