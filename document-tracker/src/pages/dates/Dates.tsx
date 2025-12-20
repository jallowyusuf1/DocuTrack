import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, XCircle, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { dateService } from '../../services/dateService';
import { useDebounce } from '../../hooks/useDebounce';
import type { ImportantDate } from '../../types';
import CalendarView from '../../components/dates/CalendarView';
import ListView from '../../components/dates/ListView';
import ViewToggle from '../../components/dates/ViewToggle';
import Button from '../../components/ui/Skeleton';
import Skeleton from '../../components/ui/Skeleton';
import BackButton from '../../components/ui/BackButton';

export default function Dates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter dates by search query
  const filteredDates = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return dates;
    }

    const query = debouncedSearchQuery.toLowerCase();
    return dates.filter((date) => {
      const titleMatch = date.title.toLowerCase().includes(query);
      const descriptionMatch = date.description?.toLowerCase().includes(query);
      const categoryMatch = date.category?.toLowerCase().includes(query);
      return titleMatch || descriptionMatch || categoryMatch;
    });
  }, [dates, debouncedSearchQuery]);

  // Fetch all important dates
  const fetchDates = async (showRefreshing = false) => {
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
      // Clear error on successful fetch (even if empty)
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch important dates:', err);
      // Only show error for non-table-not-found errors
      // Table not found errors are handled gracefully by returning empty array
      if (!err.message?.includes('not found') && !err.code?.includes('PGRST')) {
        setError('Failed to load important dates. Please try again.');
      } else {
        // Table doesn't exist - show empty state instead of error
        setDates([]);
        setError(null);
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDates();
  }, [user]);

  // Listen for refresh events (when adding new important date)
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
  }, [user]);

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

  // Loading skeleton
  if (loading && dates.length === 0) {
    return (
      <div className="pb-[72px] min-h-screen">
        {/* Header */}
        <div className="px-5 py-4">
          <h1 className="text-2xl font-bold text-white mb-1">Important Dates</h1>
          <p className="text-sm text-glass-secondary">Track your important dates and reminders</p>
        </div>

        {/* View Toggle Skeleton */}
        <div className="px-4 mb-4">
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        {/* Content Skeleton */}
        <div className="px-4 space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && dates.length === 0) {
    return (
      <div className="pb-[72px] min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dates</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => fetchDates()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[72px] min-h-screen">
      {/* Header */}
      <div className="px-5 py-4">
        <div className="mb-4">
          <BackButton to="/dashboard" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Important Dates</h1>
        <p className="text-sm text-glass-secondary">Track your important dates and reminders</p>
      </div>

      {/* Search Bar */}
      <div className="px-4 pt-2 pb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 z-10"
            style={{
              color: '#A78BFA',
              filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.5))',
            }}
          />
          <input
            type="text"
            placeholder="Search important dates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[50px] pl-12 pr-12 rounded-2xl text-white transition-all duration-200"
            style={{
              background: 'rgba(35, 29, 51, 0.6)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '15px',
            }}
            onFocus={(e) => {
              if (e.currentTarget) {
                e.currentTarget.style.border = '1px solid rgba(139, 92, 246, 0.5)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
              }
            }}
            onBlur={(e) => {
              if (e.currentTarget) {
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
          <style>{`
            input::placeholder {
              color: #A78BFA;
              opacity: 0.7;
            }
          `}</style>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all z-10"
              style={{
                background: 'rgba(35, 29, 51, 0.5)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
        {debouncedSearchQuery && filteredDates.length > 0 && (
          <p className="text-xs mt-2 px-1" style={{ color: '#A78BFA' }}>
            {filteredDates.length} result{filteredDates.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* View Toggle */}
      <div className="px-4 mb-4">
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-2">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      )}

      {/* Content Area with Page Flip Animation */}
      <div
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
              <CalendarView
                dates={filteredDates}
              />
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
              <ListView
                dates={filteredDates}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Note: Mark Renewed Modal removed - not needed for important dates */}
      {/* {isModalOpen && selectedDocument && (
        <MarkRenewedModal
          document={selectedDocument}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDocument(null);
          }}
          onSave={handleConfirmRenew}
        />
      )} */}
    </div>
  );
}
