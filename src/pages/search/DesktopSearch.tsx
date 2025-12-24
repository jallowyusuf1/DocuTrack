import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, Clock, Star, Filter, Grid3x3, List, ArrowRight,
  FileText, Calendar, Users, Folder, ChevronDown, ChevronRight,
  CheckCircle, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documents';
import { useAuth } from '../../hooks/useAuth';
import type { Document, DocumentType } from '../../types';
import { getDaysUntil } from '../../utils/dateUtils';
import BackButton from '../../components/ui/BackButton';

type ViewMode = 'grid' | 'list';
type SortBy = 'relevance' | 'date' | 'name';
type DatePreset = 'Today' | 'This Week' | 'This Month' | 'This Year' | 'Custom' | '';

interface SearchSuggestion {
  type: 'document' | 'category' | 'recent';
  text: string;
  count?: number;
  icon: typeof FileText;
}

interface GroupedResults {
  documents: Document[];
  categories: Array<{ name: string; count: number }>;
  dates: Array<{ date: string; count: number }>;
  family: Array<{ name: string; count: number }>;
}

// Document types from the actual type definition
const DOCUMENT_TYPES: DocumentType[] = [
  'passport', 'visa', 'id_card', 'insurance', 'subscription', 'receipt',
  'bill', 'contract', 'warranty', 'license_plate', 'registration',
  'membership', 'certification', 'food', 'other'
];

const URGENCIES = ['Urgent', 'Important', 'Normal', 'Low'];
const DATE_PRESETS: DatePreset[] = ['Today', 'This Week', 'This Month', 'This Year', 'Custom'];
const STATUS_OPTIONS = ['Active', 'Expired', 'Locked'];

