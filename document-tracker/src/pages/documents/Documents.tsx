import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, Filter, ChevronDown, FolderOpen, XCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { documentService } from '../../services/documents';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../hooks/useToast';
import type { Document, DocumentType } from '../../types';
import { getDaysUntil, getUrgencyLevel } from '../../utils/dateUtils';
import { staggerContainer, staggerItem, fadeInUp } from '../../utils/animations';
import DocumentGridCard from '../../components/documents/DocumentGridCard';
import CategoryTabs from '../../components/documents/CategoryTabs';
import SortModal, { type SortOption } from '../../components/documents/SortModal';
import FilterModal, { type FilterState } from '../../components/documents/FilterModal';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import Toast from '../../components/ui/Toast';
import EmptyState from '../../components/ui/EmptyState';

const getSortLabel = (sort: SortOption): string => {
  switch (sort) {
    case 'newest':
      return 'Newest';
    case 'oldest':
      return 'Oldest';
    case 'expiring_soon':
      return 'Expiring Soon';
    case 'name_asc':
      return 'Name A-Z';
    case 'name_desc':
      return 'Name Z-A';
    default:
      return 'Newest';
  }
};

const sortDocuments = (documents: Document[], sort: SortOption): Document[] => {
  const sorted = [...documents];
  
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case 'oldest':
      return sorted.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    case 'expiring_soon':
      return sorted.sort((a, b) => {
        const daysA = getDaysUntil(a.expiration_date);
        const daysB = getDaysUntil(b.expiration_date);
        return daysA - daysB;
      });
    case 'name_asc':
      return sorted.sort((a, b) => 
        a.document_name.localeCompare(b.document_name)
      );
    case 'name_desc':
      return sorted.sort((a, b) => 
        b.document_name.localeCompare(a.document_name)
      );
    default:
      return sorted;
  }
};

const filterDocuments = (
  documents: Document[],
  searchQuery: string,
  category: DocumentType | 'all',
  filters: FilterState
): Document[] => {
  let filtered = [...documents];

  // Category filter
  if (category !== 'all') {
    filtered = filtered.filter((doc) => doc.document_type === category);
  }

  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((doc) => {
      const nameMatch = doc.document_name.toLowerCase().includes(query);
      const numberMatch = doc.document_number?.toLowerCase().includes(query);
      const notesMatch = doc.notes?.toLowerCase().includes(query);
      return nameMatch || numberMatch || notesMatch;
    });
  }

  // Expiration status filter
  const hasExpirationFilter = Object.values(filters.expirationStatus).some(Boolean);
  if (hasExpirationFilter) {
    filtered = filtered.filter((doc) => {
      const daysLeft = getDaysUntil(doc.expiration_date);
      const urgency = getUrgencyLevel(doc.expiration_date);
      
      if (filters.expirationStatus.expired && daysLeft < 0) return true;
      if (filters.expirationStatus.expiring7Days && urgency === 'urgent') return true;
      if (filters.expirationStatus.expiring30Days && (urgency === 'urgent' || urgency === 'soon' || urgency === 'upcoming')) return true;
      if (filters.expirationStatus.valid && daysLeft > 30) return true;
      
      return false;
    });
  }

  // Has notes filter
  if (filters.hasNotes) {
    filtered = filtered.filter((doc) => doc.notes && doc.notes.trim().length > 0);
  }

  return filtered;
};

