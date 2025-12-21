import { motion, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { 
  FileText, 
  Plane, 
  CreditCard, 
  Shield, 
  Receipt, 
  FileCheck, 
  Scroll,
  Folder,
  ChevronDown,
  Check
} from 'lucide-react';
import type { DocumentType } from '../../types';
import { triggerHaptic } from '../../utils/animations';

interface CategoryTabsProps {
  selectedCategory: DocumentType | 'all';
  onCategoryChange: (category: DocumentType | 'all') => void;
}

const CATEGORIES: Array<{
  value: DocumentType | 'all';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: 'all', label: 'All', icon: Folder },
  { value: 'passport', label: 'Passports & Travel', icon: Plane },
  { value: 'visa', label: 'Visas & Permits', icon: FileText },
  { value: 'id_card', label: 'ID Cards', icon: CreditCard },
  { value: 'insurance', label: 'Insurance', icon: Shield },
  { value: 'subscription', label: 'Subscriptions', icon: Receipt },
  { value: 'receipt', label: 'Receipts', icon: Receipt },
  { value: 'bill', label: 'Bills', icon: FileCheck },
  { value: 'contract', label: 'Contracts', icon: Scroll },
  { value: 'other', label: 'Other', icon: FileText },
];

export default function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showFadeRight, setShowFadeRight] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || isDesktop) return;

    const checkScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowFadeRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [isDesktop]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const selectedCategoryData = CATEGORIES.find(cat => cat.value === selectedCategory) || CATEGORIES[0];

  // Desktop dropdown version
  if (isDesktop) {
    return (
      <div className="relative px-4 md:px-8" ref={dropdownRef}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            triggerHaptic('light');
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex items-center gap-3 px-6 py-3 rounded-full font-medium transition-all duration-300"
          style={{
            height: '48px',
            fontSize: '16px',
            background: selectedCategory === 'all' 
              ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
              : 'rgba(35, 29, 51, 0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: '#FFFFFF',
            border: selectedCategory === 'all' 
              ? '1px solid rgba(139, 92, 246, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: selectedCategory === 'all' 
              ? '0 4px 20px rgba(139, 92, 246, 0.4)'
              : 'none',
          }}
        >
          {(() => {
            const Icon = selectedCategoryData.icon;
            return <Icon className="w-5 h-5" />;
          })()}
          <span>{selectedCategoryData.label}</span>
          <ChevronDown 
            className={`w-5 h-5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
          />
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="absolute top-full left-4 md:left-8 mt-2 z-50 min-w-[280px] rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(35, 29, 51, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 60px rgba(139, 92, 246, 0.2)',
                }}
              >
                <div className="py-2 max-h-[400px] overflow-y-auto">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const isActive = selectedCategory === category.value;

                    return (
                      <motion.button
                        key={category.value}
                        whileHover={{ scale: 1.02, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          triggerHaptic('light');
                          onCategoryChange(category.value);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-all duration-200"
                        style={{
                          background: isActive 
                            ? 'rgba(139, 92, 246, 0.2)' 
                            : 'transparent',
                        }}
                      >
                        <div
                          className="flex items-center justify-center w-8 h-8 rounded-full transition-all"
                          style={{
                            background: isActive
                              ? 'linear-gradient(135deg, #8B5CF6, #6D28D9)'
                              : 'rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          <Icon 
                            className="w-4 h-4" 
                            style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}
                          />
                        </div>
                        <span 
                          className="flex-1 text-left font-medium"
                          style={{ color: isActive ? '#FFFFFF' : '#9CA3AF' }}
                        >
                          {category.label}
                        </span>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          >
                            <Check className="w-5 h-5 text-purple-400" />
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
      </div>
    );
  }

  // Mobile/Tablet horizontal scroll version
  return (
    <div className="relative px-4 md:px-8">
      <div
        ref={scrollContainerRef}
        className="flex gap-2 md:gap-3 overflow-x-auto scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' },
        }}
      >
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.value;

          return (
            <motion.button
              key={category.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                triggerHaptic('light');
                onCategoryChange(category.value);
              }}
              className="flex items-center gap-2 px-5 rounded-full font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 md:px-6 md:gap-2.5"
              style={isActive ? {
                height: '36px',
                fontSize: '15px',
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
                transform: 'translateY(-2px)',
              } : {
                height: '36px',
                fontSize: '15px',
                background: 'rgba(35, 29, 51, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#9CA3AF',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
              data-tablet-style="true"
            >
              <Icon className="w-4 h-4 md:w-5 md:h-5" />
              <span>{category.label}</span>
            </motion.button>
          );
        })}
      </div>
      {/* Fade effect at right edge */}
      {showFadeRight && (
        <div
          className="absolute right-0 top-0 bottom-0 w-8 md:w-12 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(35, 29, 51, 0.8), transparent)',
          }}
        />
      )}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 768px) {
          button[data-tablet-style="true"] {
            height: 44px !important;
            font-size: 17px !important;
          }
        }
      `}</style>
    </div>
  );
}
