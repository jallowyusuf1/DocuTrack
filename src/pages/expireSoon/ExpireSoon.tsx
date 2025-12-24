import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { documentService } from '../../services/documents';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import { staggerContainer, staggerItem, fadeInUp } from '../../utils/animations';
import { AlertCircle, ChevronRight, Plus, Search } from 'lucide-react';
import DashboardDocumentCard from '../../components/documents/DashboardDocumentCard';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { LiquidGlowDot, LiquidPill } from '../../components/ui/liquid';

interface DocumentStats {
  total: number;
  onTimeRate: number;
  urgent: number;
  soon: number;
  upcoming: number;
}

export default function ExpireSoon() {
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
  const soonCount = documents.filter((doc) => {
    const days = getDaysUntil(doc.expiration_date);
    return days > 7 && days <= 30;
  }).length;
  const upcomingCount = documents.filter((doc) => {
    const days = getDaysUntil(doc.expiration_date);
    return days > 30 && days <= 60;
  }).length;

  const urgencyGlow = (kind: 'urgent' | 'soon' | 'upcoming') => {
    if (kind === 'urgent') return '#FF453A';
    if (kind === 'soon') return '#FF9F0A';
    return '#FFD60A';
  };

  // Fetch all data (expire_soon scope only)
  const fetchData = async (showRefreshing = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      if (showRefreshing) setIsRefreshing(true);
      else setIsLoading(true);

      setError(null);

      const allDocs = await documentService.getAllDocuments(user.id, 'expire_soon');
      const documentStats = await documentService.getDocumentStats(user.id, 'expire_soon');

      // Expiring window: include recently expired so it’s obvious
      const expiringDocs = allDocs.filter((doc) => {
        const days = getDaysUntil(doc.expiration_date);
        return days >= -30 && days <= 60;
      });

      expiringDocs.sort((a, b) => getDaysUntil(a.expiration_date) - getDaysUntil(b.expiration_date));

      setDocuments(expiringDocs);
      setStats(documentStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching Expire Soon:', err);
      setDocuments([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (user) fetchData();
    else {
      setIsLoading(false);
      setDocuments([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (user && isOnline) {
      autoRefreshInterval.current = setInterval(() => {
        fetchData(true);
      }, 60000);

      return () => {
        if (autoRefreshInterval.current) clearInterval(autoRefreshInterval.current);
      };
    }
  }, [user, isOnline]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => fetchData();
    window.addEventListener('refreshDashboard', handleRefresh);
    return () => window.removeEventListener('refreshDashboard', handleRefresh);
  }, []);

  // Search keyboard behavior
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
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
    if (pullDistance.current > 80) fetchData(true);
    pullStartY.current = 0;
    pullDistance.current = 0;
  };

  const filteredDocuments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => {
      const name = d.document_name?.toLowerCase?.() ?? '';
      const type = d.document_type?.toLowerCase?.() ?? '';
      return name.includes(q) || type.includes(q);
    });
  }, [documents, searchQuery]);

  // Loading skeleton
  if (isLoading && documents.length === 0 && user) {
    return (
      <div className="pb-[72px] min-h-screen liquid-dashboard-bg">
        <div className="px-4 md:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 md:max-w-[1024px] md:mx-auto">
          <div className="mb-6">
            <Skeleton className="h-16 rounded-3xl bg-white/10" />
          </div>
          <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6">
            <Skeleton className="h-[110px] rounded-3xl bg-white/10" />
            <Skeleton className="h-[110px] rounded-3xl bg-white/10" />
            <Skeleton className="h-[110px] rounded-3xl bg-white/10" />
          </div>
          <Skeleton className="h-24 rounded-3xl bg-white/10 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-3xl bg-white/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && documents.length === 0) {
    return (
      <div className="pb-[72px] min-h-screen flex items-center justify-center px-4 liquid-dashboard-bg">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center p-8 max-w-md rounded-2xl"
          style={{
            // Frosted tile glass - matte, blurred
            background: 'rgba(42, 38, 64, 0.4)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <Button variant="primary" onClick={() => fetchData()}>
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-[72px] min-h-screen liquid-dashboard-bg">
      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 px-4 md:px-6 lg:px-8 pt-12 md:pt-16 lg:pt-20 md:max-w-[1024px] md:mx-auto"
      >
        {/* Header */}
        <motion.div initial="initial" animate="animate" variants={fadeInUp} className="mb-6 md:mb-8">
          <div
            className="rounded-2xl px-5 py-4"
            style={{
              // Frosted tile glass - matte, blurred
              background: 'rgba(42, 38, 64, 0.4)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="min-w-0">
                <div
                  className="text-white font-semibold text-xl md:text-2xl truncate"
                  style={{ fontFamily: 'SF Pro Display, -apple-system, sans-serif', letterSpacing: '-0.24px' }}
                >
                  Expiring Soon
                </div>
                <div className="text-sm text-white/70">
                  {documents.length === 0 ? 'No items expiring in the next 60 days' : `You have ${documents.length} item${documents.length !== 1 ? 's' : ''} expiring soon`}
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
                      className="w-11 h-11 flex items-center justify-center relative rounded-xl"
                      style={{
                        background: 'rgba(42, 38, 64, 0.4)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      }}
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
                      className="h-11 flex items-center gap-3 px-4 overflow-hidden rounded-xl"
                      style={{
                        background: 'rgba(42, 38, 64, 0.4)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      }}
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

                <button
                  type="button"
                  onClick={() => navigate('/add-document?scope=expire_soon')}
                  className="w-11 h-11 flex items-center justify-center relative rounded-xl"
                  style={{
                    background: 'rgba(42, 38, 64, 0.4)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  }}
                  aria-label="Add expiring item"
                  title="Add"
                >
                  <Plus className="w-5 h-5 text-white/90 relative" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Urgency pills (smaller, not touching, frosted tile glass) */}
        {(urgentCount > 0 || soonCount > 0 || upcomingCount > 0) && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mb-6 md:mb-8 grid grid-cols-3 gap-5 md:gap-6">
            {[
              { key: 'urgent' as const, label: 'URGENT', value: urgentCount, range: [0, 7] as const },
              { key: 'soon' as const, label: 'SOON', value: soonCount, range: [8, 30] as const },
              { key: 'upcoming' as const, label: 'UPCOMING', value: upcomingCount, range: [31, 60] as const },
            ].map((c) => (
              <motion.div key={c.key} variants={staggerItem}>
                <motion.div
                  onClick={() => navigate(`/documents?scope=expire_soon&expiring=1&minDays=${c.range[0]}&maxDays=${c.range[1]}`)}
                  className="rounded-2xl px-3 py-3 md:px-4 md:py-4 cursor-pointer"
                  style={{
                    // Frosted tile glass - matte, blurred, NOT milky white
                    background: `color-mix(in srgb, ${urgencyGlow(c.key)} 6%, rgba(42, 38, 64, 0.4))`,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    // Frosted tile pattern overlay
                    backgroundImage: `
                      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative flex items-center justify-center text-center">
                    <div className="min-w-0">
                      <div className="text-white/70 text-[10px] md:text-[11px] font-semibold tracking-[0.18em]">
                        {c.label}
                      </div>
                      <div
                        className="text-white text-2xl md:text-3xl font-bold mt-1.5"
                        style={{ letterSpacing: '-0.04em' }}
                      >
                        {c.value}
                      </div>
                    </div>
                    <LiquidGlowDot
                      color={urgencyGlow(c.key)}
                      size={c.key === 'urgent' ? 14 : 12}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold text-white">Expiring Soon</h2>
            {documents.length > 0 && (
              <button
                onClick={() => navigate('/documents?scope=expire_soon&expiring=1')}
                className="text-sm text-white/70 hover:text-white flex items-center gap-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredDocuments.length === 0 ? (
            <motion.div initial="initial" animate="animate" variants={fadeInUp} className="text-left">
              <div
                className="rounded-3xl p-6 md:p-7"
                style={{
                  // Frosted tile glass - matte, blurred
                  background: 'rgba(42, 38, 64, 0.4)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  backgroundImage: `
                    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      // Frosted tile glass - matte, blurred
                      background: 'rgba(42, 38, 64, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px) saturate(180%)',
                      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    }}
                  >
                    <Plus className="w-6 h-6 text-white/85" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white text-xl md:text-2xl font-bold">
                      {searchQuery.trim() ? 'No matches found' : 'You’re all caught up'}
                    </div>
                    <div className="text-white/60 text-sm mt-1">
                      {searchQuery.trim()
                        ? 'Try a different keyword or clear your search.'
                        : 'Nothing is expiring soon. When something approaches its deadline, it will show up here.'}
                    </div>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    {searchQuery.trim() ? (
                      <Button variant="secondary" onClick={() => setSearchQuery('')}>
                        Clear search
                      </Button>
                    ) : (
                      <Button variant="primary" onClick={() => navigate('/add-document?scope=expire_soon')} className="inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3 md:space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {filteredDocuments.map((document) => (
                <motion.div key={document.id} variants={staggerItem} className="relative">
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


