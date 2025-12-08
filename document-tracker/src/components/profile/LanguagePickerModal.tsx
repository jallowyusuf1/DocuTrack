import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../hooks/useToast';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    rtl: true,
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    rtl: false,
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: '🇵🇰',
    rtl: true,
  },
];

interface LanguagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguagePickerModal({
  isOpen,
  onClose,
}: LanguagePickerModalProps) {
  const { t } = useTranslation();
  const { language, changeLanguage, isChanging } = useLanguage();
  const { showToast } = useToast();

  const handleLanguageSelect = async (langCode: string) => {
    if (isChanging || language === langCode) return;
    
    triggerHaptic('light');
    try {
      await changeLanguage(langCode);
      const selectedLang = languages.find(l => l.code === langCode);
      showToast(t('success.languageUpdated', { language: selectedLang?.name || langCode }), 'success');
      // Close modal after a brief delay to allow animation
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error) {
      console.error('Error changing language:', error);
      showToast('Failed to change language', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={getTransition(transitions.spring)}
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[80vh] overflow-y-auto"
            style={{
              background: 'rgba(42, 38, 64, 0.85)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div 
                className="w-10 h-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">{t('modals.selectLanguage')}</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="p-2 rounded-lg hover:bg-purple-500/20 active:bg-purple-500/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </motion.button>
            </div>

            {/* Language List */}
            <div className="px-6 py-4 space-y-3">
              {languages.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <motion.button
                    key={lang.code}
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleLanguageSelect(lang.code)}
                    disabled={isChanging || language === lang.code}
                    className="w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
                    style={isSelected ? {
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(109, 40, 217, 0.4))',
                      border: '2px solid rgba(139, 92, 246, 0.6)',
                      boxShadow: '0 0 24px rgba(139, 92, 246, 0.4)',
                    } : {
                      background: 'rgba(42, 38, 64, 0.6)',
                      backdropFilter: 'blur(15px)',
                      WebkitBackdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Flag Icon */}
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          background: 'rgba(35, 29, 51, 0.8)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                        }}
                      >
                        {lang.flag}
                      </div>

                      {/* Language Info */}
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <span 
                          className="text-base font-semibold truncate w-full"
                          style={{ color: isSelected ? '#FFFFFF' : '#FFFFFF' }}
                        >
                          {lang.nativeName}
                        </span>
                        <span 
                          className="text-sm mt-0.5 truncate w-full"
                          style={{ color: '#A78BFA', opacity: 0.8 }}
                        >
                          {lang.name}
                        </span>
                      </div>
                    </div>

                    {/* Checkmark */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                          boxShadow: '0 0 16px rgba(139, 92, 246, 0.6)',
                        }}
                      >
                        <Check className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
