import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { 
  FileText, 
  Plane, 
  CreditCard, 
  Shield, 
  Receipt, 
  FileCheck, 
  Scroll,
  Folder
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
  const [showFadeRight, setShowFadeRight] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

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
  }, []);

  return (
    <div className="relative px-4">
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide"
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0"
              style={isActive ? {
                background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
                transform: 'translateY(-2px)',
              } : {
                background: 'rgba(35, 29, 51, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#9CA3AF',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{category.label}</span>
            </motion.button>
          );
        })}
      </div>
      {/* Fade effect at right edge */}
      {showFadeRight && (
        <div
          className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(35, 29, 51, 0.8), transparent)',
          }}
        />
      )}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
