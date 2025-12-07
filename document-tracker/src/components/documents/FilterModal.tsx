import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';

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

  if (!isOpen) return null;

  const handleToggleExpirationStatus = (key: keyof FilterState['expirationStatus']) => {
    setLocalFilters((prev) => ({
      ...prev,
      expirationStatus: {
        ...prev.expirationStatus,
        [key]: !prev.expirationStatus[key],
      },
    }));
  };

  const handleToggleNotes = () => {
    setLocalFilters((prev) => ({
      ...prev,
      hasNotes: !prev.hasNotes,
    }));
  };

  const handleClearAll = () => {
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
    onFiltersChange(localFilters);
    onClose();
  };

  const hasActiveFilters = Object.values(localFilters.expirationStatus).some(Boolean) || localFilters.hasNotes;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Filter Documents</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Expiration Status */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Expiration Status</h3>
            <div className="space-y-3">
              {[
                { key: 'expired' as const, label: 'Expired' },
                { key: 'expiring7Days' as const, label: 'Expiring in 7 days' },
                { key: 'expiring30Days' as const, label: 'Expiring in 30 days' },
                { key: 'valid' as const, label: 'Valid (not expiring soon)' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.expirationStatus[key]}
                    onChange={() => handleToggleExpirationStatus(key)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Has Notes */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Has Notes</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.hasNotes}
                onChange={handleToggleNotes}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Show only documents with notes</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 safe-area-bottom">
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
      </div>
    </div>
  );
}

