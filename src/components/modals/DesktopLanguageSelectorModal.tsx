import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DesktopModal from '../ui/DesktopModal';
import { triggerHaptic } from '../../utils/animations';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  translationPercent: number;
}

interface DesktopLanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (languageCode: string) => void;
  currentLanguage?: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', translationPercent: 100 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', translationPercent: 95 },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', translationPercent: 90 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', translationPercent: 85 },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', translationPercent: 80 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', translationPercent: 75 },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', translationPercent: 70 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', translationPercent: 65 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', translationPercent: 60 },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', translationPercent: 55 },
];

export default function DesktopLanguageSelectorModal({
  isOpen,
  onClose,
  onSelect,
  currentLanguage = 'en',
}: DesktopLanguageSelectorModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleLanguageClick = (languageCode: string) => {
    if (languageCode === currentLanguage) {
      onClose();
      return;
    }
    setSelectedLanguage(languageCode);
    setShowConfirmation(true);
    triggerHaptic('light');
  };

  const handleConfirm = () => {
    if (selectedLanguage) {
      triggerHaptic('medium');
      onSelect(selectedLanguage);
      onClose();
      // In real app, reload would happen here
      // window.location.reload();
    }
  };

  const selectedLang = selectedLanguage
    ? LANGUAGES.find((l) => l.code === selectedLanguage)
    : null;

  return (
    <>
      <DesktopModal
        isOpen={isOpen && !showConfirmation}
        onClose={onClose}
        width={700}
        height={600}
        title="Select Language"
      >
        <div className="flex h-full">
          {/* Languages List */}
          <div className="w-[400px] border-r border-white/10 overflow-y-auto">
            <div className="p-6 space-y-2">
              {LANGUAGES.map((language) => (
                <motion.button
                  key={language.code}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLanguageClick(language.code)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    currentLanguage === language.code
                      ? 'bg-blue-600/30 border-2 border-blue-600'
                      : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                  }`}
                  style={{ height: '80px' }}
                >
                  <span className="text-5xl">{language.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="text-[22px] font-semibold text-white mb-1">
                      {language.name}
                    </div>
                    <div className="text-[19px] text-white/60">{language.nativeName}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-xs text-white/40">{language.translationPercent}%</div>
                    <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${language.translationPercent}%` }}
                      />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="space-y-4">
              {/* Sample UI Preview */}
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="mb-4">
                  <div className="h-4 w-32 rounded bg-white/20 mb-2" />
                  <div className="h-4 w-24 rounded bg-white/10" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-5/6 rounded bg-white/10" />
                  <div className="h-3 w-4/6 rounded bg-white/10" />
                </div>
              </div>
              <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600/20" />
                  <div>
                    <div className="h-3 w-24 rounded bg-white/20 mb-2" />
                    <div className="h-2 w-16 rounded bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DesktopModal>

      {/* Confirmation Modal */}
      <DesktopModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setSelectedLanguage(null);
        }}
        width={500}
        height={300}
        title="Change Language?"
      >
        <div className="p-6 flex flex-col items-center text-center">
          <p className="text-lg text-white/80 mb-2">
            Change language to <span className="font-semibold text-white">{selectedLang?.name}</span>?
          </p>
          <p className="text-sm text-white/60 mb-6">The app will reload</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowConfirmation(false);
                setSelectedLanguage(null);
              }}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-800 transition-colors"
            >
              Change Language
            </button>
          </div>
        </div>
      </DesktopModal>
    </>
  );
}

