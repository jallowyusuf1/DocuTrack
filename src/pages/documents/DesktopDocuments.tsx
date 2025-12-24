import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { documentLockService } from '../../services/documentLockService';
import { useToast } from '../../hooks/useToast';
import type { Document } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import FilterSidebar, { type FilterState } from '../../components/documents/FilterSidebar';
import DocumentsToolbar from '../../components/documents/DocumentsToolbar';
import GridView from '../../components/documents/desktop/GridView';
import ListView from '../../components/documents/desktop/ListView';
import BulkActionsBar from '../../components/documents/desktop/BulkActionsBar';
import QuickViewModal from '../../components/documents/desktop/QuickViewModal';
import Toast from '../../components/ui/Toast';
import BackButton from '../../components/ui/BackButton';
import { DocumentLockOverlay } from '../../components/documents/DocumentLockOverlay';
import { UnlockAnimation } from '../../components/documents/UnlockAnimation';
import { Lock } from 'lucide-react';

type ViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE = 20;

const CATEGORY_ICONS: Record<string, string> = {
  'Passport': '🛂',
  'Visa': '✈️',
  'ID Card': '🪪',
  'Driver License': '🚗',
  'Insurance': '🛡️',
  'Medical': '⚕️',
  'Legal': '⚖️',
  'Financial': '💰',
  'Other': '📄',
};

