import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowUpDown, Clock, Calendar, ArrowUpAZ, ArrowDownZA } from 'lucide-react';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

export type SortOption = 'newest' | 'oldest' | 'expiring_soon' | 'name_asc' | 'name_desc';

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: Array<{ 
  value: SortOption; 
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'newest', label: 'Newest First', icon: ArrowUpDown },
  { value: 'oldest', label: 'Oldest First', icon: ArrowUpDown },
  { value: 'expiring_soon', label: 'Expiring Soon', icon: Clock },
  { value: 'name_asc', label: 'Name A-Z', icon: ArrowUpAZ },
  { value: 'name_desc', label: 'Name Z-A', icon: ArrowDownZA },
];

export default function SortModal({
  isOpen,
  onClose,
  selectedSort,
  onSortChange,
}: SortModalProps) {
  const handleSelect = (sort: SortOption) => {
    triggerHaptic('light');
    onSortChange(sort);
    onClose();
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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[70vh] overflow-hidden"
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

            {/* Content */}
            <div className="px-5 pb-6">
              <h2 className="text-xl font-bold text-white mb-5">Sort By</h2>

              <div className="space-y-2">
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedSort === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSelect(option.value)}
                      className="w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200 touch-manipulation"
                      style={isSelected ? {
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
                        border: '1px solid rgba(139, 92, 246, 0.5)',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
                      } : {
                        background: 'rgba(35, 29, 51, 0.5)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(35, 29, 51, 0.5)';
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" style={{ color: isSelected ? '#A78BFA' : '#9CA3AF' }} />
                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-glass-primary'}`}>
                          {option.label}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Check className="w-5 h-5 text-purple-400" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
