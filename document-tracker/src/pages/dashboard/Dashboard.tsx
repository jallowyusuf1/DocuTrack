import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import { staggerContainer, staggerItem, fadeInUp, float, getTransition, transitions, triggerHaptic } from '../../utils/animations';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import UrgencySummaryCard from '../../components/documents/UrgencySummaryCard';
import DashboardDocumentCard from '../../components/documents/DashboardDocumentCard';
import GreetingSection from '../../components/dashboard/GreetingSection';
import ActivityChart from '../../components/dashboard/ActivityChart';
import MarkRenewedModal from '../../components/documents/MarkRenewedModal';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

export default function Dashboard() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);

  // Calculate urgency counts
  const urgentCount = documents.filter(
    (doc) => getDaysUntil(doc.expiration_date) <= 7
  ).length;
  const soonCount = documents.filter(
    (doc) => {
      const days = getDaysUntil(doc.expiration_date);
      return days > 7 && days <= 14;
    }
  ).length;
  const upcomingCount = documents.filter(
    (doc) => {
      const days = getDaysUntil(doc.expiration_date);
      return days > 14 && days <= 30;
    }
  ).length;

  // Fetch documents
  const fetchDocuments = async (showRefreshing = false) => {
    if (!user) return;

    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const expiringDocs = await documentService.getExpiringDocuments(user.id, 30);
      
      // Sort by days remaining (most urgent first)
      const sortedDocs = expiringDocs.sort((a, b) => {
        const daysA = getDaysUntil(a.expiration_date);
        const daysB = getDaysUntil(b.expiration_date);
        return daysA - daysB;
      });

      setDocuments(sortedDocs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
      setError(errorMessage);
      console.error('Error fetching documents:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  // Listen for refresh events from QuickAddModal
  useEffect(() => {
    const handleRefresh = () => {
      fetchDocuments();
    };
    window.addEventListener('refreshDashboard', handleRefresh);
    return () => {
      window.removeEventListener('refreshDashboard', handleRefresh);
    };
  }, []);

  // Handle mark as renewed
  const handleMarkRenewed = async (documentId: string, newExpirationDate: string) => {
    if (!user) return;

    try {
      await documentService.updateDocument(documentId, user.id, {
        expiration_date: newExpirationDate,
      });
      
      // Refresh the list
      await fetchDocuments();
      setIsModalOpen(false);
      setSelectedDocument(null);
    } catch (err) {
      console.error('Error updating document:', err);
      throw err;
    }
  };

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
      // Allow pull down
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance.current > 80) {
      // Pulled down enough, refresh
      fetchDocuments(true);
    }
    pullStartY.current = 0;
    pullDistance.current = 0;
  };

  // Loading skeleton
  if (isLoading && documents.length === 0) {
    return (
      <div className="pb-[72px]">
        {/* Page Title */}
        <div className="px-5 py-4">
          <h1 className="text-2xl font-bold text-white mb-1">Expire Soon</h1>
          <p className="text-sm text-glass-secondary">Items expiring in next 30 days</p>
        </div>

        {/* Greeting Skeleton */}
        <div className="px-5 mb-5">
          <Skeleton className="h-32 rounded-3xl bg-white/10" />
        </div>

        {/* Summary Cards Skeleton */}
        <div className="px-5 mb-5">
          <div className="flex gap-3">
            <Skeleton className="w-[31%] h-[100px] rounded-2xl bg-white/10" />
            <Skeleton className="w-[31%] h-[100px] rounded-2xl bg-white/10" />
            <Skeleton className="w-[31%] h-[100px] rounded-2xl bg-white/10" />
          </div>
        </div>

        {/* Activity Chart Skeleton */}
        <div className="px-5 mb-6">
          <Skeleton className="h-64 rounded-2xl bg-white/10" />
        </div>

        {/* Document Cards Skeleton */}
        <div className="px-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl bg-white/10" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && documents.length === 0) {
    return (
      <div className="pb-[72px] min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass-card-primary p-8 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Documents</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={() => fetchDocuments()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const totalExpiring = urgentCount + soonCount + upcomingCount;

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

      {/* Content */}
      <div className="relative z-10 px-5 pt-4">
        {/* Greeting Section */}
        <GreetingSection expiringCount={totalExpiring} />

        {/* Urgency Summary Cards */}
        <div className="mb-5">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-3 gap-2.5"
          >
            <motion.div variants={staggerItem}>
              <UrgencySummaryCard
                count={urgentCount}
                label="URGENT"
                icon={AlertCircle}
                bgColor=""
                textColor="text-red-500"
                iconColor="text-red-400"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <UrgencySummaryCard
                count={soonCount}
                label="SOON"
                icon={AlertCircle}
                bgColor=""
                textColor="text-orange-500"
                iconColor="text-orange-400"
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <UrgencySummaryCard
                count={upcomingCount}
                label="UPCOMING"
                icon={AlertCircle}
                bgColor=""
                textColor="text-yellow-500"
                iconColor="text-yellow-400"
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Activity Chart */}
        <ActivityChart />

        {/* Document List Section */}
        <div className="mt-6 mb-4">
          <h3 className="text-xl font-bold text-white mb-1">Expiring Soon</h3>
          <p className="text-sm text-glass-secondary mb-4">Next 30 days</p>
        </div>

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
              style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
            />
          </motion.div>
        )}

        {/* Document List */}
        <motion.div
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="space-y-0"
        >
          {documents.length === 0 ? (
            // Empty State
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              transition={getTransition(transitions.medium)}
              className="glass-card-elevated rounded-3xl p-12 flex flex-col items-center justify-center my-8"
              style={{ boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)' }}
            >
              <motion.div
                animate="animate"
                variants={float}
                transition={getTransition({ duration: 2, repeat: Infinity, ease: 'easeInOut' })}
                className="w-24 h-24 rounded-full glass-card flex items-center justify-center mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(109, 40, 217, 0.3))',
                }}
              >
                <CheckCircle className="w-12 h-12 text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">All Clear!</h2>
              <p className="text-sm text-glass-secondary text-center">
                No documents expiring soon
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
            >
              {documents.map((document) => (
                <motion.div key={document.id} variants={staggerItem}>
                  <DashboardDocumentCard document={document} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Mark Renewed Modal */}
      {isModalOpen && selectedDocument && (
        <MarkRenewedModal
          document={selectedDocument}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDocument(null);
          }}
          onSave={handleMarkRenewed}
        />
      )}
    </div>
  );
}
