import React, { useState } from 'react';
import { ChevronDown, SlidersHorizontal, Grid, List } from 'lucide-react';

interface SortOption {
  value: string;
  label: string;
}

interface GlassListControlsProps {
  // Sort
  sortOptions: SortOption[];
  currentSort: string;
  onSortChange: (sort: string) => void;

  // Filter
  showFilter?: boolean;
  onFilterClick?: () => void;
  filterCount?: number;

  // View toggle
  showViewToggle?: boolean;
  currentView?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;

  className?: string;
}

export const GlassListControls: React.FC<GlassListControlsProps> = ({
  sortOptions,
  currentSort,
  onSortChange,
  showFilter = true,
  onFilterClick,
  filterCount = 0,
  showViewToggle = false,
  currentView = 'list',
  onViewChange,
  className = '',
}) => {
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Sort';

  return (
    <div className={`
      h-14
      bg-white/80 dark:bg-zinc-900/80
      backdrop-blur-[40px] backdrop-saturate-[130%]
      border border-black/8 dark:border-white/12
      rounded-2xl
      shadow-[0_4px_16px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.6)]
      px-4
      mb-4
      flex items-center justify-between gap-3
      ${className}
    `}>
      {/* Left: Sort dropdown */}
      <div className="relative flex-1 max-w-xs">
        <button
          onClick={() => setShowSortDropdown(!showSortDropdown)}
          className="
            w-full
            h-10
            px-4
            bg-black/5 dark:bg-white/5
            border border-black/10 dark:border-white/10
            rounded-xl
            text-sm md:text-base
            text-gray-700 dark:text-gray-300
            font-medium
            flex items-center justify-between
            transition-all
            hover:bg-black/10 dark:hover:bg-white/10
            hover:border-black/20 dark:hover:border-white/20
          "
        >
          <span className="truncate">{currentSortLabel}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown menu */}
        {showSortDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowSortDropdown(false)}
            />

            {/* Menu */}
            <div className="
              absolute top-full left-0 right-0 mt-2
              bg-white/95 dark:bg-zinc-900/95
              backdrop-blur-[40px] backdrop-saturate-[130%]
              border border-black/8 dark:border-white/12
              rounded-xl
              shadow-[0_8px_24px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.8)]
              overflow-hidden
              z-20
            ">
              {sortOptions.map((option, idx) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setShowSortDropdown(false);
                  }}
                  className={`
                    w-full
                    px-4 py-3
                    text-left text-sm md:text-base
                    transition-colors
                    ${currentSort === option.value
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }
                    ${idx > 0 ? 'border-t border-black/5 dark:border-white/5' : ''}
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Right: Filter and View toggle */}
      <div className="flex items-center gap-2">
        {/* Filter button */}
        {showFilter && (
          <button
            onClick={onFilterClick}
            className="
              h-10
              px-4
              bg-black/5 dark:bg-white/5
              border border-black/10 dark:border-white/10
              rounded-xl
              text-sm md:text-base
              text-gray-700 dark:text-gray-300
              font-medium
              flex items-center gap-2
              transition-all
              hover:bg-black/10 dark:hover:bg-white/10
              hover:border-black/20 dark:hover:border-white/20
              relative
            "
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden md:inline">Filter</span>

            {/* Filter count badge */}
            {filterCount > 0 && (
              <span className="
                absolute -top-1 -right-1
                w-5 h-5
                bg-blue-500
                text-white
                text-xs
                font-bold
                rounded-full
                flex items-center justify-center
              ">
                {filterCount}
              </span>
            )}
          </button>
        )}

        {/* View toggle (desktop only) */}
        {showViewToggle && (
          <div className="hidden md:flex items-center gap-1 p-1 bg-black/5 dark:bg-white/5 rounded-xl">
            <button
              onClick={() => onViewChange?.('grid')}
              className={`
                w-9 h-9
                rounded-lg
                flex items-center justify-center
                transition-all
                ${currentView === 'grid'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }
              `}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewChange?.('list')}
              className={`
                w-9 h-9
                rounded-lg
                flex items-center justify-center
                transition-all
                ${currentView === 'list'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }
              `}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
