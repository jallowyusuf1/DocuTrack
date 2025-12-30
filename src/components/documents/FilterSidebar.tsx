import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterSidebarProps {
  categories: { name: string; count: number; icon: string }[];
  onFilterChange: (filters: FilterState) => void;
  currentFilters: FilterState;
  onToggleView?: () => void;
  onFocusSearch?: () => void;
}

export interface FilterState {
  searchQuery: string;
  selectedCategories: string[];
  urgencyFilter: 'all' | 'urgent' | 'soon' | 'valid' | 'expired';
  dateRange: 'all' | 'this_week' | 'this_month' | 'next_30' | 'next_60' | 'custom';
  customDateRange?: { start: Date; end: Date };
  sortBy: 'name' | 'date_added' | 'expiry_date' | 'category';
  sortOrder: 'asc' | 'desc';
}

const urgencyOptions = [
  { value: 'all', label: 'All Documents', color: '#2563EB' },
  { value: 'urgent', label: 'Urgent (< 7 days)', color: '#EF4444' },
  { value: 'soon', label: 'Expiring Soon (7-30 days)', color: '#F59E0B' },
  { value: 'valid', label: 'Valid (> 30 days)', color: '#10B981' },
  { value: 'expired', label: 'Expired', color: '#6B7280' },
] as const;

const dateRangeOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'next_30', label: 'Next 30 Days' },
  { value: 'next_60', label: 'Next 60 Days' },
  { value: 'custom', label: 'Custom Range' },
] as const;

const sortOptions = [
  { value: 'name', label: 'Document Name (A-Z)' },
  { value: 'date_added', label: 'Date Added' },
  { value: 'expiry_date', label: 'Expiry Date (Nearest First)' },
  { value: 'category', label: 'Category' },
] as const;

