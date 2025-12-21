import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import Button from '../ui/Button';
import { getTransition, transitions, triggerHaptic } from '../../utils/animations';

export interface FilterState {
  expirationStatus: {
    expired: boolean;
    expiring7Days: boolean;
    expiring30Days: boolean;
    valid: boolean;
  };
  hasNotes: boolean;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  activeFilterCount?: number;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
}: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
    }
  }, [isOpen, filters]);

  const handleToggleExpirationStatus = (key: keyof FilterState['expirationStatus']) => {
    triggerHaptic('light');
    setLocalFilters((prev) => ({
      ...prev,
      expirationStatus: {
        ...prev.expirationStatus,
        [key]: !prev.expirationStatus[key],
      },
    }));
  };

  const handleToggleNotes = () => {
    triggerHaptic('light');
    setLocalFilters((prev) => ({
      ...prev,
      hasNotes: !prev.hasNotes,
    }));
  };

  const handleClearAll = () => {
    triggerHaptic('light');
    setLocalFilters({
      expirationStatus: {
        expired: false,
        expiring7Days: false,
        expiring30Days: false,
        valid: false,
      },
      hasNotes: false,
    });
  };

  const handleApply = () => {
    triggerHaptic('medium');
    onFiltersChange(localFilters);
    onClose();
  };

  const hasActiveFilters = Object.values(localFilters.expirationStatus).some(Boolean) || localFilters.hasNotes;

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
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] w-full max-h-[85vh] overflow-y-auto md:max-w-[600px] md:left-1/2 md:-translate-x-1/2 md:max-h-[70vh] md:rounded-t-[24px]"
            style={{
              background: 'rgba(42, 38, 64, 0.85)',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2 sticky top-0" style={{
              background: 'rgba(42, 38, 64, 0.85)',
              backdropFilter: 'blur(25px)',
            }}>
              <div 
                className="w-10 h-1 rounded-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                }}
              />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Filter Documents</h2>
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

            {/* Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Expiration Status */}
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Expiration Status</h3>
                <div className="space-y-3">
                  {[
                    { key: 'expired' as const, label: 'Expired' },
                    { key: 'expiring7Days' as const, label: 'Expiring in 7 days' },
                    { key: 'expiring30Days' as const, label: 'Expiring in 30 days' },
                    { key: 'valid' as const, label: 'Valid' },
                  ].map(({ key, label }) => {
                    const isChecked = localFilters.expirationStatus[key];
                    return (
                      <motion.label
                        key={key}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => handleToggleExpirationStatus(key)}
                      >
                        <motion.div
                          animate={{
                            scale: isChecked ? 1 : 0.9,
                          }}
                          transition={{ duration: 0.2 }}
                          className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
                          style={isChecked ? {
                            background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                            border: '1px solid rgba(139, 92, 246, 0.5)',
                            boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                          } : {
                            background: 'rgba(35, 29, 51, 0.5)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          {isChecked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <Check className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                        <span className="text-sm text-white">{label}</span>
                      </motion.label>
                    );
                  })}
                </div>
              </div>

              {/* Has Notes */}
              <div>
                <h3 className="text-base font-semibold text-white mb-3">Has Notes</h3>
                <motion.label 
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={handleToggleNotes}
                >
                  <motion.div
                    animate={{
                      scale: localFilters.hasNotes ? 1 : 0.9,
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-5 rounded flex items-center justify-center transition-all duration-200"
                    style={localFilters.hasNotes ? {
                      background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                      boxShadow: '0 0 12px rgba(139, 92, 246, 0.4)',
                    } : {
                      background: 'rgba(35, 29, 51, 0.5)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {localFilters.hasNotes && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                  <span className="text-sm text-white">Show only documents with notes</span>
                </motion.label>
              </div>
            </div>

            {/* Footer */}
            <div 
              className="sticky bottom-0 px-6 py-4 safe-area-bottom border-t border-white/10"
              style={{
                background: 'rgba(42, 38, 64, 0.85)',
                backdropFilter: 'blur(25px)',
              }}
            >
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={handleClearAll}
                  disabled={!hasActiveFilters}
                >
                  Clear All
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleApply}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
