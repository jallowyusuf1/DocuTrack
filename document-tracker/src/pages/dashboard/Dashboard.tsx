import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import UrgencySummaryCard from '../../components/documents/UrgencySummaryCard';
import DocumentCard from '../../components/documents/DocumentCard';
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Expire Soon</h1>
          <p className="text-sm text-gray-600">Items expiring in next 30 days</p>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="px-5 mb-6">
          <div className="flex gap-3">
            <Skeleton className="w-[31%] h-20" />
            <Skeleton className="w-[31%] h-20" />
            <Skeleton className="w-[31%] h-20" />
          </div>
        </div>

        {/* Document Cards Skeleton */}
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && documents.length === 0) {
    return (
      <div className="pb-[72px] min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Documents</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => fetchDocuments()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-[72px]">
      {/* Page Title */}
      <div className="px-5 py-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Expire Soon</h1>
        <p className="text-sm text-gray-600">Items expiring in next 30 days</p>
      </div>

      {/* Urgency Summary Cards */}
      <div className="px-5 mb-6">
        <div className="flex gap-3">
          <div className="w-[31%]">
            <UrgencySummaryCard
              count={urgentCount}
              label="URGENT"
              icon={AlertCircle}
              bgColor="bg-red-50"
              textColor="text-red-600"
              iconColor="text-red-500"
            />
          </div>
          <div className="w-[31%]">
            <UrgencySummaryCard
              count={soonCount}
              label="SOON"
              icon={AlertCircle}
              bgColor="bg-orange-50"
              textColor="text-orange-600"
              iconColor="text-orange-500"
            />
          </div>
          <div className="w-[31%]">
            <UrgencySummaryCard
              count={upcomingCount}
              label="UPCOMING"
              icon={AlertCircle}
              bgColor="bg-yellow-50"
              textColor="text-yellow-600"
              iconColor="text-yellow-500"
            />
          </div>
        </div>
      </div>

      {/* Pull to Refresh Indicator */}
      {isRefreshing && (
        <div className="flex justify-center py-2">
          <RefreshCw className="w-5 h-5 text-primary-600 animate-spin" />
        </div>
      )}

      {/* Document List */}
      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="px-4 space-y-3"
      >
        {documents.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">All Good!</h2>
            <p className="text-sm text-gray-600 text-center mb-2">
              No items expiring in next 30 days
            </p>
            <p className="text-xs text-gray-500 text-center">
              Tap the + button to add documents, warranties, license plates, and more
            </p>
          </div>
        ) : (
          documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              onMarkRenewed={(doc) => {
                setSelectedDocument(doc);
                setIsModalOpen(true);
              }}
            />
          ))
        )}
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