export default function DesktopDocuments() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, removeToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // View & Selection State - Load from localStorage
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('documentViewMode');
    return (saved === 'list' || saved === 'grid') ? saved : 'grid';
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter State - Initialize from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    const category = searchParams.get('category');
    const urgency = searchParams.get('urgency');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    return {
      searchQuery: search || '',
      selectedCategories: category ? [category] : [],
      urgencyFilter: (urgency as any) || 'all',
      dateRange: 'all',
      sortBy: (sortBy as any) || 'name',
      sortOrder: (sortOrder as any) || 'asc',
    };
  });

  // Quick View State
  const [quickViewDocument, setQuickViewDocument] = useState<Document | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Document Lock State
  const [isLocked, setIsLocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [lockCheckComplete, setLockCheckComplete] = useState(false);
  const [lockAvailable, setLockAvailable] = useState(false);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('documentViewMode', viewMode);
  }, [viewMode]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.searchQuery) params.set('search', filters.searchQuery);
    if (filters.selectedCategories.length > 0) params.set('category', filters.selectedCategories[0]);
    if (filters.urgencyFilter !== 'all') params.set('urgency', filters.urgencyFilter);
    if (filters.sortBy !== 'name') params.set('sortBy', filters.sortBy);
    if (filters.sortOrder !== 'asc') params.set('sortOrder', filters.sortOrder);

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Fetch documents (Supabase)
  const fetchDocuments = useCallback(async () => {
    if (!user?.id) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Default Documents page = dashboard scope ONLY (Expiring Soon is a separate workspace)
      const scopeParam = searchParams.get('scope');
      const scope = scopeParam === 'expire_soon' ? 'expire_soon' : 'dashboard';

      const expiring = searchParams.get('expiring') === '1';
      const minDays = Number(searchParams.get('minDays') ?? '0');
      const maxDays = Number(searchParams.get('maxDays') ?? '60');

      let fetchedDocs = await documentService.getDocuments(user.id, scope as any);

      if (expiring) {
        fetchedDocs = fetchedDocs.filter((d) => {
          const days = getDaysUntil(d.expiration_date);
          return days >= minDays && days <= maxDays;
        });
      }

      setDocuments(fetchedDocs);
      setHasMore(false);
      setCurrentPage(1);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError(err?.message ?? 'Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, searchParams]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Check if documents should be locked on mount
  useEffect(() => {
    const checkLockStatus = async () => {
      if (!user?.id) {
        setLockCheckComplete(true);
        return;
      }

      try {
        // Check if lock is enabled in settings
        const settings = await documentLockService.getLockSettings(user.id);

        const available = !!settings?.lockEnabled && !!settings?.lockPasswordHash;
        setLockAvailable(available);

        if (!available) {
          // Lock not enabled or no password set
          setIsLocked(false);
          setLockCheckComplete(true);
          return;
        }

        // Check if already unlocked in this session
        const isAlreadyUnlocked = !documentLockService.isDocumentsLocked();

        if (isAlreadyUnlocked) {
          setIsLocked(false);
          setLockCheckComplete(true);
          return;
        }

        // Lock based on trigger setting
        if (settings.lockTrigger === 'always') {
          // Always lock on page load
          documentLockService.setDocumentsLocked(true);
          setIsLocked(true);
        } else if (settings.lockTrigger === 'manual') {
          // Only lock if manually locked
          const isManuallyLocked = documentLockService.isDocumentsLocked();
          setIsLocked(isManuallyLocked);
        } else if (settings.lockTrigger === 'idle') {
          // TODO: Implement idle timeout logic
          const isManuallyLocked = documentLockService.isDocumentsLocked();
          setIsLocked(isManuallyLocked);
        }

        setLockCheckComplete(true);
      } catch (error) {
        console.error('Error checking lock status:', error);
        setIsLocked(false);
        setLockAvailable(false);
        setLockCheckComplete(true);
      }
    };

    checkLockStatus();
  }, [user]);

  // React to external lock events (e.g., a future nav button)
  useEffect(() => {
    const handler = (e: Event) => {
      const evt = e as CustomEvent<{ locked?: boolean }>;
      if (typeof evt.detail?.locked === 'boolean') setIsLocked(evt.detail.locked);
    };
    window.addEventListener('documents_lock_change', handler as EventListener);
    return () => window.removeEventListener('documents_lock_change', handler as EventListener);
  }, []);

  // Handle unlock
  const handleUnlock = () => {
    setIsUnlocking(true);
  };

  const handleUnlockComplete = () => {
    setIsUnlocking(false);
    setIsLocked(false);
  };

  // Calculate categories with counts
  const categories = useMemo(() => {
    const categoryMap = new Map<string, number>();

    documents.forEach((doc) => {
      const count = categoryMap.get(doc.document_type) || 0;
      categoryMap.set(doc.document_type, count + 1);
    });

    return Array.from(categoryMap.entries()).map(([name, count]) => ({
      name,
      count,
      icon: CATEGORY_ICONS[name] || '📄',
    }));
  }, [documents]);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    let filtered = [...documents];

    // Search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((doc) => {
        const nameMatch = doc.document_name.toLowerCase().includes(query);
        const numberMatch = doc.document_number?.toLowerCase().includes(query);
        const notesMatch = doc.notes?.toLowerCase().includes(query);
        return nameMatch || numberMatch || notesMatch;
      });
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter((doc) =>
        filters.selectedCategories.includes(doc.document_type)
      );
    }

    // Urgency filter
    if (filters.urgencyFilter !== 'all') {
      filtered = filtered.filter((doc) => {
        const daysLeft = getDaysUntil(doc.expiration_date);
        switch (filters.urgencyFilter) {
          case 'expired':
            return daysLeft < 0;
          case 'urgent':
            return daysLeft >= 0 && daysLeft < 7;
          case 'soon':
            return daysLeft >= 7 && daysLeft < 30;
          case 'valid':
            return daysLeft >= 30;
          default:
            return true;
        }
      });
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      filtered = filtered.filter((doc) => {
        const expiryDate = new Date(doc.expiration_date);
        switch (filters.dateRange) {
          case 'this_week':
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            return expiryDate <= weekFromNow && expiryDate >= now;
          case 'this_month':
            const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            return expiryDate <= monthFromNow && expiryDate >= now;
          case 'next_30':
            const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
            return expiryDate <= thirtyDays && expiryDate >= now;
          case 'next_60':
            const sixtyDays = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
            return expiryDate <= sixtyDays && expiryDate >= now;
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.document_name.localeCompare(b.document_name);
          break;
        case 'date_added':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'expiry_date':
          // Sort by expiry date - nearest first
          comparison = new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
          break;
        case 'category':
          comparison = a.document_type.localeCompare(b.document_type);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [documents, filters]);

  // Paginated documents
  const paginatedDocuments = useMemo(() => {
    const startIndex = 0;
    const endIndex = currentPage * ITEMS_PER_PAGE;
    const paginated = filteredAndSortedDocuments.slice(startIndex, endIndex);
    setHasMore(endIndex < filteredAndSortedDocuments.length);
    return paginated;
  }, [filteredAndSortedDocuments, currentPage]);

  const handleLoadMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  // Selection handlers
  const handleSelectDocument = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // Quick view handlers
  const handleQuickView = (document: Document) => {
    setQuickViewDocument(document);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setTimeout(() => setQuickViewDocument(null), 300);
  };

  const handleOpenFullDetail = (id: string) => {
    navigate(`/documents/${id}`);
  };

  // Quick view navigation
  const quickViewIndex = quickViewDocument
    ? filteredAndSortedDocuments.findIndex((doc) => doc.id === quickViewDocument.id)
    : -1;

  const handleQuickViewPrevious = () => {
    if (quickViewIndex > 0) {
      setQuickViewDocument(filteredAndSortedDocuments[quickViewIndex - 1]);
    }
  };

  const handleQuickViewNext = () => {
    if (quickViewIndex < filteredAndSortedDocuments.length - 1) {
      setQuickViewDocument(filteredAndSortedDocuments[quickViewIndex + 1]);
    }
  };

  // Bulk action handlers
  const handleBulkShare = () => {
    console.log('Sharing documents:', selectedIds);
    // TODO: Implement bulk share
  };

  const handleBulkExport = () => {
    console.log('Exporting documents:', selectedIds);
    // TODO: Implement bulk export
  };

  const handleBulkDelete = () => {
    console.log('Deleting documents:', selectedIds);
    // TODO: Implement bulk delete with confirmation
  };

  // Document action handlers
  const handleShare = (document: Document) => {
    console.log('Sharing document:', document.id);
    // TODO: Implement share
  };

  const handleEdit = (document: Document) => {
    navigate(`/documents/edit/${document.id}`);
  };

  const handleDelete = (document: Document) => {
    console.log('Deleting document:', document.id);
    // TODO: Implement delete with confirmation
  };

  const selectionMode = selectedIds.length > 0;

  // Show nothing until lock check is complete
  if (!lockCheckComplete) {
    return (
      <div className="min-h-full flex flex-col liquid-dashboard-bg">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col liquid-dashboard-bg">
      {/* Document Lock Overlay */}
      {isLocked && !isUnlocking && (
        <DocumentLockOverlay onUnlock={handleUnlock} />
      )}

      {/* Unlock Animation */}
      {isUnlocking && (
        <UnlockAnimation onComplete={handleUnlockComplete} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <FilterSidebar
          categories={categories}
          onFilterChange={setFilters}
          currentFilters={filters}
          onToggleView={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
          onFocusSearch={() => {
            // Focus search input in FilterSidebar
            const searchInput = document.querySelector('input[placeholder="Search documents..."]') as HTMLInputElement;
            searchInput?.focus();
          }}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Back Button + Toolbar */}
          <div className="flex items-center gap-4 px-6 py-4">
            <BackButton
              to={searchParams.get('scope') === 'expire_soon' || searchParams.get('expiring') === '1' ? '/expire-soon' : '/dashboard'}
            />
            <div className="flex-1">
              <DocumentsToolbar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                selectedCount={selectedIds.length}
                onBulkAction={(action) => {
                  if (action === 'share') handleBulkShare();
                  else if (action === 'export') handleBulkExport();
                  else if (action === 'delete') handleBulkDelete();
                }}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onSortChange={(sortBy, sortOrder) => {
                  setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
                }}
              />
            </div>

            {/* Lock Documents button */}
            {lockAvailable && (
              <button
                onClick={() => {
                  // Lock immediately (will show overlay on this page)
                  documentLockService.setDocumentsLocked(true);
                  setIsLocked(true);
                }}
                className="h-[44px] px-4 rounded-xl flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white transition-colors"
                style={{
                  background: 'rgba(35, 29, 51, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                }}
                title="Lock Documents"
              >
                <Lock className="w-4 h-4 text-yellow-300" />
                <span>Lock</span>
              </button>
            )}
          </div>

          {/* Document Views */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-lg">Loading documents...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-red-400 text-lg mb-4">{error}</p>
                  <button
                    onClick={fetchDocuments}
                    className="px-6 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredAndSortedDocuments.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-white/50 text-lg mb-4">No documents found</p>
                  <button
                    onClick={() => navigate('/add-document')}
                    className="px-6 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    Add Document
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {viewMode === 'grid' && (
                  <GridView
                    documents={paginatedDocuments}
                    selectedIds={selectedIds}
                    onSelectDocument={handleSelectDocument}
                    onQuickView={handleQuickView}
                    onShare={handleShare}
                    onNavigateToDetail={handleOpenFullDetail}
                    selectionMode={selectionMode}
                  />
                )}
                {viewMode === 'list' && (
                  <ListView
                    documents={paginatedDocuments}
                    selectedIds={selectedIds}
                    onSelectDocument={handleSelectDocument}
                    onQuickView={handleQuickView}
                    onShare={handleShare}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onNavigateToDetail={handleOpenFullDetail}
                    selectionMode={selectionMode}
                  />
                )}

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center py-8">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-3 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all transform hover:scale-105 font-medium"
                    >
                      Load More ({filteredAndSortedDocuments.length - paginatedDocuments.length} remaining)
                    </button>
                  </div>
                )}

                {/* Showing count */}
                {paginatedDocuments.length > 0 && (
                  <div className="flex justify-center py-4 text-white/40 text-sm">
                    Showing {paginatedDocuments.length} of {filteredAndSortedDocuments.length} documents
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onShare={handleBulkShare}
        onExport={handleBulkExport}
        onDelete={handleBulkDelete}
        onClearSelection={handleClearSelection}
      />

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={isQuickViewOpen}
        document={quickViewDocument}
        onClose={handleCloseQuickView}
        onOpenFullDetail={handleOpenFullDetail}
        onPrevious={handleQuickViewPrevious}
        onNext={handleQuickViewNext}
        hasPrevious={quickViewIndex > 0}
        hasNext={quickViewIndex < filteredAndSortedDocuments.length - 1}
      />

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
