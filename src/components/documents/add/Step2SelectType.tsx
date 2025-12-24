import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { triggerHaptic, prefersReducedMotion } from '../../../utils/animations';
import type { DocumentType } from '../../../types';

interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  category: string;
  emoji: string;
  id: string; // Unique identifier for each option
}

const DOCUMENT_TYPES: DocumentTypeOption[] = [
  // Identity
  { id: 'passport', value: 'passport', label: 'Passport', category: 'Identity', emoji: '📘' },
  { id: 'national_id', value: 'id_card', label: 'National ID', category: 'Identity', emoji: '🪪' },
  { id: 'driver_license', value: 'license_plate', label: 'Driver License', category: 'Identity', emoji: '🚗' },
  // Travel
  { id: 'visa', value: 'visa', label: 'Visa', category: 'Travel', emoji: '✈️' },
  // Certificates
  { id: 'birth_certificate', value: 'certification', label: 'Birth Certificate', category: 'Certificates', emoji: '📜' },
  { id: 'marriage_certificate', value: 'certification', label: 'Marriage Certificate', category: 'Certificates', emoji: '💍' },
  // Insurance
  { id: 'health_insurance', value: 'insurance', label: 'Health Insurance', category: 'Insurance', emoji: '🏥' },
  { id: 'auto_insurance', value: 'insurance', label: 'Auto Insurance', category: 'Insurance', emoji: '🚙' },
  // Professional
  { id: 'degree_diploma', value: 'certification', label: 'Degree/Diploma', category: 'Professional', emoji: '🎓' },
  // Property
  { id: 'vehicle_registration', value: 'registration', label: 'Vehicle Registration', category: 'Property', emoji: '📋' },
  // Medical
  { id: 'vaccination_card', value: 'other', label: 'Vaccination Card', category: 'Medical', emoji: '💉' },
  // Other
  { id: 'custom_document', value: 'other', label: 'Custom Document', category: 'Other', emoji: '📄' },
];

interface Step2SelectTypeProps {
  onTypeSelected: (type: DocumentType, label: string, category: string) => void;
  onBack: () => void;
}

export default function Step2SelectType({ onTypeSelected, onBack }: Step2SelectTypeProps) {
  const reduced = prefersReducedMotion();

  const handleTypeSelect = (type: DocumentType, label: string, category: string) => {
    triggerHaptic('light');
    onTypeSelected(type, label, category);
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
            <p className="text-white/70 text-sm mt-0.5">Step 2 of 4</p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className="flex-1 h-1 rounded-full"
              style={{
                background: step === 2 ? 'rgba(139, 92, 246, 0.8)' : step < 2 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(255, 255, 255, 0.15)',
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
            <h2 className="text-white font-semibold text-xl mb-6">Select Document Type</h2>

            <div className="grid grid-cols-3 gap-3">
              {DOCUMENT_TYPES.map((docType) => (
                <motion.button
                  key={docType.id}
                  whileHover={reduced ? undefined : { scale: 1.05, y: -2 }}
                  whileTap={reduced ? undefined : { scale: 0.95 }}
                  onClick={() => handleTypeSelect(docType.value, docType.label, docType.category)}
                  className="relative overflow-hidden rounded-2xl p-4 text-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  <div className="text-3xl mb-2">{docType.emoji}</div>
                  <div className="text-white font-medium text-sm mb-1">{docType.label}</div>
                  <div className="text-white/50 text-xs">{docType.category}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

