import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { DesktopModal } from './DesktopModal';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  translationProgress: number;
}

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLanguage: (languageCode: string) => void;
  currentLanguage: string;
  languages: Language[];
}

const defaultLanguages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', translationProgress: 100 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', translationProgress: 100 },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', translationProgress: 98 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', translationProgress: 95 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', translationProgress: 92 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', translationProgress: 90 },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', translationProgress: 88 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', translationProgress: 85 },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', translationProgress: 83 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', translationProgress: 80 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', translationProgress: 78 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', translationProgress: 75 },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isOpen,
  onClose,
  onSelectLanguage,
  currentLanguage,
  languages = defaultLanguages,
}) => {
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);

  const handleLanguageClick = (language: Language) => {
    if (language.code === currentLanguage) return;

    setSelectedLanguage(language.code);
    setPendingLanguage(language);
    setShowConfirmation(true);
  };

  const confirmLanguageChange = () => {
    if (pendingLanguage) {
      onSelectLanguage(pendingLanguage.code);
      setShowConfirmation(false);
      onClose();
    }
  };

  const previewTexts = {
    en: {
      title: 'Document Tracker',
      addDocument: 'Add Document',
      expiryDate: 'Expiry Date',
      category: 'Category',
    },
    es: {
      title: 'Rastreador de Documentos',
      addDocument: 'Agregar Documento',
      expiryDate: 'Fecha de Vencimiento',
      category: 'Categoría',
    },
    fr: {
      title: 'Suivi des Documents',
      addDocument: 'Ajouter un Document',
      expiryDate: 'Date d\'Expiration',
      category: 'Catégorie',
    },
    de: {
      title: 'Dokumentenverfolgung',
      addDocument: 'Dokument Hinzufügen',
      expiryDate: 'Ablaufdatum',
      category: 'Kategorie',
    },
  };

  const getPreviewText = (code: string) => {
    return previewTexts[code as keyof typeof previewTexts] || previewTexts.en;
  };

  return (
    <>
      <DesktopModal isOpen={isOpen && !showConfirmation} onClose={onClose}>
        <div
          className="bg-white dark:bg-gray-800"
          style={{
            width: '700px',
            height: '600px',
            display: 'flex',
          }}
        >
          {/* Languages List (Left) */}
          <div className="w-[400px] p-6 overflow-y-auto border-r border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Select Language
            </h2>

            <div className="space-y-2">
              {languages.map((language) => {
                const isSelected = selectedLanguage === language.code;
                const isCurrent = currentLanguage === language.code;
                const isHovered = hoveredLanguage === language.code;

                return (
                  <button
                    key={language.code}
                    onMouseEnter={() => setHoveredLanguage(language.code)}
                    onMouseLeave={() => setHoveredLanguage(null)}
                    onClick={() => handleLanguageClick(language)}
                    className={`w-full rounded-2xl transition-all ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    style={{
                      width: '380px',
                      height: '80px',
                      padding: '16px',
                    }}
                  >
                    <div className="flex items-center gap-4 h-full">
                      {/* Flag */}
                      <div className="text-5xl flex-shrink-0">
                        {language.flag}
                      </div>

                      {/* Language Info */}
                      <div className="flex-1 text-left">
                        <h3
                          className={`font-semibold mb-1 ${
                            isSelected ? 'text-white' : 'text-gray-900 dark:text-white'
                          }`}
                          style={{ fontSize: '22px' }}
                        >
                          {language.name}
                        </h3>
                        <p
                          className={`${
                            isSelected ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                          style={{ fontSize: '19px' }}
                        >
                          {language.nativeName}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex flex-col items-end gap-1">
                        {isCurrent && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-purple-500 mb-1">
                            <Check size={14} />
                            Current
                          </div>
                        )}
                        <div className="w-20 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isSelected ? 'bg-white' : 'bg-purple-500'
                            }`}
                            style={{ width: `${language.translationProgress}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs ${
                            isSelected ? 'text-purple-100' : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {language.translationProgress}%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preview Panel (Right) */}
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Preview
            </h3>

            {/* Live Preview */}
            <div className="space-y-6">
              {/* Mock App Header */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
                <h4 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                  {getPreviewText(selectedLanguage).title}
                </h4>
                <button className="w-full py-3 bg-purple-500 text-white rounded-xl font-semibold">
                  {getPreviewText(selectedLanguage).addDocument}
                </button>
              </div>

              {/* Mock Document Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md">
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-gradient-to-br from-purple-200 to-blue-200 dark:from-purple-800 dark:to-blue-800 rounded-lg" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Passport
                    </h5>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        {getPreviewText(selectedLanguage).category}: Travel
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {getPreviewText(selectedLanguage).expiryDate}: 2025-12-31
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Globe size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                      Translation Progress
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      {languages.find(l => l.code === selectedLanguage)?.translationProgress}% of the app
                      has been translated to {languages.find(l => l.code === selectedLanguage)?.name}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DesktopModal>

      {/* Confirmation Modal */}
      {showConfirmation && pendingLanguage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(30px)',
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-8"
            style={{
              width: '500px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div className="flex justify-center mb-6">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: '96px',
                  height: '96px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.1) 100%)',
                }}
              >
                <div className="text-6xl">
                  {pendingLanguage.flag}
                </div>
              </div>
            </div>

            <h3 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Change Language?
            </h3>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-2">
              Change to <span className="font-semibold">{pendingLanguage.name}</span>?
            </p>
            <p className="text-center text-sm text-gray-500 dark:text-gray-500 mb-8">
              The app will reload to apply the new language
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setPendingLanguage(null);
                  setSelectedLanguage(currentLanguage);
                }}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmLanguageChange}
                className="flex-1 px-6 py-3 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors font-medium"
              >
                Change Language
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
