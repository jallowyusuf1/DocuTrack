import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Palette, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/animations';
import { useToast } from '../../hooks/useToast';

interface ThemeCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const themes = [
  { id: 'default', name: 'Default Blue', primary: '#2563EB', secondary: '#1E40AF' },
  { id: 'purple', name: 'Purple Dream', primary: '#8B5CF6', secondary: '#7C3AED' },
  { id: 'green', name: 'Forest Green', primary: '#10B981', secondary: '#059669' },
  { id: 'pink', name: 'Pink Bliss', primary: '#EC4899', secondary: '#DB2777' },
  { id: 'orange', name: 'Sunset Orange', primary: '#F59E0B', secondary: '#D97706' },
  { id: 'red', name: 'Ruby Red', primary: '#EF4444', secondary: '#DC2626' },
];

export default function ThemeCustomizationModal({ isOpen, onClose }: ThemeCustomizationModalProps) {
  const { showToast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState('default');

  const handleSave = () => {
    triggerHaptic('success');
    showToast(`Theme changed to ${themes.find((t) => t.id === selectedTheme)?.name}`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0, 0, 0, 0.85)' }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative w-full max-w-lg mx-4 mb-4 md:mb-0 rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 22, 37, 0.95), rgba(35, 29, 51, 0.95))',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(219, 39, 119, 0.2))',
                    }}
                  >
                    <Palette className="w-5 h-5" style={{ color: '#F472B6' }} />
                  </div>
                  <h2 className="text-xl font-bold text-white">Theme Customization</h2>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <p className="text-white/80 text-sm mb-4">Choose your preferred color theme</p>

              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <motion.button
                    key={theme.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedTheme(theme.id);
                    }}
                    className="relative p-4 rounded-2xl text-left"
                    style={{
                      background: selectedTheme === theme.id
                        ? `linear-gradient(135deg, ${theme.primary}33, ${theme.secondary}33)`
                        : 'rgba(255, 255, 255, 0.03)',
                      border: selectedTheme === theme.id
                        ? `1px solid ${theme.primary}66`
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-full"
                        style={{
                          background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                        }}
                      />
                      <p className="text-white font-medium text-sm">{theme.name}</p>
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="h-2 flex-1 rounded-full"
                        style={{ background: theme.primary }}
                      />
                      <div
                        className="h-2 flex-1 rounded-full"
                        style={{ background: theme.secondary }}
                      />
                    </div>

                    {selectedTheme === theme.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                        style={{
                          background: theme.primary,
                        }}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Info Box */}
              <div
                className="mt-4 p-4 rounded-xl"
                style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                <p className="text-sm text-blue-300 leading-relaxed">
                  Theme customization is coming soon! This feature will allow you to personalize your DocuTrackr experience.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 h-12 rounded-xl font-medium"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                }}
              >
                Cancel
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="flex-1 h-12 rounded-xl font-medium"
                style={{
                  background: `linear-gradient(135deg, ${themes.find((t) => t.id === selectedTheme)?.primary}, ${themes.find((t) => t.id === selectedTheme)?.secondary})`,
                  color: '#FFFFFF',
                }}
              >
                Apply Theme
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
