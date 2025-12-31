import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import GlassModal from '../../ui/glass/GlassModal';
import GlassTile from '../../ui/glass/GlassTile';
import GlassInput from '../../ui/glass/GlassInput';
import GlassButton from '../../ui/glass/GlassButton';
import { prefersReducedMotion } from '../../../utils/animations';
import type { DocumentType } from '../../../types';

interface DocumentTypeOption {
  value: DocumentType;
  label: string;
  category: string;
  emoji: string;
  description: string;
  fieldCount: number;
}

const DOCUMENT_TYPES: DocumentTypeOption[] = [
  // Identity
  { value: 'passport', label: 'Passport', category: 'Identity', emoji: '🛂', description: 'International travel document', fieldCount: 15 },
  { value: 'id_card', label: 'National ID', category: 'Identity', emoji: '🪪', description: 'Government-issued identification', fieldCount: 12 },
  { value: 'license_plate', label: 'Driver License', category: 'Identity', emoji: '🚗', description: 'State-issued license', fieldCount: 12 },
  // Travel
  { value: 'visa', label: 'Visa', category: 'Travel', emoji: '✈️', description: 'Travel authorization document', fieldCount: 10 },
  // Certificates
  { value: 'certification', label: 'Birth Certificate', category: 'Certificates', emoji: '📄', description: 'Official birth record', fieldCount: 18 },
  { value: 'certification', label: 'Marriage Certificate', category: 'Certificates', emoji: '💍', description: 'Marriage documentation', fieldCount: 14 },
  // Insurance
  { value: 'insurance', label: 'Health Insurance', category: 'Insurance', emoji: '🏥', description: 'Health coverage proof', fieldCount: 10 },
  { value: 'insurance', label: 'Auto Insurance', category: 'Insurance', emoji: '🚙', description: 'Vehicle insurance card', fieldCount: 8 },
  // Professional
  { value: 'certification', label: 'Degree/Diploma', category: 'Professional', emoji: '🎓', description: 'Educational certificate', fieldCount: 12 },
  // Property
  { value: 'registration', label: 'Vehicle Registration', category: 'Property', emoji: '📋', description: 'Vehicle registration document', fieldCount: 9 },
  // Medical
  { value: 'other', label: 'Vaccination Card', category: 'Medical', emoji: '💉', description: 'Vaccination records', fieldCount: 7 },
];

const CATEGORIES = [
  { id: 'all', label: 'All Types', emoji: '📋' },
  { id: 'identity', label: 'Identity', emoji: '🪪' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'certificates', label: 'Certificates', emoji: '📋' },
  { id: 'insurance', label: 'Insurance & Financial', emoji: '💳' },
  { id: 'professional', label: 'Professional', emoji: '👨‍💼' },
  { id: 'property', label: 'Property', emoji: '🏠' },
  { id: 'medical', label: 'Medical', emoji: '⚕️' },
];

interface Step2DocumentTypeSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onTypeSelected: (type: DocumentType, label: string, category: string) => void;
  detectedType?: { type: DocumentType; label: string; confidence: number };
}

export default function Step2DocumentTypeSelection({
  isOpen,
  onClose,
  onTypeSelected,
  detectedType,
}: Step2DocumentTypeSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const reduced = prefersReducedMotion();

  const filteredTypes = DOCUMENT_TYPES.filter((type) => {
    const matchesSearch =
      type.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' ||
      type.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleTypeSelect = (type: DocumentTypeOption) => {
    onTypeSelected(type.value, type.label, type.category);
  };

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={onClose}
      title="What type of document is this?"
      size="large"
    >
      <div className="space-y-4">
        {/* Smart Detection Banner */}
        {detectedType && detectedType.confidence > 0.8 && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -20 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            className="rounded-xl p-4"
            style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-white font-semibold">
                    We detected this looks like a {detectedType.label}. Is that correct?
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={() => onTypeSelected(detectedType.type, detectedType.label, 'Identity')}
                >
                  Yes, Continue
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                >
                  No, Choose Different
                </GlassButton>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Bar */}
        <GlassTile>
          <GlassInput
            placeholder="Search document types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </GlassTile>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Sidebar - Categories */}
          <div className="md:col-span-1">
            <GlassTile>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'text-white'
                        : 'text-white/70 hover:text-white'
                    }`}
                    style={{
                      background:
                        selectedCategory === cat.id
                          ? 'rgba(59, 130, 246, 0.3)'
                          : 'transparent',
                      border:
                        selectedCategory === cat.id
                          ? '1px solid rgba(59, 130, 246, 0.5)'
                          : '1px solid transparent',
                    }}
                  >
                    <span className="mr-2">{cat.emoji}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </GlassTile>
          </div>

          {/* Main Content - Document Type Cards */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTypes.map((type, index) => (
                <motion.div
                  key={`${type.value}-${type.label}`}
                  initial={reduced ? false : { opacity: 0, y: 20 }}
                  animate={reduced ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassTile
                    interactive
                    onClick={() => handleTypeSelect(type)}
                    className="h-full"
                  >
                    <div className="flex flex-col items-center text-center h-full">
                      <div className="text-6xl mb-3">{type.emoji}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{type.label}</h3>
                      <p className="text-sm text-white/60 mb-3 line-clamp-2">
                        {type.description}
                      </p>
                      <div
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: 'rgba(59, 130, 246, 1)',
                        }}
                      >
                        {type.fieldCount} fields
                      </div>
                    </div>
                  </GlassTile>
                </motion.div>
              ))}
            </div>

            {/* Custom Document Type */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: filteredTypes.length * 0.05 }}
              className="mt-4"
            >
              <GlassTile
                interactive
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.2)',
                }}
              >
                <div className="flex flex-col items-center text-center py-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-white font-semibold">Create Custom Document Type</p>
                </div>
              </GlassTile>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <GlassTile>
          <div className="flex items-center justify-center">
            <p className="text-sm text-white/60">
              Can't find your type?{' '}
              <button
                className="text-blue-400 hover:text-blue-300 underline"
                onClick={() => {
                  // Open custom type creator
                }}
              >
                Create custom →
              </button>
            </p>
          </div>
        </GlassTile>
      </div>
    </GlassModal>
  );
}