export default function Documents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, removeToast } = useToast();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentType | 'all'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    expirationStatus: {
      expired: false,
      expiring7Days: false,
      expiring30Days: false,
      valid: false,
    },
    hasNotes: false,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pullStartY = useRef<number>(0);
  const pullDistance = useRef<number>(0);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load documents
  const fetchDocuments = useCallback(async (showRefreshing = false) => {
    if (!user?.id) return;
    
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const fetchedDocs = await documentService.getDocuments(user.id);
      setDocuments(fetchedDocs);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Filter and sort documents
  const filteredAndSortedDocuments = useMemo(() => {
    const filtered = filterDocuments(documents, debouncedSearchQuery, selectedCategory, filters);
    return sortDocuments(filtered, sortOption);
  }, [documents, debouncedSearchQuery, selectedCategory, filters, sortOption]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (Object.values(filters.expirationStatus).some(Boolean)) count++;
    if (filters.hasNotes) count++;
    return count;
  }, [filters]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedSort = localStorage.getItem('documents_sort') as SortOption | null;
    if (savedSort) setSortOption(savedSort);
    
    const savedFilters = localStorage.getItem('documents_filters');
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('documents_sort', sortOption);
  }, [sortOption]);

  useEffect(() => {
    localStorage.setItem('documents_filters', JSON.stringify(filters));
  }, [filters]);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleCategoryChange = (category: DocumentType | 'all') => {
    setSelectedCategory(category);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortOption(sort);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
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

  // Empty states
  const showNoDocuments = !loading && documents.length === 0;
  const showNoResults = !loading && documents.length > 0 && filteredAndSortedDocuments.length === 0;

  return (
    <div className="min-h-screen pb-[72px] relative overflow-hidden">
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

      <div className="relative z-10">
        {/* Header */}
        <header 
          className="sticky top-0 z-10"
          style={{
            background: 'rgba(35, 29, 51, 0.8)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)',
          }}
        >
          <div className="px-5 py-4">
            <h1 className="text-2xl font-bold text-white" style={{ fontSize: '24px' }}>My Documents</h1>
            <p className="text-sm mt-1" style={{ 
              fontSize: '14px',
              color: '#A78BFA',
            }}>
              {loading ? 'Loading...' : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </header>

        {/* Search Bar */}
        <div className="px-4 pt-4 pb-2">
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
              placeholder="Search documents..."
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
                e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)';
                e.target.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
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
                onClick={handleClearSearch}
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
          {debouncedSearchQuery && filteredAndSortedDocuments.length > 0 && (
            <p className="text-xs mt-2 px-1" style={{ color: '#A78BFA' }}>
              {filteredAndSortedDocuments.length} result{filteredAndSortedDocuments.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

      {/* Category Tabs */}
      <div className="py-3">
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

        {/* Sort/Filter Bar */}
        <div className="flex items-center justify-between px-4 pb-3 gap-3">
          <button
            onClick={() => setIsSortModalOpen(true)}
            className="flex items-center gap-2 glass-card-subtle px-4 py-2.5 rounded-xl text-sm text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <span>Sort: {getSortLabel(sortOption)}</span>
            <ChevronDown className="w-4 h-4 text-purple-400" />
          </button>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="relative flex items-center gap-2 glass-card-subtle px-4 py-2.5 rounded-xl text-sm text-white hover:bg-white/10 active:scale-95 transition-all"
            style={activeFilterCount > 0 ? {
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
            } : {}}
          >
            <Filter className="w-5 h-5 text-purple-400" />
            {activeFilterCount > 0 && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-purple-600 to-purple-500 text-white text-xs font-semibold rounded-full flex items-center justify-center"
                style={{ boxShadow: '0 0 15px rgba(139, 92, 246, 0.6)' }}
              >
                {activeFilterCount}
              </motion.span>
            )}
          </button>
        </div>

        {/* Pull to Refresh Indicator */}
        {isRefreshing && (
          <div className="flex justify-center py-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(35, 29, 51, 0.6)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
              }}
            >
              <RefreshCw className="w-5 h-5" style={{ color: '#A78BFA' }} />
            </motion.div>
          </div>
        )}

        {/* Document Grid */}
        <div 
          ref={scrollContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="px-4 pb-4"
        >
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-3xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center glass-card rounded-3xl p-8 mx-4">
            <XCircle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-lg font-semibold text-white mb-2">{error}</p>
            <Button onClick={fetchDocuments} variant="primary">
              Retry
            </Button>
          </div>
        ) : showNoDocuments ? (
          <EmptyState
            icon={<FolderOpen className="w-16 h-16" />}
            title="No Documents Yet"
            description="Add your first document to get started"
            action={
              <Button onClick={() => navigate('/add-document')} variant="primary">
                Add Document
              </Button>
            }
          />
        ) : showNoResults ? (
          <EmptyState
            icon={<Search className="w-16 h-16" />}
            title="No Results Found"
            description="Try different search terms"
            action={
              <Button onClick={handleClearSearch} variant="secondary">
                Clear Search
              </Button>
            }
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 gap-4"
          >
            {filteredAndSortedDocuments.map((document) => (
              <motion.div key={document.id} variants={staggerItem}>
                <DocumentGridCard document={document} />
              </motion.div>
            ))}
          </motion.div>
        )}
        </div>
      </div>

      {/* Sort Modal */}
      <SortModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        selectedSort={sortOption}
        onSortChange={handleSortChange}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        activeFilterCount={activeFilterCount}
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
