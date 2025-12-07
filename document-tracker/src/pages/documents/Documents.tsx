import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, Filter, ChevronDown, FolderOpen, XCircle } from 'lucide-react';
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

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Load documents
  const fetchDocuments = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedDocs = await documentService.getDocuments(user.id);
      setDocuments(fetchedDocs);
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
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

  // Empty states
  const showNoDocuments = !loading && documents.length === 0;
  const showNoResults = !loading && documents.length > 0 && filteredAndSortedDocuments.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-[72px]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-5 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-sm text-gray-600 mt-1">
            {loading ? 'Loading...' : `${documents.length} document${documents.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full h-12 pl-10 pr-10
              bg-gray-100 rounded-xl
              border-0
              text-gray-900 placeholder-gray-500
              focus:ring-2 focus:ring-blue-500 focus:bg-white
              transition-colors duration-200
            "
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 active:bg-gray-300"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        {debouncedSearchQuery && filteredAndSortedDocuments.length > 0 && (
          <p className="text-xs text-gray-500 mt-2 px-1">
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
      <div className="flex items-center justify-between px-4 pb-3">
        <button
          onClick={() => setIsSortModalOpen(true)}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 active:scale-95"
        >
          <span>Sort: {getSortLabel(sortOption)}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="relative flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 active:scale-95"
        >
          <Filter className="w-5 h-5" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Document List */}
      <div className="px-4 pb-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-lg font-semibold text-gray-800 mb-2">{error}</p>
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
            className="grid grid-cols-2 gap-3"
          >
            {filteredAndSortedDocuments.map((document) => (
              <motion.div key={document.id} variants={staggerItem}>
                <DocumentGridCard document={document} />
              </motion.div>
            ))}
          </motion.div>
        )}
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
