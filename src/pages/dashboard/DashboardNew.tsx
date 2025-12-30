import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Eye,
  X,
  ArrowRight,
  Folder,
  Sparkles,
  Edit,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { dateService } from '../../services/dateService';
import type { Document, ImportantDate } from '../../types';
import { getDaysUntil, getUrgencyLevel, formatDate } from '../../utils/dateUtils';
import { triggerHaptic } from '../../utils/animations';
import { useImageUrl } from '../../hooks/useImageUrl';
import Skeleton from '../../components/ui/Skeleton';
import { usePageLock } from '../../hooks/usePageLock';
import EnhancedPageLockModal from '../../components/lock/EnhancedPageLockModal';

type TabType = 'expiring' | 'dates' | 'analytics';

interface DocumentStats {
  total: number;
  expiringSoon: number;
  expired: number;
  valid: number;
}

// Animated Counter Component
function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000; // 1 second
    const increment = value / (duration / 16); // 60fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

export default function DashboardNew() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Page lock
  const { isLocked, lockType, isLoading: lockLoading, handleUnlock } = usePageLock('dashboard');

  const [activeTab, setActiveTab] = useState<TabType>('expiring');
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  
  // Lazy loading state
  const [visibleItems, setVisibleItems] = useState(4);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Filter documents by expiration date for "Expire Soon" tab
  const expiringDocuments = useMemo(() => {
    return allDocuments.filter(doc => {
      const days = getDaysUntil(doc.expiration_date);
      // Show documents expiring in next 60 days or recently expired (within 30 days)
      return days >= -30 && days <= 60;
    }).sort((a, b) => {
      const daysA = getDaysUntil(a.expiration_date);
      const daysB = getDaysUntil(b.expiration_date);
      return daysA - daysB; // Most urgent first
    });
  }, [allDocuments]);

  // Stats calculation
  const stats: DocumentStats = useMemo(() => {
    const total = allDocuments.length;
    const expiringSoon = allDocuments.filter(doc => {
      const days = getDaysUntil(doc.expiration_date);
      return days >= 0 && days <= 30;
    }).length;
    const expired = allDocuments.filter(doc => getDaysUntil(doc.expiration_date) < 0).length;
    const valid = total - expired;

    return { total, expiringSoon, expired, valid };
  }, [allDocuments]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const [docsData, datesData] = await Promise.all([
          documentService.getDocuments(user.id),
          dateService.getDates(user.id).catch(() => []),
        ]);

        setAllDocuments(docsData);
        setDates(datesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for refresh events
    const handleRefresh = () => {
      fetchData();
    };
    window.addEventListener('refreshDashboard', handleRefresh);
    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, [user]);

  // Lazy loading with intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleItems((prev) => {
            const currentTabItems = activeTab === 'expiring' 
              ? expiringDocuments.length 
              : activeTab === 'dates' 
              ? dates.length 
              : 0;
            return Math.min(prev + 4, currentTabItems);
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [activeTab, expiringDocuments.length, dates.length]);

  // Reset visible items when tab changes
  useEffect(() => {
    setVisibleItems(4);
  }, [activeTab]);

  // Tab switching
  const handleTabChange = (tab: TabType) => {
    console.log('Tab change clicked:', tab);
    triggerHaptic('light');
    setActiveTab(tab);
  };

  // Document click handler
  const handleDocumentClick = (doc: Document) => {
    triggerHaptic('medium');
    navigate(`/documents/${doc.id}`);
  };

  // Get user's display name
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  // Render loading skeleton
  if (loading) {
    return (
      <div className="pb-20 blue-wave-bg min-h-screen">
        <div className="px-5 space-y-12 pt-8">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-40 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page Lock Modal */}
      <EnhancedPageLockModal
        isOpen={isLocked}
        pageName="Dashboard"
        lockType={lockType}
        onUnlock={handleUnlock}
      />

      <div className="pb-20" style={{ minHeight: '100vh' }}>
        {/* Welcome Message - Prominent at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="px-5 pt-2 pb-6"
      >
        <div
          className="rounded-3xl p-6 mb-6"
          style={{
            background: 'rgba(26, 26, 26, 0.8)',
            backdropFilter: 'blur(40px) saturate(120%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ letterSpacing: '-0.5px', fontWeight: 700 }}>
            Welcome, {displayName} 👋
          </h1>
          <p className="text-white/70 text-base md:text-lg">You have {stats.total} document{stats.total !== 1 ? 's' : ''} in your account</p>
        </div>
      </motion.div>

      {/* Tab Navigation - Lower position */}
      <div className="flex justify-center px-5 mb-8" style={{ position: 'relative', zIndex: 10 }}>
        <div className="inline-flex" style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, margin: 0, position: 'relative', zIndex: 10 }}>
          <button
            onClick={() => handleTabChange('expiring')}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer"
            style={{
              background: activeTab === 'expiring'
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(109, 40, 217, 0.3))'
                : 'transparent',
              color: activeTab === 'expiring' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              boxShadow: activeTab === 'expiring'
                ? '0 4px 20px rgba(37, 99, 235, 0.5)'
                : 'none',
              borderBottom: activeTab === 'expiring' ? '3px solid #2563EB' : 'none',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            <Clock className="w-5 h-5" />
            Expire Soon
          </button>
          <button
            onClick={() => handleTabChange('dates')}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer"
            style={{
              background: activeTab === 'dates'
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(109, 40, 217, 0.3))'
                : 'transparent',
              color: activeTab === 'dates' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              boxShadow: activeTab === 'dates'
                ? '0 4px 20px rgba(37, 99, 235, 0.5)'
                : 'none',
              borderBottom: activeTab === 'dates' ? '3px solid #2563EB' : 'none',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            <Calendar className="w-5 h-5" />
            Important Dates
          </button>
          <button
            onClick={() => handleTabChange('analytics')}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer"
            style={{
              background: activeTab === 'analytics'
                ? 'linear-gradient(135deg, rgba(37, 99, 235, 0.3), rgba(109, 40, 217, 0.3))'
                : 'transparent',
              color: activeTab === 'analytics' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
              boxShadow: activeTab === 'analytics'
                ? '0 4px 20px rgba(37, 99, 235, 0.5)'
                : 'none',
              borderBottom: activeTab === 'analytics' ? '3px solid #2563EB' : 'none',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
          >
            <TrendingUp className="w-5 h-5" />
            Analytics
          </button>
        </div>
      </div>

      {/* Tab Content - Scrollable */}
      <div className="px-5 space-y-12">
        <AnimatePresence mode="wait">
          {/* Expire Soon Tab */}
          {activeTab === 'expiring' && (
            <motion.div
              key="expiring"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Stats Cards */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                    },
                  },
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-6 mb-12"
              >
                <StatCard
                  icon="📄"
                  label="Total"
                  value={stats.total}
                  color="#3B82F6"
                  delay={0}
                />
                <StatCard
                  icon="⏰"
                  label="Expiring Soon"
                  value={stats.expiringSoon}
                  color="#F59E0B"
                  delay={100}
                  pulse={stats.expiringSoon > 0}
                  badge={stats.expiringSoon > 0 ? "Needs attention" : undefined}
                />
                <StatCard
                  icon={stats.expired === 0 ? "✓" : "❌"}
                  label="Expired"
                  value={stats.expired}
                  color={stats.expired === 0 ? "#10B981" : "#EF4444"}
                  delay={200}
                  pulse={stats.expired > 0}
                  badge={stats.expired === 0 ? "All clear!" : undefined}
                />
                <StatCard
                  icon="✅"
                  label="Valid"
                  value={stats.valid}
                  color="#10B981"
                  delay={300}
                  badge="Great job!"
                />
              </motion.div>

              {/* Expiring Documents List */}
              <section>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-between mb-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📂</span>
                    <h2 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.5px', fontWeight: 700 }}>
                      Documents Expiring Soon
                    </h2>
                    <span className="text-white/60 text-base">({expiringDocuments.length})</span>
                  </div>
                  <button
                    onClick={() => navigate('/documents')}
                    className="text-blue-300 text-sm font-semibold hover:text-blue-200 transition-all duration-200 flex items-center gap-1 group"
                    style={{
                      textShadow: '0 0 20px rgba(96, 165, 250, 0.5)',
                    }}
                  >
                    View All
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>

                <div className="space-y-6">
                  {expiringDocuments.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(50px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '24px',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <FileText className="w-20 h-20 mx-auto text-white/30 mb-4" />
                      <p className="text-white/50 text-lg">No documents expiring soon</p>
                    </motion.div>
                  ) : (
                    <>
                      {expiringDocuments.slice(0, visibleItems).map((doc, index) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: 0.5 + index * 0.1,
                            duration: 0.5,
                            ease: "easeOut"
                          }}
                        >
                          <DocumentCard
                            document={doc}
                            onClick={() => handleDocumentClick(doc)}
                            delay={0}
                          />
                        </motion.div>
                      ))}
                      {visibleItems < expiringDocuments.length && (
                        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-white/50 text-sm"
                          >
                            Loading more...
                          </motion.div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* Important Dates Tab */}
          {activeTab === 'dates' && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <section>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between mb-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">📅</span>
                    <h2 className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.5px', fontWeight: 700 }}>
                      Important Dates
                    </h2>
                    <span className="text-white/60 text-base">({dates.length})</span>
                  </div>
                  <button
                    onClick={() => navigate('/dates')}
                    className="text-blue-300 text-sm font-semibold hover:text-blue-200 transition-all duration-200 flex items-center gap-1 group"
                    style={{
                      textShadow: '0 0 20px rgba(96, 165, 250, 0.5)',
                    }}
                  >
                    View All
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </motion.div>

                <div className="space-y-6">
                  {dates.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-20"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(50px) saturate(180%)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '24px',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                        minHeight: '300px',
                      }}
                    >
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        style={{
                          filter: 'drop-shadow(0 0 40px rgba(37, 99, 235, 0.4))',
                        }}
                        className="mb-6"
                      >
                        <Calendar className="w-32 h-32 mx-auto text-blue-300" />
                      </motion.div>
                      <p className="text-white/60 text-xl mb-2">No important dates</p>
                      <p className="text-white/60 text-base mb-8">Add reminders to track important dates</p>
                      <motion.button
                        onClick={() => navigate('/dates?add=true')}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-8 py-4 rounded-2xl font-semibold text-white text-lg transition-all duration-300"
                        style={{
                          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.8), rgba(109, 40, 217, 0.8))',
                          boxShadow: '0 8px 32px rgba(37, 99, 235, 0.4)',
                        }}
                      >
                        + Add Important Date
                      </motion.button>
                    </motion.div>
                  ) : (
                    <>
                      {dates.slice(0, visibleItems).map((date, index) => (
                        <motion.div
                          key={date.id}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: index * 0.1,
                            duration: 0.5,
                            ease: "easeOut"
                          }}
                        >
                          <DateCard date={date} delay={0} />
                        </motion.div>
                      ))}
                      {visibleItems < dates.length && (
                        <div ref={loadMoreRef} className="h-20 flex items-center justify-center">
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-white/50 text-sm"
                          >
                            Loading more...
                          </motion.div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AnalyticsTab documents={allDocuments} stats={stats} />
          )}
        </AnimatePresence>
      </div>

      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <DocumentPreviewModal
            document={previewDoc}
            onClose={() => setPreviewDoc(null)}
          />
        )}
      </AnimatePresence>
    </div>
    </>
  );
}

