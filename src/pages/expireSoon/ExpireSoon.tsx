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
import { useTheme } from '../../contexts/ThemeContext';
import StatCard from '../../components/ui/StatCard';
import { FileText, Clock, AlertTriangle } from 'lucide-react';

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
  const { theme } = useTheme();

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

      // Expiring window: include recently expired so it's obvious
      // Also include documents from dashboard scope that are expiring (not just expire_soon scope)
      let expiringDocs = allDocs.filter((doc) => {
        const days = getDaysUntil(doc.expiration_date);
        // Show documents expiring within 60 days OR recently expired (within 30 days)
        return days >= -30 && days <= 60;
      });
      
      // Also fetch documents from dashboard scope that are expiring
      try {
        const dashboardDocs = await documentService.getAllDocuments(user.id, 'dashboard');
        const dashboardExpiring = dashboardDocs.filter((doc) => {
          const days = getDaysUntil(doc.expiration_date);
          return days >= -30 && days <= 60;
        });
        // Merge and deduplicate by ID
        const allExpiring = [...expiringDocs, ...dashboardExpiring];
        const uniqueExpiring = Array.from(
          new Map(allExpiring.map(doc => [doc.id, doc])).values()
        );
        expiringDocs = uniqueExpiring;
      } catch (err) {
        console.warn('Failed to fetch dashboard documents for expiring soon:', err);
        // Continue with just expire_soon scope documents
      }

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
      <div className="pb-[72px] blue-wave-bg">
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
      <div className="pb-[72px] flex items-center justify-center px-4 liquid-dashboard-bg">
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="text-center p-8 max-w-md rounded-2xl"
          style={{
            // Dark glass - black & white theme
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(40px) saturate(120%)',
            WebkitBackdropFilter: 'blur(40px) saturate(120%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
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

  const bgColor = theme === 'light' ? '#FFFFFF' : '#000000';
  const textColor = theme === 'light' ? '#000000' : '#FFFFFF';

  return (
    <div className="pb-[72px] min-h-screen" style={{ background: bgColor, color: textColor }}>
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
            className="rounded-2xl px-5 py-4 glass-card"
            style={{
              background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.8)',
              backdropFilter: 'blur(40px) saturate(120%)',
              WebkitBackdropFilter: 'blur(40px) saturate(120%)',
              border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: theme === 'light'
                ? '0 10px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                : '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="flex items-center gap-4">
              <div className="min-w-0">
                <div
                  className="font-semibold text-xl md:text-2xl truncate"
                  style={{
                    fontFamily: 'SF Pro Display, -apple-system, sans-serif',
                    letterSpacing: '-0.24px',
                    color: textColor,
                  }}
                >
                  Expiring Soon
                </div>
                <div className="text-sm" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>
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
                        background: 'rgba(26, 26, 26, 0.8)',
                        backdropFilter: 'blur(40px) saturate(120%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      }}
                      aria-label="Search expiring items"
                      title="Search"
                    >
                      <Search className="w-5 h-5 relative" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)' }} />
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
                        background: 'rgba(26, 26, 26, 0.8)',
                        backdropFilter: 'blur(40px) saturate(120%)',
                        WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      }}
                    >
                      <Search className="w-5 h-5 flex-shrink-0" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)' }} />
                      <input
                        ref={searchInputRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search expiring items…"
                        className="bg-transparent outline-none text-sm flex-1 min-w-0"
                        style={{
                          color: textColor,
                        }}
                        placeholder-color={theme === 'light' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.45)'}
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
                    background: 'rgba(26, 26, 26, 0.8)',
                    backdropFilter: 'blur(40px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
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

        {/* Stat Cards */}
        {(urgentCount > 0 || soonCount > 0 || upcomingCount > 0) && (
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="mb-6 md:mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <motion.div variants={staggerItem}>
              <StatCard
                icon={AlertTriangle}
                label="Urgent"
                value={urgentCount}
                status="expired"
                onClick={() => navigate(`/documents?scope=expire_soon&expiring=1&minDays=0&maxDays=7`)}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={Clock}
                label="Expiring Soon"
                value={soonCount}
                status="expiring"
                onClick={() => navigate(`/documents?scope=expire_soon&expiring=1&minDays=8&maxDays=30`)}
              />
                </motion.div>
            <motion.div variants={staggerItem}>
              <StatCard
                icon={FileText}
                label="Upcoming"
                value={upcomingCount}
                status="expiring"
                onClick={() => navigate(`/documents?scope=expire_soon&expiring=1&minDays=31&maxDays=60`)}
              />
              </motion.div>
          </motion.div>
        )}

        {/* List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base md:text-lg font-bold" style={{ color: textColor }}>Expiring Soon</h2>
            {documents.length > 0 && (
              <button
                onClick={() => navigate('/documents?scope=expire_soon&expiring=1')}
                className="text-sm flex items-center gap-1 transition-colors"
                style={{
                  color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = theme === 'light' ? '#000000' : '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
                }}
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredDocuments.length === 0 ? (
            <motion.div initial="initial" animate="animate" variants={fadeInUp} className="text-left">
              <div
                className="rounded-3xl p-6 md:p-7 glass-card"
                style={{
                  background: theme === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(26, 26, 26, 0.8)',
                  backdropFilter: 'blur(40px) saturate(120%)',
                  WebkitBackdropFilter: 'blur(40px) saturate(120%)',
                  border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: theme === 'light'
                    ? '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                    : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                      border: theme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  >
                    <Plus className="w-6 h-6" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.85)' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl md:text-2xl font-bold" style={{ color: textColor }}>
                      {searchQuery.trim() ? 'No matches found' : 'You're all caught up'}
                    </div>
                    <div className="text-sm mt-1" style={{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)' }}>
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
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5 md:space-y-7 max-h-[420px] overflow-y-auto pr-1">
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


