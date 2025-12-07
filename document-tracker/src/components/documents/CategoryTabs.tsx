import { useRef, useEffect } from 'react';
import type { DocumentType } from '../../types';

interface Category {
  id: string;
  label: string;
  value: DocumentType | 'all';
  icon?: string;
}

const CATEGORIES: Category[] = [
  { id: 'all', label: 'All', value: 'all' },
  { id: 'passport', label: 'Passports & Travel', value: 'passport' },
  { id: 'visa', label: 'Visas & Permits', value: 'visa' },
  { id: 'id_card', label: 'ID Cards', value: 'id_card' },
  { id: 'insurance', label: 'Insurance', value: 'insurance' },
  { id: 'subscription', label: 'Subscriptions', value: 'subscription' },
  { id: 'receipt', label: 'Receipts', value: 'receipt' },
  { id: 'bill', label: 'Bills', value: 'bill' },
  { id: 'contract', label: 'Contracts', value: 'contract' },
  { id: 'warranty', label: 'Warranties', value: 'warranty' },
  { id: 'license_plate', label: 'License Plates', value: 'license_plate' },
  { id: 'registration', label: 'Registrations', value: 'registration' },
  { id: 'membership', label: 'Memberships', value: 'membership' },
  { id: 'certification', label: 'Certifications', value: 'certification' },
  { id: 'food', label: 'Food Items', value: 'food' },
  { id: 'other', label: 'Other', value: 'other' },
];

interface CategoryTabsProps {
  selectedCategory: DocumentType | 'all';
  onCategoryChange: (category: DocumentType | 'all') => void;
}

export default function CategoryTabs({ selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedTabRef = useRef<HTMLButtonElement>(null);

  // Scroll to selected tab on mount or category change
  useEffect(() => {
    if (selectedTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const tab = selectedTabRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      
      const scrollLeft = tab.offsetLeft - (containerRect.width / 2) + (tabRect.width / 2);
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }
  }, [selectedCategory]);

  return (
    <div className="relative">
      {/* Fade effect at right edge */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white pointer-events-none z-10" />
      
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto px-4 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.value;
          return (
            <button
              key={category.id}
              ref={isSelected ? selectedTabRef : null}
              onClick={() => onCategoryChange(category.value)}
              className={`
                h-10 px-5 rounded-full
                flex items-center justify-center
                whitespace-nowrap
                text-sm font-medium
                transition-all duration-200
                active:scale-95
                touch-manipulation
                ${isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