// Enhanced Stat Card Component
function StatCard({ icon, label, value, color, delay = 0, pulse = false, badge }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000 }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-6 rounded-3xl cursor-pointer relative overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(50px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: `0 12px 40px rgba(0, 0, 0, 0.5), 0 0 40px ${color}40, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      }}
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at top left, ${color}, transparent)`,
        }}
      />

      {/* Icon in top-left */}
      <div className="absolute top-4 left-4 text-4xl" style={{ filter: `drop-shadow(0 0 20px ${color}60)` }}>
        {pulse ? (
          <motion.span
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {icon}
          </motion.span>
        ) : (
          icon
        )}
      </div>

      {badge && (
        <div
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: label === 'Expired' && value === 0
              ? 'rgba(16, 185, 129, 0.3)'
              : 'rgba(239, 68, 68, 0.3)',
            color: label === 'Expired' && value === 0 ? '#10B981' : '#EF4444',
            border: `1px solid ${label === 'Expired' && value === 0 ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
          }}
        >
          {badge}
        </div>
      )}

      <div className="relative pt-12">
        <div className="text-sm font-bold text-white/80 uppercase tracking-wide mb-3">{label}</div>
        <div className="text-5xl font-extrabold text-white mb-2" style={{ letterSpacing: '-1px', fontWeight: 800 }}>
          <AnimatedCounter value={value} />
        </div>
        <div className="text-xs text-white/50 flex items-center gap-1">
          View all <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  );
}

// Enhanced Document Card Component
function DocumentCard({ document, onClick, delay = 0 }: { document: Document; onClick: () => void; delay: number }) {
  const daysUntil = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);
  const { signedUrl: imageUrl, loading: imageLoading } = useImageUrl(document.image_url);

  const urgencyColor = {
    expired: '#EF4444',
    urgent: '#F97316',
    soon: '#F59E0B',
    upcoming: '#10B981',
    valid: '#3B82F6',
  }[urgency];

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      passport: 'Passport',
      license_plate: 'License Plate',
      drivers_license: "Driver's License",
      insurance: 'Insurance',
      visa: 'Visa',
      id_card: 'ID Card',
      other: 'Other'
    };
    return labels[type] || type;
  };

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      passport: '🛂',
      license_plate: '🚗',
      drivers_license: '🪪',
      insurance: '💳',
      visa: '✈️',
      id_card: '🆔',
      other: '📄'
    };
    return icons[type] || '📄';
  };

  const getDaysLabel = (days: number) => {
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day left';
    if (days > 365) return 'Valid';
    return `${days} days left`;
  };

  const isUrgent = urgency === 'expired' || urgency === 'urgent';
  const badgeColor = daysUntil < 7 ? '#EF4444' : daysUntil <= 30 ? '#F59E0B' : '#10B981';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -6, scale: 1.01, rotate: 0.5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-5 rounded-3xl cursor-pointer relative overflow-hidden group"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(50px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: isUrgent && daysUntil >= 0
          ? `0 12px 40px rgba(0, 0, 0, 0.5), 0 0 40px ${badgeColor}40, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
          : '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        minHeight: '120px',
      }}
    >
      {/* Gradient overlay based on document type */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
        style={{
          background: `radial-gradient(circle at bottom right, ${urgencyColor}, transparent)`,
        }}
      />

      <div className="relative flex items-center gap-4">
        {/* Document thumbnail/icon */}
        <div
          className="w-20 h-24 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 overflow-hidden"
          style={{
            background: `${urgencyColor}20`,
            border: `2px solid ${urgencyColor}40`,
          }}
        >
          {imageUrl && !imageLoading ? (
            <img
              src={imageUrl}
              alt={document.document_name}
              className="w-full h-full object-cover"
            />
          ) : (
            getDocumentIcon(document.document_type)
          )}
        </div>

        {/* Document info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-white mb-1 truncate" style={{ letterSpacing: '-0.3px', fontWeight: 700 }}>
            {document.document_name}
          </h3>
          <p className="text-white/60 text-sm mb-3">{getDocumentTypeLabel(document.document_type)}</p>

          {isUrgent && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold mb-2"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.4)',
              }}
            >
              ⚠️ Urgent
            </div>
          )}

          {daysUntil > 365 && (
            <div className="text-xs text-white/50">
              ~{Math.floor(daysUntil / 365)} years remaining
            </div>
          )}
        </div>

        {/* Status badge and action */}
        <div className="text-right flex-shrink-0 flex flex-col items-end gap-3">
          <motion.div
            animate={isUrgent && daysUntil >= 0 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="px-4 py-2 rounded-full text-lg font-bold"
            style={{
              background: `${badgeColor}30`,
              color: badgeColor,
              border: `2px solid ${badgeColor}60`,
              boxShadow: `0 0 20px ${badgeColor}40`,
            }}
          >
            {getDaysLabel(daysUntil)}
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-6 h-6"
          >
            <Eye className="w-6 h-6 text-white/40 group-hover:text-blue-300 transition-colors" />
          </motion.div>
        </div>
      </div>

      {/* Quick Actions Overlay on Hover */}
      <motion.div
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl flex items-center justify-center gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md"
        >
          <Eye className="w-5 h-5 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/documents/${document.id}/edit`;
          }}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md"
        >
          <Edit className="w-5 h-5 text-white" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            // Share functionality
          }}
          className="p-3 rounded-full bg-white/20 backdrop-blur-md"
        >
          <Share2 className="w-5 h-5 text-white" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Enhanced Date Card Component
