import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { documentService } from '../../services/documents';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import { staggerContainer, staggerItem, fadeInUp, getTransition, transitions } from '../../utils/animations';
import { 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Search, 
  ChevronRight
} from 'lucide-react';
import DashboardDocumentCard from '../../components/documents/DashboardDocumentCard';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { LiquidPill, LiquidGlowDot } from '../../components/ui/liquid';

interface DocumentStats {
  total: number;
  onTimeRate: number;
  urgent: number;
  soon: number;
  upcoming: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    onTimeRate: 100,
    urgent: 0,
    soon: 0,
    upcoming: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);

  // Calculate urgency counts
  const urgentCount = documents.filter(
    (doc) => getDaysUntil(doc.expiration_date) >= 0 && getDaysUntil(doc.expiration_date) <= 7
  ).length;
  const soonCount = documents.filter(
    (doc) => {
      const days = getDaysUntil(doc.expiration_date);
      return days > 7 && days <= 30;
    }
  ).length;
  const upcomingCount = documents.filter(
    (doc) => {
      const days = getDaysUntil(doc.expiration_date);
      return days > 30 && days <= 60;
    }
  ).length;

  // Fetch all data
  const fetchData = async (showRefreshing = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      // Fetch all documents for urgency calculations
      const allDocs = await documentService.getAllDocuments(user.id);
      
      // Fetch stats
      const documentStats = await documentService.getDocumentStats(user.id);

      // Filter documents expiring soon (include recently expired so they stand out)
      const expiringDocs = allDocs.filter(doc => {
        const days = getDaysUntil(doc.expiration_date);
        return days >= -30 && days <= 60;
      });

      // Sort by days remaining (most urgent first)
      const sortedDocs = expiringDocs.sort((a, b) => {
        const daysA = getDaysUntil(a.expiration_date);
        const daysB = getDaysUntil(b.expiration_date);
        return daysA - daysB;
      });

      setDocuments(sortedDocs);
      setStats(documentStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setIsLoading(false);
      setDocuments([]);
    }
  }, [user]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (user && isOnline) {
      autoRefreshInterval.current = setInterval(() => {
        fetchData(true);
      }, 60000); // 60 seconds

      return () => {
        if (autoRefreshInterval.current) {
          clearInterval(autoRefreshInterval.current);
        }
      };
    }
  }, [user, isOnline]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('refreshDashboard', handleRefresh);
    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, []);

  // Search keyboard behavior
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
      // Cmd+K / Ctrl+K opens search
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen(true);
        window.setTimeout(() => searchInputRef.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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
      fetchData(true);
    }
    pullStartY.current = 0;
    pullDistance.current = 0;
  };


  // Handle urgency card click - navigate to filtered documents
  const handleUrgencyCardClick = (minDays: number, maxDays: number) => {
    // Map to urgency filter values used by Documents page
    let urgencyFilter = 'all';
    if (minDays === 0 && maxDays === 7) {
      urgencyFilter = 'urgent';
    } else if (minDays === 8 && maxDays === 30) {
      urgencyFilter = 'soon';
    } else if (minDays === 31 && maxDays === 60) {
      urgencyFilter = 'upcoming';
    }
    navigate(`/documents?urgency=${urgencyFilter}`);
  };

  const urgencyGlow = (kind: 'urgent' | 'soon' | 'upcoming') => {
    if (kind === 'urgent') return '#FF453A';
    if (kind === 'soon') return '#FF9F0A';
    return '#FFD60A';
  };

  // Loading skeleton
  if (isLoading && documents.length === 0 && user) {
    return (
      <div className="pb-[72px] min-h-screen">
        <div className="px-4 md:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 md:max-w-[1024px] md:mx-auto">
          {/* Hero Text Skeleton */}
          <div className="mb-8 md:mb-12 text-center">
            <Skeleton className="h-12 md:h-16 w-3/4 max-w-2xl mx-auto mb-4 rounded-lg bg-white/10" />
            <Skeleton className="h-6 md:h-8 w-2/3 max-w-xl mx-auto rounded-lg bg-white/10" />
          </div>

          {/* Greeting Skeleton */}
          <div className="mb-6 md:mb-8">
            <Skeleton className="h-8 w-48 mb-2 rounded-lg bg-white/10" />
            <Skeleton className="h-6 w-64 rounded-lg bg-white/10" />
          </div>

          {/* Urgency Cards Skeleton */}
          <div className="mb-6 md:mb-8">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <Skeleton className="h-[100px] md:h-[140px] rounded-2xl bg-white/10" />
              <Skeleton className="h-[100px] md:h-[140px] rounded-2xl bg-white/10" />
              <Skeleton className="h-[100px] md:h-[140px] rounded-2xl bg-white/10" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="mb-6 md:mb-8">
            <Skeleton className="h-32 rounded-2xl bg-white/10" />
          </div>

          {/* Recent Documents Skeleton */}
          <div className="mb-6">
            <Skeleton className="h-6 w-32 mb-4 rounded-lg bg-white/10" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 md:h-28 rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && documents.length === 0) {
    return (
      <div className="pb-[72px] min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center glass-card-primary p-8 max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={() => fetchData()}>
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  // Offline banner
  const showOfflineBanner = !isOnline;

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => {
      const name = d.document_name?.toLowerCase?.() ?? '';
      const type = d.document_type?.toLowerCase?.() ?? '';
      return name.includes(q) || type.includes(q);
    });
  }, [documents, searchQuery]);

  return (
    <div className="pb-[72px] min-h-screen liquid-dashboard-bg">

      {/* Offline Banner */}
      {showOfflineBanner && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-red-500/90 backdrop-blur-lg text-white text-center py-2 px-4"
        >
          <div className="flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">You're offline</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchData()}
              className="ml-2 text-white hover:text-white/80"
            >
              Retry
            </Button>
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 px-4 md:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 md:max-w-[1024px] md:mx-auto"
      >
        {/* Header capsule */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="mb-6 md:mb-8">
          <LiquidPill className="px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="min-w-0">
                <div
                  className="text-white font-semibold text-xl md:text-2xl truncate"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                    letterSpacing: '-0.24px',
                  }}
                >
                  Expiring Soon
                </div>
                <div className="text-sm text-white/70">
                  {documents.length === 0
                    ? 'No expiring items in the next 60 days'
                    : `${documents.length} item${documents.length !== 1 ? 's' : ''} in the next 60 days`}
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <AnimatePresence mode="wait" initial={false}>
                  {!isSearchOpen ? (
                    <motion.button
                      key="search-icon"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.16 }}
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(true);
                        window.setTimeout(() => searchInputRef.current?.focus(), 0);
                      }}
                      className="glass-pill w-11 h-11 flex items-center justify-center relative"
                      aria-label="Search expiring items"
                      title="Search"
                    >
                      <Search className="w-5 h-5 text-white/90 relative" />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="search-tab"
                      initial={{ opacity: 0, width: 56 }}
                      animate={{ opacity: 1, width: 320 }}
                      exit={{ opacity: 0, width: 56 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="glass-pill h-11 flex items-center gap-3 px-4 overflow-hidden"
                    >
                      <Search className="w-5 h-5 text-white/80 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search expiring items…"
                        className="bg-transparent outline-none text-white placeholder:text-white/45 text-sm flex-1 min-w-0"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-8 h-8 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center"
                        aria-label="Close search"
                        title="Close"
                      >
                        <span className="text-lg leading-none">×</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </LiquidPill>
        </motion.div>

        {/* Urgency Capsules */}
        {(urgentCount > 0 || soonCount > 0 || upcomingCount > 0) && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mb-6 md:mb-8 grid grid-cols-3 gap-4 md:gap-6">
            {[
              { key: 'urgent' as const, label: 'URGENT', value: urgentCount, range: [0, 7] as const },
              { key: 'soon' as const, label: 'SOON', value: soonCount, range: [8, 30] as const },
              { key: 'upcoming' as const, label: 'UPCOMING', value: upcomingCount, range: [31, 60] as const },
            ].map((c) => (
              <motion.div key={c.key} variants={staggerItem}>
                <LiquidPill
                  interactive
                  className="px-3 py-3 md:px-4 md:py-4"
                  onClick={() => handleUrgencyCardClick(c.range[0], c.range[1])}
                  style={{
                    background:
                      c.key === 'upcoming'
                        ? `color-mix(in srgb, ${urgencyGlow(c.key)} 6%, rgba(255,255,255,0.04))`
                        : `color-mix(in srgb, ${urgencyGlow(c.key)} 8%, rgba(255,255,255,0.05))`,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 24px color-mix(in srgb, ${urgencyGlow(c.key)} 15%, transparent), inset 0 1px 0 rgba(255,255,255,0.1)`,
                    border: 'none',
                    outline: 'none',
                  }}
                >
                  <div className="relative flex items-center justify-center text-center">
                    <div className="min-w-0">
                      <div className="text-white/70 text-[10px] md:text-[11px] font-semibold tracking-[0.18em]">
                        {c.label}
                      </div>
                      <div className="text-white text-2xl md:text-3xl font-bold mt-1.5" style={{ letterSpacing: '-0.04em' }}>
                        {c.value}
                      </div>
                    </div>
                    <LiquidGlowDot
                      color={urgencyGlow(c.key)}
                      size={c.key === 'urgent' ? 16 : 14}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </LiquidPill>
              </motion.div>
            ))}
          </motion.div>
        )}


        {/* Pull to Refresh Indicator */}
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center py-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-6 h-6 rounded-full border-2 border-purple-500 border-t-transparent"
            />
          </motion.div>
        )}

        {/* Expiring Soon (scrollable list) */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold text-white">Expiring Soon</h2>
            {documents.length > 0 && (
              <button
                onClick={() => navigate('/documents')}
                className="text-sm text-white/70 hover:text-white flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredDocuments.length === 0 ? (
            // Empty State
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="text-center"
            >
              <LiquidPill className="px-6 py-10 max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-[22px] mx-auto mb-5 flex items-center justify-center"
                  style={{
                    // clear/dark glass (no milky white)
                    background: 'rgba(0,0,0,0.20)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                  }}
                >
                  <Plus className="w-8 h-8 text-white/85" />
                </div>
                <h3 className="text-white text-2xl font-bold mb-2">
                  {searchQuery.trim() ? 'No matches found' : 'You’re all caught up'}
                </h3>
                <p className="text-white/65 text-sm mb-6 max-w-md mx-auto">
                  {searchQuery.trim()
                    ? 'Try a different keyword or clear your search.'
                    : 'Nothing is expiring soon. When something approaches its deadline, it will show up here.'}
                </p>
                {searchQuery.trim() ? (
                  <Button variant="secondary" onClick={() => setSearchQuery('')} className="inline-flex items-center gap-2">
                    Clear search
                  </Button>
                ) : (
                  <Button variant="primary" onClick={() => navigate('/add-document')} className="inline-flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add
                  </Button>
                )}
              </LiquidPill>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-4 md:space-y-6 max-h-[420px] overflow-y-auto pr-1"
            >
              {filteredDocuments.map((document) => (
                <motion.div
                  key={document.id}
                  variants={staggerItem}
                  className="relative"
                >
                  <DashboardDocumentCard document={document} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
