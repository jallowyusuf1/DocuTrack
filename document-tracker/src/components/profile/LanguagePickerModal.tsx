import { X, Check } from 'lucide-react';

interface LanguagePickerModalProps {
  isOpen: boolean;
  selectedLanguage: string;
  onClose: () => void;
  onSelect: (language: string) => void;
}

const LANGUAGES = [
  { value: 'English', label: 'English' },
  { value: 'Arabic', label: 'العربية' },
  { value: 'French', label: 'Français' },
  { value: 'Spanish', label: 'Español' },
  { value: 'German', label: 'Deutsch' },
  { value: 'Italian', label: 'Italiano' },
  { value: 'Portuguese', label: 'Português' },
  { value: 'Chinese', label: '中文' },
  { value: 'Japanese', label: '日本語' },
  { value: 'Korean', label: '한국어' },
];

export default function LanguagePickerModal({
  isOpen,
  selectedLanguage,
  onClose,
  onSelect,
}: LanguagePickerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50">
      <div
        className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Select Language</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Language List */}
        <div className="px-6 py-4">
          {LANGUAGES.map((language) => (
            <button
              key={language.value}
              onClick={() => onSelect(language.value)}
              className="w-full h-14 px-4 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-gray-900">{language.label}</span>
              {selectedLanguage === language.value && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

