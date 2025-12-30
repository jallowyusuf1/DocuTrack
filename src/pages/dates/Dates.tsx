import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RefreshCw, XCircle, Search, X, Filter, SlidersHorizontal, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { dateService } from '../../services/dateService';
import { useDebounce } from '../../hooks/useDebounce';
import { matchesSearch, getSearchSuggestions } from '../../utils/searchUtils';
import { useSearchHistory } from '../../hooks/useSearch';
import type { ImportantDate } from '../../types';
import CalendarView from '../../components/dates/CalendarView';
import ListView from '../../components/dates/ListView';
import ViewToggle from '../../components/dates/ViewToggle';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import BackButton from '../../components/ui/BackButton';
import AddImportantDateModal from '../../components/dates/AddImportantDateModal';
import { useTheme } from '../../contexts/ThemeContext';
import { usePageLock } from '../../hooks/usePageLock';
import EnhancedPageLockModal from '../../components/lock/EnhancedPageLockModal';

type SortOption = 'date_asc' | 'date_desc' | 'title_asc' | 'title_desc' | 'category';

const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date (Earliest First)' },
  { value: 'date_desc', label: 'Date (Latest First)' },
  { value: 'title_asc', label: 'Title (A-Z)' },
  { value: 'title_desc', label: 'Title (Z-A)' },
  { value: 'category', label: 'Category' },
];

const CATEGORY_COLORS: Record<string, string> = {
  'Personal': '#60A5FA',
  'Work': '#FB923C',
  'Medical': '#F87171',
  'Legal': '#34D399',
  'Financial': '#60A5FA',
  'Travel': '#FB923C',
  'Education': '#34D399',
  'Other': '#9CA3AF',
};