function DateCard({ date, delay = 0 }: { date: ImportantDate; delay: number }) {
  const daysUntil = getDaysUntil(date.date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="p-5 rounded-3xl"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(50px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(37, 99, 235, 0.2)',
            border: '2px solid rgba(37, 99, 235, 0.4)',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)',
          }}
        >
          <Calendar className="w-8 h-8 text-blue-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{date.title}</h3>
          <p className="text-white/60">{formatDate(date.date)}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{daysUntil}</div>
          <div className="text-sm text-white/60">days</div>
        </div>
      </div>
    </motion.div>
  );
}

// Analytics Tab Component
function AnalyticsTab({ documents, stats }: { documents: Document[]; stats: DocumentStats }) {
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    documents.forEach(doc => {
      counts[doc.document_type] = (counts[doc.document_type] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [documents]);

  const colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'];

  return (
    <motion.div
      key="analytics"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Top Stats Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Documents Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-6 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15), rgba(59, 130, 246, 0.05))',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(96, 165, 250, 0.3)',
            boxShadow: '0 8px 32px rgba(37, 99, 235, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <FileText className="w-8 h-8 text-blue-400 mb-3" />
          <div className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-1">Total Documents</div>
          <div className="text-4xl font-extrabold text-white" style={{ letterSpacing: '-1px' }}>
            <AnimatedCounter value={stats.total} />
          </div>
        </motion.div>

        {/* Valid Documents Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-6 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.05))',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
          <div className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-1">Valid</div>
          <div className="text-4xl font-extrabold text-white" style={{ letterSpacing: '-1px' }}>
            <AnimatedCounter value={stats.valid} />
          </div>
        </motion.div>

        {/* Expiring Soon Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-6 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.05))',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            boxShadow: '0 8px 32px rgba(251, 191, 36, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <Clock className="w-8 h-8 text-yellow-400 mb-3" />
          <div className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-1">Expiring Soon</div>
          <div className="text-4xl font-extrabold text-white" style={{ letterSpacing: '-1px' }}>
            <AnimatedCounter value={stats.expiringSoon} />
          </div>
        </motion.div>

        {/* Expired Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="p-6 rounded-3xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.05))',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          }}
        >
          <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
          <div className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-1">Expired</div>
          <div className="text-4xl font-extrabold text-white" style={{ letterSpacing: '-1px' }}>
            <AnimatedCounter value={stats.expired} />
          </div>
        </motion.div>
      </div>

      {/* Health Rate - Large Card */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="p-8 rounded-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(16, 185, 129, 0.08))',
          backdropFilter: 'blur(50px) saturate(180%)',
          border: '1px solid rgba(96, 165, 250, 0.25)',
          boxShadow: '0 12px 48px rgba(37, 99, 235, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="w-10 h-10 text-blue-400" />
              <h3 className="text-2xl font-bold text-white">Document Health</h3>
            </div>
            <div className="text-7xl font-extrabold text-transparent bg-clip-text mb-2" style={{
              backgroundImage: 'linear-gradient(135deg, #60A5FA, #34D399)',
              letterSpacing: '-3px',
              fontWeight: 900,
            }}>
              <AnimatedCounter value={stats.total > 0 ? Math.round((stats.valid / stats.total) * 100) : 0} />%
            </div>
            <div className="text-white/60 text-sm">of your documents are valid and up-to-date</div>
          </div>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="url(#healthGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ strokeDashoffset: 352 }}
                animate={{
                  strokeDashoffset: 352 - (352 * (stats.total > 0 ? (stats.valid / stats.total) : 0))
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  strokeDasharray: 352,
                }}
              />
              <defs>
                <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Category Breakdown */}
      <div
        className="p-6 rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="w-7 h-7 text-blue-300" />
          <h3 className="text-xl font-bold text-white">Documents by Category</h3>
        </div>
        <div className="space-y-3">
          {categoryBreakdown.map(([category, count], index) => {
            const percentage = (count / stats.total) * 100;
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: colors[index % colors.length],
                        boxShadow: `0 0 12px ${colors[index % colors.length]}80`,
                      }}
                    />
                    <span className="text-white font-semibold text-sm">{category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm">{percentage.toFixed(1)}%</span>
                    <span className="text-white font-bold text-sm">{count}</span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background: colors[index % colors.length],
                      boxShadow: `0 0 8px ${colors[index % colors.length]}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-5 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <Folder className="w-6 h-6 text-blue-400 mb-2" />
          <div className="text-2xl font-bold text-white mb-1">{categoryBreakdown.length}</div>
          <div className="text-white/60 text-xs">Categories</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-5 rounded-3xl"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(40px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
          <div className="text-2xl font-bold text-white mb-1">
            {stats.total > 0 ? ((stats.expiringSoon / stats.total) * 100).toFixed(0) : 0}%
          </div>
          <div className="text-white/60 text-xs">Need Attention</div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Document Preview Modal
function DocumentPreviewModal({ document, onClose }: { document: Document; onClose: () => void }) {
  const daysUntil = getDaysUntil(document.expiration_date);
  const urgency = getUrgencyLevel(document.expiration_date);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end lg:items-center justify-center px-4 pb-4 lg:pb-0"
      style={{ background: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(50px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.8)',
          maxHeight: '80vh',
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Document Preview</h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 160px)' }}>
          <div>
            <div className="text-white/60 text-sm mb-1">Document Name</div>
            <div className="text-white font-semibold text-xl">{document.document_name}</div>
          </div>

          <div>
            <div className="text-white/60 text-sm mb-1">Type</div>
            <div className="text-white text-lg">{document.document_type}</div>
          </div>

          {document.document_number && (
            <div>
              <div className="text-white/60 text-sm mb-1">Document Number</div>
              <div className="text-white font-mono text-lg">{document.document_number}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-white/60 text-sm mb-1">Issue Date</div>
              <div className="text-white">{document.issue_date ? formatDate(document.issue_date) : 'N/A'}</div>
            </div>
            <div>
              <div className="text-white/60 text-sm mb-1">Expiration</div>
              <div className="text-white">{formatDate(document.expiration_date)}</div>
            </div>
          </div>

          <div>
            <div className="text-white/60 text-sm mb-1">Status</div>
            <div
              className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: urgency === 'expired' ? 'rgba(239, 68, 68, 0.2)' :
                           urgency === 'urgent' ? 'rgba(249, 115, 22, 0.2)' :
                           'rgba(16, 185, 129, 0.2)',
                color: urgency === 'expired' ? '#EF4444' :
                       urgency === 'urgent' ? '#F97316' :
                       '#10B981',
                border: `1px solid ${urgency === 'expired' ? 'rgba(239, 68, 68, 0.3)' :
                                     urgency === 'urgent' ? 'rgba(249, 115, 22, 0.3)' :
                                     'rgba(16, 185, 129, 0.3)'}`,
              }}
            >
              {daysUntil < 0 ? `Expired ${Math.abs(daysUntil)} days ago` :
               daysUntil === 0 ? 'Expires today' :
               `${daysUntil} days remaining`}
            </div>
          </div>

          {document.notes && (
            <div>
              <div className="text-white/60 text-sm mb-1">Notes</div>
              <div className="text-white/80 text-sm">{document.notes}</div>
            </div>
          )}

          <button
            onClick={() => {
              onClose();
              window.location.href = `/documents/${document.id}`;
            }}
            className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(109, 40, 217, 0.9))',
              boxShadow: '0 8px 32px rgba(37, 99, 235, 0.5)',
            }}
          >
            View Full Details
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
