import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, Filter, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Document } from '../../types';
import { documentService } from '../../services/documents';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/dateUtils';
import { useImageUrl } from '../../hooks/useImageUrl';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'passport' | 'visa' | 'id_card' | 'insurance' | 'subscription' | 'receipt' | 'bill' | 'contract';

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Document[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Search documents
  useEffect(() => {
    if (!searchQuery.trim() || !user?.id) {
      setResults([]);
      return;
    }

    const searchDocuments = async () => {
      setIsSearching(true);
      try {
        const allDocs = await documentService.getDocuments(user.id);
        const query = searchQuery.toLowerCase();
        
        let filtered = allDocs.filter((doc) => {
          const matchesQuery = 
            doc.document_name.toLowerCase().includes(query) ||
            doc.document_number?.toLowerCase().includes(query) ||
            doc.notes?.toLowerCase().includes(query) ||
            doc.category?.toLowerCase().includes(query);
          
          const matchesFilter = activeFilter === 'all' || doc.document_type === activeFilter;
          
          return matchesQuery && matchesFilter;
        });

        setResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchDocuments, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, activeFilter, user?.id]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      // Save to recent searches
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    inputRef.current?.focus();
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/documents/${documentId}`);
    onClose();
  };

  const filters: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'passport', label: 'Passport' },
    { value: 'visa', label: 'Visa' },
    { value: 'id_card', label: 'ID Card' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'receipt', label: 'Receipt' },
    { value: 'bill', label: 'Bill' },
    { value: 'contract', label: 'Contract' },
  ];

  // Group results by document type
  const groupedResults = results.reduce((acc, doc) => {
    const type = doc.document_type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Just blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200]"
            style={{
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          />

          {/* Search Overlay */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[201] flex flex-col"
            style={{
              background: 'rgba(26, 22, 37, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
            }}
          >
            {/* Search Bar */}
            <div className="px-4 md:px-6 pt-20 md:pt-24 pb-6">
              <div className="max-w-4xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-purple-400 z-10" style={{ width: '20px', height: '20px' }} data-tablet-icon="true" />
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-icon="true"] {
                        width: 24px !important;
                        height: 24px !important;
                      }
                    }
                  `}</style>
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search documents..."
                    className="w-full pl-12 md:pl-14 pr-12 md:pr-14 py-3 md:py-[14px] rounded-2xl text-white placeholder:text-white/40 transition-all text-base md:text-[19px]"
                    style={{
                      background: 'rgba(42, 38, 64, 0.7)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      height: '44px',
                    }}
                    data-tablet-search="true"
                  />
                  <style>{`
                    @media (min-width: 768px) {
                      [data-tablet-search="true"] {
                        height: 52px !important;
                        max-width: 600px !important;
                        margin: 0 auto !important;
                      }
                    }
                  `}</style>
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        inputRef.current?.focus();
                      }}
                      className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 w-8 h-8 md:w-6 md:h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-all"
                    >
                      <X className="w-5 h-5 md:w-6 md:h-6 text-white" style={{ width: '20px', height: '20px' }} data-tablet-icon="true" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                {searchQuery && (
                  <div className="mt-4 md:mt-6 overflow-x-auto">
                    <div className="flex gap-2 md:gap-3">
                      {filters.map((filter) => (
                        <button
                          key={filter.value}
                          onClick={() => setActiveFilter(filter.value)}
                          className={`px-4 md:px-5 py-2 md:py-[10px] rounded-full font-medium text-sm md:text-[17px] transition-all whitespace-nowrap ${
                            activeFilter === filter.value
                              ? 'text-white'
                              : 'text-white/60'
                          }`}
                          style={{
                            background: activeFilter === filter.value
                              ? 'rgba(139, 92, 246, 0.3)'
                              : 'rgba(42, 38, 64, 0.5)',
                            border: activeFilter === filter.value
                              ? '1px solid rgba(139, 92, 246, 0.5)'
                              : '1px solid rgba(255, 255, 255, 0.1)',
                            height: '36px',
                          }}
                          data-tablet-filter="true"
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                    <style>{`
                      @media (min-width: 768px) {
                        [data-tablet-filter="true"] {
                          height: 44px !important;
                        }
                      }
                    `}</style>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-20">
              <div className="max-w-4xl mx-auto">
                {!searchQuery ? (
                  /* Recent Searches */
                  <div>
                    {recentSearches.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-400" />
                            Recent Searches
                          </h2>
                          <button
                            onClick={handleClearRecent}
                            className="text-sm text-purple-400 hover:text-purple-300"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="space-y-2">
                          {recentSearches.map((query, index) => (
                            <motion.button
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleRecentSearchClick(query)}
                              className="w-full text-left p-4 md:p-[14px] rounded-xl hover:bg-white/5 transition-all"
                              style={{
                                background: 'rgba(42, 38, 64, 0.4)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                height: '52px',
                              }}
                              data-tablet-recent="true"
                            >
                              <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-purple-400 flex-shrink-0" />
                                <span className="text-white text-base md:text-[19px] truncate">{query}</span>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                        <style>{`
                          @media (min-width: 768px) {
                            [data-tablet-recent="true"] {
                              height: 60px !important;
                            }
                          }
                        `}</style>
                      </>
                    ) : (
                      /* Empty State */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 md:py-32"
                      >
                        <div
                          className="w-20 h-20 md:w-[100px] md:h-[100px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6"
                          style={{
                            boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
                          }}
                        >
                          <Search className="w-10 h-10 md:w-12 md:h-12 text-white" />
                        </div>
                        <h3 className="text-xl md:text-[24px] font-bold text-white mb-2">Start Searching</h3>
                        <p className="text-white/60 text-center max-w-md">
                          Search for documents by name, number, or notes
                        </p>
                      </motion.div>
                    )}
                  </div>
                ) : isSearching ? (
                  /* Loading */
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : results.length === 0 ? (
                  /* No Results */
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-20 md:py-32"
                  >
                    <div
                      className="w-20 h-20 md:w-[100px] md:h-[100px] rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6"
                      style={{
                        boxShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
                      }}
                    >
                      <FileText className="w-10 h-10 md:w-12 md:h-12 text-white" />
                    </div>
                    <h3 className="text-xl md:text-[24px] font-bold text-white mb-2">No Results Found</h3>
                    <p className="text-white/60 text-center max-w-md">
                      Try different keywords or check your filters
                    </p>
                  </motion.div>
                ) : (
                  /* Results */
                  <div className="space-y-6 md:space-y-8">
                    {Object.entries(groupedResults).map(([type, docs]) => (
                      <div key={type}>
                        <h3 className="text-lg md:text-xl font-semibold text-white mb-4 capitalize">
                          {type.replace('_', ' ')} ({docs.length})
                        </h3>
                        <div className="space-y-3">
                          {docs.map((doc) => (
                            <SearchResultCard
                              key={doc.id}
                              document={doc}
                              onClick={() => handleDocumentClick(doc.id)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="fixed top-4 md:top-6 right-4 md:right-6 z-[202] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              style={{
                background: 'rgba(42, 38, 64, 0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Search Result Card Component
function SearchResultCard({ document, onClick }: { document: Document; onClick: () => void }) {
  const { signedUrl: imageUrl, loading: imageLoading } = useImageUrl(document.image_url);

  return (
    <motion.button
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left p-4 md:p-5 rounded-xl hover:bg-white/5 transition-all mx-auto"
      style={{
        background: 'rgba(42, 38, 64, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        maxWidth: '100%',
      }}
      data-tablet-result="true"
    >
      <style>{`
        @media (min-width: 768px) {
          [data-tablet-result="true"] {
            max-width: 700px !important;
          }
        }
      `}</style>
      <div className="flex items-center gap-4">
        {/* Thumbnail */}
        <div
          className="flex-shrink-0 w-12 h-16 md:w-[56px] md:h-[75px] rounded-lg overflow-hidden"
          style={{
            background: 'rgba(35, 29, 51, 0.5)',
          }}
        >
          {imageLoading ? (
            <div className="w-full h-full flex items-center justify-center animate-pulse">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={document.document_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-base md:text-[19px] font-semibold text-white mb-1 truncate">
            {document.document_name}
          </h4>
          <p className="text-sm md:text-base text-white/60 mb-1 capitalize">
            {document.document_type?.replace('_', ' ')}
          </p>
          {document.expiration_date && (
            <p className="text-xs md:text-sm text-white/40">
              Expires: {formatDate(document.expiration_date)}
            </p>
          )}
        </div>
      </div>
    </motion.button>
  );
}

