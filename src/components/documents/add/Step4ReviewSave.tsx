import { motion } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import { triggerHaptic, prefersReducedMotion } from '../../../utils/animations';
import { GlassButton } from '../../ui/glass/Glass';
import type { DocumentFormData } from '../../../types';
import { format } from 'date-fns';

interface Step4ReviewSaveProps {
  imageFile: File;
  imagePreview: string;
  formData: Partial<DocumentFormData>;
  documentTypeLabel: string;
  onSave: () => Promise<void>;
  onBack: () => void;
  isSaving?: boolean;
}

export default function Step4ReviewSave({
  imageFile,
  imagePreview,
  formData,
  documentTypeLabel,
  onSave,
  onBack,
  isSaving = false,
}: Step4ReviewSaveProps) {
  const reduced = prefersReducedMotion();

  const handleSave = async () => {
    triggerHaptic('medium');
    await onSave();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
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
            <p className="text-white/70 text-sm mt-0.5">Step 4 of 4</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="flex-1 h-1 rounded-full"
              style={{
                background: step === 4 ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.4)',
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
            <h2 className="text-white font-semibold text-xl mb-6">Review & Save</h2>

            {/* Image Preview */}
            <div className="mb-6">
              <div
                className="w-full rounded-2xl overflow-hidden"
                style={{
                  aspectRatio: '16/9',
                  background: 'rgba(0, 0, 0, 0.3)',
                }}
              >
                <img
                  src={imagePreview}
                  alt="Document preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Document Details */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-white/70 text-sm">Type:</span>
                <span className="text-white font-medium">{documentTypeLabel}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/10">
                <span className="text-white/70 text-sm">Name:</span>
                <span className="text-white font-medium">{formData.document_name || '—'}</span>
              </div>
              {formData.document_number && (
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Number:</span>
                  <span className="text-white font-medium">{formData.document_number}</span>
                </div>
              )}
              {formData.issue_date && (
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Issue Date:</span>
                  <span className="text-white font-medium">{formatDate(formData.issue_date)}</span>
                </div>
              )}
              {formData.expiration_date && (
                <div className="flex items-center justify-between py-2 border-b border-white/10">
                  <span className="text-white/70 text-sm">Expiration Date:</span>
                  <span className="text-white font-medium">{formatDate(formData.expiration_date)}</span>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={() => {
                  triggerHaptic('light');
                  onBack();
                }}
                disabled={isSaving}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </GlassButton>
              <GlassButton
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Document
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

