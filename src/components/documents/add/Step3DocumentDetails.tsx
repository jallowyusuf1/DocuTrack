import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Loader2, Sparkles } from 'lucide-react';
import { triggerHaptic, prefersReducedMotion } from '../../../utils/animations';
import { GlassButton } from '../../ui/glass/Glass';
import DatePickerModal from '../../ui/DatePickerModal';
import { extractTextFromImage } from '../../../utils/ocr';
import { useToast } from '../../../hooks/useToast';
import type { DocumentFormData, DocumentType } from '../../../types';

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
  const [showIssueDatePicker, setShowIssueDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);
  const [isExtractingOCR, setIsExtractingOCR] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Partial<DocumentFormData>>({
    defaultValues: {
      document_type: documentType,
      document_name: '',
      document_number: '',
      issue_date: '',
      expiration_date: '',
      notes: '',
    },
  });

  // Auto-extract fields using OCR when component mounts
  useEffect(() => {
    const extractOCR = async () => {
      setIsExtractingOCR(true);
      try {
        const result = await extractTextFromImage(imageFile);
        
        // Auto-fill fields if found
        if (result.fields) {
          const currentDocNumber = watch('document_number');
          const currentExpiry = watch('expiration_date');
          const currentIssue = watch('issue_date');
          const currentName = watch('document_name');
          
          if (result.fields.documentNumber && !currentDocNumber) {
            setValue('document_number', result.fields.documentNumber);
          }
          if (result.fields.expirationDate && !currentExpiry) {
            setValue('expiration_date', result.fields.expirationDate);
          }
          if (result.fields.issueDate && !currentIssue) {
            setValue('issue_date', result.fields.issueDate);
          }
          if (result.fields.name && !currentName) {
            setValue('document_name', result.fields.name);
          }
          
          // Only show toast if at least one field was extracted
          const extractedCount = [
            result.fields.documentNumber && !currentDocNumber,
            result.fields.expirationDate && !currentExpiry,
            result.fields.issueDate && !currentIssue,
            result.fields.name && !currentName,
          ].filter(Boolean).length;
          
          if (extractedCount > 0) {
            showToast(`Extracted ${extractedCount} field${extractedCount > 1 ? 's' : ''} from document!`, 'success');
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
  }, [imageFile, setValue, watch, showToast]);

  const issueDate = watch('issue_date');
  const expiryDate = watch('expiration_date');

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

  const onSubmit = (data: Partial<DocumentFormData>) => {
    triggerHaptic('light');
    onContinue(data);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1625 0%, #2d1b4e 50%, #1a1625 100%)' }}>
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
          <form onSubmit={handleSubmit(onSubmit)}>
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

              <div className="space-y-4">
                {/* Document Name */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Document Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register('document_name', { required: 'Document name is required' })}
                    type="text"
                    placeholder="Enter document name"
                    className="glass-input w-full h-12 px-4 text-white placeholder:text-white/45"
                  />
                  {errors.document_name && (
                    <p className="mt-1 text-red-300 text-xs">{errors.document_name.message}</p>
                  )}
                </div>

                {/* Document Number */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Document Number</label>
                  <input
                    {...register('document_number')}
                    type="text"
                    placeholder="Enter document number"
                    className="glass-input w-full h-12 px-4 text-white placeholder:text-white/45"
                  />
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Issue Date</label>
                  <Controller
                    name="issue_date"
                    control={control}
                    render={({ field }) => (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setShowIssueDatePicker(true);
                          }}
                          className="glass-input w-full h-12 px-4 text-left text-white placeholder:text-white/45 flex items-center justify-between"
                        >
                          <span>{issueDate || 'mm/dd/yyyy'}</span>
                          <Calendar className="w-5 h-5 text-white/60" />
                        </button>
                        <DatePickerModal
                          isOpen={showIssueDatePicker}
                          onClose={() => setShowIssueDatePicker(false)}
                          onSelect={(date) => {
                            field.onChange(date);
                            setShowIssueDatePicker(false);
                          }}
                        />
                      </>
                    )}
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Expiration Date <span className="text-red-400">*</span>
                  </label>
                  <Controller
                    name="expiration_date"
                    control={control}
                    rules={{ required: 'Expiration date is required' }}
                    render={({ field }) => (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setShowExpiryDatePicker(true);
                          }}
                          className="glass-input w-full h-12 px-4 text-left text-white placeholder:text-white/45 flex items-center justify-between"
                        >
                          <span>{expiryDate || 'mm/dd/yyyy'}</span>
                          <Calendar className="w-5 h-5 text-white/60" />
                        </button>
                        {errors.expiration_date && (
                          <p className="mt-1 text-red-300 text-xs">{errors.expiration_date.message}</p>
                        )}
                        <DatePickerModal
                          isOpen={showExpiryDatePicker}
                          onClose={() => setShowExpiryDatePicker(false)}
                          onSelect={(date) => {
                            field.onChange(date);
                            setShowExpiryDatePicker(false);
                          }}
                        />
                      </>
                    )}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-white/70 text-sm mb-2">Notes (optional)</label>
                  <textarea
                    {...register('notes')}
                    placeholder="Add any additional notes..."
                    rows={4}
                    className="glass-input w-full px-4 py-3 text-white placeholder:text-white/45 resize-none"
                    style={{
                      minHeight: '100px',
                    }}
                  />
                </div>
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
                <GlassButton type="submit" className="flex-1">
                  Review <ArrowRight className="w-4 h-4" />
                </GlassButton>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