export default function Dates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();

  // Page lock
  const { isLocked: isPageLocked, lockType: pageLockType, handleUnlock: handlePageUnlock } = usePageLock('dates');

  const [searchParams, setSearchParams] = useSearchParams();
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date_asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { history: searchHistory, addToHistory } = useSearchHistory();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    dates.forEach(date => {
      if (date.category) cats.add(date.category);
    });
    return Array.from(cats).sort();
  }, [dates]);

  // Filter and sort dates
  const filteredAndSortedDates = useMemo(() => {
    let result = dates;

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      result = result.filter((date) => {
        const searchableText = [
          date.title,
          date.description,
          date.category,
        ].filter(Boolean).join(' ');
        return matchesSearch(searchableText, debouncedSearchQuery);
      });
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(date => selectedCategories.includes(date.category));
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title);
        case 'title_desc':
          return b.title.localeCompare(a.title);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return result;
  }, [dates, debouncedSearchQuery, selectedCategories, sortBy]);

  // Get search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return [];

    const titles = dates.map(d => d.title);
    const allSuggestions = [...titles, ...categories];

    return allSuggestions
      .filter(suggestion =>
        matchesSearch(suggestion, searchQuery) &&
        suggestion.toLowerCase() !== searchQuery.toLowerCase()
      )
      .slice(0, 5);
  }, [dates, searchQuery, categories]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (view === 'calendar') {
            e.preventDefault();
            // Will be handled by CalendarView
          }
          break;
        case 'ArrowRight':
          if (view === 'calendar') {
            e.preventDefault();
            // Will be handled by CalendarView
          }
          break;
        case 'n':
        case 'N':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setIsAddModalOpen(true);
          }
          break;
        case '/':
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        case 'Escape':
          setSearchQuery('');
          setShowSortMenu(false);
          setShowFilterMenu(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch all important dates
  const fetchDates = useCallback(async (showRefreshing = false) => {
    if (!user?.id) return;

    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const fetchedDates = await dateService.getDates(user.id);
      setDates(fetchedDates);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch important dates:', err);
      if (!err.message?.includes('not found') && !err.code?.includes('PGRST')) {
        setError('Failed to load important dates. Please try again.');
      } else {
        setDates([]);
        setError(null);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  // Check if we should open add modal from query params
  useEffect(() => {
    const shouldAdd = searchParams.get('add');
    if (shouldAdd === 'true') {
      setIsAddModalOpen(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('add');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Listen for refresh events
  useEffect(() => {
    const handleFocus = () => {
      fetchDates();
    };
    const handleRefresh = () => {
      fetchDates();
    };
    window.addEventListener('focus', handleFocus);
    window.addEventListener('refreshDates', handleRefresh);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('refreshDates', handleRefresh);
    };
  }, [fetchDates]);

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollContainerRef.current?.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current === 0) return;
    const currentY = e.touches[0].clientY;
    pullDistance.current = currentY - pullStartY.current;
    if (pullDistance.current > 0 && scrollContainerRef.current?.scrollTop === 0) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance.current > 80) {
      fetchDates(true);
    }
    pullStartY.current = 0;
    pullDistance.current = 0;
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const bgColor = theme === 'light' ? '#FFFFFF' : '#000000';
  const textColor = theme === 'light' ? '#000000' : '#FFFFFF';

  // Loading skeleton
  if (loading && dates.length === 0) {
    return (
      <>
        {/* Page Lock Modal */}
        <EnhancedPageLockModal
          isOpen={isPageLocked}
          pageName="Important Dates"
          lockType={pageLockType}
          onUnlock={handlePageUnlock}
        />

        <div className="min-h-screen pb-[72px]" style={{ background: bgColor, color: textColor }}>
        <div className="px-5 py-4">
          <Skeleton className="h-8 w-48 mb-2" style={{ background: theme === 'light' ? 'rgba(245, 245, 245, 0.8)' : 'rgba(26, 26, 26, 0.8)' }} />
          <Skeleton className="h-4 w-64" style={{ background: theme === 'light' ? 'rgba(245, 245, 245, 0.8)' : 'rgba(26, 26, 26, 0.8)' }} />
        </div>

        <div className="px-4 mb-4">
          <Skeleton className="h-12 w-full rounded-xl" style={{ background: theme === 'light' ? 'rgba(245, 245, 245, 0.8)' : 'rgba(26, 26, 26, 0.8)' }} />
        </div>

        <div className="px-4 mb-4">
          <Skeleton className="h-11 w-full rounded-2xl" style={{ background: theme === 'light' ? 'rgba(245, 245, 245, 0.8)' : 'rgba(26, 26, 26, 0.8)' }} />
        </div>

        <div className="px-4 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" style={{ background: theme === 'light' ? 'rgba(245, 245, 245, 0.8)' : 'rgba(26, 26, 26, 0.8)' }} />
          <Skeleton className="h-32 w-full rounded-xl" style={{ background: theme === 'light' ? 'rgba(245, 245, 245, 0.8)' : 'rgba(26, 26, 26, 0.8)' }} />
        </div>
        </div>
      </>
    );
  }

  // Error state
  if (error && dates.length === 0) {
    return (
      <>
        {/* Page Lock Modal */}
        <EnhancedPageLockModal
          isOpen={isPageLocked}
          pageName="Important Dates"
          lockType={pageLockType}
          onUnlock={handlePageUnlock}
        />

        <div className="min-h-screen pb-[72px] flex items-center justify-center px-4" style={{ background: bgColor, color: textColor }}>
        <div className="text-center glass-card p-8 rounded-2xl">
          <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: theme === 'light' ? '#EF4444' : '#F87171' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: textColor }}>Failed to Load Dates</h2>
          <p className="mb-6" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)' }}>{error}</p>
          <Button variant="primary" onClick={() => fetchDates()}>
            Retry
          </Button>
        </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Page Lock Modal */}
      <EnhancedPageLockModal
        isOpen={isPageLocked}
        pageName="Important Dates"
        lockType={pageLockType}
        onUnlock={handlePageUnlock}
      />

      <div className="min-h-screen pt-4 pb-[72px]" style={{ background: bgColor, color: textColor }}>
      {/* Header */}
      <div className="px-5 pb-4">
        <div className="mb-4">
          <BackButton to="/dashboard" />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-1"
          style={{ color: textColor }}
        >
          Important Dates
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm"
          style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)' }}
        >
          Track your important dates and reminders
        </motion.p>
      </div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 pt-2 pb-4"
      >
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10 transition-all"
            style={{
              color: theme === 'light' ? '#3B82F6' : '#60A5FA',
              filter: theme === 'light' ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))' : 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.5))',
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search dates... (Press '/' to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[50px] pl-12 pr-12 rounded-2xl transition-all duration-300"
            style={{
              background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.8)',
              backdropFilter: 'blur(40px) saturate(120%)',
              WebkitBackdropFilter: 'blur(40px) saturate(120%)',
              border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '15px',
              color: textColor,
            }}
            onFocus={(e) => {
              const focusColor = theme === 'light' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(96, 165, 250, 0.5)';
              e.currentTarget.style.border = `1px solid ${focusColor}`;
              e.currentTarget.style.boxShadow = `0 0 20px ${focusColor}66`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <style>{`
            input::placeholder {
              color: ${theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(96, 165, 250, 0.5)'};
              opacity: 0.7;
            }
          `}</style>
          {searchQuery && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center active:scale-95 transition-all z-10"
              style={{
                background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: textColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.8)';
              }}
            >
              <X className="w-4 h-4" style={{ color: textColor }} />
            </motion.button>
          )}
        </div>
        {debouncedSearchQuery && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs mt-2 px-1"
            style={{ color: theme === 'light' ? '#3B82F6' : '#60A5FA' }}
          >
            {filteredAndSortedDates.length} result{filteredAndSortedDates.length !== 1 ? 's' : ''}
          </motion.p>
        )}
      </motion.div>

      {/* Filter & Sort Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 pb-4 flex items-center gap-2"
      >
        {/* Filter Button */}
        <div className="relative" ref={filterMenuRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium transition-all"
            style={{
              background: selectedCategories.length > 0
                ? (theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(96, 165, 250, 0.2)')
                : (theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.8)'),
              backdropFilter: 'blur(40px) saturate(120%)',
              WebkitBackdropFilter: 'blur(40px) saturate(120%)',
              border: selectedCategories.length > 0
                ? (theme === 'light' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(96, 165, 250, 0.5)')
                : (theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)'),
              color: textColor,
            }}
          >
            <Filter className="w-4 h-4" style={{ color: theme === 'light' ? '#3B82F6' : '#60A5FA' }} />
            Filter
            {selectedCategories.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ background: theme === 'light' ? '#3B82F6' : '#60A5FA', color: '#FFFFFF' }}>
                {selectedCategories.length}
              </span>
            )}
          </motion.button>

          {/* Filter Menu */}
          <AnimatePresence>
            {showFilterMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full mt-2 left-0 min-w-[200px] rounded-2xl overflow-hidden z-50 glass-card"
                style={{
                  background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(26, 26, 26, 0.95)',
                  backdropFilter: 'blur(40px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                  border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: theme === 'light' ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="p-3">
                  <div className="text-xs font-semibold mb-2 px-2" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)' }}>CATEGORIES</div>
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl mb-1 transition-all"
                      style={{
                        background: selectedCategories.includes(category)
                          ? (theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(96, 165, 250, 0.2)')
                          : 'transparent',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: CATEGORY_COLORS[category] || '#9CA3AF' }}
                        />
                        <span className="text-sm" style={{ color: textColor }}>{category}</span>
                      </div>
                      {selectedCategories.includes(category) && (
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: theme === 'light' ? '#3B82F6' : '#60A5FA' }} />
                      )}
                    </motion.button>
                  ))}
                  {selectedCategories.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCategories([])}
                      className="w-full mt-2 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{ background: 'rgba(248, 113, 113, 0.2)', color: '#F87171' }}
                    >
                      Clear All
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Button */}
        <div className="relative flex-1" ref={sortMenuRef}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="w-full flex items-center justify-between px-4 h-10 rounded-xl text-sm font-medium transition-all"
            style={{
              background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.8)',
              backdropFilter: 'blur(40px) saturate(120%)',
              WebkitBackdropFilter: 'blur(40px) saturate(120%)',
              border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: textColor,
            }}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" style={{ color: theme === 'light' ? '#3B82F6' : '#60A5FA' }} />
              <span className="truncate">
                {SORT_OPTIONS.find(opt => opt.value === sortBy)?.label || 'Sort'}
              </span>
            </div>
            {showSortMenu ? <ChevronUp className="w-4 h-4" style={{ color: textColor }} /> : <ChevronDown className="w-4 h-4" style={{ color: textColor }} />}
          </motion.button>

          {/* Sort Menu */}
          <AnimatePresence>
            {showSortMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full mt-2 left-0 right-0 rounded-2xl overflow-hidden z-50 glass-card"
                style={{
                  background: theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(26, 26, 26, 0.95)',
                  backdropFilter: 'blur(40px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                  border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: theme === 'light' ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 8px 32px rgba(0, 0, 0, 0.5)',
                }}
              >
                <div className="p-3">
                  {SORT_OPTIONS.map((option) => (
                    <motion.button
                      key={option.value}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSortBy(option.value as SortOption);
                        setShowSortMenu(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all"
                      style={{
                        background: sortBy === option.value
                          ? (theme === 'light' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(96, 165, 250, 0.2)')
                          : 'transparent',
                        color: sortBy === option.value ? (theme === 'light' ? '#3B82F6' : '#60A5FA') : textColor,
                      }}
                    >
                      <span className="text-sm">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-4 mb-4"
      >
        <ViewToggle view={view} onViewChange={setView} />
      </motion.div>

      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-center py-2"
          >
            <RefreshCw className="w-5 h-5 animate-spin" style={{ color: theme === 'light' ? '#3B82F6' : '#60A5FA' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="px-4 relative"
        style={{ perspective: '1000px', minHeight: '400px' }}
      >
        <AnimatePresence mode="wait">
          {view === 'calendar' ? (
            <motion.div
              key="calendar"
              initial={{ rotateY: -90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: 90, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              <CalendarView dates={filteredAndSortedDates} />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              <ListView dates={filteredAndSortedDates} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl z-40"
        style={{
          background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
          boxShadow: '0 8px 32px rgba(96, 165, 250, 0.5)',
        }}
        aria-label="Add date"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={3} />
      </motion.button>

      {/* Keyboard Shortcuts Helper */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 left-4 px-3 py-2 rounded-lg text-xs text-white/40 pointer-events-none z-30"
        style={{
          background: 'rgba(26, 26, 26, 0.6)',
          backdropFilter: 'blur(20px)',
        }}
      >
        Press <span className="font-mono text-white/60">/</span> to search, <span className="font-mono text-white/60">Cmd+N</span> to add
      </motion.div>

      {/* Add Important Date Modal */}
      <AddImportantDateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          fetchDates();
          window.dispatchEvent(new CustomEvent('refreshDates'));
        }}
        initialDate={searchParams.get('date') || undefined}
      />
      </div>
    </>
  );
}
