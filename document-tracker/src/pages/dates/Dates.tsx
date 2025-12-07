import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, XCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import type { Document } from '../../types';
import CalendarView from '../../components/dates/CalendarView';
import ListView from '../../components/dates/ListView';
import ViewToggle from '../../components/dates/ViewToggle';
import MarkRenewedModal from '../../components/documents/MarkRenewedModal';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';

export default function Dates() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);

  // Fetch all documents
  const fetchDocuments = async (showRefreshing = false) => {
    if (!user?.id) return;

    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const fetchedDocs = await documentService.getDocuments(user.id);
      setDocuments(fetchedDocs);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load dates. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  // Listen for refresh events (when returning from detail page or adding new date)
  useEffect(() => {
    const handleFocus = () => {
      fetchDocuments();
    };
    const handleRefresh = () => {
      fetchDocuments();
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
      fetchDocuments(true);
    }
    pullStartY.current = 0;
    pullDistance.current = 0;
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/documents/${documentId}`);
  };

  const handleMarkRenewed = (document: Document) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const handleConfirmRenew = async (documentId: string, newExpirationDate: string) => {
    if (!user?.id) return;
    try {
      await documentService.updateDocument(documentId, user.id, {
        expiration_date: newExpirationDate,
      } as any);
      setIsModalOpen(false);
      setSelectedDocument(null);
      await fetchDocuments();
    } catch (err) {
      console.error('Failed to renew document:', err);
      throw err;
    }
  };

  // Loading skeleton
  if (loading && documents.length === 0) {
    return (
      <div className="pb-[72px] min-h-screen">
        {/* Header */}
        <div className="px-5 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Important Dates</h1>
          <p className="text-sm text-gray-600">All your document expiration dates</p>
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
  if (error && documents.length === 0) {
    return (
      <div className="pb-[72px] min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load Dates</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button variant="primary" onClick={() => fetchDocuments()}>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Important Dates</h1>
        <p className="text-sm text-gray-600">All your document expiration dates</p>
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

      {/* Content Area */}
      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="px-4"
      >
        <div className={`
          transition-opacity duration-300
          ${view === 'calendar' ? 'opacity-100' : 'opacity-0 absolute w-0 h-0 overflow-hidden'}
        `}>
          {view === 'calendar' && (
            <CalendarView
              documents={documents}
              onDocumentClick={handleDocumentClick}
              onMarkRenewed={handleMarkRenewed}
            />
          )}
        </div>

        <div className={`
          transition-opacity duration-300
          ${view === 'list' ? 'opacity-100' : 'opacity-0 absolute w-0 h-0 overflow-hidden'}
        `}>
          {view === 'list' && (
            <ListView
              documents={documents}
              onDocumentClick={handleDocumentClick}
            />
          )}
        </div>
      </div>

      {/* Mark Renewed Modal */}
      {isModalOpen && selectedDocument && (
        <MarkRenewedModal
          document={selectedDocument}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDocument(null);
          }}
          onSave={handleConfirmRenew}
        />
      )}
    </div>
  );
}
