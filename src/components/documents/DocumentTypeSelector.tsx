import React, { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import type { DocumentType } from '../../types';
import { DOCUMENT_TYPE_TEMPLATES } from '../../config/documentTypeTemplates';

interface DocumentTypeSelectorProps {
  value: DocumentType;
  onChange: (type: DocumentType) => void;
  disabled?: boolean;
  error?: string;
}

const CATEGORIES = [
  { key: 'identity', label: 'Identity Documents', icon: '🆔' },
  { key: 'travel', label: 'Travel Documents', icon: '✈️' },
  { key: 'certificate', label: 'Certificates', icon: '📜' },
  { key: 'insurance', label: 'Insurance & Financial', icon: '💳' },
  { key: 'professional', label: 'Professional & Academic', icon: '🎓' },
  { key: 'property', label: 'Property & Legal', icon: '🏠' },
  { key: 'medical', label: 'Medical', icon: '🏥' },
  { key: 'custom', label: 'Custom', icon: '📄' },
  { key: 'other', label: 'Other', icon: '📋' },
];

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Group templates by category
  const templatesByCategory = React.useMemo(() => {
    const grouped: Record<string, Array<{ type: DocumentType; name: string }>> = {};

    Object.entries(DOCUMENT_TYPE_TEMPLATES).forEach(([type, template]) => {
      const category = template.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({ type: type as DocumentType, name: template.name });
    });

    // Sort within each category
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    return grouped;
  }, []);

  // Filter templates
  const filteredTemplates = React.useMemo(() => {
    let templates: Array<{ type: DocumentType; name: string; category: string }> = [];

    Object.entries(templatesByCategory).forEach(([category, items]) => {
      if (selectedCategory && selectedCategory !== category) return;
      items.forEach(item => {
        if (!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          templates.push({ ...item, category });
        }
      });
    });

    return templates;
  }, [templatesByCategory, selectedCategory, searchQuery]);

  const selectedTemplate = DOCUMENT_TYPE_TEMPLATES[value];
  const selectedCategoryLabel = selectedTemplate
    ? CATEGORIES.find(c => c.key === selectedTemplate.category)?.label || selectedTemplate.category
    : 'Select Document Type';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white">
        Document Type <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full h-12 px-4 pr-10 rounded-xl text-white bg-[rgba(35,29,51,0.6)] border transition-all text-left flex items-center justify-between ${
            error
              ? 'border-red-500'
              : 'border-white/10 focus:border-blue-600/50'
          } focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <span className={selectedTemplate ? '' : 'text-gray-400'}>
            {selectedTemplate ? selectedTemplate.name : 'Select Document Type...'}
          </span>
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            />
            <div className="absolute z-20 w-full mt-1 bg-[rgba(35,29,51,0.95)] backdrop-blur-xl border border-white/10 rounded-xl shadow-xl max-h-[600px] overflow-hidden">
              {/* Search */}
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search document types..."
                    className="w-full h-10 pl-10 pr-4 rounded-lg text-white bg-[rgba(26,22,37,0.6)] border border-white/10 focus:border-blue-600/50 focus:outline-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="p-3 border-b border-white/10 overflow-x-auto">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === null
                        ? 'bg-blue-600/20 text-blue-300'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                        selectedCategory === cat.key
                          ? 'bg-blue-600/20 text-blue-300'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates List */}
              <div className="overflow-y-auto max-h-[400px]">
                {filteredTemplates.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No document types found
                  </div>
                ) : (
                  <div className="p-2">
                    {Object.entries(
                      filteredTemplates.reduce((acc, item) => {
                        if (!acc[item.category]) acc[item.category] = [];
                        acc[item.category].push(item);
                        return acc;
                      }, {} as Record<string, typeof filteredTemplates>)
                    ).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                          {CATEGORIES.find(c => c.key === category)?.label || category}
                        </div>
                        {items.map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                              onChange(item.type);
                              setIsOpen(false);
                              setSearchQuery('');
                              setSelectedCategory(null);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors rounded-lg ${
                              value === item.type ? 'bg-blue-600/20' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-white">{item.name}</span>
                              {value === item.type && (
                                <span className="text-blue-400">✓</span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
};


