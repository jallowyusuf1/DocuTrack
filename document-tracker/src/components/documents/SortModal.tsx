import { Check } from 'lucide-react';

export type SortOption = 'newest' | 'oldest' | 'expiring_soon' | 'name_asc' | 'name_desc';

interface SortModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
];

export default function SortModal({
  isOpen,
  onClose,
  selectedSort,
  onSortChange,
}: SortModalProps) {
  if (!isOpen) return null;

  const handleSelect = (sort: SortOption) => {
    onSortChange(sort);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-h-[70vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sort By</h2>

          <div className="space-y-1">
            {SORT_OPTIONS.map((option) => {
              const isSelected = selectedSort === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center justify-between
                    px-4 py-4 rounded-lg
                    transition-colors duration-200
                    ${isSelected
                      ? 'bg-blue-50 text-blue-600'
                      : 'bg-white text-gray-900 hover:bg-gray-50'
                    }
                    active:scale-98
                    touch-manipulation
                  `}
                >
                  <span className="font-medium">{option.label}</span>
                  {isSelected && (
                    <Check className="w-5 h-5 text-blue-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

