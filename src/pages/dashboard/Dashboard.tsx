import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { documentService } from '../../services/documents';
import { getUnreadCount } from '../../services/notifications';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import { staggerContainer, staggerItem, fadeInUp, getTransition, transitions } from '../../utils/animations';
import { 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Search, 
  Bell, 
  Share2,
  Trash2,
  ChevronRight
} from 'lucide-react';
import UrgencySummaryCard from '../../components/documents/UrgencySummaryCard';
import DashboardDocumentCard from '../../components/documents/DashboardDocumentCard';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

interface DocumentStats {
  total: number;
  onTimeRate: number;
  urgent: number;
  soon: number;
  upcoming: number;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOnline } = useOnlineStatus();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    onTimeRate: 100,
    urgent: 0,
    soon: 0,
    upcoming: 0,
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [swipedDocumentId, setSwipedDocumentId] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);
  const autoRefreshInterval = useRef<NodeJS.Timeout | null>(null);
  const swipeStartX = useRef<number>(0);
  const swipeCurrentX = useRef<number>(0);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get user name from profile or email
  const getUserName = () => {
    // In a real app, you'd fetch from user_profiles table
    return user?.email?.split('@')[0] || 'there';
  };

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
      
      // Fetch recent documents (limit 4, sorted by created_at DESC)
      const recent = await documentService.getRecentDocuments(user.id, 4);
      
      // Fetch stats
      const documentStats = await documentService.getDocumentStats(user.id);
      
      // Fetch unread notification count
      const unread = await getUnreadCount(user.id);

      // Filter documents expiring in next 60 days for urgency cards
      const expiringDocs = allDocs.filter(doc => {
        const days = getDaysUntil(doc.expiration_date);
        return days >= 0 && days <= 60;
      });

      // Sort by days remaining (most urgent first)
      const sortedDocs = expiringDocs.sort((a, b) => {
        const daysA = getDaysUntil(a.expiration_date);
        const daysB = getDaysUntil(b.expiration_date);
        return daysA - daysB;
      });

      setDocuments(sortedDocs);
      setRecentDocuments(recent);
      setStats(documentStats);
      setUnreadCount(unread);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('Error fetching data:', err);
      setDocuments([]);
      setRecentDocuments([]);
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
      setRecentDocuments([]);
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

  // Swipe handlers for mobile/tablet
  const handleSwipeStart = (e: React.TouchEvent, documentId: string) => {
    swipeStartX.current = e.touches[0].clientX;
    swipeCurrentX.current = swipeStartX.current;
  };

  const handleSwipeMove = (e: React.TouchEvent, documentId: string) => {
    if (swipeStartX.current === 0) return;
    swipeCurrentX.current = e.touches[0].clientX;
    const deltaX = swipeCurrentX.current - swipeStartX.current;
    
    if (deltaX < -50) {
      setSwipedDocumentId(documentId);
    } else if (deltaX > 50) {
      setSwipedDocumentId(null);
    }
  };

  const handleSwipeEnd = () => {
    swipeStartX.current = 0;
    swipeCurrentX.current = 0;
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

  // Handle document share
  const handleShare = async (document: Document) => {
    setSwipedDocumentId(null);
    // Implement share functionality
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.document_name,
          text: `Check out my ${document.document_type}`,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  // Handle document delete
  const handleDelete = async (document: Document) => {
    if (!user) return;
    setSwipedDocumentId(null);
    
    if (window.confirm(`Are you sure you want to delete "${document.document_name}"?`)) {
      try {
        await documentService.deleteDocument(document.id, user.id);
        await fetchData();
      } catch (err) {
        console.error('Error deleting document:', err);
        alert('Failed to delete document');
      }
    }
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
  if (error && documents.length === 0 && recentDocuments.length === 0) {
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

  return (
    <div className="pb-[72px] min-h-screen relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, rgba(139, 92, 246, 0) 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full blur-[80px] opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0) 70%)',
            transform: 'translate(50%, 50%)',
          }}
        />
      </div>

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
        {/* Hero Text Section */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={fadeInUp}
          className="mb-8 md:mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4" style={{
            fontFamily: 'SF Pro Display, -apple-system, sans-serif',
            letterSpacing: '-0.5px',
            textShadow: '0 4px 20px rgba(139, 92, 246, 0.5)',
          }}>
            Never miss another deadline
          </h1>
          <p className="text-lg md:text-xl text-glass-secondary max-w-2xl mx-auto">
            Track every document. Get reminded automatically. Simple, secure, and beautifully designed.
          </p>
        </motion.div>

        {/* Header with Greeting and Actions */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-1">
                {getGreeting()}, {getUserName()}!
              </h2>
              <p className="text-sm md:text-base text-glass-secondary">
                {stats.total === 0 
                  ? 'No documents yet'
                  : `${stats.total} document${stats.total !== 1 ? 's' : ''} tracked`}
              </p>
            </div>

            {/* Mobile: Action Icons */}
            <div className="md:hidden flex items-center gap-3 ml-auto">
              <button
                onClick={() => navigate('/search')}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20"
              >
                <Search className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => navigate('/notifications')}
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center border border-white/20 relative"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Urgency Summary Cards - Clickable */}
        {(urgentCount > 0 || soonCount > 0 || upcomingCount > 0) && (
          <div className="mb-6 md:mb-8">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-3 gap-3 md:gap-4"
            >
              <motion.div variants={staggerItem}>
                <button
                  onClick={() => handleUrgencyCardClick(0, 7)}
                  className="w-full"
                >
                  <UrgencySummaryCard
                    count={urgentCount}
                    label="URGENT"
                    bgColor=""
                    textColor="text-red-500"
                    iconColor="text-red-400"
                  />
                </button>
              </motion.div>
              <motion.div variants={staggerItem}>
                <button
                  onClick={() => handleUrgencyCardClick(8, 30)}
                  className="w-full"
                >
                  <UrgencySummaryCard
                    count={soonCount}
                    label="SOON"
                    bgColor=""
                    textColor="text-orange-500"
                    iconColor="text-orange-400"
                  />
                </button>
              </motion.div>
              <motion.div variants={staggerItem}>
                <button
                  onClick={() => handleUrgencyCardClick(31, 60)}
                  className="w-full"
                >
                  <UrgencySummaryCard
                    count={upcomingCount}
                    label="UPCOMING"
                    bgColor=""
                    textColor="text-yellow-500"
                    iconColor="text-yellow-400"
                  />
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Stats Section */}
        {stats.total > 0 && (
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
            className="mb-6 md:mb-8 glass-card-primary rounded-2xl p-4 md:p-6"
          >
            <h2 className="text-lg md:text-xl font-bold text-white mb-4">Statistics</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.total}</div>
                <div className="text-xs md:text-sm text-glass-secondary">Total Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stats.onTimeRate}%</div>
                <div className="text-xs md:text-sm text-glass-secondary">On-Time Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                  {Math.round((stats.total * 0.5) / 1024)}MB
                </div>
                <div className="text-xs md:text-sm text-glass-secondary">Storage Used</div>
              </div>
            </div>
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

        {/* Recent Documents Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-white">Recent Documents</h2>
            {recentDocuments.length > 0 && (
              <button
                onClick={() => navigate('/documents')}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {recentDocuments.length === 0 ? (
            // Empty State
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="glass-card-elevated rounded-3xl p-12 flex flex-col items-center justify-center"
            >
              <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center mb-6">
                <Plus className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Documents Yet</h2>
              <p className="text-sm text-glass-secondary text-center mb-6">
                Start tracking your documents to never miss a deadline
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/add-document')}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Expiring Item
              </Button>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="space-y-3 md:space-y-4"
            >
              {recentDocuments.map((document) => (
                <motion.div
                  key={document.id}
                  variants={staggerItem}
                  className="relative"
                >
                  {/* Swipe Actions (Mobile/Tablet) */}
                  <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-4 z-10">
                    <AnimatePresence>
                      {swipedDocumentId === document.id && (
                        <>
                          <motion.button
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            onClick={() => handleShare(document)}
                            className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center"
                          >
                            <Share2 className="w-5 h-5 text-white" />
                          </motion.button>
                          <motion.button
                            initial={{ x: 50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 50, opacity: 0 }}
                            onClick={() => handleDelete(document)}
                            className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center"
                          >
                            <Trash2 className="w-5 h-5 text-white" />
                          </motion.button>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Document Card */}
                  <div
                    onTouchStart={(e) => handleSwipeStart(e, document.id)}
                    onTouchMove={(e) => handleSwipeMove(e, document.id)}
                    onTouchEnd={handleSwipeEnd}
                    style={{
                      transform: swipedDocumentId === document.id ? 'translateX(-120px)' : 'translateX(0)',
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    <DashboardDocumentCard document={document} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