const formatDocumentType = (type: DocumentType): string => {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function DesktopSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const [searchQuery, setSearchQuery] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [groupedResults, setGroupedResults] = useState<GroupedResults>({
    documents: [],
    categories: [],
    dates: [],
    family: [],
  });
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [loading, setLoading] = useState(false);
  const [searchTime, setSearchTime] = useState(0);

  // Filters
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([]);
  const [selectedUrgency, setSelectedUrgency] = useState<string>('');
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePreset>('');
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showSharedOnly, setShowSharedOnly] = useState(false);

  // UI State
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const stored = localStorage.getItem('recentSearches');
    return stored ? JSON.parse(stored) : [];
  });
  const [savedSearches, setSavedSearches] = useState<string[]>(() => {
    const stored = localStorage.getItem('savedSearches');
    return stored ? JSON.parse(stored) : [];
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [expandedGroups, setExpandedGroups] = useState({
    documents: true,
    categories: true,
    dates: true,
    family: true,
  });

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
    searchInputRef.current?.focus();
  }, [user?.id]);

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  // Save saved searches to localStorage
  useEffect(() => {
    if (savedSearches.length > 0) {
      localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    }
  }, [savedSearches]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      
      // / to focus search
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      
      // G to toggle grid view
      if ((e.key === 'g' || e.key === 'G') && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        setViewMode('grid');
        return;
      }
      
      // L to toggle list view
      if ((e.key === 'l' || e.key === 'L') && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        setViewMode('list');
        return;
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setSearchQuery('');
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        searchInputRef.current?.blur();
        return;
      }
      
      // Arrow keys for suggestions navigation
      if (showSuggestions && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        }
        if (e.key === 'Enter' && selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
          e.preventDefault();
          const suggestion = suggestions[selectedSuggestionIndex];
          if (suggestion.type === 'recent' || suggestion.type === 'category') {
            setSearchQuery(suggestion.text);
          } else if (suggestion.type === 'document') {
            const doc = documents.find(d => d.document_name === suggestion.text);
            if (doc) {
              navigate(`/documents/${doc.id}`);
            }
          }
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSuggestions, suggestions, selectedSuggestionIndex, navigate, documents]);

  // Generate suggestions while typing
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];

    // Recent searches
    recentSearches
      .filter(s => s.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach(s => {
        newSuggestions.push({
          type: 'recent',
          text: s,
          icon: Clock,
        });
      });

    // Categories with counts
    const categoryCounts = new Map<string, number>();
    documents.forEach(doc => {
      const category = formatDocumentType(doc.document_type);
      if (category.toLowerCase().includes(query)) {
        categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
      }
    });
    Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([name, count]) => {
        newSuggestions.push({
          type: 'category',
          text: name,
          count,
          icon: Folder,
        });
      });

    // Documents
    documents
      .filter(doc => 
        doc.document_name.toLowerCase().includes(query) ||
        formatDocumentType(doc.document_type).toLowerCase().includes(query)
      )
      .slice(0, 8 - newSuggestions.length)
      .forEach(doc => {
        newSuggestions.push({
          type: 'document',
          text: doc.document_name,
          icon: FileText,
        });
      });

    setSuggestions(newSuggestions.slice(0, 8));
  }, [searchQuery, documents, recentSearches]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        performSearch();
      } else {
        setGroupedResults({
          documents: [],
          categories: [],
          dates: [],
          family: [],
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedTypes, selectedUrgency, selectedDatePreset, customDateStart, customDateEnd, selectedStatuses, showSharedOnly, sortBy]);

  const loadDocuments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const docs = await documentService.getDocuments(user.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = () => {
    const startTime = performance.now();
    const query = searchQuery.toLowerCase();

    // Filter documents
    let results = documents.filter(doc => {
      // Text search
      const matchesQuery = 
        doc.document_name?.toLowerCase().includes(query) ||
        formatDocumentType(doc.document_type).toLowerCase().includes(query) ||
        doc.notes?.toLowerCase().includes(query) ||
        doc.document_number?.toLowerCase().includes(query);

      // Type filter
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(doc.document_type);

      // Urgency filter
      const daysUntil = getDaysUntil(doc.expiration_date);
      let matchesUrgency = true;
      if (selectedUrgency) {
        if (selectedUrgency === 'Urgent') matchesUrgency = daysUntil <= 7;
        else if (selectedUrgency === 'Important') matchesUrgency = daysUntil > 7 && daysUntil <= 14;
        else if (selectedUrgency === 'Normal') matchesUrgency = daysUntil > 14 && daysUntil <= 30;
        else if (selectedUrgency === 'Low') matchesUrgency = daysUntil > 30;
      }

      // Date range filter
      let matchesDateRange = true;
      if (selectedDatePreset || customDateStart || customDateEnd) {
        const docDate = new Date(doc.expiration_date);
        let startDate: Date | null = null;
        let endDate: Date | null = null;

        if (selectedDatePreset === 'Custom') {
          if (customDateStart) startDate = new Date(customDateStart);
          if (customDateEnd) endDate = new Date(customDateEnd);
        } else if (selectedDatePreset) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDatePreset === 'Today') {
            startDate = today;
            endDate = new Date(today);
          } else if (selectedDatePreset === 'This Week') {
            startDate = today;
            endDate = new Date(today);
            endDate.setDate(today.getDate() + 7);
          } else if (selectedDatePreset === 'This Month') {
            startDate = today;
            endDate = new Date(today);
            endDate.setMonth(today.getMonth() + 1);
          } else if (selectedDatePreset === 'This Year') {
            startDate = today;
            endDate = new Date(today);
            endDate.setFullYear(today.getFullYear() + 1);
          }
        }

        if (startDate || endDate) {
          matchesDateRange = true;
          if (startDate && docDate < startDate) matchesDateRange = false;
          if (endDate && docDate > endDate) matchesDateRange = false;
        }
      }

      // Status filter
      let matchesStatus = selectedStatuses.length === 0;
      if (selectedStatuses.length > 0) {
        const isExpired = new Date(doc.expiration_date) < new Date();
        const isLocked = doc.is_locked || false;
        const isActive = !isExpired && !isLocked;

        if (selectedStatuses.includes('Active') && isActive) matchesStatus = true;
        if (selectedStatuses.includes('Expired') && isExpired) matchesStatus = true;
        if (selectedStatuses.includes('Locked') && isLocked) matchesStatus = true;
      }

      // Shared filter (placeholder - implement when sharing is available)
      const matchesShared = !showSharedOnly;

      return matchesQuery && matchesType && matchesUrgency && matchesDateRange && matchesStatus && matchesShared;
    });

    // Sort results
    if (sortBy === 'date') {
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'name') {
      results.sort((a, b) => a.document_name.localeCompare(b.document_name));
    }
    // 'relevance' keeps natural order

    // Group results
    const categories = new Map<string, number>();
    const dates = new Map<string, number>();
    
    results.forEach(doc => {
      const category = formatDocumentType(doc.document_type);
      categories.set(category, (categories.get(category) || 0) + 1);
      
      const dateKey = new Date(doc.expiration_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      dates.set(dateKey, (dates.get(dateKey) || 0) + 1);
    });

    setGroupedResults({
      documents: results,
      categories: Array.from(categories.entries()).map(([name, count]) => ({ name, count })),
      dates: Array.from(dates.entries()).map(([date, count]) => ({ date, count })),
      family: [], // TODO: Implement family member search
    });

    const endTime = performance.now();
    setSearchTime(endTime - startTime);

    // Add to recent searches
    if (searchQuery && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 9)]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setGroupedResults({
      documents: [],
      categories: [],
      dates: [],
      family: [],
    });
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'recent' || suggestion.type === 'category') {
      setSearchQuery(suggestion.text);
    } else if (suggestion.type === 'document') {
      const doc = documents.find(d => d.document_name === suggestion.text);
      if (doc) {
        navigate(`/documents/${doc.id}`);
      }
    }
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const toggleSavedSearch = (query: string) => {
    if (savedSearches.includes(query)) {
      setSavedSearches(prev => prev.filter(s => s !== query));
    } else {
      setSavedSearches(prev => [...prev, query]);
    }
  };

  const highlightMatch = (text: string) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="font-bold text-purple-400">{part}</span>
      ) : (
        part
      )
    );
  };

  const totalResults = groupedResults.documents.length + 
    groupedResults.categories.length + 
    groupedResults.dates.length + 
    groupedResults.family.length;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10" style={{ background: 'linear-gradient(135deg, #1A1625 0%, #231D33 50%, #2A2640 100%)' }}>
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)' }}
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-[120px]"
          style={{ background: 'linear-gradient(135deg, #EC4899, #8B5CF6)' }}
          animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <main className="pt-4 px-8 pb-8 max-w-[1920px] mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton to="/dashboard" />
        </div>

        {/* Search Header */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[800px] relative"
          >
            {/* Card Container - Apple-style Minimal Design */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(26, 22, 37, 0.4)',
                backdropFilter: 'blur(40px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Large Search Bar */}
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-7 h-7 text-white/40" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                    setSelectedSuggestionIndex(-1);
                  }}
                  placeholder="Search documents, categories, dates..."
                  className="w-full h-16 pl-16 pr-16 rounded-2xl text-white placeholder:text-white/30 text-2xl font-medium transition-all focus:outline-none"
                  style={{
                    background: 'rgba(42, 38, 64, 0.4)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: 'inset 0 2px 12px rgba(0, 0, 0, 0.4)',
                  }}
                  onFocus={(e) => {
                    setShowSuggestions(true);
                    e.target.style.border = '1px solid rgba(139, 92, 246, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                  }}
                />
                {searchQuery && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={clearSearch}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 w-full rounded-2xl overflow-hidden z-50 max-h-96 overflow-y-auto"
                  style={{
                    background: 'rgba(26, 22, 37, 0.95)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {suggestions.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    const isSelected = index === selectedSuggestionIndex;
                    return (
                      <motion.button
                        key={`${suggestion.type}-${suggestion.text}-${index}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleSuggestionSelect(suggestion)}
                        onMouseEnter={() => setSelectedSuggestionIndex(index)}
                        className={`w-full px-6 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left ${
                          isSelected ? 'bg-white/10' : ''
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${suggestion.type === 'recent' ? 'text-purple-400' : suggestion.type === 'category' ? 'text-blue-400' : 'text-white/60'}`} />
                        <span className="flex-1 text-white">{highlightMatch(suggestion.text)}</span>
                        {suggestion.count !== undefined && (
                          <span className="text-sm text-white/40">({suggestion.count})</span>
                        )}
                        {suggestion.type === 'document' && (
                          <span className="text-sm text-white/40">in {formatDocumentType(documents.find(d => d.document_name === suggestion.text)?.document_type || 'other')}</span>
                        )}
                        {suggestion.type === 'recent' && (
                          <Clock className="w-4 h-4 text-white/30" />
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Two-Column Layout - Filters appear below search card */}
        <div className="grid grid-cols-[320px_1fr] gap-8 mt-0">
          {/* Filters Sidebar */}
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(42, 38, 64, 0.4)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Recent
                  </h3>
                  <button
                    onClick={() => {
                      setRecentSearches([]);
                      localStorage.removeItem('recentSearches');
                    }}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.slice(0, 10).map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(query)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                    >
                      <Clock className="w-3.5 h-3.5 text-white/40" />
                      <span className="flex-1 text-sm text-white/70 group-hover:text-white truncate">{query}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSavedSearch(query);
                        }}
                        className={`${savedSearches.includes(query) ? 'text-yellow-400' : 'text-white/30'}`}
                      >
                        <Star className="w-3.5 h-3.5" fill={savedSearches.includes(query) ? 'currentColor' : 'none'} />
                      </button>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl p-5 space-y-5"
              style={{
                background: 'rgba(42, 38, 64, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-purple-400" />
                Filters
              </h3>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Document Type</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {DOCUMENT_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTypes([...selectedTypes, type]);
                          } else {
                            setSelectedTypes(selectedTypes.filter(t => t !== type));
                          }
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                        {formatDocumentType(type)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Urgency</label>
                <div className="space-y-2">
                  {URGENCIES.map((urgency) => (
                    <label key={urgency} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="urgency"
                        checked={selectedUrgency === urgency}
                        onChange={() => setSelectedUrgency(urgency)}
                        className="w-4 h-4 border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-sm text-white/60 group-hover:text-white transition-colors">{urgency}</span>
                    </label>
                  ))}
                  {selectedUrgency && (
                    <button
                      onClick={() => setSelectedUrgency('')}
                      className="text-xs text-purple-400 hover:text-purple-300 ml-6"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Date Range</label>
                <div className="space-y-2">
                  {DATE_PRESETS.map((preset) => (
                    <label key={preset} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="datePreset"
                        checked={selectedDatePreset === preset}
                        onChange={() => setSelectedDatePreset(preset)}
                        className="w-4 h-4 border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-sm text-white/60 group-hover:text-white transition-colors">{preset}</span>
                    </label>
                  ))}
                  {selectedDatePreset === 'Custom' && (
                    <div className="ml-6 space-y-2 pt-2">
                      <input
                        type="date"
                        value={customDateStart}
                        onChange={(e) => setCustomDateStart(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                      />
                      <input
                        type="date"
                        value={customDateEnd}
                        onChange={(e) => setCustomDateEnd(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/10 border border-white/20 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}
                  {selectedDatePreset && (
                    <button
                      onClick={() => {
                        setSelectedDatePreset('');
                        setCustomDateStart('');
                        setCustomDateEnd('');
                      }}
                      className="text-xs text-purple-400 hover:text-purple-300 ml-6"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">Status</label>
                <div className="space-y-2">
                  {STATUS_OPTIONS.map((status) => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStatuses([...selectedStatuses, status]);
                          } else {
                            setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                          }
                        }}
                        className="w-4 h-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <span className="text-sm text-white/60 group-hover:text-white transition-colors">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Shared Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-white/80">Shared Documents Only</span>
                  <div
                    onClick={() => setShowSharedOnly(!showSharedOnly)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      showSharedOnly ? 'bg-purple-500' : 'bg-white/20'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                      animate={{ left: showSharedOnly ? '22px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </label>
              </div>
            </motion.div>

            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(42, 38, 64, 0.4)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  Saved Searches
                </h3>
                <div className="space-y-2">
                  {savedSearches.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(query)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                      <Star className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" />
                      <span className="flex-1 text-sm text-white/70 hover:text-white truncate">{query}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {searchQuery ? (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <p className="text-white/60">
                    <span className="text-white font-semibold">{groupedResults.documents.length}</span> results in{' '}
                    <span className="text-purple-400">{searchTime.toFixed(0)}ms</span>
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Sort */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortBy)}
                      className="h-10 px-4 rounded-xl text-white text-sm appearance-none cursor-pointer"
                      style={{
                        background: 'rgba(42, 38, 64, 0.6)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        paddingRight: '32px',
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                      }}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date</option>
                      <option value="name">Name</option>
                    </select>

                    {/* View Toggle */}
                    <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(42, 38, 64, 0.6)' }}>
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded transition-colors ${
                          viewMode === 'grid' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded transition-colors ${
                          viewMode === 'list' ? 'bg-purple-500 text-white' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results */}
                {groupedResults.documents.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No results found for "{searchQuery}"</h3>
                    <p className="text-white/60 mb-6">Try checking your spelling or using different keywords</p>
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {DOCUMENT_TYPES.slice(0, 5).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setSearchQuery(formatDocumentType(type));
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
                          style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                          }}
                        >
                          Browse {formatDocumentType(type)}
                        </button>
                      ))}
                    </div>
                    <div className="text-sm text-white/40">
                      <p className="mb-2">Did you mean:</p>
                      {recentSearches.slice(0, 3).map((query, i) => (
                        <button
                          key={i}
                          onClick={() => handleRecentSearchClick(query)}
                          className="text-purple-400 hover:text-purple-300 mr-4"
                        >
                          {query}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Grouped Results */}
                    {groupedResults.documents.length > 0 && (
                      <div className="space-y-4">
                        <button
                          onClick={() => setExpandedGroups(prev => ({ ...prev, documents: !prev.documents }))}
                          className="flex items-center gap-2 text-white font-semibold mb-3"
                        >
                          {expandedGroups.documents ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <FileText className="w-5 h-5 text-purple-400" />
                          DOCUMENTS ({groupedResults.documents.length})
                        </button>
                        {expandedGroups.documents && (
                          viewMode === 'grid' ? (
                            <div className="grid grid-cols-3 xl:grid-cols-4 gap-6">
                              {groupedResults.documents.map((doc, index) => (
                                <motion.div
                                  key={doc.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.05 }}
                                  onClick={() => navigate(`/documents/${doc.id}`)}
                                  whileHover={{ y: -4, scale: 1.02 }}
                                  className="cursor-pointer rounded-2xl overflow-hidden group relative"
                                  style={{
                                    background: 'rgba(42, 38, 64, 0.4)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    height: '380px',
                                  }}
                                >
                                  {/* Thumbnail */}
                                  <div className="h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                                    {doc.image_url ? (
                                      <img
                                        src={doc.image_url}
                                        alt={doc.document_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <FileText className="w-16 h-16 text-white/60" />
                                    )}
                                  </div>
                                  {/* Info */}
                                  <div className="p-5">
                                    <h4 className="font-semibold text-white mb-2 line-clamp-2">{highlightMatch(doc.document_name)}</h4>
                                    <p className="text-sm text-purple-400 mb-2">{formatDocumentType(doc.document_type)}</p>
                                    {doc.expiration_date && (
                                      <p className="text-xs text-white/60">
                                        Expires: {new Date(doc.expiration_date).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {groupedResults.documents.map((doc, index) => (
                                <motion.div
                                  key={doc.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.03 }}
                                  onClick={() => navigate(`/documents/${doc.id}`)}
                                  className="p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                                  style={{
                                    background: 'rgba(42, 38, 64, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                  }}
                                >
                                  <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                    <FileText className="w-6 h-6 text-purple-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-white truncate">{highlightMatch(doc.document_name)}</h4>
                                    <p className="text-sm text-white/60">{formatDocumentType(doc.document_type)}</p>
                                  </div>
                                  <div className="text-sm text-white/60 shrink-0">
                                    {doc.expiration_date && new Date(doc.expiration_date).toLocaleDateString()}
                                  </div>
                                  <p className="text-xs text-purple-400 shrink-0">in {formatDocumentType(doc.document_type)}</p>
                                </motion.div>
                              ))}
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* Categories Group */}
                    {groupedResults.categories.length > 0 && (
                      <div className="space-y-4 mt-8">
                        <button
                          onClick={() => setExpandedGroups(prev => ({ ...prev, categories: !prev.categories }))}
                          className="flex items-center gap-2 text-white font-semibold mb-3"
                        >
                          {expandedGroups.categories ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <Folder className="w-5 h-5 text-blue-400" />
                          CATEGORIES ({groupedResults.categories.length})
                        </button>
                        {expandedGroups.categories && (
                          <div className="grid grid-cols-3 gap-4">
                            {groupedResults.categories.map((cat, index) => (
                              <motion.button
                                key={cat.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                  setSearchQuery(cat.name);
                                  setShowSuggestions(false);
                                }}
                                className="p-4 rounded-xl text-left hover:scale-105 transition-transform"
                                style={{
                                  background: 'rgba(42, 38, 64, 0.4)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                              >
                                <Folder className="w-6 h-6 text-blue-400 mb-2" />
                                <h4 className="font-semibold text-white mb-1">{cat.name}</h4>
                                <p className="text-sm text-white/60">{cat.count} documents</p>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dates Group */}
                    {groupedResults.dates.length > 0 && (
                      <div className="space-y-4 mt-8">
                        <button
                          onClick={() => setExpandedGroups(prev => ({ ...prev, dates: !prev.dates }))}
                          className="flex items-center gap-2 text-white font-semibold mb-3"
                        >
                          {expandedGroups.dates ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                          <Calendar className="w-5 h-5 text-green-400" />
                          DATES ({groupedResults.dates.length})
                        </button>
                        {expandedGroups.dates && (
                          <div className="grid grid-cols-4 gap-4">
                            {groupedResults.dates.map((date, index) => (
                              <motion.button
                                key={date.date}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => {
                                  setSearchQuery(date.date);
                                  setShowSuggestions(false);
                                }}
                                className="p-4 rounded-xl text-center hover:scale-105 transition-transform"
                                style={{
                                  background: 'rgba(42, 38, 64, 0.4)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                              >
                                <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                <h4 className="font-semibold text-white mb-1">{date.date}</h4>
                                <p className="text-sm text-white/60">{date.count} documents</p>
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <Search className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">Start searching</h3>
                <p className="text-white/60">Type in the search bar above to find your documents</p>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