export default function FilterSidebar({ categories, onFilterChange, currentFilters, onToggleView, onFocusSearch }: FilterSidebarProps) {
  const [expandedSections, setExpandedSections] = useState({
    categories: false,
    urgency: false,
    dateRange: false,
    sort: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (updates: Partial<FilterState>) => {
    onFilterChange({ ...currentFilters, ...updates });
  };

  const toggleCategory = (category: string) => {
    const selected = currentFilters.selectedCategories.includes(category)
      ? currentFilters.selectedCategories.filter(c => c !== category)
      : [...currentFilters.selectedCategories, category];
    updateFilter({ selectedCategories: selected });
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      selectedCategories: [],
      urgencyFilter: 'all',
      dateRange: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    currentFilters.searchQuery ||
    currentFilters.selectedCategories.length > 0 ||
    currentFilters.urgencyFilter !== 'all' ||
    currentFilters.dateRange !== 'all';

  return (
    <div className="w-80 h-full flex flex-col" style={{
      background: 'rgba(26, 22, 37, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Search */}
      <div className="p-4 md:p-6 relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={currentFilters.searchQuery}
            onChange={(e) => updateFilter({ searchQuery: e.target.value })}
            className="w-full h-12 pl-12 pr-10 rounded-xl text-white focus:outline-none transition-all cursor-pointer"
            style={{
              fontSize: '15px',
              background: 'rgba(35, 29, 51, 0.5)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
            }}
          />
          {currentFilters.searchQuery && (
            <button
              onClick={() => updateFilter({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Filters */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {/* Categories */}
        <FilterButton
          label="Category"
          isExpanded={expandedSections.categories}
          onToggle={() => toggleSection('categories')}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2 pt-3"
          >
            {categories.map((category) => {
              const isChecked = currentFilters.selectedCategories.includes(category.name);
              return (
                <motion.label
                  key={category.name}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative flex items-center justify-center"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(category.name)}
                      className="sr-only"
                    />
                    <motion.div
                      animate={{
                        scale: isChecked ? 1 : 0.8,
                        backgroundColor: isChecked ? 'rgba(37, 99, 235, 1)' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: isChecked ? 'rgba(37, 99, 235, 1)' : 'rgba(255, 255, 255, 0.2)',
                      }}
                      transition={{
                        duration: 0.2,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    >
                      {isChecked && (
                        <motion.svg
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </motion.svg>
                      )}
                    </motion.div>
                  </motion.div>
                  <span className="text-2xl">{category.icon}</span>
                  <span className="flex-1 text-white text-sm">{category.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-medium">
                    {category.count}
                  </span>
                </motion.label>
              );
            })}
          </motion.div>
        </FilterButton>

        {/* Urgency */}
        <FilterButton
          label="Urgency"
          isExpanded={expandedSections.urgency}
          onToggle={() => toggleSection('urgency')}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2 pt-3"
          >
                {urgencyOptions.map((option) => {
                  const isChecked = currentFilters.urgencyFilter === option.value;
                  return (
                    <motion.label
                      key={option.value}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <motion.div
                        whileTap={{ scale: 0.9 }}
                        className="relative flex items-center justify-center"
                      >
                        <input
                          type="radio"
                          name="urgency"
                          checked={isChecked}
                          onChange={() => updateFilter({ urgencyFilter: option.value })}
                          className="sr-only"
                        />
                        <motion.div
                          animate={{
                            scale: isChecked ? 1 : 0.8,
                            borderColor: isChecked ? option.color : 'rgba(255, 255, 255, 0.2)',
                          }}
                          transition={{
                            duration: 0.2,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: isChecked ? option.color : 'rgba(255, 255, 255, 0.2)',
                          }}
                        >
                          {isChecked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ background: option.color }}
                            />
                          )}
                        </motion.div>
                      </motion.div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ background: option.color }}
                      />
                      <span className="text-white text-sm">{option.label}</span>
                    </motion.label>
                  );
                })}
          </motion.div>
        </FilterButton>

        {/* Date Range */}
        <FilterButton
          label="Date Range"
          isExpanded={expandedSections.dateRange}
          onToggle={() => toggleSection('dateRange')}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2 pt-3"
          >
            {dateRangeOptions.map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter({ dateRange: option.value })}
                className={`w-full text-left py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer focus:outline-none ${
                  currentFilters.dateRange === option.value
                    ? 'bg-blue-500/20 text-blue-300 font-medium'
                    : 'text-white hover:bg-white/5'
                }`}
              >
                {option.label}
              </motion.button>
            ))}
          </motion.div>
        </FilterButton>

        {/* Sort */}
        <FilterButton
          label="Sort By"
          isExpanded={expandedSections.sort}
          onToggle={() => toggleSection('sort')}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3 pt-3"
          >
            <select
              value={currentFilters.sortBy}
              onChange={(e) => updateFilter({ sortBy: e.target.value as FilterState['sortBy'] })}
              className="w-full py-2 px-3 rounded-lg bg-[rgba(35,29,51,0.6)] border border-white/10 text-white text-sm focus:border-blue-500/50 focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter({ sortOrder: 'asc' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer focus:outline-none ${
                  currentFilters.sortOrder === 'asc'
                    ? 'bg-blue-500/20 text-blue-300 font-medium'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                Ascending
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => updateFilter({ sortOrder: 'desc' })}
                className={`flex-1 py-2 px-3 rounded-lg text-sm transition-colors cursor-pointer focus:outline-none ${
                  currentFilters.sortOrder === 'desc'
                    ? 'bg-blue-500/20 text-blue-300 font-medium'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                Descending
              </motion.button>
            </div>
          </motion.div>
        </FilterButton>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="p-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={clearAllFilters}
            className="w-full py-3 px-4 rounded-xl text-white font-medium transition-all"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            Clear All Filters
          </motion.button>
        </div>
      )}

    </div>
  );
}

// Filter Button Component with Frosted Glass and Card Expansion
function FilterButton({ 
  label, 
  isExpanded, 
  onToggle, 
  children 
}: { 
  label: string; 
  isExpanded: boolean; 
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {/* Button State (Default) */}
      <AnimatePresence mode="wait">
        {!isExpanded && (
          <motion.button
            key="button"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{
              duration: 0.35,
              ease: [0.4, 0, 0.2, 1],
            }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            className="w-full py-4 px-5 rounded-2xl text-white font-medium text-left cursor-pointer focus:outline-none focus:ring-0"
            style={{
              background: 'rgba(35, 29, 51, 0.4)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'auto',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {label}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Card State (Expanded) */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8, height: 0 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: 'auto'
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.96, 
              y: -8,
              height: 0
            }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.3 },
              scale: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              y: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
              height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
            }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(35, 29, 51, 0.4)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
              pointerEvents: 'auto',
            }}
          >
            {/* Card Header - Same style as button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-4 px-5 text-white font-medium text-left cursor-pointer focus:outline-none focus:ring-0"
              style={{
                background: 'transparent',
                pointerEvents: 'auto',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {label}
            </motion.button>
            
            {/* Card Content */}
            <motion.div 
              className="px-5 pb-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
